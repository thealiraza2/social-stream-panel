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

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (u: User): Promise<UserProfile | null> => {
    const snap = await getDoc(doc(db, "users", u.uid));
    if (snap.exists()) {
      const data = { uid: u.uid, ...snap.data() } as UserProfile;
      if (data.status === "banned") {
        await signOut(auth);
        setUser(null);
        setProfile(null);
        throw new Error("Your account has been banned. Please contact support.");
      }
      setProfile(data);
      return data;
    }
    return null;
  };

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        try {
          await fetchProfile(u);
        } catch {
          // banned user — already signed out in fetchProfile
        }
      } else {
        setProfile(null);
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
    const userProfile: Omit<UserProfile, "uid"> = {
      displayName,
      email,
      role: "user",
      balance: 0,
      status: "active",
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, "users", cred.user.uid), userProfile);
    setProfile({ uid: cred.user.uid, ...userProfile });
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
      setProfile({ uid: cred.user.uid, ...userProfile });
    } else {
      setProfile({ uid: cred.user.uid, ...snap.data() } as UserProfile);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setProfile(null);
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
