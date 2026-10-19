import type { PharmacySummary } from "@/lib/pharmacy-api";
import { cedis, waitLabel } from "@/lib/pharmacy-data";

const toneText: Record<string, string> = {
  danger: "text-status-red",
  success: "text-status-green",
};

export default function PharmacyKpis({ summary }: { summary: PharmacySummary }) {
  const kpis = [
    {
      id: "queue",
      label: "Pending Rx Queue",
      value: String(summary.pendingRx),
      unit: summary.pendingRx === 1 ? "patient" : "patients",
      note: `${summary.pendingLines} line(s) · Avg wait ${waitLabel(summary.avgWaitMinutes)}`,
    },
    {
      id: "dispensed",
      label: "Dispensed Today",
      value: String(summary.dispensedToday),
      unit: "lines filled",
      note: `${cedis(summary.valueToday)} at formulary price`,
    },
    {
      id: "low-stock",
      label: "Low-Stock Critical",
      value: String(summary.lowStockCount),
      unit: "medications",
      note: "At or below reorder level",
      tone: summary.lowStockCount > 0 ? "danger" : undefined,
    },
    {
      id: "nhis",
      label: "NHIS Coverage Today",
      value: summary.nhisCoveragePct == null ? "—" : `${summary.nhisCoveragePct}%`,
      unit: summary.nhisCoveragePct == null ? "" : "of lines",
      note:
        summary.nhisCoveragePct == null
          ? "Nothing dispensed yet today"
          : `${summary.nhisLinesToday} line(s) at zero co-pay`,
      tone: summary.nhisCoveragePct != null ? "success" : undefined,
    },
  ];
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {kpis.map((kpi) => (
        <div key={kpi.id} className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{kpi.label}</p>
          <p className={`mt-1 text-2xl font-extrabold ${toneText[kpi.tone ?? ""] ?? "text-slate-900"}`}>
            {kpi.value}
            {kpi.unit && <span className="ml-1 text-xs font-semibold text-slate-400">{kpi.unit}</span>}
          </p>
          <p className="mt-1 text-[11px] text-slate-400">{kpi.note}</p>
        </div>
      ))}
    </div>
  );
}
