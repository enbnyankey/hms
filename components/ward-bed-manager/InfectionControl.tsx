"use client";

import { ShieldAlert, Phone, BedDouble, Sparkles, Wrench } from "lucide-react";
import { actionToast } from "@/lib/actions";

// IPC escalation contact. This is fixed hospital guidance, not live data.
const ESCALATION_CONTACT = "Contact IPC Officer Dr. Nsa Menor on Speed Dial 4410.";

/** Live infection-control picture from the bed board (all counts come from the database). */
export default function InfectionControl({
  isolationInUse,
  isolationBeds,
  cleaning,
  outOfService,
}: {
  isolationInUse: number;
  isolationBeds: number;
  cleaning: number;
  outOfService: number;
}) {
  const rows = [
    {
      icon: BedDouble,
      label: "Isolation Beds in Use",
      note: `${isolationBeds} bed${isolationBeds === 1 ? "" : "s"} under isolation precautions`,
      value: String(isolationInUse),
      tone: isolationInUse > 0 ? "text-status-amber" : "text-status-green",
    },
    {
      icon: Sparkles,
      label: "Awaiting Terminal Clean",
      note: "Vacated beds with housekeeping",
      value: String(cleaning),
      tone: cleaning > 0 ? "text-status-amber" : "text-status-green",
    },
    {
      icon: Wrench,
      label: "Out of Service",
      note: "Beds under maintenance",
      value: String(outOfService),
      tone: "text-slate-800",
    },
  ];

  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-surface-border px-5 py-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Infection Control Status</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">Live</span>
      </div>

      <div className="space-y-3 p-5">
        {rows.map((r) => {
          const Icon = r.icon;
          return (
            <div key={r.label} className="flex items-center justify-between rounded-lg border border-surface-border p-3">
              <div className="flex items-start gap-2">
                <Icon className="mt-0.5 h-3.5 w-3.5 text-slate-400" />
                <div>
                  <p className="text-xs font-bold text-slate-800">{r.label}</p>
                  <p className="text-[10px] text-slate-400">{r.note}</p>
                </div>
              </div>
              <p className={`text-sm font-extrabold ${r.tone}`}>{r.value}</p>
            </div>
          );
        })}

        <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-status-red-bg p-3">
          <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-red" />
          <div className="flex-1">
            <p className="text-xs font-bold text-status-red">Need Isolation Escalation?</p>
            <p className="text-[11px] text-slate-600">{ESCALATION_CONTACT}</p>
          </div>
          <button
            onClick={() => actionToast("Escalation call placed", ESCALATION_CONTACT, "error")}
            className="shrink-0 rounded-md bg-status-red px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-700"
          >
            Escalate Now
          </button>
        </div>
      </div>
    </div>
  );
}
