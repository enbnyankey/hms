"use client";

import { UserPlus, ShieldCheck, Pencil, Trash2, type LucideIcon } from "lucide-react";

export type ActivityEntry = {
  id: string;
  type: "register" | "verify" | "edit" | "deactivate";
  message: string;
  timestamp: string;
};

const iconFor: Record<ActivityEntry["type"], { icon: LucideIcon; className: string }> = {
  register: { icon: UserPlus, className: "bg-teal-50 text-brand-teal" },
  verify: { icon: ShieldCheck, className: "bg-status-green-bg text-status-green" },
  edit: { icon: Pencil, className: "bg-status-blue-bg text-status-blue" },
  deactivate: { icon: Trash2, className: "bg-status-red-bg text-status-red" },
};

export default function RecentActivityPanel({ entries }: { entries: ActivityEntry[] }) {
  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="border-b border-surface-border px-5 py-4">
        <h2 className="text-sm font-bold text-slate-900">Front Desk Activity</h2>
        <p className="text-[11px] text-slate-400">Recent registry actions by all staff</p>
      </div>
      <div className="max-h-[420px] overflow-y-auto p-4">
        {entries.length === 0 ? (
          <p className="px-1 py-6 text-center text-xs text-slate-400">No activity recorded yet today.</p>
        ) : (
          <ul className="space-y-3">
            {entries.map((entry) => {
              const cfg = iconFor[entry.type];
              const Icon = cfg.icon;
              return (
                <li key={entry.id} className="flex items-start gap-2.5">
                  <span className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${cfg.className}`}>
                    <Icon className="h-3 w-3" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-snug text-slate-700">{entry.message}</p>
                    <p className="text-[10px] text-slate-400">{entry.timestamp}</p>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
