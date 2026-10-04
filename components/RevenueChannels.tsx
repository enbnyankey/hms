import { Wallet } from "lucide-react";
import Card from "./Card";
import { revenueChannels, revenueBreakdown, revenueTotal, nhisBatchStatus } from "@/lib/mock-data";

const dotColor: Record<string, string> = {
  "bg-brand-cyan": "#0e7490",
  "bg-brand-teal": "#0d9488",
  "bg-amber-400": "#fbbf24",
};

export default function RevenueChannels() {
  const gradientStops = buildConicGradient(revenueChannels);

  return (
    <Card
      icon={Wallet}
      iconClassName="bg-teal-50 text-brand-teal"
      title="Daily Revenue Channels"
      subtitle="Claims, Cash & MoMo Gateways"
      headerClassName="px-4 py-3"
      bodyClassName="p-4"
    >
      <div className="flex items-center gap-4">
        <div
          className="relative h-16 w-16 shrink-0 rounded-full"
          style={{ background: gradientStops }}
        >
          <div className="absolute inset-2 flex flex-col items-center justify-center rounded-full bg-white text-center">
            <span className="text-[7px] font-semibold text-slate-400">GHS</span>
            <span className="text-[11px] font-extrabold text-slate-800">184k</span>
          </div>
        </div>
        <ul className="flex-1 space-y-1 text-[11px]">
          {revenueChannels.map((ch) => (
            <li key={ch.id} className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: dotColor[ch.colorClass] }}
                />
                {ch.label}
              </span>
              <span className="font-semibold text-slate-800">{ch.amount}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-2.5 space-y-1 border-t border-surface-border pt-2.5 text-[11px]">
        {revenueBreakdown.map((row) => (
          <div key={row.id} className="flex items-center justify-between text-slate-500">
            <span>{row.label}</span>
            <span className="font-medium text-slate-700">{row.amount}</span>
          </div>
        ))}
      </div>

      <div className="mt-2.5 flex items-center justify-between border-t border-surface-border pt-2 text-[11px]">
        <span className="text-slate-400">NHIS Batch Submission Status</span>
        <span className="font-semibold text-status-green">{nhisBatchStatus}</span>
      </div>
      <p className="mt-1.5 text-right text-[10px] text-slate-400">
        Total <span className="font-bold text-slate-700">{revenueTotal}</span>
      </p>
    </Card>
  );
}

function buildConicGradient(channels: typeof revenueChannels) {
  const values = [84650, 62400, 37200];
  const total = values.reduce((a, b) => a + b, 0);
  const colors = channels.map((c) => dotColor[c.colorClass]);
  let acc = 0;
  const stops = values.map((v, i) => {
    const start = (acc / total) * 360;
    acc += v;
    const end = (acc / total) * 360;
    return `${colors[i]} ${start}deg ${end}deg`;
  });
  return `conic-gradient(${stops.join(", ")})`;
}
