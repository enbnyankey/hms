import { Landmark, ShieldCheck, Building2, Smartphone, AlertOctagon } from "lucide-react";
import { billingKpis } from "@/lib/billing-data";

const icons = [Landmark, ShieldCheck, Building2, Smartphone, AlertOctagon];

export default function BillingKpis() {
  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {billingKpis.map((kpi, i) => {
        const Icon = icons[i];
        const danger = kpi.tone === "danger";
        return (
          <div
            key={kpi.id}
            className={`rounded-xl border p-4 shadow-card ${
              danger ? "border-red-200 bg-status-red-bg" : "border-surface-border bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <p
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  danger ? "text-status-red" : "text-slate-400"
                }`}
              >
                {kpi.label}
              </p>
              <Icon className={`h-3.5 w-3.5 ${danger ? "text-status-red" : "text-slate-300"}`} />
            </div>
            <p className={`mt-1 text-xl font-extrabold ${danger ? "text-status-red" : "text-slate-900"}`}>
              {kpi.value}
            </p>
            <p className={`mt-0.5 text-[11px] ${danger ? "text-status-red/80" : "text-slate-400"}`}>{kpi.note}</p>
          </div>
        );
      })}
    </div>
  );
}
