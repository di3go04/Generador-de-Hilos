const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url: string | null;
  role: "admin" | "member";
  tenant_id: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  plan: "free" | "pro" | "enterprise";
  is_active: boolean;
  member_count: number;
  monthly_conversions: number;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("urban_token");
}

function setToken(token: string) {
  localStorage.setItem("urban_token", token);
}

function clearToken() {
  localStorage.removeItem("urban_token");
}

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    if (res.status === 401) {
      clearToken();
    }
    throw new ApiError(res.status, err.message || "Request failed");
  }

  return res.json();
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export const api = {
  // ── Auth ──────────────────────────────────────────────────────────────────
  login: (email: string, password: string) =>
    request<AuthResponse>("POST", "/auth/login", { email, password }),

  register: (data: { email: string; password: string; name: string; tenantName?: string; tenantSlug?: string }) =>
    request<AuthResponse>("POST", "/auth/register", data),

  oauth: (provider: "google" | "github", code: string) =>
    request<AuthResponse>("POST", "/auth/oauth", { provider, code }),

  me: () => request<{ user: User }>("GET", "/auth/me"),

  // ── Tenants ───────────────────────────────────────────────────────────────
  getTenant: () => request<{ tenant: Tenant }>("GET", "/tenants/me"),

  updateTenant: (data: Partial<Pick<Tenant, "name">>) =>
    request<{ tenant: Tenant }>("PATCH", "/tenants/me", data),

  getMembers: () => request<{ members: User[] }>("GET", "/tenants/me/members"),

  // ── Conversions ───────────────────────────────────────────────────────────
  startConversion: (file: File, options: Record<string, string>) => {
    const token = getToken();
    const formData = new FormData();
    formData.append("file", file);
    Object.entries(options).forEach(([k, v]) => formData.append(k, v));

    return fetch(`${API_BASE}/conversions`, {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    }).then(async (res) => {
      if (!res.ok) {
        const err = await res.json().catch(() => ({ message: res.statusText }));
        throw new ApiError(res.status, err.message || "Conversion failed");
      }
      return res.json();
    });
  },

  getConversions: (limit = 20, offset = 0) =>
    request<{ jobs: any[]; total: number }>("GET", `/conversions?limit=${limit}&offset=${offset}`),

  getConversion: (id: string) =>
    request<{ job: any }>("GET", `/conversions/${id}`),

  // ── Usage ─────────────────────────────────────────────────────────────────
  getUsage: (months = 6) =>
    request<{ records: any[] }>("GET", `/usage?months=${months}`),

  getCurrentUsage: () =>
    request<{ month: string; conversions: number; ai_generations: number }>("GET", "/usage/current"),

  // ── Billing ────────────────────────────────────────────────────────────────
  createCheckoutSession: (plan: "pro" | "enterprise") =>
    request<{ url: string }>("POST", "/billing/checkout", { plan }),

  createPortalSession: () =>
    request<{ url: string }>("POST", "/billing/portal"),
};

export { setToken, clearToken, getToken };
