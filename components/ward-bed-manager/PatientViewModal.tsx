"use client";

import { FileText } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export type ViewRow = { label: string; value: string };

export default function PatientViewModal({
  open,
  onClose,
  title,
  description,
  rows,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  rows: ViewRow[];
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      description={description}
      icon={FileText}
      tone="default"
      size="sm"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <dl className="space-y-2.5">
        {rows.map((r) => (
          <div key={r.label} className="flex items-start justify-between gap-3 border-b border-surface-border pb-2 last:border-0 last:pb-0">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{r.label}</dt>
            <dd className="text-right text-xs font-medium text-slate-700">{r.value}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
