// Thin client for the real Spring Boot backend (hms-backend). Only
// authentication calls through this today — see AuthProvider in lib/auth.tsx
// — but this is the shared place any future module should add its calls,
// each one attaching the JWT the same way apiLogin's caller stores it.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export type LoginResult = {
  token: string;
  name: string;
  role: string;
  email: string;
};

/**
 * Calls POST /auth/login on the real backend. Throws ApiError with a
 * message suitable for showing the user directly:
 *  - 401 -> "Incorrect email or password."
 *  - backend unreachable -> a message telling them to check the backend.
 */
export async function apiLogin(email: string, password: string): Promise<LoginResult> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
  } catch {
    throw new ApiError(
      "Can't reach the AuraHealth server. Make sure the backend (mvn spring-boot:run) is running and " +
        "NEXT_PUBLIC_API_BASE_URL points at it.",
      0
    );
  }

  if (!response.ok) {
    let message = "Incorrect email or password.";
    try {
      const body = await response.json();
      if (body?.message) message = body.message;
    } catch {
      // fall through to default message
    }
    throw new ApiError(message, response.status);
  }

  return response.json();
}

/** Base URL other modules should build their endpoint calls from. */
export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export { API_BASE_URL };

// ---------------------------------------------------------------------------
// Authenticated calls for every module.
// ---------------------------------------------------------------------------

// Same key AuthProvider (lib/auth.tsx) stores the signed-in user under.
const AUTH_STORAGE_KEY = "aurahealth_hms_user";

function storedToken(): string | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
    return raw ? (JSON.parse(raw).token as string | undefined) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * fetch() against the backend with the signed-in user's JWT attached.
 * Returns the parsed JSON body (or undefined for an empty response).
 * Throws ApiError carrying the backend's own message (e.g. "Bed A-102-C is
 * OCCUPIED and can't take an admission."), ready to show in a toast.
 * A 401 means the session expired: the stored login is cleared and the
 * browser is sent back to the login page.
 */
export async function apiFetch<T>(
  path: string,
  options: { method?: string; body?: unknown } = {}
): Promise<T> {
  const token = storedToken();
  let response: Response;
  try {
    response = await fetch(apiUrl(path), {
      method: options.method ?? "GET",
      headers: {
        ...(options.body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new ApiError(
      "Can't reach the AuraHealth server. Make sure the backend is running.",
      0
    );
  }

  if (response.status === 401) {
    try {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch {
      // ignore
    }
    if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
      window.location.href = "/login";
    }
    throw new ApiError("Your session has expired. Please sign in again.", 401);
  }

  if (!response.ok) {
    let message = `Request failed (${response.status}).`;
    try {
      const body = await response.json();
      if (body?.fieldErrors?.length) message = `${body.message} ${body.fieldErrors.join("; ")}`;
      else if (body?.message) message = body.message;
    } catch {
      // keep the default message
    }
    throw new ApiError(message, response.status);
  }

  const text = await response.text();
  return (text ? JSON.parse(text) : undefined) as T;
}

/** Spring Data's paged response shape (GET /patients etc.). */
export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  number: number;
  size: number;
};

/** A line from the shared activity log (GET /audit-events). */
export type AuditEvent = {
  id: string;
  occurredAt: string;
  actorName: string | null;
  actorRole: string | null;
  module: string;
  action: string;
  entityType: string | null;
  entityId: string | null;
  summary: string;
};

export function fetchActivity(module: string, limit = 20): Promise<AuditEvent[]> {
  return apiFetch<AuditEvent[]>(`/audit-events?module=${encodeURIComponent(module)}&limit=${limit}`);
}

/** "Today · 08:12 AM", "Yesterday · 4:05 PM", "3 Oct · 9:30 AM". */
export function formatActivityTime(iso: string): string {
  const d = new Date(iso);
  const time = d.toLocaleTimeString("en-GB", { hour: "numeric", minute: "2-digit", hour12: true }).toUpperCase();
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return `Today · ${time}`;
  if (d.toDateString() === yesterday.toDateString()) return `Yesterday · ${time}`;
  return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })} · ${time}`;
}

/** Today in the backend's display format, e.g. "7 Oct 2026". */
export function todayLabel(): string {
  const d = new Date();
  return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })} ${d.getFullYear()}`;
}
