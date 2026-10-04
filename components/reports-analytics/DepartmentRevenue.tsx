import { PieChart } from "lucide-react";
import Card from "@/components/Card";
import { departmentRevenue, departmentRevenueDotColor } from "@/lib/reports-analytics-data";

export default function DepartmentRevenue() {
  const total = departmentRevenue.reduce((sum, d) => sum + d.amount, 0);
  const gradient = buildConicGradient();

  return (
    <Card
      icon={PieChart}
      iconClassName="bg-status-blue-bg text-status-blue"
      title="Revenue by Department"
      subtitle="Share of total billed revenue"
    >
      <div className="flex items-center gap-4">
        <div className="relative h-20 w-20 shrink-0 rounded-full" style={{ background: gradient }}>
          <div className="absolute inset-2.5 flex flex-col items-center justify-center rounded-full bg-white text-center">
            <span className="text-[8px] font-semibold text-slate-400">GHS</span>
            <span className="text-xs font-extrabold text-slate-800">{Math.round(total / 1000)}k</span>
          </div>
        </div>
        <ul className="flex-1 space-y-1.5 text-[11px]">
          {departmentRevenue.map((d) => (
            <li key={d.id} className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-500">
                <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: departmentRevenueDotColor[d.colorClass] }} />
                {d.label}
              </span>
              <span className="font-semibold text-slate-800">GH¢{d.amount.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );

  function buildConicGradient() {
    let acc = 0;
    const stops = departmentRevenue.map((d) => {
      const start = (acc / total) * 360;
      acc += d.amount;
      const end = (acc / total) * 360;
      return `${departmentRevenueDotColor[d.colorClass]} ${start}deg ${end}deg`;
    });
    return `conic-gradient(${stops.join(", ")})`;
  }
}
