"use client";

import { useState } from "react";
import { ScanLine, Plus, Trash2, Eye, CheckCircle2, ScanEye } from "lucide-react";
import type { ImagingOrder } from "@/lib/doctor-data";
import { actionToast } from "@/lib/actions";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Button from "@/components/ui/Button";

type ImagingFormState = { title: string; detail: string; tag: string };
const emptyForm: ImagingFormState = { title: "", detail: "", tag: "Order Sent" };

export default function ImagingTracings({
  orders,
  onChange,
}: {
  orders: ImagingOrder[];
  onChange: (next: ImagingOrder[]) => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<ImagingFormState>(emptyForm);
  const [viewTarget, setViewTarget] = useState<ImagingOrder | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ImagingOrder | null>(null);

  const isValid = form.title.trim().length > 0 && form.detail.trim().length > 0;

  function handleSubmit() {
    if (!isValid) return;
    const newOrder: ImagingOrder = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      detail: form.detail.trim(),
      tag: form.tag.trim() || "Order Sent",
    };
    onChange([...orders, newOrder]);
    actionToast("Imaging order placed", newOrder.title, "info");
    setFormOpen(false);
    setForm(emptyForm);
  }

  function handleCancel() {
    if (!cancelTarget) return;
    onChange(orders.filter((o) => o.id !== cancelTarget.id));
    actionToast("Imaging order cancelled", cancelTarget.title, "warning");
    setCancelTarget(null);
  }

  function markComplete(order: ImagingOrder) {
    onChange(orders.map((o) => (o.id === order.id ? { ...o, tag: "Completed" } : o)));
    actionToast("Imaging marked complete", order.title, "success");
    setViewTarget(null);
  }

  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-surface-border px-5 py-4">
        <div className="flex items-center gap-2">
          <ScanLine className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Imaging & Tracings</h2>
        </div>
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-1 text-[11px] font-semibold text-brand-cyan hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Order Imaging
        </button>
      </div>

      <div className="space-y-2.5 p-5">
        {orders.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-surface-border py-8 text-center">
            <ScanEye className="h-5 w-5 text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">No imaging orders yet</p>
            <p className="text-[11px] text-slate-400">Order an imaging study or tracing for this patient.</p>
          </div>
        )}

        {orders.map((img) => (
          <div key={img.id} className="flex items-start justify-between gap-2 rounded-lg border border-surface-border p-3">
            <button type="button" onClick={() => setViewTarget(img)} className="min-w-0 text-left">
              <p className="text-xs font-bold text-slate-800 hover:text-brand-cyan">{img.title}</p>
              <p className="mt-0.5 text-[11px] text-slate-400">{img.detail}</p>
            </button>
            <div className="flex shrink-0 items-center gap-2">
              <span className="shrink-0 rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-500">
                {img.tag}
              </span>
              <button
                type="button"
                onClick={() => setViewTarget(img)}
                aria-label={`View ${img.title}`}
                className="text-slate-300 hover:text-brand-cyan"
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setCancelTarget(img)}
                aria-label={`Cancel ${img.title}`}
                className="text-slate-300 hover:text-status-red"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Order Imaging / Tracing"
        description="Request an imaging study or physiological tracing."
        icon={ScanLine}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
              Place Order
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Study</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Echocardiogram (2D)"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Detail</label>
            <input
              value={form.detail}
              onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
              placeholder="Reason / scheduling notes"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
            {!form.detail.trim() && form.title.trim() && (
              <p className="mt-1 text-[11px] text-status-red">A detail is required.</p>
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title={viewTarget?.title ?? ""}
        description="Imaging order details (read-only)"
        icon={Eye}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewTarget(null)}>
              Close
            </Button>
            {viewTarget && viewTarget.tag !== "Completed" && (
              <Button variant="success" onClick={() => markComplete(viewTarget)}>
                <CheckCircle2 className="h-3.5 w-3.5" />
                Mark Complete
              </Button>
            )}
          </>
        }
      >
        {viewTarget && (
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-800">Detail:</span> {viewTarget.detail}</p>
            <p><span className="font-semibold text-slate-800">Status:</span> {viewTarget.tag}</p>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!cancelTarget}
        onClose={() => setCancelTarget(null)}
        onConfirm={handleCancel}
        variant="delete"
        title="Cancel Imaging Order"
        description={`Cancel the order "${cancelTarget?.title ?? ""}"?`}
        confirmLabel="Cancel Order"
      />
    </div>
  );
}
