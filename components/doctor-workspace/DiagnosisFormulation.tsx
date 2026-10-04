"use client";

import { useState } from "react";
import { Stamp, HelpCircle, Plus, Pencil, Trash2, Stethoscope } from "lucide-react";
import type { DiagnosisEntry } from "@/lib/doctor-data";
import { actionToast } from "@/lib/actions";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Button from "@/components/ui/Button";

type DiagnosisFormState = {
  kind: DiagnosisEntry["kind"];
  code: string;
  title: string;
  detail: string;
};

const emptyForm: DiagnosisFormState = { kind: "DIFFERENTIAL", code: "", title: "", detail: "" };

export default function DiagnosisFormulation({
  diagnoses,
  onChange,
}: {
  diagnoses: DiagnosisEntry[];
  onChange: (next: DiagnosisEntry[]) => void;
}) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DiagnosisFormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<DiagnosisEntry | null>(null);

  const isValid = form.code.trim().length > 0 && form.title.trim().length > 0;

  function openAdd() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEdit(dx: DiagnosisEntry) {
    setEditingId(dx.id);
    setForm({ kind: dx.kind, code: dx.code, title: dx.title, detail: dx.detail });
    setFormOpen(true);
  }

  function handleSubmit() {
    if (!isValid) return;
    if (editingId) {
      onChange(
        diagnoses.map((dx) =>
          dx.id === editingId
            ? { ...dx, kind: form.kind, code: form.code.trim(), title: form.title.trim(), detail: form.detail.trim() }
            : dx
        )
      );
      actionToast("Diagnosis updated", form.title.trim());
    } else {
      const newDx: DiagnosisEntry = {
        id: crypto.randomUUID(),
        kind: form.kind,
        code: form.code.trim(),
        title: form.title.trim(),
        detail: form.detail.trim() || "Newly added · Pending review",
      };
      onChange([...diagnoses, newDx]);
      actionToast("Diagnosis added", newDx.title);
    }
    setFormOpen(false);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    onChange(diagnoses.filter((dx) => dx.id !== deleteTarget.id));
    actionToast("Diagnosis removed", deleteTarget.title, "warning");
    setDeleteTarget(null);
  }

  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border px-5 py-4">
        <div className="flex items-center gap-2">
          <Stamp className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Diagnosis Formulation (ICD-11 Standardized)</h2>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="flex items-center gap-1 text-[11px] font-semibold text-brand-cyan hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Secondary / Differential
        </button>
      </div>

      <div className="space-y-3 p-5">
        {diagnoses.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-surface-border py-8 text-center">
            <Stethoscope className="h-5 w-5 text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">No diagnoses recorded yet</p>
            <p className="text-[11px] text-slate-400">Add a primary or differential diagnosis to get started.</p>
          </div>
        )}

        {diagnoses.map((dx) => (
          <div key={dx.id} className="flex items-start gap-3 rounded-lg border border-surface-border p-3.5">
            {dx.kind === "PRIMARY" ? (
              <span className="shrink-0 rounded bg-status-red px-2 py-1 text-[10px] font-bold text-white">
                PRIMARY
              </span>
            ) : (
              <span className="shrink-0 rounded bg-slate-100 px-2 py-1 text-[10px] font-bold text-slate-500">
                DIFFERENTIAL
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-800">
                {dx.code} {dx.title}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">{dx.detail}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {dx.kind === "DIFFERENTIAL" && (
                <HelpCircle className="h-3.5 w-3.5 shrink-0 text-slate-300" />
              )}
              <button
                type="button"
                onClick={() => openEdit(dx)}
                aria-label={`Edit ${dx.title}`}
                className="text-slate-300 hover:text-brand-cyan"
              >
                <Pencil className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(dx)}
                aria-label={`Delete ${dx.title}`}
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
        title={editingId ? "Edit Diagnosis" : "Add Diagnosis"}
        description="Record an ICD-11 standardized diagnosis for this encounter."
        icon={Stamp}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
              {editingId ? "Save Changes" : "Add Diagnosis"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="flex gap-2">
            {(["PRIMARY", "DIFFERENTIAL"] as const).map((kind) => (
              <button
                key={kind}
                type="button"
                onClick={() => setForm((f) => ({ ...f, kind }))}
                className={`flex-1 rounded-md border px-3 py-2 text-[11px] font-bold transition-colors ${
                  form.kind === kind
                    ? "border-brand-teal bg-teal-50 text-brand-teal"
                    : "border-surface-border text-slate-500 hover:bg-slate-50"
                }`}
              >
                {kind}
              </button>
            ))}
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              ICD-11 Code
            </label>
            <input
              value={form.code}
              onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              placeholder="e.g. BA00"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Diagnosis Title
            </label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Essential hypertension"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
            {!form.title.trim() && form.title.length === 0 && form.code.length > 0 && (
              <p className="mt-1 text-[11px] text-status-red">Title is required.</p>
            )}
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Clinical Detail
            </label>
            <textarea
              value={form.detail}
              onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
              rows={2}
              placeholder="Severity, certainty, supporting workup…"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        variant="delete"
        title="Remove Diagnosis"
        description={`Remove "${deleteTarget?.title ?? ""}" from this patient's diagnosis list? This cannot be undone.`}
        confirmLabel="Remove Diagnosis"
      />
    </div>
  );
}
