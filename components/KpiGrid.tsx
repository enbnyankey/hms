import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { kpiCards } from "@/lib/mock-data";

export default function KpiGrid() {
  return (
    <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
      {kpiCards.map((kpi) => (
        <div
          key={kpi.id}
          className={`rounded-xl border p-4 shadow-card ${
            kpi.tone === "danger"
              ? "border-red-200 bg-status-red-bg"
              : "border-surface-border bg-white"
          }`}
        >
          <p
            className={`text-[11px] font-semibold uppercase tracking-wide ${
              kpi.tone === "danger" ? "text-status-red" : "text-slate-400"
            }`}
          >
            {kpi.label}
          </p>
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span
              className={`text-2xl font-extrabold ${
                kpi.tone === "danger" ? "text-status-red" : "text-slate-900"
              }`}
            >
              {kpi.value}
            </span>
            {kpi.breakdown && (
              <span className="text-xs font-medium text-slate-400">{kpi.breakdown}</span>
            )}
          </div>
          {kpi.delta && (
            <div
              className={`mt-1 inline-flex items-center gap-0.5 text-xs font-semibold ${
                kpi.deltaTone === "up" ? "text-status-green" : "text-slate-400"
              }`}
            >
              {kpi.deltaTone === "up" && <ArrowUpRight className="h-3 w-3" />}
              {kpi.deltaTone === "down" && <ArrowDownRight className="h-3 w-3" />}
              {kpi.delta}
            </div>
          )}
          {kpi.sub && <p className="mt-1.5 text-[11px] leading-snug text-slate-400">{kpi.sub}</p>}
        </div>
      ))}
    </div>
  );
}
