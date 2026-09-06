"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";

const API_BASE   = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000";
const TOKEN_KEY  = "kelana_token";

export interface AuthUser {
  id: number;
  email: string;
  username: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  authHeader: () => Record<string, string>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Cookie helpers ─────────────────────────────────────────────
function setTokenCookie(token: string) {
  // expires in 1 day, SameSite=Lax so middleware can read it
  document.cookie = `${TOKEN_KEY}=${token}; path=/; max-age=${60 * 60 * 24}; SameSite=Lax`;
}

function clearTokenCookie() {
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0; SameSite=Lax`;
}

function saveToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
  setTokenCookie(token);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
  clearTokenCookie();
}

// ── Provider ───────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser]         = useState<AuthUser | null>(null);
  const [token, setToken]       = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Changed from true to false

  // Restore session on mount
  useEffect(() => {
    const stored = localStorage.getItem(TOKEN_KEY);
    if (stored) {
      setToken(stored);
      setTokenCookie(stored);
      // Don't fetch user immediately, let pages decide if they need user data
    }
  }, []);

  async function fetchMe(t: string) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

      const res = await fetch(`${API_BASE}/api/v1/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error("Session expired");
      const data: AuthUser = await res.json();
      setUser(data);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      clearToken();
      setToken(null);
      setUser(null);
    }
  }

  async function login(usernameOrEmail: string, password: string) {
    const form = new URLSearchParams();
    form.append("username", usernameOrEmail);
    form.append("password", password);

    const res = await fetch(`${API_BASE}/api/v1/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: form.toString(),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail ?? "Login gagal.");
    }

    const data = await res.json();
    saveToken(data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  }

  async function register(email: string, username: string, password: string) {
    const res = await fetch(`${API_BASE}/api/v1/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, username, password }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err?.detail ?? "Registrasi gagal.");
    }

    const data = await res.json();
    saveToken(data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  }

  const logout = useCallback(() => {
    clearToken();
    setToken(null);
    setUser(null);
  }, []);

  const authHeader = useCallback((): Record<string, string> => {
    const t = localStorage.getItem(TOKEN_KEY);
    return t ? { Authorization: `Bearer ${t}` } : {};
  }, []);

  const refreshUser = useCallback(async () => {
    const t = token || localStorage.getItem(TOKEN_KEY);
    if (t) {
      await fetchMe(t);
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, register, logout, authHeader, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
