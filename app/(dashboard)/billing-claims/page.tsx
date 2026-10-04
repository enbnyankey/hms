"use client";

import { useMemo, useState } from "react";
import BillingHeader from "@/components/billing/BillingHeader";
import BillingKpis from "@/components/billing/BillingKpis";
import NhisBatchCard from "@/components/billing/NhisBatchCard";
import InvoiceTable from "@/components/billing/InvoiceTable";
import PatientPaymentPanel from "@/components/billing/PatientPaymentPanel";
import PaymentModal from "@/components/billing/PaymentModal";
import InvoiceViewModal from "@/components/billing/InvoiceViewModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { actionToast } from "@/lib/actions";
import {
  invoices as initialInvoices,
  selectedInvoicePatient,
  type Invoice,
} from "@/lib/billing-data";

export default function BillingClaimsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>(initialInvoices);

  const [viewInvoiceId, setViewInvoiceId] = useState<string | null>(null);
  const [payInvoiceId, setPayInvoiceId] = useState<string | null>(null);
  const [voidInvoiceId, setVoidInvoiceId] = useState<string | null>(null);
  const [rejectInvoiceId, setRejectInvoiceId] = useState<string | null>(null);
  const [voidBusy, setVoidBusy] = useState(false);
  const [rejectBusy, setRejectBusy] = useState(false);

  const [batchConfirmOpen, setBatchConfirmOpen] = useState(false);
  const [batchSubmitted, setBatchSubmitted] = useState(false);
  const [batchBusy, setBatchBusy] = useState(false);

  const viewInvoice = useMemo(() => invoices.find((i) => i.id === viewInvoiceId) ?? null, [invoices, viewInvoiceId]);
  const payInvoice = useMemo(() => invoices.find((i) => i.id === payInvoiceId) ?? null, [invoices, payInvoiceId]);

  // The cashier panel is wired to a single itemized encounter (Kwame Boateng's
  // Cardiology OPD visit). Keep it in sync with that same invoice's live balance.
  const panelInvoice = useMemo(
    () => invoices.find((i) => i.id === selectedInvoicePatient.invoiceId) ?? invoices[0],
    [invoices]
  );

  function applyPayment(invoiceId: string, amount: number) {
    setInvoices((prev) =>
      prev.map((inv) => {
        if (inv.id !== invoiceId) return inv;
        const nextBalance = Math.max(0, Math.round((inv.balance - amount) * 100) / 100);
        return {
          ...inv,
          balance: nextBalance,
          status: nextBalance === 0 ? "Paid in Full" : "Partial Paid",
        };
      })
    );
  }

  function handleVoidConfirm() {
    if (!voidInvoiceId) return;
    setVoidBusy(true);
    setTimeout(() => {
      const invoice = invoices.find((i) => i.id === voidInvoiceId);
      setInvoices((prev) =>
        prev.map((inv) => (inv.id === voidInvoiceId ? { ...inv, status: "Void", balance: 0 } : inv))
      );
      actionToast("Invoice voided", invoice ? `${invoice.id} has been voided and removed from collections.` : undefined, "warning");
      setVoidBusy(false);
      setVoidInvoiceId(null);
    }, 350);
  }

  function handleRejectConfirm(reason?: string) {
    if (!rejectInvoiceId) return;
    setRejectBusy(true);
    setTimeout(() => {
      const invoice = invoices.find((i) => i.id === rejectInvoiceId);
      setInvoices((prev) => prev.map((inv) => (inv.id === rejectInvoiceId ? { ...inv, status: "Rejected" } : inv)));
      actionToast(
        "Claim flagged for review",
        invoice ? `${invoice.id} was rejected. Reason: ${reason}` : reason,
        "error"
      );
      setRejectBusy(false);
      setRejectInvoiceId(null);
    }, 350);
  }

  function handleReceivePayment() {
    const outstanding = invoices.find((i) => i.balance > 0 && i.status !== "Void");
    if (!outstanding) {
      actionToast("No outstanding balances", "Every active invoice is already fully settled.", "info");
      return;
    }
    setPayInvoiceId(outstanding.id);
  }

  function handleBatchNhis() {
    if (batchSubmitted) {
      actionToast("Batch already submitted", "This NHIS batch is already awaiting adjudication.", "info");
      return;
    }
    setBatchConfirmOpen(true);
  }

  function confirmBatchSubmit() {
    setBatchBusy(true);
    setTimeout(() => {
      setBatchSubmitted(true);
      setBatchBusy(false);
      setBatchConfirmOpen(false);
      actionToast("Batch submitted to NHIA", "Claims queued for the next gateway adjudication cycle.", "info");
    }, 500);
  }

  return (
    <div>
      <BillingHeader onReceivePayment={handleReceivePayment} onBatchNhis={handleBatchNhis} batchSubmitted={batchSubmitted} />
      <BillingKpis />
      <NhisBatchCard submitted={batchSubmitted} onSubmitBatch={handleBatchNhis} />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_400px]">
        <InvoiceTable
          invoices={invoices}
          onView={setViewInvoiceId}
          onPay={setPayInvoiceId}
          onVoid={setVoidInvoiceId}
          onReject={setRejectInvoiceId}
        />
        <PatientPaymentPanel invoice={panelInvoice} onPay={applyPayment} />
      </div>

      <InvoiceViewModal invoice={viewInvoice} open={!!viewInvoice} onClose={() => setViewInvoiceId(null)} />

      <PaymentModal
        invoice={payInvoice}
        open={!!payInvoice}
        onClose={() => setPayInvoiceId(null)}
        onSubmit={(amount) => {
          if (!payInvoice) return;
          applyPayment(payInvoice.id, amount);
          actionToast("Payment recorded", `GH¢${amount.toFixed(2)} applied to ${payInvoice.id}.`);
          setPayInvoiceId(null);
        }}
      />

      <ConfirmModal
        open={!!voidInvoiceId}
        onClose={() => setVoidInvoiceId(null)}
        onConfirm={handleVoidConfirm}
        variant="delete"
        title="Void invoice"
        description={
          voidInvoiceId
            ? `This will void ${voidInvoiceId} and zero its outstanding balance. This action cannot be undone.`
            : ""
        }
        confirmLabel={voidBusy ? "Voiding…" : "Void invoice"}
      />

      <ConfirmModal
        open={!!rejectInvoiceId}
        onClose={() => setRejectInvoiceId(null)}
        onConfirm={handleRejectConfirm}
        variant="reject"
        title="Reject NHIS claim"
        description={
          rejectInvoiceId
            ? `Flag ${rejectInvoiceId} as rejected by the NHIA adjudication engine. Provide a reason for the audit trail.`
            : ""
        }
        confirmLabel={rejectBusy ? "Rejecting…" : "Reject claim"}
        requireReason
        reasonLabel="Rejection reason"
        reasonPlaceholder="e.g. Diagnosis code mismatch, missing pre-authorization…"
      />

      <ConfirmModal
        open={batchConfirmOpen}
        onClose={() => (!batchBusy ? setBatchConfirmOpen(false) : undefined)}
        onConfirm={confirmBatchSubmit}
        variant="approve"
        title="Submit NHIS batch"
        description="This submits the current electronic batch to the NHIA Claim-it gateway for adjudication. You won't be able to edit claims in this batch afterward."
        confirmLabel={batchBusy ? "Submitting…" : "Submit batch"}
      />
    </div>
  );
}
