import { Users, Wallet, BedDouble, ShieldCheck, TrendingUp, TrendingDown } from "lucide-react";
import type { ComponentType } from "react";
import type { DateRangeId } from "@/lib/reports-analytics-data";
import { rangeMultiplier } from "@/lib/reports-analytics-data";

function Tile({
  icon: Icon,
  iconClassName,
  label,
  value,
  deltaLabel,
  deltaUp,
  footnote,
}: {
  icon: ComponentType<{ className?: string }>;
  iconClassName: string;
  label: string;
  value: string;
  deltaLabel: string;
  deltaUp: boolean;
  footnote: string;
}) {
  return (
    <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <span className={`flex h-7 w-7 items-center justify-center rounded-md ${iconClassName}`}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className="mt-1 text-2xl font-extrabold text-slate-900">{value}</p>
      <div className="mt-1 flex items-center gap-1 text-[11px]">
        <span className={`flex items-center gap-0.5 font-semibold ${deltaUp ? "text-status-green" : "text-status-red"}`}>
          {deltaUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {deltaLabel}
        </span>
        <span className="text-slate-400">{footnote}</span>
      </div>
    </div>
  );
}

export default function ReportsKpis({ range }: { range: DateRangeId }) {
  const m = rangeMultiplier[range];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <Tile
        icon={Users}
        iconClassName="bg-teal-50 text-brand-teal"
        label="Patient Volume"
        value={Math.round(1462 * m).toLocaleString()}
        deltaLabel="+5.2%"
        deltaUp
        footnote="vs. prior period"
      />
      <Tile
        icon={Wallet}
        iconClassName="bg-status-blue-bg text-status-blue"
        label="Total Revenue"
        value={`GH¢${Math.round(216450 * m).toLocaleString()}`}
        deltaLabel="+8.1%"
        deltaUp
        footnote="vs. prior period"
      />
      <Tile
        icon={BedDouble}
        iconClassName="bg-status-amber-bg text-status-amber"
        label="Bed Occupancy"
        value="84.6%"
        deltaLabel="-1.4%"
        deltaUp={false}
        footnote="237 of 280 beds"
      />
      <Tile
        icon={ShieldCheck}
        iconClassName="bg-status-green-bg text-status-green"
        label="NHIS Claims Approved"
        value="91.3%"
        deltaLabel="+2.0%"
        deltaUp
        footnote="of submitted claims"
      />
    </div>
  );
}
