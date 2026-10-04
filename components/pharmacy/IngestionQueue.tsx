"use client";

import { useState } from "react";
import {
  ListFilter,
  Timer,
  Search,
  X,
  Eye,
  CheckCircle2,
  XCircle,
  Inbox,
} from "lucide-react";
import Card from "../Card";
import Modal from "../ui/Modal";
import ConfirmModal from "../ui/ConfirmModal";
import Button from "../ui/Button";
import { actionToast } from "@/lib/actions";
import {
  queueFilters,
  queueItems as initialQueueItems,
  type QueueItem,
  type QueueStatus,
} from "@/lib/pharmacy-data";

const statusStyle: Record<QueueStatus, string> = {
  "Ready for Final Check": "bg-status-green-bg text-status-green",
  "STAT / Emergency": "bg-status-red-bg text-status-red",
  "Insurance Clearance": "bg-status-amber-bg text-status-amber",
  "Verification Passed": "bg-status-blue-bg text-status-blue",
};

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-surface-border py-1.5 last:border-b-0">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-right text-xs font-medium text-slate-700">{value}</span>
    </div>
  );
}

export default function IngestionQueue() {
  const [items, setItems] = useState<QueueItem[]>(initialQueueItems);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [highlightedId, setHighlightedId] = useState<string | undefined>(
    initialQueueItems.find((i) => i.selected)?.id
  );

  const [viewItem, setViewItem] = useState<QueueItem | null>(null);

  const [dispenseItem, setDispenseItem] = useState<QueueItem | null>(null);
  const [dispenseQty, setDispenseQty] = useState("1");
  const [dispenseBatch, setDispenseBatch] = useState("");
  const [dispensing, setDispensing] = useState(false);

  const [rejectItem, setRejectItem] = useState<QueueItem | null>(null);

  const counts: Record<string, number> = {
    all: items.length,
    stat: items.filter((i) => i.category === "stat").length,
    ward: items.filter((i) => i.category === "ward").length,
    opd: items.filter((i) => i.category === "opd").length,
  };

  const query = search.trim().toLowerCase();
  const filtered = items.filter((item) => {
    const matchesFilter = activeFilter === "all" || item.category === activeFilter;
    if (!matchesFilter) return false;
    if (!query) return true;
    return (
      item.patient.toLowerCase().includes(query) ||
      item.rxId.toLowerCase().includes(query) ||
      item.prescriber.toLowerCase().includes(query)
    );
  });

  function openDispense(item: QueueItem) {
    setHighlightedId(item.id);
    const suggested = item.itemsNote?.match(/\d+/)?.[0] ?? "1";
    setDispenseQty(suggested);
    setDispenseBatch("");
    setDispenseItem(item);
  }

  function confirmDispense() {
    if (!dispenseItem) return;
    const qty = Number(dispenseQty);
    if (!qty || qty <= 0 || !dispenseBatch.trim()) return;
    setDispensing(true);
    setTimeout(() => {
      setItems((prev) => prev.filter((i) => i.id !== dispenseItem.id));
      actionToast(
        "Prescription dispensed",
        `${dispenseItem.rxId} · ${dispenseItem.patient} · Batch ${dispenseBatch.trim()}`,
        "success"
      );
      setDispensing(false);
      setDispenseItem(null);
    }, 400);
  }

  function confirmReject(reason?: string) {
    if (!rejectItem) return;
    setItems((prev) => prev.filter((i) => i.id !== rejectItem.id));
    actionToast("Prescription rejected", `${rejectItem.rxId} · Reason: ${reason || "—"}`, "error");
    setRejectItem(null);
  }

  const dispenseInvalid = !dispenseQty || Number(dispenseQty) <= 0 || !dispenseBatch.trim();

  return (
    <Card
      icon={ListFilter}
      iconClassName="bg-teal-50 text-brand-teal"
      title="Prescription Ingestion & Dispensing Queue"
      subtitle="Sorted by Clinical Priority & Wait Time"
      headerClassName="px-4 py-3"
      bodyClassName="p-4"
      action={
        <div className="flex flex-wrap items-center gap-1.5">
          {queueFilters.map((f) => (
            <Button
              key={f.id}
              variant={activeFilter === f.id ? "primary" : "secondary"}
              onClick={() => setActiveFilter(f.id)}
              className={`!rounded-md !px-2.5 !py-1 !text-[11px] ${
                activeFilter === f.id ? "" : "!border-0 !bg-slate-100 !text-slate-500 hover:!bg-slate-200"
              }`}
            >
              {f.label} <span className="opacity-75">{counts[f.id] ?? f.count}</span>
            </Button>
          ))}
        </div>
      }
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient, Rx ID, or prescriber…"
            className="w-full rounded-md border border-surface-border py-1.5 pl-8 pr-2.5 text-xs text-slate-700 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
        {search && (
          <Button
            variant="secondary"
            className="!rounded-md !px-2.5 !py-1.5 !text-[11px]"
            onClick={() => setSearch("")}
          >
            <X className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      <div className="space-y-2">
        {filtered.map((item) => (
          <div
            key={item.id}
            className={`rounded-lg border px-3 py-2 ${
              item.id === highlightedId
                ? "border-brand-teal bg-teal-50/40 ring-1 ring-brand-teal"
                : "border-surface-border bg-white"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-semibold text-slate-400">{item.rxId}</span>
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${statusStyle[item.status]}`}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-1 text-sm font-bold text-slate-800">{item.patient}</p>
                <p className="text-[11px] text-slate-500">{item.location}</p>
                {item.detail && (
                  <p
                    className={`mt-1 text-[11px] font-medium ${
                      item.detailUrgent ? "text-status-red" : "text-slate-500"
                    }`}
                  >
                    {item.detail}
                  </p>
                )}
                {item.statusNote && <p className="mt-0.5 text-[11px] text-slate-400">{item.statusNote}</p>}
              </div>
              <div className="text-right">
                <p className="text-[11px] text-slate-400">Prescriber: {item.prescriber}</p>
                {item.wait && (
                  <p className="mt-1 flex items-center justify-end gap-1 text-[11px] font-semibold text-slate-600">
                    <Timer className="h-3 w-3" />
                    {item.waitLabel} {item.wait}
                  </p>
                )}
                {item.itemsNote && <p className="mt-1 text-[11px] font-semibold text-brand-teal">{item.itemsNote}</p>}
              </div>
            </div>

            <div className="mt-2 flex items-center justify-end gap-1.5 border-t border-surface-border pt-1.5">
              <Button
                variant="ghost"
                className="!rounded-md !px-2 !py-1 !text-[10px]"
                onClick={() => {
                  setHighlightedId(item.id);
                  setViewItem(item);
                }}
              >
                <Eye className="h-3 w-3" /> View
              </Button>
              <Button
                variant="danger"
                className="!rounded-md !px-2 !py-1 !text-[10px]"
                onClick={() => setRejectItem(item)}
              >
                <XCircle className="h-3 w-3" /> Reject
              </Button>
              <Button
                variant="success"
                className="!rounded-md !px-2 !py-1 !text-[10px]"
                onClick={() => openDispense(item)}
              >
                <CheckCircle2 className="h-3 w-3" /> Dispense
              </Button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-surface-border py-10 text-center">
            <Inbox className="h-6 w-6 text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">No prescriptions match this view</p>
            <p className="text-[11px] text-slate-400">Try a different filter, or clear your search.</p>
          </div>
        )}
      </div>

      {/* View detail modal */}
      <Modal
        open={!!viewItem}
        onClose={() => setViewItem(null)}
        title={viewItem?.rxId ?? "Prescription"}
        description="Full prescription order detail"
        icon={Eye}
        size="md"
        footer={
          <Button variant="secondary" onClick={() => setViewItem(null)}>
            Close
          </Button>
        }
      >
        {viewItem && (
          <div>
            <DetailRow label="Status" value={viewItem.status} />
            <DetailRow label="Patient" value={viewItem.patient} />
            <DetailRow label="Location" value={viewItem.location} />
            {viewItem.detail && <DetailRow label="Order Detail" value={viewItem.detail} />}
            <DetailRow label="Prescriber" value={viewItem.prescriber} />
            {viewItem.wait && <DetailRow label={viewItem.waitLabel || "Wait"} value={viewItem.wait} />}
            {viewItem.itemsNote && <DetailRow label="Items" value={viewItem.itemsNote} />}
          </div>
        )}
      </Modal>

      {/* Dispense form modal */}
      <Modal
        open={!!dispenseItem}
        onClose={() => !dispensing && setDispenseItem(null)}
        title="Dispense Prescription"
        description={dispenseItem ? `${dispenseItem.rxId} · ${dispenseItem.patient}` : undefined}
        icon={CheckCircle2}
        tone="success"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDispenseItem(null)} disabled={dispensing}>
              Cancel
            </Button>
            <Button variant="success" onClick={confirmDispense} loading={dispensing} disabled={dispenseInvalid}>
              Confirm Dispense
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Quantity to Dispense
            </label>
            <input
              type="number"
              min={1}
              value={dispenseQty}
              onChange={(e) => setDispenseQty(e.target.value)}
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
            />
            {(!dispenseQty || Number(dispenseQty) <= 0) && (
              <p className="mt-1 text-[11px] text-slate-400">Enter a quantity greater than 0.</p>
            )}
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Batch / Lot Number
            </label>
            <input
              value={dispenseBatch}
              onChange={(e) => setDispenseBatch(e.target.value)}
              placeholder="e.g. AML-2024-69"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
            {!dispenseBatch.trim() && <p className="mt-1 text-[11px] text-slate-400">Batch number is required.</p>}
          </div>
        </div>
      </Modal>

      {/* Reject confirm modal */}
      <ConfirmModal
        open={!!rejectItem}
        onClose={() => setRejectItem(null)}
        onConfirm={(reason) => confirmReject(reason)}
        variant="reject"
        title="Reject Prescription"
        description={
          rejectItem
            ? `Reject ${rejectItem.rxId} for ${rejectItem.patient}? This removes it from the dispensing queue.`
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
