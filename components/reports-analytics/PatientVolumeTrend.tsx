"use client";

import { useState } from "react";
import { LineChart } from "lucide-react";
import Card from "@/components/Card";
import { patientVolumeTrend } from "@/lib/reports-analytics-data";

export default function PatientVolumeTrend() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const max = Math.max(...patientVolumeTrend.map((p) => p.value));

  return (
    <Card
      icon={LineChart}
      iconClassName="bg-teal-50 text-brand-teal"
      title="Patient Volume Trend"
      subtitle="Total encounters by month, all departments"
    >
      <div className="flex h-40 items-stretch gap-3">
        {patientVolumeTrend.map((point, idx) => {
          const heightPct = Math.max(6, (point.value / max) * 100);
          const isActive = hoverIdx === idx;
          return (
            <div
              key={point.label}
              className="flex flex-1 flex-col items-center gap-1.5"
              onMouseEnter={() => setHoverIdx(idx)}
              onMouseLeave={() => setHoverIdx(null)}
            >
              <span className={`shrink-0 text-[10px] font-semibold ${isActive ? "text-slate-800" : "text-transparent"}`}>
                {point.value.toLocaleString()}
              </span>
              <div className="flex w-full flex-1 items-end">
                <div
                  className={`w-full rounded-t-md transition-colors ${isActive ? "bg-brand-teal" : "bg-teal-100"}`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="shrink-0 text-[10px] font-semibold text-slate-400">{point.label}</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
