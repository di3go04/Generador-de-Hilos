"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { api, setToken, clearToken, getToken, type User, type Tenant } from "@/lib/api";

interface AuthState {
  user: User | null;
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name: string }) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    tenant: null,
    loading: true,
    error: null,
  });

  const fetchSession = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setState({ user: null, tenant: null, loading: false, error: null });
      return;
    }

    try {
      const [{ user }, { tenant }] = await Promise.all([
        api.me(),
        api.getTenant(),
      ]);
      setState({ user, tenant, loading: false, error: null });
    } catch {
      clearToken();
      setState({ user: null, tenant: null, loading: false, error: null });
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const login = useCallback(async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { token, user } = await api.login(email, password);
      setToken(token);
      const { tenant } = await api.getTenant();
      setState({ user, tenant, loading: false, error: null });
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
      throw err;
    }
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name: string }) => {
    setState((s) => ({ ...s, loading: true, error: null }));
    try {
      const { token, user } = await api.register(data);
      setToken(token);
      const { tenant } = await api.getTenant();
      setState({ user, tenant, loading: false, error: null });
    } catch (err: any) {
      setState((s) => ({ ...s, loading: false, error: err.message }));
      throw err;
    }
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setState({ user: null, tenant: null, loading: false, error: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
