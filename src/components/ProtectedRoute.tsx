import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";

const MAINTENANCE_CACHE_KEY = "maintenance_mode";

const useMaintenanceMode = () => {
  const [maintenance, setMaintenance] = useState(() => {
    return sessionStorage.getItem(MAINTENANCE_CACHE_KEY) === "true";
  });
  const [loaded, setLoaded] = useState(() => {
    return sessionStorage.getItem(MAINTENANCE_CACHE_KEY) !== null;
  });

  useEffect(() => {
    const unsub = onSnapshot(doc(db, "settings", "general"), (snap) => {
      const val = snap.exists() ? !!snap.data().maintenanceMode : false;
      setMaintenance(val);
      sessionStorage.setItem(MAINTENANCE_CACHE_KEY, String(val));
      setLoaded(true);
    });
    return unsub;
  }, []);

  return { maintenance, loaded };
};

export const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, profile, loading } = useAuth();
  const { maintenance, loaded } = useMaintenanceMode();

  if (loading || !loaded) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (!user.emailVerified) return <Navigate to="/verify-email" replace />;
  if (profile?.status === "banned") return <Navigate to="/banned" replace />;
  if (profile?.status === "deleted") return <Navigate to="/account-deleted" replace />;
  if (maintenance && profile?.role !== "admin") return <Navigate to="/maintenance" replace />;
  return <>{children}</>;
};

export const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  const { profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!profile || profile.role !== "admin") return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};
