import { init } from "@sentry/react";

const DEFAULT_SENTRY_DSN =
  "https://0a8d92f8c618508de106efafefbaa666@o4511695946121216.ingest.us.sentry.io/4511695947038725";
const APP_NAME = import.meta.env.VITE_APP_NAME || "trucoshi-client";

const getRelease = () => {
  const version = import.meta.env.VITE_APP_VERSION;

  if (!version) {
    return undefined;
  }

  return `${APP_NAME}@${version}`;
};

init({
  dsn: import.meta.env.VITE_SENTRY_DSN || DEFAULT_SENTRY_DSN,
  environment: import.meta.env.VITE_APP_ENVIRONMENT || import.meta.env.MODE,
  release: getRelease(),
  sendDefaultPii: false,
});
