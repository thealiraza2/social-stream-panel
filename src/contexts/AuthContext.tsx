import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";
import { doc, setDoc, getDoc, updateDoc, addDoc, collection, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

const fetchLocationData = async () => {
  try {
    const res = await fetch("https://ipapi.co/json/", { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    return { ip: data.ip || "", country: data.country_name || "", city: data.city || "", region: data.region || "" };
  } catch {
    return null;
  }
};

const saveLoginHistory = async (uid: string, loc: { ip: string; country: string; city: string; region: string }) => {
  try {
    await addDoc(collection(db, "users", uid, "login_history"), {
      ip: loc.ip, country: loc.country, city: loc.city, region: loc.region,
      loginAt: serverTimestamp(),
    });
  } catch {
    // silent fail
  }
};

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: "admin" | "user";
  balance: number;
  status: "active" | "banned" | "deleted";
  banReason?: string;
  deletedAt?: any;
  createdAt: any;
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const useAuth = () => useContext(AuthContext);

const PROFILE_CACHE_KEY = "cached_profile";
const AUTH_SESSION_HINT_KEY = "auth_session_expected";

const getCachedProfile = (): UserProfile | null => {
  try {
    const raw = localStorage.getItem(PROFILE_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const setCachedProfile = (p: UserProfile | null) => {
  if (p) {
    localStorage.setItem(PROFILE_CACHE_KEY, JSON.stringify(p));
  } else {
    localStorage.removeItem(PROFILE_CACHE_KEY);
  }
};

const getSessionHint = () => {
  try {
    return localStorage.getItem(AUTH_SESSION_HINT_KEY) === "true";
  } catch {
    return false;
  }
};

const setSessionHint = (value: boolean) => {
  try {
    if (value) {
      localStorage.setItem(AUTH_SESSION_HINT_KEY, "true");
    } else {
      localStorage.removeItem(AUTH_SESSION_HINT_KEY);
    }
  } catch {
    // Ignore storage errors
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cachedProfile = getCachedProfile();
  const [user, setUser] = useState<User | null>(() => auth.currentUser);
  const [profile, setProfile] = useState<UserProfile | null>(cachedProfile);
  const [loading, setLoading] = useState(() => (!!cachedProfile || getSessionHint()) && !auth.currentUser);

  const fetchProfile = async (u: User): Promise<UserProfile | null> => {
    const snap = await getDoc(doc(db, "users", u.uid));
    if (snap.exists()) {
      const data = { uid: u.uid, ...snap.data() } as UserProfile;
      setProfile(data);
      setCachedProfile(data);
      return data;
    }
    return null;
  };

  useEffect(() => {
    let isMounted = true;
    let restoreTimer: number | undefined;

    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!isMounted) return;
      if (restoreTimer) window.clearTimeout(restoreTimer);

      setUser(u);

      if (u) {
        setSessionHint(true);
        try {
          await fetchProfile(u);
        } catch (error) {
          console.error("Failed to restore profile:", error);
        } finally {
          if (isMounted) setLoading(false);
        }
        return;
      }

      if (getCachedProfile() || getSessionHint()) {
        restoreTimer = window.setTimeout(() => {
          if (!auth.currentUser && isMounted) {
            setProfile(null);
            setCachedProfile(null);
            setSessionHint(false);
            setLoading(false);
          }
        }, 2000);
        return;
      }

      setProfile(null);
      setCachedProfile(null);
      setSessionHint(false);
      setLoading(false);
    });

    return () => {
      isMounted = false;
      if (restoreTimer) window.clearTimeout(restoreTimer);
      unsub();
    };
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    setSessionHint(true);
    await fetchProfile(cred.user);
    // Save location in background
    fetchLocationData().then(loc => {
      if (loc) {
        updateDoc(doc(db, "users", cred.user.uid), { lastIP: loc.ip, lastCountry: loc.country, lastCity: loc.city, lastRegion: loc.region, lastLoginAt: serverTimestamp() }).catch(() => {});
        saveLoginHistory(cred.user.uid, loc);
      }
    });
  };

  const signup = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    setSessionHint(true);
    await updateProfile(cred.user, { displayName });
    await sendEmailVerification(cred.user);
    const loc = await fetchLocationData();
    const userProfile: any = {
      displayName, email, role: "user", balance: 0, status: "active", createdAt: serverTimestamp(),
      lastIP: loc?.ip || "", lastCountry: loc?.country || "", lastCity: loc?.city || "", lastRegion: loc?.region || "", lastLoginAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", cred.user.uid), userProfile);
    const full = { uid: cred.user.uid, ...userProfile };
    setProfile(full);
    setCachedProfile(full);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    setSessionHint(true);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (!snap.exists()) {
      const loc = await fetchLocationData();
      const userProfile: any = {
        displayName: cred.user.displayName || "User",
        email: cred.user.email || "",
        role: "user", balance: 0, status: "active", createdAt: serverTimestamp(),
        lastIP: loc?.ip || "", lastCountry: loc?.country || "", lastCity: loc?.city || "", lastRegion: loc?.region || "", lastLoginAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", cred.user.uid), userProfile);
      const full = { uid: cred.user.uid, ...userProfile };
      setProfile(full);
      setCachedProfile(full);
    } else {
      const data = { uid: cred.user.uid, ...snap.data() } as UserProfile;
      setProfile(data);
      setCachedProfile(data);
      // Update location in background
      fetchLocationData().then(loc => {
        if (loc) updateDoc(doc(db, "users", cred.user.uid), { lastIP: loc.ip, lastCountry: loc.country, lastCity: loc.city, lastRegion: loc.region, lastLoginAt: serverTimestamp() }).catch(() => {});
      });
    }
  };

  const logout = async () => {
    setSessionHint(false);
    await signOut(auth);
    setProfile(null);
    setCachedProfile(null);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, signup, loginWithGoogle, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};
