"use client";

import { Search, X } from "lucide-react";

export type WardFilterOption = { id: string; label: string; count: number };

export type BedStatusFilter = "all" | "occupied" | "discharge-ready" | "available" | "reserved" | "cleaning" | "maintenance";

export default function WardFilterBar({
  wardFilters,
  activeFilter,
  onFilterChange,
  search,
  onSearchChange,
  isolationOnly,
  onIsolationOnlyChange,
  statusFilter,
  onStatusFilterChange,
  highlightUnderstaffed,
  onHighlightUnderstaffedChange,
}: {
  wardFilters: WardFilterOption[];
  activeFilter: string;
  onFilterChange: (id: string) => void;
  search: string;
  onSearchChange: (value: string) => void;
  isolationOnly: boolean;
  onIsolationOnlyChange: (value: boolean) => void;
  statusFilter: BedStatusFilter;
  onStatusFilterChange: (value: BedStatusFilter) => void;
  highlightUnderstaffed: boolean;
  onHighlightUnderstaffedChange: (value: boolean) => void;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl border border-surface-border bg-white p-3 shadow-card">
      <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Filter Ward:</span>
      <div className="flex flex-wrap items-center gap-1.5">
        {wardFilters.map((f) => (
          <button
            key={f.id}
            type="button"
            aria-pressed={activeFilter === f.id}
            onClick={() => onFilterChange(f.id)}
            className={`rounded-md px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
              activeFilter === f.id ? "bg-brand-cyan text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search patient, bed or MRN…"
          className="w-56 rounded-md border border-surface-border py-1.5 pl-8 pr-7 text-[11px] text-slate-700 outline-none placeholder:text-slate-300 focus:border-brand-teal"
        />
        {search && (
          <button
            type="button"
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="absolute right-1.5 top-1/2 flex h-4 w-4 -translate-y-1/2 items-center justify-center rounded text-slate-300 hover:text-slate-500"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      <select
        value={statusFilter}
        onChange={(e) => onStatusFilterChange(e.target.value as BedStatusFilter)}
        className="ml-auto rounded-md border border-surface-border px-2.5 py-1.5 text-[11px] font-medium text-slate-500 outline-none focus:border-brand-teal"
      >
        <option value="all">All Bed Statuses</option>
        <option value="occupied">Occupied</option>
        <option value="discharge-ready">Discharge Ready</option>
        <option value="available">Available</option>
        <option value="reserved">Reserved</option>
        <option value="cleaning">Cleaning</option>
        <option value="maintenance">Out of Service</option>
      </select>

      <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
        <input
          type="checkbox"
          checked={isolationOnly}
          onChange={(e) => onIsolationOnlyChange(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-surface-border"
        />
        Isolation Beds Only
      </label>

      <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-500">
        <input
          type="checkbox"
          checked={highlightUnderstaffed}
          onChange={(e) => onHighlightUnderstaffedChange(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-surface-border"
        />
        Staffing Ratio 1:5 Overall
      </label>

      {(search || isolationOnly || statusFilter !== "all" || activeFilter !== "all") && (
        <button
          type="button"
          onClick={() => {
            onSearchChange("");
            onIsolationOnlyChange(false);
            onStatusFilterChange("all");
            onFilterChange("all");
          }}
          className="flex items-center gap-1 rounded-md border border-surface-border px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
        >
          <X className="h-3 w-3" />
          Clear
        </button>
      )}
    </div>
  );
}
