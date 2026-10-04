"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Stethoscope,
  BedDouble,
  ClipboardList,
  Pill,
  FlaskConical,
  CreditCard,
  LayoutGrid,
  Activity,
  HeartPulse,
  Radio,
  ShieldCheck,
} from "lucide-react";
import { useAuth, ROLES, ROLE_LABELS, ROLE_META, ROLE_HOME } from "@/lib/auth";
import TopStatusBar from "@/components/marketing/TopStatusBar";
import MarketingHeader from "@/components/marketing/MarketingHeader";
import ComplianceFooter from "@/components/marketing/ComplianceFooter";

const modules = [
  {
    icon: LayoutGrid,
    title: "Executive Leadership Suite",
    desc: "Live bed occupancy, revenue channels, and hospital-wide KPIs in one console.",
    stat: "342 patients today",
    href: "/login",
  },
  {
    icon: Stethoscope,
    title: "Doctor Consultation & e-Rx",
    desc: "SOAP notes, ICD-11 diagnosis, drug-interaction checks, one-tap e-prescribing.",
    stat: "38 doctors on roster",
    href: "/login",
  },
  {
    icon: BedDouble,
    title: "Ward & Inpatient Management",
    desc: "Live occupancy across ICU, maternity, surgical and paediatric wards.",
    stat: "237/280 beds occupied",
    href: "/login",
  },
  {
    icon: ClipboardList,
    title: "Nursing & eMAR Station",
    desc: "Medication administration records, vitals charting, shift handover notes.",
    stat: "84 nurses on roster",
    href: "/login",
  },
  {
    icon: Pill,
    title: "Pharmacy & Dispensing Hub",
    desc: "Dispensing, cold-chain monitoring, and controlled-substance ledgers.",
    stat: "14 pharmacy staff",
    href: "/login",
  },
  {
    icon: FlaskConical,
    title: "Pathology & Diagnostic Lab",
    desc: "Accessioning, instrument-interfaced results, and pathologist sign-off.",
    stat: "9 lab technicians",
    href: "/login",
  },
];

const tierToneClass: Record<string, string> = {
  admin: "bg-slate-800 text-white",
  clinical: "bg-teal-50 text-brand-teal",
  support: "bg-status-blue-bg text-status-blue",
};

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [loading, user, router]);

  return (
    <div className="min-h-screen bg-slate-50">
      <TopStatusBar />
      <MarketingHeader />

      {/* Hero */}
      <section className="border-b border-surface-border bg-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-14 lg:grid-cols-[1.2fr_1fr] lg:items-center">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-semibold text-brand-teal">
              <ShieldCheck className="h-3.5 w-3.5" />
              Built for Ghanaian & West African facilities
            </span>
            <h1 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Next-generation clinical precision & hospital administration.
            </h1>
            <p className="mt-3 max-w-xl text-sm text-slate-500">
              AuraHealth HMS connects registration, triage, wards, pharmacy, the lab, and NHIS billing — with
              every screen scoped to the person using it, from Chief of Staff to student doctor.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-md bg-brand-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
              >
                Staff Ingress & Sign In
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/signup"
                className="rounded-md border border-surface-border bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Staff Onboarding / Rank Register
              </Link>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4 border-t border-surface-border pt-6">
              <div>
                <p className="text-lg font-extrabold text-slate-900">18ms</p>
                <p className="text-[11px] text-slate-400">Mean UI sync</p>
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-900">412/490</p>
                <p className="text-[11px] text-slate-400">Active inpatient beds</p>
              </div>
              <div>
                <p className="text-lg font-extrabold text-slate-900">9</p>
                <p className="text-[11px] text-slate-400">Role-scoped staff tiers</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-slate-950 p-5 text-white shadow-card">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <Radio className="h-3.5 w-3.5 text-emerald-400" />
                Live sample telemetry
              </span>
              <span className="rounded bg-white/10 px-2 py-0.5 font-mono">MOCK DATA</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-[10px] uppercase text-slate-400">ECG / HR</p>
                <p className="text-xl font-extrabold">74 bpm</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-[10px] uppercase text-slate-400">SpO2</p>
                <p className="text-xl font-extrabold">98.6%</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-[10px] uppercase text-slate-400">NIBP</p>
                <p className="text-xl font-extrabold">118/78</p>
              </div>
              <div className="rounded-lg bg-white/5 p-3">
                <p className="text-[10px] uppercase text-slate-400">Resp. rate</p>
                <p className="text-xl font-extrabold">16/min</p>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-white/5 p-3 text-[11px]">
              <Activity className="h-4 w-4 shrink-0 text-status-red" />
              <span>Sample dispatch: trauma bay resuscitation, ETA 4 min</span>
            </div>
          </div>
        </div>
      </section>

      {/* Core capabilities */}
      <section className="mx-auto max-w-6xl px-6 py-14">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-brand-teal">System core capabilities</p>
            <h2 className="mt-1 text-xl font-extrabold text-slate-900">
              Clinical modules engineered for zero ambiguity
            </h2>
          </div>
          <span className="hidden items-center gap-1.5 rounded-full bg-status-green-bg px-2.5 py-1 text-[11px] font-semibold text-status-green sm:flex">
            6 modules online
          </span>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <Link
              key={m.title}
              href={m.href}
              className="rounded-xl border border-surface-border bg-white p-5 shadow-card transition hover:border-brand-teal"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-brand-teal">
                <m.icon className="h-4.5 w-4.5" />
              </div>
              <h3 className="mt-3 text-sm font-bold text-slate-900">{m.title}</h3>
              <p className="mt-1 text-xs leading-snug text-slate-500">{m.desc}</p>
              <div className="mt-3 flex items-center justify-between border-t border-surface-border pt-2.5 text-[11px]">
                <span className="font-semibold text-slate-400">{m.stat}</span>
                <span className="flex items-center gap-1 font-semibold text-brand-teal">
                  Explore <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>

        <Link
          href="/login"
          className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-white p-5 shadow-card transition hover:border-brand-teal"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-50 text-brand-teal">
              <CreditCard className="h-4.5 w-4.5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Billing, Folio Settlements & NHIS Claims Adjudication</h3>
              <p className="text-xs text-slate-500">
                Itemized billing, NHIS batch submission, and payment reconciliation.
              </p>
            </div>
          </div>
          <span className="flex items-center gap-1 text-xs font-semibold text-brand-teal">
            Billing protocol <ArrowRight className="h-3.5 w-3.5" />
          </span>
        </Link>
      </section>

      {/* Access governance */}
      <section className="border-t border-surface-border bg-white py-14">
        <div className="mx-auto max-w-6xl px-6">
          <p className="text-[11px] font-bold uppercase tracking-wide text-brand-teal">Access governance</p>
          <h2 className="mt-1 text-xl font-extrabold text-slate-900">Clinical rank hierarchy & role-based security</h2>
          <p className="mt-1 max-w-2xl text-xs text-slate-500">
            Every account is scoped to exactly the modules its rank needs — a student doctor never sees
            billing, and a billing clerk never sees a diagnosis.
          </p>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {ROLES.map((r) => {
              const meta = ROLE_META[r];
              return (
                <div key={r} className="rounded-lg border border-surface-border p-4">
                  <div className="flex items-center justify-between">
                    <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-extrabold tracking-wide text-slate-700">
                      {meta.code}
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${tierToneClass[meta.tierTone]}`}>
                      {meta.tier}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] font-bold text-slate-800">{ROLE_LABELS[r]}</p>
                  <p className="mt-1 text-[11px] leading-snug text-slate-500">{meta.privileges}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-5 flex items-start gap-2 rounded-lg bg-status-blue-bg px-4 py-3 text-[11px] leading-snug text-status-blue">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0" />
            Client-side menus mirror the same role checks the API layer enforces — hiding a menu item is a
            convenience, never the security boundary itself.
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-6 py-14 text-center">
        <HeartPulse className="mx-auto h-8 w-8 text-brand-teal" strokeWidth={2.25} />
        <h2 className="mt-3 text-xl font-extrabold text-slate-900">Initiate clinical onboarding or ingress</h2>
        <p className="mx-auto mt-1 max-w-md text-xs text-slate-500">
          Certified staff sign in directly; new medical, nursing or administrative personnel register their
          rank for approval.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Link
            href="/login"
            className="rounded-md bg-brand-teal px-5 py-2.5 text-sm font-semibold text-white hover:bg-teal-700"
          >
            Staff Portal Login
          </Link>
          <Link
            href="/signup"
            className="rounded-md border border-surface-border bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Register New Practitioner
          </Link>
        </div>
      </section>

      <ComplianceFooter />
    </div>
  );
}
