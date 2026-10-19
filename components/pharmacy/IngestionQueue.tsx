"use client";

import { useState } from "react";
import { ListFilter, Timer, Search, X, CheckCircle2, XCircle, Inbox, Lock, AlertTriangle } from "lucide-react";
import Card from "../Card";
import ConfirmModal from "../ui/ConfirmModal";
import Button from "../ui/Button";
import type { QueueItem } from "@/lib/pharmacy-api";
import { CATEGORY_LABEL, STATUS_STYLE, waitLabel } from "@/lib/pharmacy-data";

const FILTERS = ["all", "stat", "ward", "opd"] as const;

export default function IngestionQueue({
  items,
  selectedId,
  canWork,
  onSelect,
  onDispense,
  onReject,
}: {
  items: QueueItem[];
  selectedId: string | null;
  canWork: boolean;
  onSelect: (patientId: string) => void;
  onDispense: (patientId: string) => void;
  onReject: (item: QueueItem, reason: string) => Promise<boolean>;
}) {
  const [activeFilter, setActiveFilter] = useState<(typeof FILTERS)[number]>("all");
  const [search, setSearch] = useState("");
  const [rejectItem, setRejectItem] = useState<QueueItem | null>(null);

  const counts: Record<string, number> = {
    all: items.length,
    stat: items.filter((i) => i.category === "stat").length,
    ward: items.filter((i) => i.category === "ward").length,
    opd: items.filter((i) => i.category === "opd").length,
  };

  const query = search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    if (activeFilter !== "all" && item.category !== activeFilter) return false;
    if (!query) return true;
    return (
      item.patientName.toLowerCase().includes(query) ||
      item.mrn.toLowerCase().includes(query) ||
      item.rxRef.toLowerCase().includes(query) ||
      item.prescriber.toLowerCase().includes(query) ||
      item.itemsSummary.toLowerCase().includes(query)
    );
  });

  return (
    <Card
      icon={ListFilter}
      iconClassName="bg-teal-50 text-brand-teal"
      title="Prescription Queue"
      subtitle="STAT first, then longest wait"
      headerClassName="px-4 py-3"
      bodyClassName="p-4"
    >
      <div className="mb-3 flex flex-wrap items-center gap-1.5">
        {FILTERS.map((f) => (
          <Button
            key={f}
            variant={activeFilter === f ? "primary" : "secondary"}
            onClick={() => setActiveFilter(f)}
            className={`!rounded-md !px-2.5 !py-1 !text-[11px] ${
              activeFilter === f ? "" : "!border-0 !bg-slate-100 !text-slate-500 hover:!bg-slate-200"
            }`}
          >
            {f === "all" ? "All" : CATEGORY_LABEL[f]} <span className="opacity-75">{counts[f]}</span>
          </Button>
        ))}
      </div>

      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patient, MRN, Rx, drug…"
            className="w-full rounded-md border border-surface-border py-1.5 pl-8 pr-2.5 text-xs text-slate-700 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
        {search && (
          <Button variant="secondary" className="!rounded-md !px-2.5 !py-1.5 !text-[11px]" onClick={() => setSearch("")}>
            <X className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.patientId}
            role="button"
            tabIndex={0}
            onClick={() => onSelect(item.patientId)}
            onKeyDown={(e) => e.key === "Enter" && onSelect(item.patientId)}
            className={`cursor-pointer rounded-lg border px-3 py-2 ${
              item.patientId === selectedId
                ? "border-brand-teal bg-teal-50/40 ring-1 ring-brand-teal"
                : "border-surface-border bg-white hover:border-slate-300"
            }`}
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[11px] font-semibold text-slate-400">{item.rxRef}</span>
              <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${STATUS_STYLE[item.status] ?? "bg-slate-100 text-slate-500"}`}>
                {item.status}
              </span>
              {item.controlled && (
                <span className="flex items-center gap-0.5 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-slate-600">
                  <Lock className="h-2.5 w-2.5" /> CD
                </span>
              )}
            </div>
            <p className="mt-1 text-sm font-bold text-slate-800">{item.patientName}</p>
            <p className="text-[11px] text-slate-500">
              {item.mrn} · {[item.sex, item.age != null ? `${item.age}y` : null].filter(Boolean).join(", ")} · {item.location}
            </p>
            <p className="mt-1 text-[11px] font-medium text-slate-600">{item.itemsSummary}</p>
            {item.flag && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-status-amber">
                <AlertTriangle className="h-3 w-3" /> {item.flag}
              </p>
            )}
            <div className="mt-1 flex flex-wrap items-center justify-between gap-1 text-[11px]">
              <span className="text-slate-400">{item.prescriber}</span>
              <span className="flex items-center gap-1 font-semibold text-slate-600">
                <Timer className="h-3 w-3" /> {waitLabel(item.waitMinutes)} · {item.verifiedCount}/{item.lineCount} verified
              </span>
            </div>

            {canWork && (
              <div className="mt-2 flex items-center justify-end gap-1.5 border-t border-surface-border pt-1.5">
                <Button
                  variant="danger"
                  className="!rounded-md !px-2 !py-1 !text-[10px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRejectItem(item);
                  }}
                >
                  <XCircle className="h-3 w-3" /> Reject
                </Button>
                <Button
                  variant="success"
                  className="!rounded-md !px-2 !py-1 !text-[10px]"
                  disabled={!!item.flag}
                  title={item.flag ? "Clear the review flag first" : undefined}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDispense(item.patientId);
                  }}
                >
                  <CheckCircle2 className="h-3 w-3" /> Dispense
                </Button>
              </div>
            )}
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-surface-border py-10 text-center">
            <Inbox className="h-6 w-6 text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">
              {items.length === 0 ? "No prescriptions waiting" : "No prescriptions match this view"}
            </p>
            <p className="text-[11px] text-slate-400">
              {items.length === 0 ? "New prescriptions appear here as doctors write them." : "Try a different filter, or clear your search."}
            </p>
          </div>
        )}
      </div>

      <ConfirmModal
        open={!!rejectItem}
        onClose={() => setRejectItem(null)}
        onConfirm={async (reason) => {
          if (!rejectItem) return;
          if (await onReject(rejectItem, reason ?? "")) setRejectItem(null);
        }}
        variant="reject"
        title="Reject Prescription"
        description={
          rejectItem
            ? `Reject all ${rejectItem.lineCount} waiting line(s) for ${rejectItem.patientName} (${rejectItem.rxRef})? They leave the queue and the reason is recorded for the prescriber.`
            : ""
        }
        confirmLabel="Reject Prescription"
        requireReason
        reasonLabel="Reason for rejection"
        reasonPlaceholder="e.g. Dosage discrepancy, needs prescriber clarification…"
      />
    </Card>
  );
}
