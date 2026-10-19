"use client";

import { useMemo, useState } from "react";
import { Search, X, Eye, Pencil, ShieldCheck, Trash2, Inbox, Copy } from "lucide-react";
import {
  registryFilters,
  matchesRegistryFilter,
  type PatientRecord,
  type RegistryFilterId,
  type NhisStatus,
} from "@/lib/patient-registry-data";

const nhisStyle: Record<NhisStatus, string> = {
  Verified: "bg-status-green-bg text-status-green",
  Pending: "bg-status-amber-bg text-status-amber",
  Expired: "bg-status-red-bg text-status-red",
  "Not Enrolled": "bg-slate-100 text-slate-500",
};

const PAGE_SIZE = 6;

export default function PatientIndexTable({
  patients,
  onView,
  onEdit,
  onVerifyNhis,
  onDeactivate,
}: {
  patients: PatientRecord[];
  onView: (id: string) => void;
  onEdit: (id: string) => void;
  onVerifyNhis: (id: string) => void;
  onDeactivate: (id: string) => void;
}) {
  const [activeFilter, setActiveFilter] = useState<RegistryFilterId>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const activePatients = useMemo(() => patients.filter((p) => p.status === "Active"), [patients]);

  const filterCounts = useMemo(() => {
    const counts: Record<RegistryFilterId, number> = {
      all: 0,
      "pending-nhis": 0,
      "walk-in": 0,
      inpatient: 0,
      duplicates: 0,
    };
    for (const id of Object.keys(counts) as RegistryFilterId[]) {
      counts[id] = activePatients.filter((p) => matchesRegistryFilter(p, id)).length;
    }
    return counts;
  }, [activePatients]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return activePatients.filter((p) => {
      if (!matchesRegistryFilter(p, activeFilter)) return false;
      if (!query) return true;
      return (
        p.name.toLowerCase().includes(query) ||
        p.mrn.toLowerCase().includes(query) ||
        p.nhisNumber.toLowerCase().includes(query) ||
        p.phone.toLowerCase().includes(query)
      );
    });
  }, [activePatients, activeFilter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagePatients = filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  function handleFilterClick(id: RegistryFilterId) {
    setActiveFilter(id);
    setPage(1);
  }

  function handleSearchChange(value: string) {
    setSearch(value);
    setPage(1);
  }

  function clearAll() {
    setSearch("");
    setActiveFilter("all");
    setPage(1);
  }

  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-surface-border px-5 py-4">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Master Patient Index</h2>
          <p className="text-[11px] text-slate-400">Search and manage every registered patient record</p>
        </div>
        <div className="flex flex-wrap items-center gap-1 rounded-md bg-slate-100 p-1">
          {registryFilters.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => handleFilterClick(f.id)}
              aria-pressed={activeFilter === f.id}
              className={`rounded px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                activeFilter === f.id ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {f.label} ({filterCounts[f.id]})
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-surface-border px-5 py-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by name, MRN, NHIS number, or phone…"
            className="w-full rounded-md border border-surface-border py-1.5 pl-8 pr-2.5 text-xs text-slate-700 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
        {search && (
          <button
            type="button"
            onClick={() => handleSearchChange("")}
            className="flex items-center gap-1 rounded-md border border-surface-border px-2.5 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
          >
            <X className="h-3 w-3" />
            Clear
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              <th className="px-5 pb-2 pt-3 font-semibold">MRN &amp; Patient</th>
              <th className="pb-2 pt-3 font-semibold">Age / Sex</th>
              <th className="pb-2 pt-3 font-semibold">Phone</th>
              <th className="pb-2 pt-3 font-semibold">NHIS Status</th>
              <th className="pb-2 pt-3 font-semibold">Last Visit</th>
              <th className="pb-2 pt-3 font-semibold">Registered By</th>
              <th className="px-5 pb-2 pt-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {pagePatients.map((p) => (
              <tr key={p.id} className="align-top hover:bg-slate-50">
                <td className="px-5 py-3">
                  <p className="font-mono text-[11px] font-semibold text-brand-cyan">{p.mrn}</p>
                  <p className="flex items-center gap-1.5 font-semibold text-slate-800">
                    {p.name}
                    {p.duplicateFlag && (
                      <span
                        title="Possible duplicate MPI record"
                        className="inline-flex items-center gap-0.5 rounded-full bg-status-orange-bg px-1.5 py-0.5 text-[9px] font-bold text-status-orange"
                      >
                        <Copy className="h-2.5 w-2.5" />
                        Dup?
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-slate-400">{p.category}</p>
                </td>
                <td className="py-3 pr-3 text-slate-700">
                  {p.age}y · {p.sex === "Male" ? "M" : "F"}
                </td>
                <td className="py-3 pr-3 font-mono text-[11px] text-slate-600">{p.phone}</td>
                <td className="py-3 pr-3">
                  <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${nhisStyle[p.nhisStatus]}`}>
                    {p.nhisStatus}
                  </span>
                </td>
                <td className="py-3 pr-3 text-slate-600">{p.lastVisit}</td>
                <td className="py-3 pr-3 text-slate-600">{p.registeredBy}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      title="View patient"
                      onClick={() => onView(p.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      title="Edit patient"
                      onClick={() => onEdit(p.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-brand-teal hover:bg-teal-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </button>
                    {p.nhisStatus === "Pending" && (
                      <button
                        type="button"
                        title="Verify NHIS coverage"
                        onClick={() => onVerifyNhis(p.id)}
                        className="flex h-7 w-7 items-center justify-center rounded-md text-status-green hover:bg-status-green-bg"
                      >
                        <ShieldCheck className="h-3.5 w-3.5" />
                      </button>
                    )}
                    <button
                      type="button"
                      title="Deactivate record"
                      onClick={() => onDeactivate(p.id)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-status-red hover:bg-status-red-bg"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-5 py-12 text-center">
            <Inbox className="h-6 w-6 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No patient records match this view</p>
            <p className="max-w-xs text-[11px] text-slate-400">
              Try a different filter or clear your search to see more Master Patient Index entries.
            </p>
            {(search || activeFilter !== "all") && (
              <button
                type="button"
                onClick={clearAll}
                className="mt-1 rounded-md border border-surface-border px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
              >
                Clear filters
              </button>
            )}
          </div>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-surface-border px-5 py-3 text-[11px] text-slate-400">
          <span>
            Showing {(currentPage - 1) * PAGE_SIZE + 1}-{Math.min(currentPage * PAGE_SIZE, filtered.length)} of{" "}
            {filtered.length} patient records
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage <= 1}
              onClick={() => setPage((pg) => Math.max(1, pg - 1))}
              className="rounded-md border border-surface-border px-2.5 py-1 font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`rounded-md px-2.5 py-1 font-semibold ${
                  n === currentPage ? "bg-brand-cyan text-white" : "border border-surface-border hover:bg-slate-50"
                }`}
              >
                {n}
              </button>
            ))}
            <button
              type="button"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((pg) => Math.min(totalPages, pg + 1))}
              className="rounded-md border border-surface-border px-2.5 py-1 font-semibold hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
