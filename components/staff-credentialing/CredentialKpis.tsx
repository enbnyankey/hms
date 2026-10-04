import type { ComponentType, ReactNode } from "react";
import { ClipboardCheck, RefreshCcw, KeyRound, ShieldCheck } from "lucide-react";
import type { StaffCredential } from "@/lib/staff-credentialing-data";

export default function CredentialKpis({
  pending,
  activeRoster,
}: {
  pending: StaffCredential[];
  activeRoster: number;
}) {
  const highPriority = pending.filter((p) => p.highPriority).length;
  const synced = pending.filter((p) => p.councilSynced).length;
  const flaggedManual = pending.length - synced;
  const fido2Issued = pending.filter((p) => p.fido2Issued).length;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Tile
        icon={ClipboardCheck}
        iconClass="bg-teal-50 text-brand-teal"
        label="Pending Verification"
        value={pending.length}
        footer={<span className="rounded bg-status-red-bg px-1.5 py-0.5 text-[10px] font-bold text-status-red">+{highPriority} High Priority</span>}
      />
      <Tile
        icon={RefreshCcw}
        iconClass="bg-status-blue-bg text-status-blue"
        label="Council Automated Sync"
        value={`${synced} / ${pending.length}`}
        footer={<span className="text-[11px] text-slate-400">{flaggedManual} Flagged Manual</span>}
      />
      <Tile
        icon={KeyRound}
        iconClass="bg-status-amber-bg text-status-amber"
        label="Hardware FIDO2 Issuance"
        value={fido2Issued}
        footer={<span className="text-[11px] text-slate-400">YubiKey NFC pre-configured</span>}
      />
      <Tile
        icon={ShieldCheck}
        iconClass="bg-status-green-bg text-status-green"
        label="30-Day Active Roster"
        value={activeRoster}
        footer={<span className="text-[11px] font-semibold text-status-green">Compliance: 99.8% MDC/NMC</span>}
      />
    </div>
  );
}

function Tile({
  icon: Icon,
  iconClass,
  label,
  value,
  footer,
}: {
  icon: ComponentType<{ className?: string }>;
  iconClass: string;
  label: string;
  value: string | number;
  footer: ReactNode;
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${iconClass}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
      <div className="mt-1">{footer}</div>
    </div>
  );
}
