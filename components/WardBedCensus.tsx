import { BedDouble } from "lucide-react";
import Card from "./Card";
import { wardStats, wardTotals, wardEscalation } from "@/lib/mock-data";

const toneBar: Record<string, string> = {
  red: "bg-status-red",
  amber: "bg-amber-400",
  green: "bg-status-green",
};

export default function WardBedCensus() {
  return (
    <Card
      icon={BedDouble}
      iconClassName="bg-blue-50 text-status-blue"
      title="Ward Bed Census"
      subtitle="12 Clinical Care Units"
      headerClassName="px-4 py-3"
      bodyClassName="p-4"
      action={
        <span className="text-sm font-bold text-slate-800">
          {wardTotals.occupied}/{wardTotals.total}
        </span>
      }
    >
      <div className="space-y-2">
        {wardStats.map((ward) => {
          const pct = Math.round((ward.occupied / ward.total) * 100);
          return (
            <div key={ward.id}>
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-700">{ward.name}</span>
                <span className="font-semibold text-slate-500">
                  {pct}% ({ward.occupied}/{ward.total})
                </span>
              </div>
              <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full ${toneBar[ward.tone]}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <p className="mt-0.5 text-[10px] text-slate-400">{ward.note}</p>
            </div>
          );
        })}
      </div>

      <div className="mt-3 rounded-lg border border-surface-border bg-slate-50 p-2.5">
        <p className="text-[11px] font-bold text-slate-700">{wardEscalation.title}</p>
        <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{wardEscalation.detail}</p>
      </div>
    </Card>
  );
}
