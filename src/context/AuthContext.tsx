import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  register as apiRegister,
  login as apiLogin,
  clearToken,
  getToken,
  getProfile,
  incrementStat as apiIncrementStat,
  UserProfile,
} from '../services/apiService';
import { DEFAULT_GROQ_KEY } from '../config/defaults';

type AuthContextType = {
  userId: string | null;
  profile: UserProfile | null;
  groqApiKey: string;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name: string, grade: string) => Promise<void>;
  logOut: () => Promise<void>;
  updateGroqKey: (key: string) => Promise<void>;
  refreshProfile: () => Promise<void>;
  incrementStat: (field: 'totalQuestions' | 'totalCompositions' | 'totalSocraticSessions') => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

const USER_ID_KEY = 'user_id';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [userId, setUserId] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [groqApiKey, setGroqApiKey] = useState('');
  const [loading, setLoading] = useState(true);

  // Uygulama açılışında kayıtlı oturumu kontrol et
  useEffect(() => {
    restoreSession();
  }, []);

  async function restoreSession() {
    try {
      const [token, storedId, storedKey] = await Promise.all([
        getToken(),
        AsyncStorage.getItem(USER_ID_KEY),
        AsyncStorage.getItem('groq_api_key'),
      ]);

      if (token && storedId) {
        setUserId(storedId);
        setGroqApiKey(storedKey || DEFAULT_GROQ_KEY);
        // Arka planda profil güncelle, hata olursa sessiz devam et
        getProfile(storedId)
          .then(setProfile)
          .catch(() => {});
      }
    } finally {
      setLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    const { user } = await apiLogin(email, password);
    await AsyncStorage.setItem(USER_ID_KEY, user.id);
    setUserId(user.id);
    setProfile(user);
    const key = await AsyncStorage.getItem('groq_api_key');
    setGroqApiKey(key || DEFAULT_GROQ_KEY);
  }

  async function signUp(email: string, password: string, name: string, grade: string) {
    const { user } = await apiRegister(email, password, name, grade);
    await AsyncStorage.setItem(USER_ID_KEY, user.id);
    setUserId(user.id);
    setProfile(user);
    const key = await AsyncStorage.getItem('groq_api_key');
    setGroqApiKey(key || DEFAULT_GROQ_KEY);
  }

  async function logOut() {
    await Promise.all([
      clearToken(),
      AsyncStorage.removeItem(USER_ID_KEY),
    ]);
    setUserId(null);
    setProfile(null);
    setGroqApiKey('');
  }

  async function updateGroqKey(key: string) {
    await AsyncStorage.setItem('groq_api_key', key);
    setGroqApiKey(key || DEFAULT_GROQ_KEY);
  }

  async function refreshProfile() {
    if (!userId) return;
    try {
      const updated = await getProfile(userId);
      setProfile(updated);
    } catch {}
  }

  async function incrementStat(
    field: 'totalQuestions' | 'totalCompositions' | 'totalSocraticSessions'
  ) {
    if (!userId) return;
    try {
      await apiIncrementStat(userId, field);
      setProfile((prev) =>
        prev ? { ...prev, [field]: (prev[field] ?? 0) + 1 } : prev
      );
    } catch {}
  }

  return (
    <AuthContext.Provider
      value={{
        userId,
        profile,
        groqApiKey,
        loading,
        signIn,
        signUp,
        logOut,
        updateGroqKey,
        refreshProfile,
        incrementStat,
      }}
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
