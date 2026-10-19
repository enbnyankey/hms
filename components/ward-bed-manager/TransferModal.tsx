"use client";

import { useState } from "react";
import { ArrowLeftRight } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
/** A bed a patient can be moved/admitted into. ward is the ward code (e.g. "A"). */
export type TransferTarget = { ward: string; bedId: string; label: string };

export default function TransferModal({
  open,
  onClose,
  onConfirm,
  sourceLabel,
  patientName,
  availableTargets,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (target: TransferTarget) => void | Promise<void>;
  sourceLabel: string;
  patientName?: string;
  availableTargets: TransferTarget[];
}) {
  const [targetKey, setTargetKey] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function handleClose() {
    if (submitting) return;
    setTargetKey("");
    onClose();
  }

  async function handleConfirm() {
    const target = availableTargets.find((t) => `${t.ward}:${t.bedId}` === targetKey);
    if (!target) return;
    setSubmitting(true);
    try {
      await onConfirm(target);
      setTargetKey("");
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Transfer Patient"
      description={patientName ? `Move ${patientName} to another bed` : undefined}
      icon={ArrowLeftRight}
      tone="default"
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} loading={submitting} disabled={!targetKey}>
            Confirm Transfer
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">From</label>
          <p className="mt-1 rounded-md border border-surface-border bg-slate-50 px-3 py-2 text-sm text-slate-600">
            {sourceLabel}
          </p>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Destination Bed
          </label>
          {availableTargets.length === 0 ? (
            <p className="mt-1 rounded-md border border-dashed border-surface-border px-3 py-2 text-xs text-slate-400">
              No available beds to transfer into right now.
            </p>
          ) : (
            <select
              value={targetKey}
              onChange={(e) => setTargetKey(e.target.value)}
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
            >
              <option value="">Select a bed…</option>
              {availableTargets.map((t) => (
                <option key={`${t.ward}:${t.bedId}`} value={`${t.ward}:${t.bedId}`}>
                  {t.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>
    </Modal>
  );
}
