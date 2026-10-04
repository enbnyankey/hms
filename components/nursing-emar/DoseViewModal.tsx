"use client";

import { FileText } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { MarDose } from "@/lib/nursing-emar-data";

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-surface-border py-1.5 last:border-b-0">
      <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</span>
      <span className="text-right text-xs font-medium text-slate-700">{value}</span>
    </div>
  );
}

export default function DoseViewModal({ dose, onClose }: { dose: MarDose | null; onClose: () => void }) {
  return (
    <Modal
      open={!!dose}
      onClose={onClose}
      title={dose ? `${dose.drug} ${dose.dose}` : "Order Detail"}
      description={dose ? `${dose.patientName} · ${dose.mrn} · ${dose.bed}` : undefined}
      icon={FileText}
      size="md"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      {dose && (
        <div>
          <DetailRow label="Status" value={dose.status} />
          <DetailRow label="Route" value={dose.route} />
          <DetailRow label="Frequency" value={dose.frequency} />
          <DetailRow label="Indication" value={dose.indication} />
          <DetailRow label="Scheduled Time" value={dose.scheduledTime} />
          <DetailRow label="Prescribing Doctor" value={dose.prescribingDoctor} />
          <DetailRow label="Controlled Substance" value={dose.controlled ? "Yes — requires witness" : "No"} />
          {dose.givenAt && <DetailRow label="Given At" value={`${dose.givenAt} by ${dose.givenBy ?? "—"}`} />}
          {dose.witnessedBy && <DetailRow label="Witnessed By" value={dose.witnessedBy} />}
          {dose.heldReason && <DetailRow label="Hold / Refusal Reason" value={dose.heldReason} />}

          <div className="mt-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Administration History
            </p>
            <div className="mt-1.5 space-y-1.5">
              {dose.history.length === 0 && (
                <p className="text-xs text-slate-400">No prior administrations recorded.</p>
              )}
              {dose.history.slice(0, 3).map((h, i) => (
                <div key={i} className="rounded-lg border border-surface-border p-2 text-xs">
                  <p className="font-semibold text-slate-700">
                    {h.time} · {h.by}
                  </p>
                  <p className="mt-0.5 text-slate-500">{h.note}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </Modal>
  );
}
