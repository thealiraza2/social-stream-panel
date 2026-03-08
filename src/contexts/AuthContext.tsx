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
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  role: "admin" | "user";
  balance: number;
  status: "active" | "banned";
  banReason?: string;
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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const cachedProfile = getCachedProfile();
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(cachedProfile);
  const [loading, setLoading] = useState(!cachedProfile);

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
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        // Background-refresh profile (UI already showing cached)
        await fetchProfile(u);
      } else {
        setProfile(null);
        setCachedProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email: string, password: string) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    await fetchProfile(cred.user);
  };

  const signup = async (email: string, password: string, displayName: string) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName });
    await sendEmailVerification(cred.user);
    const userProfile: Omit<UserProfile, "uid"> = {
      displayName,
      email,
      role: "user",
      balance: 0,
      status: "active",
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", cred.user.uid), userProfile);
    const full = { uid: cred.user.uid, ...userProfile };
    setProfile(full);
    setCachedProfile(full);
  };

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const cred = await signInWithPopup(auth, provider);
    const snap = await getDoc(doc(db, "users", cred.user.uid));
    if (!snap.exists()) {
      const userProfile: Omit<UserProfile, "uid"> = {
        displayName: cred.user.displayName || "User",
        email: cred.user.email || "",
        role: "user",
        balance: 0,
        status: "active",
        createdAt: serverTimestamp(),
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
