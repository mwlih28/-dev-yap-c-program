import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from '../config/defaults';

const TOKEN_KEY = 'auth_token';

// ─── Token yönetimi ───────────────────────────────────────────────
export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function saveToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function clearToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

// ─── HTTP istek helper'ı ──────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
  requireAuth = false
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (requireAuth) {
    const token = await getToken();
    if (!token) throw new APIError('Oturum bulunamadı. Lütfen giriş yapın.', 401);
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  const data = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));

  if (!res.ok) {
    throw new APIError((data as any)?.error ?? `Sunucu hatası (${res.status})`, res.status);
  }

  return data as T;
}

export class APIError extends Error {
  constructor(
    message: string,
    public readonly status: number
  ) {
    super(message);
    this.name = 'APIError';
  }
}

// ─── Auth ─────────────────────────────────────────────────────────
export type UserProfile = {
  id: string;
  email: string;
  displayName: string;
  grade: string;
  totalQuestions: number;
  totalCompositions: number;
  totalSocraticSessions: number;
  createdAt: string;
};

type AuthResponse = { token: string; user: UserProfile };

export async function register(
  email: string,
  password: string,
  displayName: string,
  grade: string
): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, displayName, grade }),
  });
  await saveToken(data.token);
  return data;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const data = await request<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  await saveToken(data.token);
  return data;
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  await request('/api/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ currentPassword, newPassword }),
  }, true);
}

// ─── Kullanıcı ────────────────────────────────────────────────────
export async function getProfile(userId: string): Promise<UserProfile> {
  return request<UserProfile>(`/api/users/${userId}`, {}, true);
}

export async function updateProfile(
  userId: string,
  data: Partial<Pick<UserProfile, 'displayName' | 'grade'>>
): Promise<UserProfile> {
  return request<UserProfile>(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }, true);
}

export async function incrementStat(
  userId: string,
  field: 'totalQuestions' | 'totalCompositions' | 'totalSocraticSessions'
): Promise<void> {
  await request(`/api/users/${userId}/stats`, {
    method: 'POST',
    body: JSON.stringify({ field }),
  }, true);
}
