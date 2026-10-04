import { Lock, Radar, ShieldCheck, BadgeCheck } from "lucide-react";

export default function AuditStatTiles({ totalEvents, flaggedCount }: { totalEvents: number; flaggedCount: number }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Cryptographic Ledger</p>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-teal-50 text-brand-teal">
            <Lock className="h-3.5 w-3.5" />
          </span>
        </div>
        <p className="mt-1 text-2xl font-extrabold text-slate-900">100% <span className="text-sm font-semibold text-slate-400">Immutable</span></p>
        <p className="mt-1 text-[11px] text-slate-400">Merkle Hash Chain Verified (#1.84M) · Root: 0x89e2…4bc7</p>
      </div>

      <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">24h Ingress Events</p>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-status-red-bg text-status-red">
            <Radar className="h-3.5 w-3.5" />
          </span>
        </div>
        <p className="mt-1 text-2xl font-extrabold text-slate-900">
          {totalEvents.toLocaleString()} <span className="text-sm font-semibold text-slate-400">total</span>
        </p>
        <p className="mt-1 text-[11px] text-slate-400">0 Critical Breaches · {flaggedCount} Flags for review</p>
      </div>

      <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Zero-Trust Sessions</p>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-status-blue-bg text-status-blue">
            <ShieldCheck className="h-3.5 w-3.5" />
          </span>
        </div>
        <p className="mt-1 text-2xl font-extrabold text-slate-900">148 <span className="text-sm font-semibold text-slate-400">Clinicians Active</span></p>
        <p className="mt-1 text-[11px] text-slate-400">Hardware Security Key Authenticated · MFA re-auth &lt; 45m</p>
      </div>

      <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Regulatory Compliance</p>
          <span className="flex h-7 w-7 items-center justify-center rounded-md bg-status-green-bg text-status-green">
            <BadgeCheck className="h-3.5 w-3.5" />
          </span>
        </div>
        <p className="mt-1 text-2xl font-extrabold text-slate-900">100% <span className="text-sm font-semibold text-slate-400">Passed</span></p>
        <p className="mt-1 text-[11px] text-slate-400">HIPAA · ISO 27001 · Ghana DPA · Next audit scheduled</p>
      </div>
    </div>
  );
}
