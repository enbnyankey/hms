"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import { ROLE_LABELS, ROLE_META, type Role } from "@/lib/auth";

const tierToneClass: Record<string, string> = {
  admin: "bg-slate-800 text-white",
  clinical: "bg-teal-50 text-brand-teal",
  support: "bg-status-blue-bg text-status-blue",
};

export default function RoleSelect({
  roles,
  value,
  onChange,
}: {
  roles: Role[];
  value: Role;
  onChange: (role: Role) => void;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const meta = ROLE_META[value];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 rounded-md border border-surface-border bg-white px-3 py-2 text-left hover:bg-slate-50"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-slate-800">
          {ROLE_LABELS[value]}
          <span className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${tierToneClass[meta.tierTone]}`}>
            {meta.tier}
          </span>
        </span>
        <ChevronDown className={`h-4 w-4 shrink-0 text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div className="absolute z-20 mt-1.5 w-full overflow-hidden rounded-md border border-surface-border bg-white shadow-card">
          <div className="max-h-72 overflow-y-auto py-1">
            {roles.map((r) => {
              const rMeta = ROLE_META[r];
              const active = r === value;
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    onChange(r);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center justify-between gap-3 px-3 py-2 text-left text-[13px] ${
                    active ? "bg-teal-50 text-brand-teal" : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="flex items-center gap-2 font-semibold">
                    <Check className={`h-3.5 w-3.5 shrink-0 ${active ? "opacity-100" : "opacity-0"}`} />
                    {ROLE_LABELS[r]}
                  </span>
                  <span className={`shrink-0 rounded px-1.5 py-0.5 text-[9px] font-bold ${tierToneClass[rMeta.tierTone]}`}>
                    {rMeta.tier}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
