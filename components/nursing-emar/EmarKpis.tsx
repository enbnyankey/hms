import type { EmarKpi, EmarKpiTone } from "@/lib/nursing-emar-data";

const toneText: Record<EmarKpiTone, string> = {
  info: "text-status-blue",
  success: "text-status-green",
  warning: "text-status-amber",
  danger: "text-status-red",
  neutral: "text-slate-900",
};

export default function EmarKpis({ kpis }: { kpis: EmarKpi[] }) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
      {kpis.map((kpi) => (
        <div key={kpi.id} className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{kpi.label}</p>
          <p className={`mt-1 text-2xl font-extrabold ${toneText[kpi.tone ?? "neutral"]}`}>{kpi.value}</p>
          <p className="mt-1 text-[11px] text-slate-400">{kpi.note}</p>
        </div>
      ))}
    </div>
  );
}
