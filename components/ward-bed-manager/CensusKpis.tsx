import type { CensusKpiView } from "@/lib/ward-data";

const dotTone: Record<string, string> = {
  info: "bg-brand-cyan",
  success: "bg-status-green",
  warning: "bg-status-amber",
  neutral: "bg-slate-400",
};

export default function CensusKpis({ kpis }: { kpis: CensusKpiView[] }) {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {kpis.map((kpi, i) => (
        <div key={kpi.id} className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
          <p className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
            {i !== 0 && <span className={`h-1.5 w-1.5 rounded-full ${dotTone[kpi.tone ?? "neutral"]}`} />}
            {kpi.label}
          </p>
          <p className="mt-1 text-2xl font-extrabold text-slate-900">{kpi.value}</p>
          <p className="mt-0.5 text-[11px] text-slate-400">{kpi.note}</p>
        </div>
      ))}
    </div>
  );
}
