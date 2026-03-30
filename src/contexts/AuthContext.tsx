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
  // Try server-side endpoint first (works on Vercel deployment)
  try {
    const response = await fetch('/api/client-ip');
    if (response.ok) {
      const result = await response.json();
      if (result?.ip) {
        console.log('[Auth] Location fetched from /api/client-ip', result);
        return result;
      }
    }
  } catch (e) {
    console.warn('[Auth] /api/client-ip failed, trying fallback', e);
  }

  // Fallback: call ipwho.is directly from browser (works in preview & everywhere)
  try {
    const response = await fetch('https://ipwho.is/');
    if (response.ok) {
      const data = await response.json();
      if (data?.success !== false && data?.ip) {
        const result = { ip: data.ip, country: data.country || '', city: data.city || '', region: data.region || '' };
        console.log('[Auth] Location fetched from ipwho.is fallback', result);
        return result;
      }
    }
  } catch (e2) {
    console.warn('[Auth] ipwho.is fallback also failed', e2);
  }

  console.warn('[Auth] Could not fetch location data');
  return null;
};

const saveLoginHistory = async (uid: string, loc: { ip: string; country: string; city: string; region: string }) => {
  try {
    console.log('[Auth] Saving login history for', uid, loc);
    await addDoc(collection(db, "users", uid, "login_history"), {
      ip: loc.ip, country: loc.country, city: loc.city, region: loc.region,
      loginAt: serverTimestamp(),
    });
    console.log('[Auth] Login history saved successfully');
  } catch (e) {
    console.error('[Auth] Failed to save login history:', e);
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
        // Save location on every fresh auth (not page refresh)
        const locKey = `loc_saved_${u.uid}`;
        if (!sessionStorage.getItem(locKey)) {
          sessionStorage.setItem(locKey, "1");
          fetchLocationData().then(async (loc) => {
            if (loc) {
              console.log("[Auth] Saving location for", u.uid, loc);
              await updateDoc(doc(db, "users", u.uid), { lastIP: loc.ip, lastCountry: loc.country, lastCity: loc.city, lastRegion: loc.region, lastLoginAt: serverTimestamp() }).catch(e => console.error("[Auth] updateDoc failed:", e));
              await saveLoginHistory(u.uid, loc);
            }
          });
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
    sessionStorage.removeItem(`loc_saved_${cred.user.uid}`);
    setSessionHint(true);
    await fetchProfile(cred.user);
  };

  const signup = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    sessionStorage.removeItem(`loc_saved_${cred.user.uid}`);
    setSessionHint(true);
    await updateProfile(cred.user, { displayName });
    await sendEmailVerification(cred.user);
    const userProfile: any = {
      displayName, email, role: "user", balance: 0, status: "active", createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", cred.user.uid), userProfile);
    const full = { uid: cred.user.uid, ...userProfile };
    setProfile(full);
    setCachedProfile(full);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    sessionStorage.removeItem(`loc_saved_${cred.user.uid}`);
    setSessionHint(true);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (!snap.exists()) {
      const userProfile: any = {
        displayName: cred.user.displayName || "User",
        email: cred.user.email || "",
        role: "user", balance: 0, status: "active", createdAt: serverTimestamp(),
      };
      await setDoc(doc(db, "users", cred.user.uid), userProfile);
      const full = { uid: cred.user.uid, ...userProfile };
      setProfile(full);
      setCachedProfile(full);
    } else {
      const data = { uid: cred.user.uid, ...snap.data() } as UserProfile;
      setProfile(data);
      setCachedProfile(data);
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
