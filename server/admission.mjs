const DEFAULT_CACHE_TTL_MS = 2_000;
const DEFAULT_REQUEST_TIMEOUT_MS = 2_000;

export const UNAVAILABLE_ADMISSION_STATUS = Object.freeze({
  admission: "draining",
  acceptingNewGames: false,
  available: false,
  version: null,
});

const unavailableStatus = () => ({ ...UNAVAILABLE_ADMISSION_STATUS });

const buildOpsStatusUrl = (serverUrl) => {
  if (typeof serverUrl !== "string" || !serverUrl.trim()) {
    return null;
  }

  try {
    const url = new URL(serverUrl.trim());
    if (url.protocol !== "http:" && url.protocol !== "https:") {
      return null;
    }

    url.hash = "";
    url.search = "";
    url.pathname = `${url.pathname.replace(/\/+$/, "")}/ops/status`;
    return url.toString();
  } catch {
    return null;
  }
};

export const sanitizeAdmissionStatus = (value) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return unavailableStatus();
  }

  const admission = value.admission;
  const acceptingNewGames = value.acceptingNewGames;
  const rawVersion = value.version;
  const validAdmission = admission === "accepting" || admission === "draining";
  const version = typeof rawVersion === "string" ? rawVersion.trim().slice(0, 200) : "";
  const consistent = acceptingNewGames === (admission === "accepting");

  if (!validAdmission || typeof acceptingNewGames !== "boolean" || !version || !consistent) {
    return unavailableStatus();
  }

  return {
    admission,
    acceptingNewGames,
    available: true,
    version,
  };
};

export const createAdmissionStatusReader = ({
  cacheTtlMs = DEFAULT_CACHE_TTL_MS,
  fetchImpl = globalThis.fetch,
  now = Date.now,
  requestTimeoutMs = DEFAULT_REQUEST_TIMEOUT_MS,
} = {}) => {
  let cached = null;
  let inFlight = null;

  return async ({ serverUrl, statusToken } = {}) => {
    const statusUrl = buildOpsStatusUrl(serverUrl);
    const token = typeof statusToken === "string" ? statusToken.trim() : "";
    if (!statusUrl || !token || typeof fetchImpl !== "function") {
      return unavailableStatus();
    }

    const cacheKey = `${statusUrl}\n${token}`;
    const currentTime = now();
    if (cached && cached.key === cacheKey && cached.expiresAt > currentTime) {
      return cached.value;
    }

    if (inFlight && inFlight.key === cacheKey) {
      return inFlight.promise;
    }

    const promise = (async () => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), Math.max(requestTimeoutMs, 1));

      try {
        const response = await fetchImpl(statusUrl, {
          cache: "no-store",
          headers: {
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          method: "GET",
          redirect: "error",
          signal: controller.signal,
        });

        if (!response.ok) {
          return unavailableStatus();
        }

        return sanitizeAdmissionStatus(await response.json());
      } catch {
        return unavailableStatus();
      } finally {
        clearTimeout(timeout);
      }
    })().then((value) => {
      cached = {
        expiresAt: now() + Math.max(cacheTtlMs, 0),
        key: cacheKey,
        value,
      };
      return value;
    });

    inFlight = { key: cacheKey, promise };

    try {
      return await promise;
    } finally {
      if (inFlight?.promise === promise) {
        inFlight = null;
      }
    }
  };
};

export const writeAdmissionResponse = (response, status, method = "GET") => {
  const body = JSON.stringify(sanitizeAdmissionStatus(status));
  response.writeHead(200, {
    "Cache-Control": "no-store",
    "Content-Length": Buffer.byteLength(body),
    "Content-Type": "application/json; charset=utf-8",
    "Permissions-Policy": "camera=(), geolocation=(), microphone=()",
    "Referrer-Policy": "no-referrer",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
  });
  response.end(method === "HEAD" ? undefined : body);
};
