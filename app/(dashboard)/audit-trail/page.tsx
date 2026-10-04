"use client";

import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import AuditStatTiles from "@/components/audit/AuditStatTiles";
import SecurityAlerts from "@/components/audit/SecurityAlerts";
import LedgerTable from "@/components/audit/LedgerTable";
import ForensicPanel from "@/components/audit/ForensicPanel";
import { initialLedgerEvents, initialSecurityAlerts } from "@/lib/audit-log-data";

export default function AuditTrailPage() {
  const [alerts, setAlerts] = useState(initialSecurityAlerts);
  const [events] = useState(initialLedgerEvents);
  const [selectedId, setSelectedId] = useState<string | null>(initialLedgerEvents[0]?.id ?? null);

  const selected = events.find((e) => e.id === selectedId) ?? null;

  function handleReview(id: string) {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, reviewed: true } : a)));
  }

  return (
    <div>
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white">
          <ShieldCheck className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Operations &amp; Governance</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Audit &amp; Security Logs</h1>
          <p className="text-xs text-slate-500">
            Immutable cryptographic ledger, SIEM anomaly detection, and forensic chain-of-custody for every system event
          </p>
        </div>
      </div>

      <AuditStatTiles totalEvents={142890} flaggedCount={alerts.filter((a) => !a.reviewed).length + 11} />

      <div className="mt-5">
        <SecurityAlerts alerts={alerts} onReview={handleReview} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_380px]">
        <LedgerTable events={events} selectedId={selectedId} onSelect={setSelectedId} />
        <ForensicPanel event={selected} onRecalculateHash={() => {}} />
      </div>
    </div>
  );
}
