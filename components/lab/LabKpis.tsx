import { Archive, RefreshCw, AlertTriangle, Clock } from "lucide-react";
import type { LabSummary } from "@/lib/lab-api";

const toneText: Record<string, string> = {
  danger: "text-status-red",
  success: "text-status-green",
};

const icons: Record<string, typeof Archive> = {
  pending: Archive,
  running: RefreshCw,
  panic: AlertTriangle,
  tat: Clock,
};

const iconTone: Record<string, string> = {
  pending: "bg-slate-100 text-slate-500",
  running: "bg-blue-50 text-status-blue",
  panic: "bg-status-red-bg text-status-red",
  tat: "bg-status-green-bg text-status-green",
};

export default function LabKpis({ summary }: { summary: LabSummary | null }) {
  const s = summary;
  const labKpis: { id: string; label: string; value: string; unit?: string; note: string; tone?: "danger" | "success" }[] = [
    { id: "pending", label: "Awaiting Specimen", value: String(s?.awaitingAccession ?? "—"), unit: "Orders", note: "Ordered, not yet received" },
    { id: "running", label: "In Analysis", value: String(s?.inAnalysis ?? "—"), unit: "Specimens", note: `${s?.awaitingValidation ?? 0} awaiting validation` },
    {
      id: "panic",
      label: "Critical Values",
      value: String(s?.criticalPending ?? "—"),
      unit: "Calls Pending",
      note: "Phone + read-back before release",
      tone: s && s.criticalPending > 0 ? "danger" : undefined,
    },
    {
      id: "tat",
      label: "TAT Compliance (STAT)",
      value: s?.statTatCompliancePct != null ? `${s.statTatCompliancePct}%` : "—",
      unit: "Target <45m",
      note: s?.statAvgTatMinutes != null ? `Avg ${s.statAvgTatMinutes} min · ${s.statValidatedToday} STAT today` : "No STAT results today",
      tone: s?.statTatCompliancePct != null && s.statTatCompliancePct >= 90 ? "success" : s?.statTatCompliancePct != null ? "danger" : undefined,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {labKpis.map((kpi) => {
        const Icon = icons[kpi.id];
        return (
          <div key={kpi.id} className="rounded-xl border border-surface-border bg-white p-3 shadow-card">
            <div className="flex items-start justify-between">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{kpi.label}</p>
              <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${iconTone[kpi.id]}`}>
                <Icon className="h-3 w-3" />
              </span>
            </div>
            <p className={`mt-0.5 text-xl font-extrabold ${toneText[kpi.tone ?? ""] ?? "text-slate-900"}`}>
              {kpi.value}
              {kpi.unit && <span className="ml-1 text-[11px] font-semibold text-slate-400">{kpi.unit}</span>}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">{kpi.note}</p>
          </div>
        );
      })}
    </div>
  );
}
