"use client";

import { useState } from "react";
import { Search, BadgeCheck, Inbox } from "lucide-react";
import type { StaffCredential, CredentialCategory } from "@/lib/staff-credentialing-data";

const toneClass: Record<StaffCredential["statusTone"], string> = {
  danger: "bg-status-red-bg text-status-red",
  warning: "bg-status-amber-bg text-status-amber",
  info: "bg-status-blue-bg text-status-blue",
  success: "bg-status-green-bg text-status-green",
};

const tabs: { id: "all" | CredentialCategory; label: string }[] = [
  { id: "all", label: "All" },
  { id: "attending", label: "Attending" },
  { id: "nursing", label: "Nursing" },
  { id: "pharm_lis", label: "Pharm/LIS" },
  { id: "admin", label: "Adm" },
];

export default function CredentialList({
  items,
  selectedId,
  onSelect,
}: {
  items: StaffCredential[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [tab, setTab] = useState<"all" | CredentialCategory>("all");
  const [search, setSearch] = useState("");

  const counts = {
    all: items.length,
    attending: items.filter((i) => i.category === "attending").length,
    nursing: items.filter((i) => i.category === "nursing").length,
    pharm_lis: items.filter((i) => i.category === "pharm_lis").length,
    admin: items.filter((i) => i.category === "admin").length,
  };

  const filtered = items.filter((i) => {
    if (tab !== "all" && i.category !== tab) return false;
    if (search) {
      const q = search.toLowerCase();
      const haystack = `${i.name} ${i.registryNo} ${i.roleTitle}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });

  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="border-b border-surface-border p-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter by name, council reg #, or role..."
            className="w-full rounded-md border border-surface-border py-2 pl-8 pr-3 text-xs text-slate-700 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`rounded-md px-2.5 py-1 text-[11px] font-semibold ${
                tab === t.id ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {t.label} ({counts[t.id]})
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-10 text-center">
          <Inbox className="h-6 w-6 text-slate-300" />
          <p className="text-xs font-semibold text-slate-500">No credentialing requests match</p>
          <p className="text-[11px] text-slate-400">Try clearing the search or filter selection.</p>
        </div>
      ) : (
        <ul className="max-h-[640px] divide-y divide-surface-border overflow-y-auto">
          {filtered.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => onSelect(item.id)}
                className={`flex w-full flex-col gap-1 px-4 py-3 text-left ${
                  selectedId === item.id ? "bg-teal-50/60" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                    {item.name}
                    {item.fido2Issued && <BadgeCheck className="h-3.5 w-3.5 text-brand-teal" />}
                  </span>
                  <span className="shrink-0 text-[10px] text-slate-400">{item.submittedAgo}</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {item.roleTitle} (Tier {item.tier})
                </p>
                <p className="text-[11px] text-slate-400">
                  {item.department} · {item.registryNo}
                </p>
                <div className="mt-1 flex items-center justify-between gap-2">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${toneClass[item.statusTone]}`}>
                    {item.statusLabel}
                  </span>
                  {item.stage && <span className="text-[10px] font-semibold text-slate-400">{item.stage}</span>}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
