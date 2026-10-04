"use client";

// Sign-in itself is now real: app/login/page.tsx calls the Spring Boot
// backend's /api/v1/auth/login, which checks a real password hash and
// returns the role from the database — the role here is no longer
// client-chosen. What's stored client-side (this file) is still just a
// convenience cache of that result (name/role/token) in localStorage, and
// canAccess()/ROUTE_ACCESS below are still UI-only routing — they are NOT a
// security boundary. Every module's own API calls must still enforce access
// server-side (JWT + Spring Security @PreAuthorize per endpoint, already in
// place for Patient Registry); a client-side hide-the-menu-item check can
// always be bypassed by calling the API directly. The signup flow still
// creates a mock, token-less session — it isn't wired to the backend yet.

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";

export type Role =
  | "admin"
  | "doctor"
  | "student_doctor"
  | "nurse"
  | "pharmacist"
  | "lab_tech"
  | "billing_clerk"
  | "front_desk"
  | "compliance";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "Chief of Staff / Administrator",
  doctor: "Attending Physician",
  student_doctor: "Student Doctor / Resident",
  nurse: "Nurse",
  pharmacist: "Pharmacist",
  lab_tech: "Lab Technician",
  billing_clerk: "Billing Clerk",
  front_desk: "Front Desk / Registrar",
  compliance: "Compliance / Auditor",
};

export const ROLES: Role[] = [
  "admin",
  "doctor",
  "student_doctor",
  "nurse",
  "pharmacist",
  "lab_tech",
  "billing_clerk",
  "front_desk",
  "compliance",
];

// Which roles can see/open each route. "admin" always has full access.
export const ROUTE_ACCESS: Record<string, Role[]> = {
  "/dashboard": ["admin"],
  "/staff-credentialing": ["admin", "compliance"],
  "/doctor-workspace": ["admin", "doctor", "student_doctor"],
  "/ward-bed-manager": ["admin", "doctor", "nurse"],
  "/patient-registry": ["admin", "doctor", "nurse", "front_desk", "billing_clerk", "student_doctor"],
  "/nursing-emar": ["admin", "nurse"],
  "/pharmacy-inventory": ["admin", "pharmacist", "doctor"],
  "/laboratory-diagnostics": ["admin", "lab_tech", "doctor"],
  "/billing-claims": ["admin", "billing_clerk"],
  "/reports-analytics": ["admin", "compliance"],
  "/audit-trail": ["admin", "compliance"],
};

// Where a role lands right after signing in — its first accessible page.
export const ROLE_HOME: Record<Role, string> = {
  admin: "/dashboard",
  doctor: "/doctor-workspace",
  student_doctor: "/doctor-workspace",
  nurse: "/ward-bed-manager",
  pharmacist: "/pharmacy-inventory",
  lab_tech: "/laboratory-diagnostics",
  billing_clerk: "/billing-claims",
  front_desk: "/patient-registry",
  compliance: "/reports-analytics",
};

// Display-only metadata for the credentialing/access-governance UI
// (login role picker, signup rank selector, landing page hierarchy grid).
export type RoleMeta = {
  code: string;
  tier: string;
  tierTone: "admin" | "clinical" | "support";
  station: "administrator" | "doctor" | "nursing" | "pharmacy_lab" | "finance_front";
  privileges: string;
  requirement: string;
};

export const ROLE_META: Record<Role, RoleMeta> = {
  admin: {
    code: "COS",
    tier: "Tier 0 · Super Admin",
    tierTone: "admin",
    station: "administrator",
    privileges: "Full access to every module, all facilities, and the audit trail.",
    requirement: "Administrator authorization",
  },
  doctor: {
    code: "MD",
    tier: "Tier 1 · Clinical",
    tierTone: "clinical",
    station: "doctor",
    privileges: "Consultation, ICD-11 diagnosis, e-prescribing, ward view, lab orders.",
    requirement: "Medical Council registration",
  },
  student_doctor: {
    code: "RES",
    tier: "Tier 2 · Supervised",
    tierTone: "clinical",
    station: "doctor",
    privileges: "Doctor Workspace under supervision; no discharge or final sign-off.",
    requirement: "Attending endorsement",
  },
  nurse: {
    code: "RN",
    tier: "Tier 2 · Nursing",
    tierTone: "clinical",
    station: "nursing",
    privileges: "Ward & bed management, eMAR administration, patient registry.",
    requirement: "Nursing council PIN",
  },
  pharmacist: {
    code: "PH",
    tier: "Tier 2 · Pharmacy",
    tierTone: "clinical",
    station: "pharmacy_lab",
    privileges: "Dispensing, inventory, cold-chain and controlled-substance ledgers.",
    requirement: "Pharmacy council registration",
  },
  lab_tech: {
    code: "LAB",
    tier: "Tier 2 · Laboratory",
    tierTone: "clinical",
    station: "pharmacy_lab",
    privileges: "Accessioning, result entry, instrument interfacing, sign-off.",
    requirement: "Allied health council validation",
  },
  billing_clerk: {
    code: "FIN",
    tier: "Tier 3 · Finance",
    tierTone: "support",
    station: "finance_front",
    privileges: "Billing, NHIS claims submission, payment reconciliation.",
    requirement: "Finance department clearance",
  },
  front_desk: {
    code: "REG",
    tier: "Tier 3 · Registration",
    tierTone: "support",
    station: "finance_front",
    privileges: "Patient intake, NHIS verification, appointment queueing.",
    requirement: "Front-office onboarding",
  },
  compliance: {
    code: "AUD",
    tier: "Tier 1 · Oversight",
    tierTone: "admin",
    station: "administrator",
    privileges: "Reports & analytics, full audit trail, access-log review.",
    requirement: "Compliance office appointment",
  },
};

export const STATIONS: { id: RoleMeta["station"] | "all"; label: string }[] = [
  { id: "all", label: "All Staff" },
  { id: "administrator", label: "Administrator" },
  { id: "doctor", label: "Doctor / Clinical" },
  { id: "nursing", label: "Nursing & Wards" },
  { id: "pharmacy_lab", label: "Pharmacy / Lab" },
  { id: "finance_front", label: "Finance / Front Desk" },
];

export function canAccess(role: Role, href: string): boolean {
  if (role === "admin") return true;
  const allowed = ROUTE_ACCESS[href];
  if (!allowed) return true; // routes not listed (e.g. /login) are unrestricted
  return allowed.includes(role);
}

export type AuthUser = {
  name: string;
  role: Role;
  /** Present once signed in against the real backend; absent for the
   *  still-mock signup flow. Sent as "Authorization: Bearer <token>" by
   *  lib/api.ts calls that need it. */
  token?: string;
  email?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  login: (user: AuthUser) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "aurahealth_hms_user";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setUser(JSON.parse(raw));
    } catch {
      // ignore — treat as signed out
    } finally {
      setLoading(false);
    }
  }, []);

  const login = useCallback((next: AuthUser) => {
    setUser(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // best-effort only
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // best-effort only
    }
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
