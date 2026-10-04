// Thin client for the real Spring Boot backend (hms-backend). Only
// authentication calls through this today — see AuthProvider in lib/auth.tsx
// — but this is the shared place any future module should add its calls,
// each one attaching the JWT the same way apiLogin's caller stores it.

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") || "http://localhost:8080/api/v1";

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
