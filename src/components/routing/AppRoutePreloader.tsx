import { useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

const PRELOAD_SESSION_ID = "preload";

export const AppRoutePreloader = () => {
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;
    let idleCallback: number | undefined;
    let idleTimeout: ReturnType<typeof setTimeout> | undefined;

    const preloadSecondaryRoutes = () => {
      if (cancelled) {
        return;
      }

      void Promise.allSettled([
        router.preloadRoute({ to: "/profile" }),
        router.preloadRoute({
          to: "/profile/$accountId",
          params: { accountId: PRELOAD_SESSION_ID },
        }),
        router.preloadRoute({
          to: "/history/$matchId",
          params: { matchId: PRELOAD_SESSION_ID },
        }),
        router.preloadRoute({ to: "/register", search: {} }),
        router.preloadRoute({ to: "/forgot-password" }),
        router.preloadRoute({ to: "/truco-online" }),
        router.preloadRoute({ to: "/truco-argentino" }),
        router.preloadRoute({ to: "/reglas-del-truco" }),
        router.preloadRoute({ to: "/ranking-cartas-truco" }),
        router.preloadRoute({
          to: "/help/rules/$lang",
          params: { lang: "en" },
        }),
      ]);
    };

    void Promise.allSettled([
      router.preloadRoute({ to: "/matches" }),
      router.preloadRoute({ to: "/ranking" }),
      router.preloadRoute({ to: "/help" }),
      router.preloadRoute({ to: "/inventory" }),
      router.preloadRoute({ to: "/login" }),
      router.preloadRoute({
        to: "/match/$sessionId",
        params: { sessionId: PRELOAD_SESSION_ID },
      }),
      router.preloadRoute({
        to: "/lobby/$sessionId",
        params: { sessionId: PRELOAD_SESSION_ID },
      }),
    ]).then(() => {
      if (cancelled) {
        return;
      }

      if ("requestIdleCallback" in window) {
        idleCallback = window.requestIdleCallback(preloadSecondaryRoutes, { timeout: 1500 });
      } else {
        idleTimeout = setTimeout(preloadSecondaryRoutes, 250);
      }
    });

    return () => {
      cancelled = true;
      if (idleCallback !== undefined) {
        window.cancelIdleCallback(idleCallback);
      }
      if (idleTimeout !== undefined) {
        clearTimeout(idleTimeout);
      }
    };
  }, [router]);

  return null;
};
