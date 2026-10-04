import { pharmacyKpis } from "@/lib/pharmacy-data";

const toneText: Record<string, string> = {
  danger: "text-status-red",
  success: "text-status-green",
};

export default function PharmacyKpis() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
      {pharmacyKpis.map((kpi) => (
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
