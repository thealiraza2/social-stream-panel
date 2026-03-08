import { useCallback, useRef } from "react";

const prefetchedRoutes = new Set<string>();

const routeImportMap: Record<string, () => Promise<unknown>> = {
  "/login": () => import("@/pages/Login"),
  "/signup": () => import("@/pages/Signup"),
  "/dashboard": () => import("@/pages/user/Dashboard"),
};

/**
 * Returns onMouseEnter/onFocus handlers that prefetch the route chunk on hover.
 * Usage: <Link {...prefetch("/login")} to="/login">Sign In</Link>
 */
export function usePrefetch() {
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const prefetch = useCallback((route: string) => {
    const start = () => {
      if (prefetchedRoutes.has(route)) return;
      timerRef.current = setTimeout(() => {
        const loader = routeImportMap[route];
        if (loader) {
          loader();
          prefetchedRoutes.add(route);
        }
      }, 80); // small delay to avoid prefetching on quick pass-overs
    };

    const cancel = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };

    return {
      onMouseEnter: start,
      onFocus: start,
      onMouseLeave: cancel,
      onBlur: cancel,
    };
  }, []);

  return prefetch;
}
