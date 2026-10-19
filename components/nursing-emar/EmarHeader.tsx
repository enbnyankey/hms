"use client";

import { useState } from "react";
import { ClipboardList, CalendarClock, UserRound, HeartPulse } from "lucide-react";
import RecordVitalsModal, { type RosterOption, type VitalsValues } from "./RecordVitalsModal";

export type WardOption = { id: string; name: string; chargeNurse: string | null };

function shiftLabel(): string {
  const h = new Date().getHours();
  if (h >= 7 && h < 19) return "Day Shift · 07:00 – 19:00";
  return "Night Shift · 19:00 – 07:00";
}

export default function EmarHeader({
  wards,
  wardId,
  onWardChange,
  roster,
  onSaveVitals,
}: {
  wards: WardOption[];
  wardId: string;
  onWardChange: (id: string) => void;
  roster: RosterOption[];
  onSaveVitals: (admissionId: string, values: VitalsValues) => Promise<boolean>;
}) {
  const [vitalsKey, setVitalsKey] = useState<number | null>(null);
  const ward = wards.find((w) => w.id === wardId);
  const today = new Date().toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short", year: "numeric" });

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-brand-teal">
          <ClipboardList className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Korle-Bu Central Hospital
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Nursing &amp; eMAR</h1>
          <select
            value={wardId}
            onChange={(e) => onWardChange(e.target.value)}
            aria-label="Ward"
            className="mt-0.5 rounded-md border border-surface-border bg-white px-2 py-1 text-xs font-medium text-slate-600 outline-none focus:border-brand-teal"
          >
            {wards.map((w) => (
              <option key={w.id} value={w.id}>
                {w.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex flex-wrap items-center justify-end gap-1.5">
          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
            <CalendarClock className="h-3.5 w-3.5" />
            {shiftLabel()}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-600">
            {today}
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-[11px] font-semibold text-brand-teal">
            <UserRound className="h-3.5 w-3.5" />
            Charge Nurse: {ward?.chargeNurse ?? "—"}
          </span>
        </div>
        <button
          type="button"
          onClick={() => setVitalsKey(Date.now())}
          className="flex items-center gap-1.5 rounded-md bg-brand-teal px-3.5 py-2 text-xs font-semibold text-white hover:bg-teal-700"
        >
          <HeartPulse className="h-3.5 w-3.5" />
          Record Vitals
        </button>
      </div>

      {vitalsKey !== null && (
        <RecordVitalsModal
          key={vitalsKey}
          open
          roster={roster}
          onClose={() => setVitalsKey(null)}
          onSave={onSaveVitals}
        />
      )}
    </div>
  );
}
