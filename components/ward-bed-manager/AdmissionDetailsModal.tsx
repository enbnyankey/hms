"use client";

import { useState } from "react";
import { Pencil } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { Bed } from "@/lib/ward-api";

/** Edit diagnosis / attending / note of the patient in a bed. Remount (key) per bed. */
export default function AdmissionDetailsModal({
  bed,
  onClose,
  onSubmit,
}: {
  bed: Bed | null;
  onClose: () => void;
  onSubmit: (values: { diagnosis: string; attending: string; notes: string }) => Promise<boolean>;
}) {
  const o = bed?.occupant;
  const [diagnosis, setDiagnosis] = useState(o?.diagnosis ?? "");
  const [attending, setAttending] = useState(o?.attending ?? "");
  const [notes, setNotes] = useState(o?.notes ?? "");
  const [submitting, setSubmitting] = useState(false);
  const invalid = !diagnosis.trim();

  async function save() {
    if (invalid) return;
    setSubmitting(true);
    try {
      if (await onSubmit({ diagnosis, attending, notes })) onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal";

  return (
    <Modal
      open={!!bed}
      onClose={() => !submitting && onClose()}
      title={`Edit Bed Details — ${bed?.code ?? ""}`}
      description={o ? `${o.patientName} · ${o.mrn}` : undefined}
      icon={Pencil}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={save} loading={submitting} disabled={invalid}>
            Save Changes
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Diagnosis</label>
          <input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} className={inputClass} />
          {invalid && <p className="mt-1 text-[11px] text-status-red">Diagnosis is required</p>}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Attending</label>
          <input value={attending} onChange={(e) => setAttending(e.target.value)} className={inputClass} />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Clinical Note</label>
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className={inputClass} />
        </div>
      </div>
    </Modal>
  );
}
