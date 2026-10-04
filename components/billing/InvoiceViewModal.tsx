"use client";

import { FileText } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { formatGHS, type Invoice, type InvoiceStatus } from "@/lib/billing-data";

const statusStyle: Record<InvoiceStatus, string> = {
  "Partial Paid": "bg-status-blue-bg text-status-blue",
  Adjudicating: "bg-status-amber-bg text-status-amber",
  Unpaid: "bg-status-red-bg text-status-red",
  "Paid in Full": "bg-status-green-bg text-status-green",
  Cleared: "bg-status-green-bg text-status-green",
  Rejected: "bg-status-orange-bg text-status-orange",
  Void: "bg-slate-100 text-slate-500",
};

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between border-b border-surface-border py-2 text-xs last:border-b-0">
      <span className="text-slate-400">{label}</span>
      <span className="font-semibold text-slate-700">{value}</span>
    </div>
  );
}

export default function InvoiceViewModal({
  invoice,
  open,
  onClose,
}: {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!invoice) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={invoice.id}
      description="Full invoice detail"
      icon={FileText}
      size="md"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-slate-900">{invoice.patient}</p>
          <p className="text-[11px] text-slate-400">{invoice.mrn}</p>
        </div>
        <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-bold ${statusStyle[invoice.status]}`}>
          {invoice.status}
        </span>
      </div>

      <div className="mt-4">
        <Row label="Encounter" value={invoice.encounter} />
        <Row label="Category" value={invoice.category} />
        <Row label="Scheme" value={invoice.scheme} />
        <Row label="Total Charges (GHS)" value={formatGHS(invoice.total)} />
        <Row label="Insurance Covered (GHS)" value={formatGHS(invoice.insurance)} />
        <Row label="Balance Due (GHS)" value={formatGHS(invoice.balance)} />
      </div>
    </Modal>
  );
}
