"use client";

import { useState } from "react";
import { ClipboardList, CalendarClock, UserRound, HeartPulse } from "lucide-react";
import { nursingHeader } from "@/lib/nursing-emar-data";
import RecordVitalsModal from "./RecordVitalsModal";

export default function EmarHeader({
  onSaveVitals,
}: {
  onSaveVitals: (patientLabel: string, values: { bp: string; pulse: string; temp: string; spo2: string; resp: string }) => void;
}) {
  const [vitalsOpen, setVitalsOpen] = useState(false);

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-brand-teal">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {nursingHeader.facility}
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Nursing &amp; eMAR</h1>
          <p className="text-xs text-slate-500">{nursingHeader.ward}</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
            <CalendarClock className="h-3.5 w-3.5" />
            {nursingHeader.shift}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
            {nursingHeader.date}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-semibold text-brand-teal">
            <UserRound className="h-3.5 w-3.5" />
            {nursingHeader.nurseInCharge}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setVitalsOpen(true)}
          className="flex items-center gap-1.5 rounded-md bg-brand-teal px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700"
        >
          <HeartPulse className="h-3.5 w-3.5" />
          Record Vitals
        </button>
      </div>

      <RecordVitalsModal
        open={vitalsOpen}
        onClose={() => setVitalsOpen(false)}
        onSave={(patientLabel, values) => {
          onSaveVitals(patientLabel, values);
          setVitalsOpen(false);
        }}
      />
    </div>
  );
}
