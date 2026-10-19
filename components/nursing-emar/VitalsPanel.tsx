"use client";

import { HeartPulse, AlertTriangle } from "lucide-react";
import Card from "@/components/Card";
import type { VitalsReading } from "@/lib/nursing-emar-data";

export default function VitalsPanel({ readings }: { readings: VitalsReading[] }) {
  return (
    <Card
      icon={HeartPulse}
      iconClassName="bg-teal-50 text-brand-cyan"
      title="Vitals Charting"
      subtitle="Latest observations per patient · due every 4h"
      headerClassName="px-4 py-3"
      bodyClassName="p-4"
    >
      <div className="space-y-2.5">
        {readings.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-400">No patients are admitted to this ward.</p>
        )}
        {readings.map((r) => (
          <div key={r.admissionId} className="rounded-lg border border-surface-border p-3">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-xs font-bold text-slate-800">{r.patientName}</p>
                <p className="text-[11px] text-slate-400">{r.bed}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-semibold text-slate-500">{r.time === "—" ? "Not recorded" : r.time}</p>
                {r.overdue && (
                  <p className="mt-0.5 flex items-center justify-end gap-1 text-[10px] font-bold text-status-red">
                    <AlertTriangle className="h-3 w-3" /> Overdue
                  </p>
                )}
              </div>
            </div>
            <div className="mt-2 grid grid-cols-5 gap-1.5 text-center">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">BP</p>
                <p className="text-[11px] font-bold text-slate-700">{r.bp}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Pulse</p>
                <p className="text-[11px] font-bold text-slate-700">{r.pulse}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Temp</p>
                <p className="text-[11px] font-bold text-slate-700">{r.temp}{r.temp !== "—" ? "°" : ""}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">SpO2</p>
                <p className="text-[11px] font-bold text-slate-700">{r.spo2}{r.spo2 !== "—" ? "%" : ""}</p>
              </div>
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wide text-slate-400">Resp</p>
                <p className="text-[11px] font-bold text-slate-700">{r.resp}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
