"use client";

import { useEffect, useState } from "react";
import { CheckCircle2 } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { MarDose } from "@/lib/nursing-emar-data";

function nowTime() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function AdministerDoseModal({
  dose,
  onClose,
  onConfirm,
}: {
  dose: MarDose | null;
  onClose: () => void;
  onConfirm: (doseId: string, values: { givenAt: string; route: string; witnessedBy?: string }) => void;
}) {
  const [givenAt, setGivenAt] = useState("");
  const [route, setRoute] = useState("");
  const [witnessedBy, setWitnessedBy] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (dose) {
      setGivenAt(nowTime());
      setRoute(dose.route);
      setWitnessedBy("");
      setSubmitting(false);
    }
  }, [dose]);

  const requiresWitness = !!dose?.controlled;
  const invalid = !givenAt.trim() || !route.trim() || (requiresWitness && !witnessedBy.trim());

  function handleConfirm() {
    if (!dose || invalid) return;
    setSubmitting(true);
    setTimeout(() => {
      onConfirm(dose.id, {
        givenAt: givenAt.trim(),
        route: route.trim(),
        witnessedBy: requiresWitness ? witnessedBy.trim() : undefined,
      });
      setSubmitting(false);
    }, 400);
  }

  return (
    <Modal
      open={!!dose}
      onClose={() => !submitting && onClose()}
      title="Administer Dose"
      description={dose ? `${dose.drug} ${dose.dose} · ${dose.patientName} (${dose.bed})` : undefined}
      icon={CheckCircle2}
      tone="success"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="success" onClick={handleConfirm} loading={submitting} disabled={invalid}>
            Confirm Given
          </Button>
        </>
      }
    >
      {dose && (
        <div className="space-y-3">
          <div className="rounded-lg border border-surface-border bg-slate-50 p-3 text-xs text-slate-600">
            <p>
              <span className="font-semibold text-slate-700">Scheduled:</span> {dose.scheduledTime} ·{" "}
              {dose.frequency}
            </p>
            <p className="mt-0.5">
              <span className="font-semibold text-slate-700">Prescribed by:</span> {dose.prescribingDoctor}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Time Given
              </label>
              <input
                type="time"
                value={givenAt}
                onChange={(e) => setGivenAt(e.target.value)}
                className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Route Confirmation
              </label>
              <input
                value={route}
                onChange={(e) => setRoute(e.target.value)}
                placeholder="e.g. PO, IV, SC"
                className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
              />
            </div>
          </div>
          {!givenAt.trim() && <p className="text-[11px] text-status-red">Time given is required.</p>}
          {!route.trim() && <p className="text-[11px] text-status-red">Route confirmation is required.</p>}

          {dose.controlled && (
            <div className="rounded-lg border border-amber-200 bg-status-amber-bg p-3">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-status-amber">
                Witnessed By (required — controlled substance)
              </label>
              <input
                value={witnessedBy}
                onChange={(e) => setWitnessedBy(e.target.value)}
                placeholder="Name of witnessing nurse"
                className="mt-1 w-full rounded-md border border-amber-200 bg-white px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-status-amber"
              />
              {!witnessedBy.trim() && (
                <p className="mt-1 text-[11px] text-status-amber">
                  A second nurse must witness administration of this Schedule drug.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}
