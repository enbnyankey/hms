"use client";

import { Cpu, PhoneCall, ShieldCheck, CheckCircle2, AlertTriangle } from "lucide-react";
import Card from "../Card";
import type { SpecimenItem } from "@/lib/lab-data";
import { clock, type Analyzer } from "@/lib/lab-api";

const ACCREDITATION =
  "Korle-Bu Central Diagnostic Network is ISO 15189:2022 compliant and synchronized with West African Health Organization (WAHO) Laboratory Quality Surveillance.";

const dot: Record<Analyzer["status"], string> = {
  ONLINE: "bg-status-green",
  MAINTENANCE: "bg-status-amber",
  OFFLINE: "bg-status-red",
};

export default function LabSidebar({
  analyzers,
  specimens,
  canWork,
  onSelect,
  onAnalyzerStatus,
}: {
  analyzers: Analyzer[];
  /** Worklist items; those with critical values feed the call log. */
  specimens: SpecimenItem[];
  canWork: boolean;
  onSelect: (id: string) => void;
  onAnalyzerStatus: (a: Analyzer, status: Analyzer["status"]) => void;
}) {
  const online = analyzers.filter((a) => a.status === "ONLINE").length;
  const critical = specimens.filter((s) => s.hasCritical);

  return (
    <div className="space-y-3">
      <Card
        icon={Cpu}
        iconClassName="bg-slate-100 text-slate-600"
        title="Analyzers"
        headerClassName="px-4 py-2.5"
        bodyClassName="p-3"
        action={<span className="rounded-full bg-status-green-bg px-2.5 py-1 text-[11px] font-semibold text-status-green">{online} Online</span>}
      >
        <div className="space-y-2">
          {analyzers.map((a) => (
            <div key={a.id} className="rounded-lg border border-surface-border bg-white p-2">
              <p className="flex items-center gap-1.5 text-[12px] font-bold text-slate-800">
                <span className={`h-1.5 w-1.5 rounded-full ${dot[a.status]}`} />
                {a.name}
              </p>
              <p className="text-[11px] text-slate-400">{a.description}</p>
              <div className="mt-1.5 flex items-center justify-between gap-2 text-[10px]">
                <span className="text-slate-500">{a.note ?? ""}</span>
                {canWork ? (
                  <select
                    value={a.status}
                    onChange={(e) => onAnalyzerStatus(a, e.target.value as Analyzer["status"])}
                    aria-label={`${a.name} status`}
                    className="rounded border border-surface-border px-1 py-0.5 text-[10px] font-semibold text-slate-600"
                  >
                    <option value="ONLINE">Online</option>
                    <option value="MAINTENANCE">Maintenance</option>
                    <option value="OFFLINE">Offline</option>
                  </select>
                ) : (
                  <span className="font-semibold text-slate-600">{a.status.toLowerCase()}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card
        icon={PhoneCall}
        iconClassName="bg-status-red-bg text-status-red"
        title="Critical Value Calls"
        headerClassName="px-4 py-2.5"
        bodyClassName="p-3"
        action={<span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">Last 24h</span>}
      >
        {critical.length === 0 ? (
          <p className="py-4 text-center text-[11px] text-slate-400">No critical values in the last 24 hours.</p>
        ) : (
          <div className="space-y-2">
            {critical.map((s) => {
              const call = s.criticalCalls.find((c) => c.readBackConfirmed);
              const values = s.analytes.filter((a) => a.flagTone === "critical").map((a) => `${a.name} = ${a.value} ${a.unit}`).join(" · ");
              return (
                <button
                  key={s.id}
                  onClick={() => onSelect(s.id)}
                  className={`block w-full rounded-lg border p-2 text-left ${s.criticalPending ? "border-status-red-bg bg-status-red-bg/50" : "border-surface-border bg-white"}`}
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-slate-500">{s.specId}</span>
                    {s.criticalPending ? (
                      <span className="flex items-center gap-1 font-bold text-status-red">
                        <AlertTriangle className="h-3 w-3" /> Call pending
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 font-bold text-status-green">
                        <CheckCircle2 className="h-3 w-3" /> Read back
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-[11px] font-semibold text-slate-700">{s.patient} · {s.location}</p>
                  <p className="text-[11px] text-slate-500">{values}</p>
                  {call && <p className="mt-1 text-[10px] text-slate-400">{call.calledTo} confirmed at {clock(call.calledAt)}.</p>}
                </button>
              );
            })}
          </div>
        )}
      </Card>

      <Card icon={ShieldCheck} iconClassName="bg-teal-50 text-brand-teal" title="Pathology Accreditation" headerClassName="px-4 py-2.5" bodyClassName="p-3">
        <p className="text-[11px] leading-snug text-slate-500">{ACCREDITATION}</p>
      </Card>
    </div>
  );
}
