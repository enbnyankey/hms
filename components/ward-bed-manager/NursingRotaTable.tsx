import { CalendarClock } from "lucide-react";
import { nursingRota, rotaTotals, shiftLabel } from "@/lib/ward-data";

// A ward's staffing is considered "overall ratio" compliant at 1 nurse : 5 or
// fewer patients. Anything looser than that is flagged when the toggle in the
// filter bar is on.
function ratioExceedsFive(ratio: string) {
  const match = ratio.match(/1:([\d.]+)/);
  if (!match) return false;
  return Number(match[1]) > 5;
}

export default function NursingRotaTable({ highlightUnderstaffed }: { highlightUnderstaffed: boolean }) {
  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border px-5 py-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Shift Nursing Rota & Capacity Summary</h2>
        </div>
        <span className="text-[11px] text-slate-400">{shiftLabel}</span>
      </div>

      <div className="overflow-x-auto p-5">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              <th className="pb-2 font-semibold">Ward Code & Pavilion</th>
              <th className="pb-2 font-semibold">Charge Nurse</th>
              <th className="pb-2 font-semibold text-right">Bed Capacity</th>
              <th className="pb-2 font-semibold text-right">Inpatients</th>
              <th className="pb-2 font-semibold text-right">Planned Discharges</th>
              <th className="pb-2 font-semibold text-right">Expected Admits</th>
              <th className="pb-2 font-semibold text-right">Nurse:Patient</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {nursingRota.map((row) => {
              const flagged = highlightUnderstaffed && ratioExceedsFive(row.ratio);
              return (
                <tr key={row.id} className={flagged ? "bg-status-amber-bg" : undefined}>
                  <td className="py-2.5 pr-3 font-semibold text-slate-800">{row.ward}</td>
                  <td className="py-2.5 pr-3 text-slate-500">{row.chargeNurse}</td>
                  <td className="py-2.5 pr-3 text-right font-medium text-slate-700">{row.capacity}</td>
                  <td className="py-2.5 pr-3 text-right font-bold text-brand-cyan">{row.inpatients}</td>
                  <td className="py-2.5 pr-3 text-right text-slate-500">{row.plannedDischarges}</td>
                  <td className="py-2.5 pr-3 text-right text-slate-500">{row.expectedAdmits}</td>
                  <td className={`py-2.5 text-right font-semibold ${flagged ? "text-status-amber" : "text-slate-700"}`}>
                    {row.ratio}
                    {flagged && <span className="ml-1 text-[10px] font-bold uppercase">Understaffed</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-surface-border bg-slate-50 font-bold text-slate-800">
              <td className="py-2.5 pr-3">Pavilion Total Census</td>
              <td className="py-2.5 pr-3" />
              <td className="py-2.5 pr-3 text-right">{rotaTotals.capacity}</td>
              <td className="py-2.5 pr-3 text-right text-brand-cyan">{rotaTotals.inpatients}</td>
              <td className="py-2.5 pr-3 text-right">{rotaTotals.plannedDischarges}</td>
              <td className="py-2.5 pr-3 text-right">{rotaTotals.expectedAdmits}</td>
              <td className="py-2.5 text-right">{rotaTotals.ratio}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
