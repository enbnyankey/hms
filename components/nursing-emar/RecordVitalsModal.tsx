"use client";

import { useState } from "react";
import { HeartPulse } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export type RosterOption = { value: string; label: string };

export type VitalsValues = { systolic: number; diastolic: number; pulse: number; temperature: number; spo2: number; respRate: number };

type FormState = {
  patient: string;
  systolic: string;
  diastolic: string;
  pulse: string;
  temp: string;
  spo2: string;
  resp: string;
};

const blank = { systolic: "", diastolic: "", pulse: "", temp: "", spo2: "", resp: "" };

/** Remount (key) each time it opens so the form starts empty. */
export default function RecordVitalsModal({
  open,
  onClose,
  onSave,
  roster,
  initialPatient,
}: {
  open: boolean;
  onClose: () => void;
  /** patient = admission id. Resolve true when saved (closes the dialog). */
  onSave: (admissionId: string, values: VitalsValues) => Promise<boolean>;
  roster: RosterOption[];
  initialPatient?: string;
}) {
  const [form, setForm] = useState<FormState>({ ...blank, patient: initialPatient ?? roster[0]?.value ?? "" });
  const [submitting, setSubmitting] = useState(false);

  const numericFields: (keyof FormState)[] = ["systolic", "diastolic", "pulse", "temp", "spo2", "resp"];
  const allFilled = form.patient.trim() && numericFields.every((f) => form[f].trim().length > 0);
  const allNumeric = numericFields.every((f) => !Number.isNaN(Number(form[f])) && form[f].trim() !== "");
  const isValid = allFilled && allNumeric;

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  async function handleSave() {
    if (!isValid) return;
    setSubmitting(true);
    try {
      const ok = await onSave(form.patient, {
        systolic: Number(form.systolic),
        diastolic: Number(form.diastolic),
        pulse: Number(form.pulse),
        temperature: Number(form.temp),
        spo2: Number(form.spo2),
        respRate: Number(form.resp),
      });
      if (ok) onClose();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Record New Vitals"
      description="Log a fresh set of nursing observations for this patient."
      icon={HeartPulse}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSave} loading={submitting} disabled={!isValid}>
            Save Vitals
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Patient</label>
          <select
            value={form.patient}
            onChange={(e) => setForm((f) => ({ ...f, patient: e.target.value }))}
            className="mt-1 w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
          >
            {roster.length === 0 && <option value="">No patients on this ward</option>}
            {roster.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Systolic BP</label>
            <input
              inputMode="numeric"
              value={form.systolic}
              onChange={(e) => setForm((f) => ({ ...f, systolic: e.target.value }))}
              placeholder="120"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Diastolic BP</label>
            <input
              inputMode="numeric"
              value={form.diastolic}
              onChange={(e) => setForm((f) => ({ ...f, diastolic: e.target.value }))}
              placeholder="80"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Pulse (bpm)</label>
            <input
              inputMode="numeric"
              value={form.pulse}
              onChange={(e) => setForm((f) => ({ ...f, pulse: e.target.value }))}
              placeholder="82"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Temp (°C)</label>
            <input
              inputMode="decimal"
              value={form.temp}
              onChange={(e) => setForm((f) => ({ ...f, temp: e.target.value }))}
              placeholder="37.0"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">SpO2 (%)</label>
            <input
              inputMode="numeric"
              value={form.spo2}
              onChange={(e) => setForm((f) => ({ ...f, spo2: e.target.value }))}
              placeholder="97"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Resp. Rate (cpm)
            </label>
            <input
              inputMode="numeric"
              value={form.resp}
              onChange={(e) => setForm((f) => ({ ...f, resp: e.target.value }))}
              placeholder="18"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
        </div>
        {!isValid && (
          <p className="text-[11px] text-status-red">
            Select a patient and enter numeric values for all vitals fields.
          </p>
        )}
      </div>
    </Modal>
  );
}
