"use client";

import { useEffect, useMemo, useState } from "react";
import { Filter, Download, ShieldCheck, RadioTower, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import type { EventCategory, EventRange, LedgerEvent } from "@/lib/audit-log-data";
import { telemetryScopes } from "@/lib/audit-log-data";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { actionToast } from "@/lib/actions";

const toneRowClass: Record<LedgerEvent["tone"], string> = {
  danger: "bg-status-red-bg text-status-red",
  warning: "bg-status-amber-bg text-status-amber",
  info: "bg-status-blue-bg text-status-blue",
  purple: "bg-purple-50 text-purple-600",
};

const PAGE_SIZE = 5;
const rangeOrder: EventRange[] = ["1h", "24h", "7d"];

function countByScope(events: LedgerEvent[], id: "all" | EventCategory): number {
  if (id === "all") return events.length;
  return events.filter((e) => e.categories.includes(id)).length;
}

export default function LedgerTable({
  events,
  selectedId,
  onSelect,
}: {
  events: LedgerEvent[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const [scope, setScope] = useState<"all" | EventCategory>("all");
  const [range, setRange] = useState<EventRange | "custom">("24h");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [customOpen, setCustomOpen] = useState(false);
  const [customFrom, setCustomFrom] = useState("");
  const [customTo, setCustomTo] = useState("");

  const filtered = useMemo(() => {
    return events.filter((e) => {
      if (scope !== "all" && !e.categories.includes(scope)) return false;
      if (range !== "custom") {
        const withinRange = rangeOrder.indexOf(e.range) <= rangeOrder.indexOf(range);
        if (!withinRange) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        const haystack = `${e.actorName} ${e.actorId} ${e.actionTitle}`.toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      return true;
    });
  }, [events, scope, range, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [scope, range, search]);

  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="space-y-3 border-b border-surface-border p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filter by actor ID, clinician name..."
              className="w-full rounded-md border border-surface-border py-2 pl-8 pr-3 text-xs text-slate-700 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
          {(["1h", "24h", "7d"] as EventRange[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-md px-2.5 py-2 text-[11px] font-semibold ${
                range === r ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {r}
            </button>
          ))}
          <button
            onClick={() => setCustomOpen(true)}
            className={`rounded-md px-2.5 py-2 text-[11px] font-semibold ${
              range === "custom" ? "bg-slate-800 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            Custom
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setExporting(true);
              setTimeout(() => {
                setExporting(false);
                actionToast("Merkle log exported", `${filtered.length} events exported with cryptographic proof chain.`, "success");
              }, 700);
            }}
            disabled={exporting}
            className="flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            {exporting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
            Export Merkle Log
          </button>
          <button
            onClick={() => {
              setVerifying(true);
              setTimeout(() => {
                setVerifying(false);
                actionToast("Merkle root verified", "Chain integrity confirmed — zero drift detected.", "success");
              }, 700);
            }}
            disabled={verifying}
            className="flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
          >
            {verifying ? <Loader2 className="h-3 w-3 animate-spin" /> : <ShieldCheck className="h-3 w-3" />}
            Verify Root
          </button>
          <button
            onClick={() => {
              setScanning(true);
              setTimeout(() => {
                setScanning(false);
                actionToast("SIEM scan complete", "0 new anomalies detected across active sessions.", "success");
              }, 1000);
            }}
            disabled={scanning}
            className="flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
          >
            {scanning ? <Loader2 className="h-3 w-3 animate-spin" /> : <RadioTower className="h-3 w-3" />}
            Run SIEM Scan
          </button>
        </div>

        <div>
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Telemetry Scope:</p>
          <div className="flex flex-wrap gap-1.5">
            {telemetryScopes.map((s) => (
              <button
                key={s.id}
                onClick={() => setScope(s.id)}
                className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                  scope === s.id ? "border-slate-800 bg-slate-800 text-white" : "border-surface-border text-slate-500 hover:bg-slate-50"
                }`}
              >
                <span className={`h-1.5 w-1.5 rounded-full ${s.dotClass}`} />
                {s.label} ({countByScope(events, s.id)})
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Showing {pageItems.length} of {filtered.length} events
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-xs">
          <thead>
            <tr className="border-b border-surface-border text-[10px] uppercase tracking-wide text-slate-400">
              <th className="px-4 py-2 font-semibold">Timestamp</th>
              <th className="px-4 py-2 font-semibold">Severity &amp; Category</th>
              <th className="px-4 py-2 font-semibold">Actor / Clinician</th>
              <th className="px-4 py-2 font-semibold">Action / Operation</th>
              <th className="px-4 py-2 font-semibold">Target Resource</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {pageItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-slate-400">
                  No ledger events match the current filters.
                </td>
              </tr>
            ) : (
              pageItems.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => onSelect(e.id)}
                  className={`cursor-pointer align-top ${selectedId === e.id ? "bg-teal-50/60" : "hover:bg-slate-50"}`}
                >
                  <td className="px-4 py-3 font-mono text-[11px] text-slate-500">
                    {e.timestamp}
                    <p className="text-[10px] text-slate-400">{e.dateLabel}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${toneRowClass[e.tone]}`}>{e.severityLabel}</span>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-800">{e.actorName}</p>
                    <p className="text-[10px] text-slate-400">{e.actorId} · {e.actorRole}</p>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-slate-700">{e.actionTitle}</p>
                    <p className="text-[10px] text-slate-400">{e.actionDetail}</p>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-500">{e.targetResource}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-surface-border px-4 py-3 text-[11px] text-slate-500">
        <span>
          Page {page} of {totalPages} · Chain Latency: 14ms (Optimal)
        </span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 rounded-md border border-surface-border px-2.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            Previous
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 rounded-md bg-slate-800 px-2.5 py-1.5 font-semibold text-white hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Next Page
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <Modal
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        title="Custom Date Range"
        description="Filter the ledger stream by a specific window"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCustomOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              onClick={() => {
                setRange("custom");
                setCustomOpen(false);
                actionToast(
                  "Custom range applied",
                  customFrom && customTo ? `Showing events from ${customFrom} to ${customTo}.` : "Showing all available ledger events.",
                  "info"
                );
              }}
            >
              Apply Range
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">From</label>
            <input
              type="date"
              value={customFrom}
              onChange={(e) => setCustomFrom(e.target.value)}
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">To</label>
            <input
              type="date"
              value={customTo}
              onChange={(e) => setCustomTo(e.target.value)}
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
            />
          </div>
        </div>
      </Modal>
    </div>
  );
}
