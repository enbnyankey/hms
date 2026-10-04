"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  HeartPulse,
  Mail,
  Lock,
  ShieldCheck,
  Building2,
  Stethoscope,
  ClipboardList,
  Pill,
  Wallet,
  Users,
  Activity,
  BedDouble,
  PhoneCall,
} from "lucide-react";
import {
  useAuth,
  ROLES,
  ROLE_META,
  ROLE_HOME,
  STATIONS,
  type Role,
} from "@/lib/auth";
import { apiLogin, ApiError } from "@/lib/api";
import TopStatusBar from "@/components/marketing/TopStatusBar";
import RoleSelect from "@/components/ui/RoleSelect";

// Seeded demo accounts (hms-backend/src/main/resources/db/migration/V4__seed_users.sql).
// Picking a role below quick-fills these so the demo stays a couple of
// clicks, but the sign-in itself is a real call to the backend — a wrong
// password or an unseeded email is rejected for real.
const DEMO_EMAIL: Record<Role, string> = {
  admin: "admin@aurahealth.demo",
  doctor: "doctor@aurahealth.demo",
  student_doctor: "student.doctor@aurahealth.demo",
  nurse: "nurse@aurahealth.demo",
  pharmacist: "pharmacist@aurahealth.demo",
  lab_tech: "labtech@aurahealth.demo",
  billing_clerk: "billing@aurahealth.demo",
  front_desk: "frontdesk@aurahealth.demo",
  compliance: "compliance@aurahealth.demo",
};
const DEMO_PASSWORD = "Passw0rd!";

const stationIcons: Record<(typeof STATIONS)[number]["id"], typeof Users> = {
  all: Users,
  administrator: Building2,
  doctor: Stethoscope,
  nursing: ClipboardList,
  pharmacy_lab: Pill,
  finance_front: Wallet,
};

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [station, setStation] = useState<(typeof STATIONS)[number]["id"]>("all");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<Role>("doctor");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const rolesForStation = useMemo(
    () => (station === "all" ? ROLES : ROLES.filter((r) => ROLE_META[r].station === station)),
    [station]
  );

  function handleStation(id: (typeof STATIONS)[number]["id"]) {
    setStation(id);
    const first = id === "all" ? ROLES : ROLES.filter((r) => ROLE_META[r].station === id);
    if (!first.includes(role)) setRole(first[0]);
  }

  function handleRole(next: Role) {
    setRole(next);
    // Quick-fill convenience only — never overwrites something the user
    // has already started typing themselves.
    if (!email.trim() && !password.trim()) {
      setEmail(DEMO_EMAIL[next]);
      setPassword(DEMO_PASSWORD);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setError("Enter your work email and password to continue.");
      return;
    }
    setError("");
    setSubmitting(true);
    try {
      const result = await apiLogin(email.trim(), password);
      login({
        name: result.name,
        role: result.role as Role,
        token: result.token,
        email: result.email,
      });
      router.push(ROLE_HOME[result.role as Role]);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Something went wrong signing you in.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopStatusBar />

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 px-4 py-8 lg:grid-cols-[1fr_360px] lg:px-6">
        {/* Left: login card */}
        <div className="rounded-xl border border-surface-border bg-white p-6 shadow-card sm:p-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-teal/10 text-brand-teal">
                <HeartPulse className="h-5 w-5" strokeWidth={2.25} />
              </div>
              <div className="leading-tight">
                <p className="text-base font-extrabold text-slate-900">AuraHealth HMS</p>
                <p className="text-[11px] uppercase tracking-wide text-slate-400">Clinical Operating Console</p>
              </div>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-500">
              <Lock className="h-3 w-3" />
              Secure Login
            </span>
          </div>

          <h1 className="mt-6 text-xl font-bold text-slate-900">Staff Sign In</h1>
          <p className="mt-1 text-xs text-slate-500">Sign in with your hospital-issued account.</p>

          <p className="mt-5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Your department & role
          </p>
          <div className="mt-2 grid grid-cols-3 gap-1.5 sm:grid-cols-6">
            {STATIONS.map((s) => {
              const Icon = stationIcons[s.id];
              const activeStation = station === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStation(s.id)}
                  className={`flex flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center text-[10px] font-semibold leading-tight ${
                    activeStation
                      ? "border-brand-teal bg-teal-50 text-brand-teal"
                      : "border-surface-border text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {s.label}
                </button>
              );
            })}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-status-blue-bg px-3 py-2.5 text-[11px] leading-snug text-status-blue">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Every sign-in and record access on this console is logged with a user, timestamp, and IP for
            audit purposes.
          </div>

          <form onSubmit={handleSubmit} className="mt-5 space-y-4">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Work email
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-md border border-surface-border px-3 py-2">
                <Mail className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="k.asadu@aurahealth.org"
                  className="w-full text-sm text-slate-800 outline-none placeholder:text-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Password
              </label>
              <div className="mt-1 flex items-center gap-2 rounded-md border border-surface-border px-3 py-2">
                <Lock className="h-4 w-4 shrink-0 text-slate-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full text-sm text-slate-800 outline-none placeholder:text-slate-300"
                />
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Quick-fill a demo account (optional)
              </label>
              <div className="mt-1">
                <RoleSelect roles={rolesForStation} value={role} onChange={handleRole} />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">
                Picking a role fills in a seeded demo login — sign-in itself still checks a real password
                against the backend.
              </p>
            </div>

            {error && <p className="text-[11px] font-semibold text-status-red">{error}</p>}

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-brand-teal py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? "Signing in…" : "Sign In"}
            </button>
          </form>

          <p className="mt-4 text-center text-xs text-slate-500">
            New staff member?{" "}
            <Link href="/signup" className="font-semibold text-brand-teal hover:underline">
              Create an account
            </Link>
          </p>
          <p className="mt-2 text-center text-xs text-slate-400">
            <Link href="/" className="hover:underline">
              ← Back to home
            </Link>
          </p>

          <div className="mt-5 flex items-start gap-2 rounded-lg border border-status-red-bg bg-status-red-bg/40 p-3 text-[10px] leading-snug text-status-red">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Sign-in is checked against the AuraHealth backend (real password hash, server-issued role) — this
            console is still a prototype otherwise, and a production deployment would add the full Ghana Data
            Protection Act controls on top of this.
          </div>
        </div>

        {/* Right: live telemetry sidebar */}
        <div className="space-y-4">
          <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <Activity className="h-4 w-4 text-brand-teal" />
                Campus Activity Ledger
              </h2>
              <span className="rounded-full bg-status-green-bg px-2 py-0.5 text-[10px] font-bold text-status-green">
                Mock Data
              </span>
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Sample bed availability and shift occupancy — for layout purposes only.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[10px] font-semibold uppercase text-slate-400">ICU Occupancy</p>
                <p className="text-lg font-extrabold text-status-red">92%</p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-[10px] font-semibold uppercase text-slate-400">On Shift</p>
                <p className="text-lg font-extrabold text-slate-800">145</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <BedDouble className="h-4 w-4 text-brand-teal" />
              Ward Cluster Snapshot
            </h2>
            <div className="mt-3 space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-status-red-bg bg-status-red-bg/40 px-3 py-2 text-[11px]">
                <span className="font-semibold text-slate-700">Emergency & Trauma</span>
                <span className="font-bold text-status-red">High load</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-surface-border px-3 py-2 text-[11px]">
                <span className="font-semibold text-slate-700">Main Surgical Theatres</span>
                <span className="font-bold text-status-green">Stable</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-surface-border px-3 py-2 text-[11px]">
                <span className="font-semibold text-slate-700">Paediatric ICU</span>
                <span className="font-bold text-status-blue">Normal</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
            <h2 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
              <PhoneCall className="h-4 w-4 text-brand-teal" />
              Clinical Support & IT Dispatch
            </h2>
            <div className="mt-2 space-y-1.5 text-[11px] text-slate-500">
              <div className="flex items-center justify-between">
                <span>IT Helpdesk</span>
                <span className="font-mono font-semibold text-slate-700">Ext. 4400</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Emergency Triage</span>
                <span className="font-mono font-semibold text-slate-700">+233 30 200 8899</span>
              </div>
              <div className="flex items-center justify-between">
                <span>On-Call Bio-Engineering</span>
                <span className="font-mono font-semibold text-slate-700">Pager #1089</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
