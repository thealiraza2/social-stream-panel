import { Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";

const LandingPage = lazy(() => import("./LandingPage"));

// Lazy-load the auth check only when we have a cached session
const AuthRedirect = lazy(() =>
  import("@/contexts/AuthContext").then((mod) => ({
    default: function AuthRedirectInner() {
      const { user, loading } = mod.useAuth();
      if (loading) return <PageLoader />;
      if (user) return <Navigate to="/dashboard" replace />;
      return (
        <Suspense fallback={<PageLoader />}>
          <LandingPage />
        </Suspense>
      );
    },
  }))
);

const Index = () => {
  // Fast path: check if Firebase has any cached auth user
  // Firebase persists auth in indexedDB, but also sets a key pattern in localStorage
  const hasSession = Object.keys(localStorage).some(
    (key) => key.startsWith("firebase:authUser:")
  );

  if (!hasSession) {
    // No cached user — render landing page immediately without loading Firebase auth
    return (
      <Suspense fallback={<PageLoader />}>
        <LandingPage />
      </Suspense>
    );
  }

  // Has cached session — load auth context to check if still valid
  return (
    <Suspense fallback={<PageLoader />}>
      <AuthRedirect />
    </Suspense>
  );
};

export default Index;
