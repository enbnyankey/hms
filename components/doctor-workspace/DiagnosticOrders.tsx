"use client";

import { useState } from "react";
import { ClipboardList, Check, Plus, Trash2, Beaker } from "lucide-react";
import type { DiagnosticOrder } from "@/lib/doctor-data";
import { priorLabs, priorLabsDate } from "@/lib/doctor-data";
import { actionToast } from "@/lib/actions";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Button from "@/components/ui/Button";

const tagTone: Record<DiagnosticOrder["tagTone"], string> = {
  danger: "bg-status-red text-white",
  warning: "bg-status-amber text-white",
  neutral: "bg-slate-100 text-slate-500",
};

const tagOptions: { tag: string; tone: DiagnosticOrder["tagTone"] }[] = [
  { tag: "STAT", tone: "danger" },
  { tag: "RAPID", tone: "warning" },
  { tag: "Routine", tone: "neutral" },
];

type OrderFormState = { title: string; detail: string; tag: string };
const emptyForm: OrderFormState = { title: "", detail: "", tag: "Routine" };

export default function DiagnosticOrders({
  orders,
  onChange,
}: {
  orders: DiagnosticOrder[];
  onChange: (next: DiagnosticOrder[]) => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<OrderFormState>(emptyForm);
  const [voidTarget, setVoidTarget] = useState<DiagnosticOrder | null>(null);
  const [dispatched, setDispatched] = useState(false);

  const isValid = form.title.trim().length > 0 && form.detail.trim().length > 0;

  function toggleChecked(id: string) {
    const order = orders.find((o) => o.id === id);
    onChange(orders.map((o) => (o.id === id ? { ...o, checked: !o.checked } : o)));
    if (order) actionToast(order.checked ? "Order marked pending" : "Order reviewed", order.title, order.checked ? "warning" : "success");
  }

  function handleSubmit() {
    if (!isValid) return;
    const tone = tagOptions.find((t) => t.tag === form.tag)?.tone ?? "neutral";
    const newOrder: DiagnosticOrder = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      detail: form.detail.trim(),
      tag: form.tag,
      tagTone: tone,
      checked: false,
    };
    onChange([...orders, newOrder]);
    actionToast("Diagnostic order placed", newOrder.title, "info");
    setFormOpen(false);
    setForm(emptyForm);
  }

  function handleVoid() {
    if (!voidTarget) return;
    onChange(orders.filter((o) => o.id !== voidTarget.id));
    actionToast("Order voided", voidTarget.title, "warning");
    setVoidTarget(null);
  }

  function dispatchStat() {
    setDispatched(true);
    onChange(orders.map((o) => ({ ...o, checked: true })));
    actionToast("STAT orders dispatched", "All diagnostic orders routed to Central Pathology.", "warning");
  }

  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border px-5 py-4">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Diagnostic Orders</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setFormOpen(true)}
            className="flex items-center gap-1 text-[11px] font-semibold text-brand-cyan hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Order Test
          </button>
          <button
            type="button"
            onClick={dispatchStat}
            disabled={dispatched || orders.length === 0}
            className="rounded-full bg-status-red-bg px-2.5 py-1 text-[10px] font-bold text-status-red disabled:cursor-not-allowed disabled:opacity-50"
          >
            {dispatched ? "DISPATCHED" : "STAT DISPATCH"}
          </button>
        </div>
      </div>

      <div className="space-y-2.5 p-5">
        {orders.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-surface-border py-8 text-center">
            <Beaker className="h-5 w-5 text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">No diagnostic orders yet</p>
            <p className="text-[11px] text-slate-400">Order a lab test to begin the diagnostic workup.</p>
          </div>
        )}

        {orders.map((order) => (
          <div key={order.id} className="flex items-start gap-2.5 rounded-lg border border-surface-border p-3">
            <button
              type="button"
              onClick={() => toggleChecked(order.id)}
              aria-label={order.checked ? `Mark ${order.title} pending` : `Mark ${order.title} reviewed`}
              className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border border-status-green bg-status-green-bg text-status-green"
            >
              {order.checked && <Check className="h-3 w-3" strokeWidth={3} />}
            </button>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800">{order.title}</p>
              <p className="text-[11px] text-slate-400">{order.detail}</p>
            </div>
            <span className={`shrink-0 rounded px-2 py-0.5 text-[10px] font-bold ${tagTone[order.tagTone]}`}>
              {order.tag}
            </span>
            <button
              type="button"
              onClick={() => setVoidTarget(order)}
              aria-label={`Void ${order.title}`}
              className="shrink-0 text-slate-300 hover:text-status-red"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}

        <div className="rounded-lg border border-surface-border bg-slate-50 p-3">
          <p className="text-[11px] font-bold text-slate-600">Recent Prior Labs ({priorLabsDate})</p>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {priorLabs.map((lab) => (
              <div key={lab.id}>
                <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{lab.label}</p>
                <p className="text-sm font-bold text-slate-800">{lab.value}</p>
                <p className="text-[10px] text-status-green">{lab.note}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Order Diagnostic Test"
        description="Add a lab or diagnostic test to this encounter."
        icon={ClipboardList}
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
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Test Name
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Thyroid Function Test"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Detail
            </label>
            <input
              value={form.detail}
              onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
              placeholder="What this test evaluates"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
            {!form.detail.trim() && form.title.trim() && (
              <p className="mt-1 text-[11px] text-status-red">A short detail is required.</p>
            )}
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Priority</label>
            <div className="mt-1 flex gap-2">
              {tagOptions.map((opt) => (
                <button
                  key={opt.tag}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, tag: opt.tag }))}
                  className={`flex-1 rounded-md border px-3 py-2 text-[11px] font-bold transition-colors ${
                    form.tag === opt.tag
                      ? "border-brand-teal bg-teal-50 text-brand-teal"
                      : "border-surface-border text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {opt.tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!voidTarget}
        onClose={() => setVoidTarget(null)}
        onConfirm={handleVoid}
        variant="delete"
        title="Void Diagnostic Order"
        description={`Void the order "${voidTarget?.title ?? ""}"? This cannot be undone.`}
        confirmLabel="Void Order"
      />
    </div>
  );
}
