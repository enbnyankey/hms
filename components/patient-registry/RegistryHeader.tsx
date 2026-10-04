"use client";

import { UserPlus, CalendarDays, MapPin } from "lucide-react";
import { registryHeader } from "@/lib/patient-registry-data";

export default function RegistryHeader({ onNewRegistration }: { onNewRegistration: () => void }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <UserPlus className="h-4 w-4" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{registryHeader.title}</h1>
            <span className="rounded-md bg-status-blue-bg px-2 py-1 text-[11px] font-semibold text-status-blue">
              {registryHeader.wing}
            </span>
          </div>
          <p className="text-xs text-slate-500">{registryHeader.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-2 text-xs font-medium text-slate-600">
          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
          {registryHeader.dateLabel}
        </span>
        <span className="flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-2 text-xs font-medium text-slate-600">
          <MapPin className="h-3.5 w-3.5 text-slate-400" />
          {registryHeader.wing}
        </span>
        <button
          type="button"
          onClick={onNewRegistration}
          className="flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700"
        >
          <UserPlus className="h-3.5 w-3.5" />
          New Registration
        </button>
      </div>
    </div>
  );
}
