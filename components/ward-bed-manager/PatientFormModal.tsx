"use client";

import { useEffect, useState } from "react";
import { UserPlus, Pencil, type LucideIcon } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { emptyPatientForm, type PatientFormValues } from "@/lib/ward-data";

export default function PatientFormModal({
  open,
  onClose,
  onSubmit,
  mode,
  bedId,
  initialValues,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PatientFormValues) => void;
  mode: "admit" | "edit";
  bedId: string;
  initialValues?: PatientFormValues;
}) {
  const [values, setValues] = useState<PatientFormValues>(initialValues ?? emptyPatientForm);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(initialValues ?? emptyPatientForm);
      setTouched(false);
    }
  }, [open, initialValues]);

  const errors = {
    name: values.name.trim().length === 0 ? "Patient name is required" : "",
    demo: values.demo.trim().length === 0 ? "Age/sex is required (e.g. 56M)" : "",
    dx: values.dx.trim().length === 0 ? "Diagnosis is required" : "",
  };
  const isValid = !errors.name && !errors.demo && !errors.dx;

  function set<K extends keyof PatientFormValues>(key: K, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  function handleSubmit() {
    setTouched(true);
    if (!isValid) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit(values);
      setSubmitting(false);
    }, 400);
  }

  const icon: LucideIcon = mode === "admit" ? UserPlus : Pencil;

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={mode === "admit" ? `Admit Patient — Bed ${bedId}` : `Edit Bed Details — ${bedId}`}
      description={mode === "admit" ? "Assign an incoming patient to this bed" : "Update patient and bed information"}
      icon={icon}
      tone="default"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>
            {mode === "admit" ? "Admit Patient" : "Save Changes"}
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Patient Name</label>
          <input
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="e.g. Kofi Asante"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {touched && errors.name && <p className="mt-1 text-[11px] text-status-red">{errors.name}</p>}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Age / Sex</label>
          <input
            value={values.demo}
            onChange={(e) => set("demo", e.target.value)}
            placeholder="e.g. 62M"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {touched && errors.demo && <p className="mt-1 text-[11px] text-status-red">{errors.demo}</p>}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">MRN</label>
          <input
            value={values.mrn}
            onChange={(e) => set("mrn", e.target.value)}
            placeholder="e.g. MRN-88219"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
        <div className="col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Diagnosis / Reason for Admission
          </label>
          <input
            value={values.dx}
            onChange={(e) => set("dx", e.target.value)}
            placeholder="e.g. Community-Acquired Pneumonia"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {touched && errors.dx && <p className="mt-1 text-[11px] text-status-red">{errors.dx}</p>}
        </div>
        <div className="col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Clinical Note (optional)
          </label>
          <textarea
            value={values.note}
            onChange={(e) => set("note", e.target.value)}
            rows={2}
            placeholder="e.g. O2 2L/min · Cefotaxime IV"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
      </div>
    </Modal>
  );
}
