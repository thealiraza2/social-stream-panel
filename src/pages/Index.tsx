import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { lazy, Suspense } from "react";
import { PageLoader } from "@/components/PageLoader";

const LandingPage = lazy(() => import("./LandingPage"));

const Index = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <Suspense fallback={<PageLoader />}>
      <LandingPage />
    </Suspense>
  );
};

export default Index;
