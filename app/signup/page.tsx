"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Lock,
  Building2,
  Phone,
  UploadCloud,
  CheckCircle2,
  Circle,
  Info,
} from "lucide-react";
import { useAuth, ROLES, ROLE_LABELS, ROLE_META, ROLE_HOME, type Role } from "@/lib/auth";
import TopStatusBar from "@/components/marketing/TopStatusBar";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import ComplianceFooter from "@/components/marketing/ComplianceFooter";

const tierToneClass: Record<string, string> = {
  admin: "bg-slate-800 text-white",
  clinical: "bg-teal-50 text-brand-teal",
  support: "bg-status-blue-bg text-status-blue",
};

const steps = ["Rank & identity", "Licensure & scope", "Security & consent"];

export default function SignupPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [step, setStep] = useState(0);
  const [role, setRole] = useState<Role>("student_doctor");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [staffId, setStaffId] = useState("");
  const [department, setDepartment] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [fileName, setFileName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [certify, setCertify] = useState(false);
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  const selectableRoles = ROLES.filter((r) => r !== "admin");

  const entropy = useMemo(() => {
    const checks = [
      { label: "12+ characters", pass: password.length >= 12 },
      { label: "Uppercase & lowercase", pass: /[a-z]/.test(password) && /[A-Z]/.test(password) },
      { label: "A number", pass: /\d/.test(password) },
      { label: "A symbol", pass: /[^A-Za-z0-9]/.test(password) },
    ];
    return { checks, score: checks.filter((c) => c.pass).length };
  }, [password]);

  function next() {
    setError("");
    if (step === 0 && !role) {
      setError("Select an institutional rank to continue.");
      return;
    }
    if (step === 1 && (!fullName.trim() || !email.trim() || !staffId.trim())) {
      setError("Fill in your full name, email and staff ID to continue.");
      return;
    }
    setStep((s) => Math.min(s + 1, steps.length - 1));
  }

  function back() {
    setError("");
    setStep((s) => Math.max(s - 1, 0));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!password.trim() || password !== confirmPassword) {
      setError("Passwords must match to continue.");
      return;
    }
    if (!certify || !consent) {
      setError("Both certifications below are required to submit.");
      return;
    }
    setError("");
    login({ name: fullName.trim(), role });
    router.push(ROLE_HOME[role]);
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <TopStatusBar />
      <MarketingHeader active="signup" />

      <div className="mx-auto max-w-6xl px-4 py-8 lg:px-6">
        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-500">
          Sec-Auth Protocol · Staff Credentialing
        </span>
        <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
          Hospital Staff Credentialing & Rank Registration
        </h1>
        <p className="mt-1 max-w-2xl text-xs text-slate-500">
          For onboarding a new team member. In production this creates a pending request an administrator
          reviews and approves — it does not grant access on its own.
        </p>

        <div className="mt-4 flex items-start gap-2 rounded-lg bg-status-blue-bg px-3 py-2.5 text-[11px] leading-snug text-status-blue">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Clinical ranks (physician, nurse, pharmacist, lab) normally require verified council registration
          before an administrator activates the account.
        </div>

        {/* Step indicator */}
        <div className="mt-5 flex items-center gap-3">
          {steps.map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-bold ${
                  i <= step ? "bg-brand-teal text-white" : "bg-slate-100 text-slate-400"
                }`}
              >
                {i + 1}
              </div>
              <div className="hidden text-[11px] font-semibold text-slate-500 sm:block">{label}</div>
              {i < steps.length - 1 && <div className="h-px flex-1 bg-surface-border" />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1.3fr]">
          {/* Left: rank selector, always visible */}
          <div>
            <p className="text-xs font-bold text-slate-800">Select institutional rank</p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Configures the menus and record access this account will have.
            </p>
            <div className="mt-3 space-y-2.5">
              {selectableRoles.map((r) => {
                const meta = ROLE_META[r];
                const active = role === r;
                return (
                  <button
                    type="button"
                    key={r}
                    onClick={() => setRole(r)}
                    className={`w-full rounded-lg border p-3 text-left ${
                      active ? "border-brand-teal ring-1 ring-brand-teal" : "border-surface-border hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2.5">
                        {active ? (
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-brand-teal" />
                        ) : (
                          <Circle className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
                        )}
                        <div>
                          <p className="text-[13px] font-bold text-slate-800">{ROLE_LABELS[r]}</p>
                          <p className="mt-0.5 text-[11px] leading-snug text-slate-500">{meta.privileges}</p>
                          <p className="mt-1 text-[10px] font-semibold text-slate-400">
                            Requires: {meta.requirement}
                          </p>
                        </div>
                      </div>
                      <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${tierToneClass[meta.tierTone]}`}>
                        {meta.tier}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: step content */}
          <div className="rounded-xl border border-surface-border bg-white p-5 shadow-card">
            <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2 text-[11px]">
              <span className="text-slate-400">Provisioning target</span>
              <span className="font-bold text-slate-800">{ROLE_LABELS[role]}</span>
            </div>

            {step === 0 && (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-bold text-slate-800">1. Personal & institutional identity</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Full name" icon={User}>
                    <input
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Ama Serwaa"
                      className="w-full text-sm text-slate-800 outline-none placeholder:text-slate-300"
                    />
                  </Field>
                  <Field label="Staff ID" icon={Building2}>
                    <input
                      value={staffId}
                      onChange={(e) => setStaffId(e.target.value)}
                      placeholder="KBH-2291"
                      className="w-full text-sm text-slate-800 outline-none placeholder:text-slate-300"
                    />
                  </Field>
                  <Field label="Official work email" icon={Mail}>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="a.serwaa@aurahealth.org"
                      className="w-full text-sm text-slate-800 outline-none placeholder:text-slate-300"
                    />
                  </Field>
                  <Field label="Duty desk / mobile" icon={Phone}>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+233 24 000 0000"
                      className="w-full text-sm text-slate-800 outline-none placeholder:text-slate-300"
                    />
                  </Field>
                </div>
              </div>
            )}

            {step === 1 && (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-bold text-slate-800">2. Regulatory licensure & clinical scope</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Department" icon={Building2}>
                    <input
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Cardiology"
                      className="w-full text-sm text-slate-800 outline-none placeholder:text-slate-300"
                    />
                  </Field>
                  <Field label="Council / license number (if applicable)" icon={Building2}>
                    <input
                      value={licenseNumber}
                      onChange={(e) => setLicenseNumber(e.target.value)}
                      placeholder="MDC/G/77209-A"
                      className="w-full text-sm text-slate-800 outline-none placeholder:text-slate-300"
                    />
                  </Field>
                </div>

                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                    Identity & license document (optional for this prototype)
                  </label>
                  <label className="mt-1 flex cursor-pointer flex-col items-center gap-1.5 rounded-lg border border-dashed border-surface-border bg-slate-50 px-4 py-6 text-center hover:bg-slate-100">
                    <UploadCloud className="h-5 w-5 text-slate-400" />
                    <span className="text-[11px] font-semibold text-slate-600">
                      {fileName || "Click to attach a certificate (PNG, JPG or PDF)"}
                    </span>
                    <input
                      type="file"
                      className="hidden"
                      onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                    />
                  </label>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="mt-4 space-y-3">
                <p className="text-xs font-bold text-slate-800">3. Master security credentials</p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <Field label="Create password" icon={Lock}>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full text-sm text-slate-800 outline-none placeholder:text-slate-300"
                    />
                  </Field>
                  <Field label="Confirm password" icon={Lock}>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full text-sm text-slate-800 outline-none placeholder:text-slate-300"
                    />
                  </Field>
                </div>

                <div className="rounded-lg border border-surface-border bg-slate-50 p-3">
                  <div className="flex items-center justify-between text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    <span>Password strength</span>
                    <span>{entropy.score}/4 criteria met</span>
                  </div>
                  <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-200">
                    <div
                      className={`h-full rounded-full ${
                        entropy.score <= 1 ? "bg-status-red" : entropy.score <= 2 ? "bg-status-amber" : "bg-status-green"
                      }`}
                      style={{ width: `${(entropy.score / 4) * 100}%` }}
                    />
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-1">
                    {entropy.checks.map((c) => (
                      <span
                        key={c.label}
                        className={`flex items-center gap-1 text-[10px] ${c.pass ? "text-status-green" : "text-slate-400"}`}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {c.label}
                      </span>
                    ))}
                  </div>
                </div>

                <label className="flex items-start gap-2 text-[11px] text-slate-600">
                  <input type="checkbox" checked={certify} onChange={(e) => setCertify(e.target.checked)} className="mt-0.5" />
                  I certify the information provided is accurate and I understand misuse of clinical
                  credentials is subject to review.
                </label>
                <label className="flex items-start gap-2 text-[11px] text-slate-600">
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
                  I consent to every record access under this account being logged with a timestamp, for
                  audit purposes.
                </label>
              </div>
            )}

            {error && <p className="mt-3 text-[11px] font-semibold text-status-red">{error}</p>}

            <div className="mt-5 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={back}
                disabled={step === 0}
                className="rounded-md border border-surface-border px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                Back
              </button>
              {step < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={next}
                  className="rounded-md bg-brand-teal px-5 py-2 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  Continue
                </button>
              ) : (
                <button
                  type="submit"
                  className="rounded-md bg-brand-teal px-5 py-2 text-xs font-semibold text-white hover:bg-teal-700"
                >
                  Submit credentialing & request access
                </button>
              )}
            </div>

            <p className="mt-4 text-center text-xs text-slate-500">
              Already have an active account?{" "}
              <Link href="/login" className="font-semibold text-brand-teal hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>

      <ComplianceFooter />
    </div>
  );
}

function Field({
  label,
  icon: Icon,
  children,
}: {
  label: string;
  icon: typeof User;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</label>
      <div className="mt-1 flex items-center gap-2 rounded-md border border-surface-border px-3 py-2">
        <Icon className="h-4 w-4 shrink-0 text-slate-400" />
        {children}
      </div>
    </div>
  );
}
