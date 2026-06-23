import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, db } from '../services/firebaseConfig';
import { DEFAULT_GROQ_KEY } from '../config/defaults';

export type UserProfile = {
  uid: string;
  displayName: string;
  email: string;
  grade: string;
  totalQuestions: number;
  totalCompositions: number;
  totalSocraticSessions: number;
  createdAt: any;
};

type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  groqApiKey: string;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, grade: string) => Promise<void>;
  logOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateGroqKey: (key: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  incrementStat: (field: 'totalQuestions' | 'totalCompositions' | 'totalSocraticSessions') => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [groqApiKey, setGroqApiKey] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await loadProfile(firebaseUser.uid);
        const key = await AsyncStorage.getItem('groq_api_key');
        // Kullanıcı kendi key'ini girmişse onu, yoksa build-time enjekte edilen default'u kullan
        setGroqApiKey(key || DEFAULT_GROQ_KEY);
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  async function loadProfile(uid: string) {
    try {
      const snap = await getDoc(doc(db, 'users', uid));
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      }
    } catch {}
  }

  async function signIn(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function signUp(email: string, password: string, name: string, grade: string) {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: name });

    const userProfile: UserProfile = {
      uid: cred.user.uid,
      displayName: name,
      email,
      grade,
      totalQuestions: 0,
      totalCompositions: 0,
      totalSocraticSessions: 0,
      createdAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', cred.user.uid), userProfile);
    setProfile(userProfile);
  }

  async function logOut() {
    await signOut(auth);
    setProfile(null);
    setGroqApiKey('');
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  async function updateGroqKey(key: string) {
    await AsyncStorage.setItem('groq_api_key', key);
    setGroqApiKey(key || DEFAULT_GROQ_KEY);
  }

  async function refreshProfile() {
    if (user) await loadProfile(user.uid);
  }

  async function incrementStat(field: 'totalQuestions' | 'totalCompositions' | 'totalSocraticSessions') {
    if (!user) return;
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        [field]: (profile?.[field] ?? 0) + 1,
      });
      setProfile((prev) => prev ? { ...prev, [field]: (prev[field] ?? 0) + 1 } : prev);
    } catch {}
  }

  return (
    <AuthContext.Provider
      value={{ user, profile, groqApiKey, loading, signIn, signUp, logOut, resetPassword, updateGroqKey, refreshProfile, incrementStat }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
