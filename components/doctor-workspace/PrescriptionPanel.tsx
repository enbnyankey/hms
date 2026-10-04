"use client";

import { useState } from "react";
import { FilePenLine, ShieldCheck, Trash2, Plus, Eye, PillBottle } from "lucide-react";
import type { PrescriptionItem } from "@/lib/doctor-data";
import { rxCrossCheckNote } from "@/lib/doctor-data";
import { actionToast } from "@/lib/actions";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Button from "@/components/ui/Button";

type RxFormState = {
  drug: string;
  dosage: string;
  duration: string;
  tag: string;
};

const emptyForm: RxFormState = { drug: "", dosage: "", duration: "30 Days (Qty: 30 Tabs)", tag: "" };

export default function PrescriptionPanel({
  prescriptions,
  onChange,
}: {
  prescriptions: PrescriptionItem[];
  onChange: (next: PrescriptionItem[]) => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<RxFormState>(emptyForm);
  const [viewTarget, setViewTarget] = useState<PrescriptionItem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<PrescriptionItem | null>(null);

  const isValid = form.drug.trim().length > 0 && form.dosage.trim().length > 0;

  function openAdd() {
    setForm(emptyForm);
    setFormOpen(true);
  }

  function handleSubmit() {
    if (!isValid) return;
    const newRx: PrescriptionItem = {
      id: crypto.randomUUID(),
      drug: form.drug.trim(),
      cost: "GHS 0.00 · NHIS 100%",
      dosage: form.dosage.trim(),
      duration: form.duration.trim() || "30 Days (Qty: 30 Tabs)",
      tag: form.tag.trim() || "Newly Added",
    };
    onChange([...prescriptions, newRx]);
    actionToast("Drug added to prescription", newRx.drug);
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    onChange(prescriptions.filter((rx) => rx.id !== deleteTarget.id));
    actionToast("Removed from prescription", deleteTarget.drug, "warning");
    setDeleteTarget(null);
  }

  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border px-5 py-4">
        <div className="flex items-center gap-2">
          <FilePenLine className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Electronic Prescription (e-Rx)</h2>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-status-green-bg px-2.5 py-1 text-[11px] font-semibold text-status-green">
          <ShieldCheck className="h-3.5 w-3.5" />
          NHIS Formulary Compliant
        </span>
      </div>

      <div className="space-y-3 p-5">
        {prescriptions.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-surface-border py-8 text-center">
            <PillBottle className="h-5 w-5 text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">No medications prescribed yet</p>
            <p className="text-[11px] text-slate-400">Add a drug to the electronic prescription below.</p>
          </div>
        )}

        {prescriptions.map((rx) => (
          <div key={rx.id} className="rounded-lg border border-surface-border p-3.5">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <button
                type="button"
                onClick={() => setViewTarget(rx)}
                className="min-w-0 text-left"
              >
                <p className="text-xs font-bold text-slate-800 hover:text-brand-cyan">{rx.drug}</p>
                <p className="text-[11px] text-slate-400">{rx.cost}</p>
              </button>
              <div className="flex shrink-0 items-center gap-2">
                <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-brand-teal">
                  {rx.tag}
                </span>
                <button
                  type="button"
                  onClick={() => setViewTarget(rx)}
                  aria-label={`View ${rx.drug}`}
                  className="text-slate-300 hover:text-brand-cyan"
                >
                  <Eye className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(rx)}
                  aria-label={`Remove ${rx.drug}`}
                  className="text-slate-300 hover:text-status-red"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1.5 text-[11px] text-slate-500">
              Dosage: {rx.dosage} · Duration: {rx.duration}
            </p>
          </div>
        ))}

        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-surface-border bg-slate-50 p-3">
          <p className="flex items-center gap-1.5 text-[11px] text-slate-500">
            <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-status-green" />
            {rxCrossCheckNote}
          </p>
          <button
            type="button"
            onClick={openAdd}
            className="flex shrink-0 items-center gap-1.5 rounded-md bg-brand-cyan px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Drug to Rx
          </button>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="e-Prescribe New Drug"
        description="Add a medication to this patient's electronic prescription."
        icon={FilePenLine}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
              Add to Prescription
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Drug Name & Strength
            </label>
            <input
              value={form.drug}
              onChange={(e) => setForm((f) => ({ ...f, drug: e.target.value }))}
              placeholder="e.g. Losartan 50mg Tablets"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Dosage Instructions
            </label>
            <input
              value={form.dosage}
              onChange={(e) => setForm((f) => ({ ...f, dosage: e.target.value }))}
              placeholder="e.g. 1 Tab PO OD (Morning)"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
            {!form.dosage.trim() && form.drug.trim() && (
              <p className="mt-1 text-[11px] text-status-red">Dosage instructions are required.</p>
            )}
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Duration
            </label>
            <input
              value={form.duration}
              onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Tag (optional)
            </label>
            <input
              value={form.tag}
              onChange={(e) => setForm((f) => ({ ...f, tag: e.target.value }))}
              placeholder="e.g. Penicillin-Safe"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={!!viewTarget}
        onClose={() => setViewTarget(null)}
        title={viewTarget?.drug ?? ""}
        description="Prescription details (read-only)"
        icon={Eye}
        size="sm"
        footer={
          <Button variant="secondary" onClick={() => setViewTarget(null)}>
            Close
          </Button>
        }
      >
        {viewTarget && (
          <div className="space-y-2 text-sm text-slate-700">
            <p><span className="font-semibold text-slate-800">Dosage:</span> {viewTarget.dosage}</p>
            <p><span className="font-semibold text-slate-800">Duration:</span> {viewTarget.duration}</p>
            <p><span className="font-semibold text-slate-800">Cost:</span> {viewTarget.cost}</p>
            <p><span className="font-semibold text-slate-800">Tag:</span> {viewTarget.tag}</p>
            <p className="flex items-center gap-1.5 rounded-md bg-slate-50 p-2.5 text-[11px] text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-status-green" />
              {rxCrossCheckNote}
            </p>
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        variant="delete"
        title="Remove Medication"
        description={`Remove "${deleteTarget?.drug ?? ""}" from this prescription?`}
        confirmLabel="Remove Drug"
      />
    </div>
  );
}
