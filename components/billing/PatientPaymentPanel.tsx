"use client";

import { useEffect, useState } from "react";
import { Smartphone, CreditCard, Banknote, Landmark, ShieldCheck, ReceiptText, LogOut, CheckCircle2 } from "lucide-react";
import {
  selectedInvoicePatient,
  lineItems,
  paymentChannels,
  momoPayment,
  vatFooter,
  formatGHS,
  type Invoice,
  type PaymentChannelId,
} from "@/lib/billing-data";
import { actionToast } from "@/lib/actions";

const channelIcons: Record<PaymentChannelId, typeof Smartphone> = {
  momo: Smartphone,
  pos: CreditCard,
  cash: Banknote,
  bank: Landmark,
};

export default function PatientPaymentPanel({
  invoice,
  onPay,
}: {
  invoice: Invoice;
  onPay: (invoiceId: string, amount: number) => void;
}) {
  const [activeChannel, setActiveChannel] = useState<PaymentChannelId>("momo");
  const [amount, setAmount] = useState(invoice.balance.toFixed(2));
  const [reference, setReference] = useState("");
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const settled = invoice.balance <= 0;

  useEffect(() => {
    setAmount(invoice.balance.toFixed(2));
  }, [invoice.balance]);

  // Coverage shown to the cashier reflects the scheme's approved contribution on this invoice.
  const coverageAmount = invoice.insurance;

  function referenceLabel() {
    switch (activeChannel) {
      case "momo":
        return "Cashier Authorization Reference";
      case "pos":
        return "Card Last 4 Digits";
      case "bank":
        return "Bank Transfer Reference";
      case "cash":
        return "Cashier Receipt Note";
    }
  }

  function handleConfirm() {
    if (settled) {
      actionToast("Already fully settled", "There is no outstanding balance on this encounter.", "info");
      return;
    }
    const parsed = Number(amount);
    if (!amount.trim() || Number.isNaN(parsed) || parsed <= 0) {
      setError("Enter a valid payment amount greater than zero.");
      return;
    }
    if (parsed > invoice.balance) {
      setError(`Amount cannot exceed the balance of GH¢${formatGHS(invoice.balance)}.`);
      return;
    }
    setError(null);
    setSubmitting(true);
    setTimeout(() => {
      onPay(invoice.id, parsed);
      actionToast("Payment confirmed", `GRA e-receipt issued for GH¢${parsed.toFixed(2)}.`);
      setSubmitting(false);
    }, 450);
  }

  function handleDischarge() {
    if (invoice.balance > 0) {
      actionToast(
        "Cannot clear for discharge",
        `Outstanding balance of GH¢${formatGHS(invoice.balance)} remains on this encounter.`,
        "warning"
      );
      return;
    }
    actionToast("Discharge clearance issued", `${selectedInvoicePatient.name} cleared for discharge.`);
  }

  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="border-b border-surface-border p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-800 text-sm font-bold text-white">
              {selectedInvoicePatient.initials}
            </div>
            <div>
              <div className="flex flex-wrap items-baseline gap-2">
                <h2 className="text-sm font-extrabold text-slate-900">{selectedInvoicePatient.name}</h2>
                <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">
                  {selectedInvoicePatient.sex}, {selectedInvoicePatient.age}y
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                {selectedInvoicePatient.mrn} · NHIS: {selectedInvoicePatient.nhis}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="font-mono text-xs font-bold text-brand-cyan">{invoice.id}</p>
            <p className="text-[11px] text-slate-400">{selectedInvoicePatient.encounterLabel}</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-wide text-slate-400">
          <span>Itemized Clinical Services</span>
          <span>Coverage / Patient Due</span>
        </div>

        <div className="mt-2 divide-y divide-surface-border">
          {lineItems.map((li) => (
            <div key={li.id} className="flex items-start justify-between gap-3 py-2.5">
              <div className="min-w-0">
                <p className="text-xs font-bold text-slate-800">{li.title}</p>
                <p className="text-[11px] text-slate-400">{li.detail}</p>
              </div>
              <div className="shrink-0 text-right">
                <p className="text-xs font-bold text-slate-800">{li.amount}</p>
                <p className="text-[11px] text-slate-400">
                  NHIS: {li.nhisCovered} <span className="text-status-red">| Pt: {li.patientDue}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-3 space-y-1.5 border-t border-surface-border pt-3 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Gross Clinical Subtotal:</span>
            <span className="font-semibold text-slate-700">GH¢{formatGHS(invoice.total)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5 text-status-green" />
              NHIS Scheme Approved G-DRG Coverage:
            </span>
            <span className="font-semibold text-status-green">- GH¢{formatGHS(coverageAmount)}</span>
          </div>
        </div>

        <div
          className={`mt-3 flex items-center justify-between rounded-lg p-3 ${settled ? "bg-status-green-bg" : "bg-slate-50"}`}
        >
          <span className="text-sm font-bold text-slate-800">
            {settled ? "Patient Balance: Fully Settled" : "Patient Out-of-Pocket Balance:"}
          </span>
          {settled ? (
            <CheckCircle2 className="h-5 w-5 text-status-green" />
          ) : (
            <span className="text-lg font-extrabold text-status-red">GH¢{formatGHS(invoice.balance)}</span>
          )}
        </div>

        <p className="mt-5 text-[11px] font-bold uppercase tracking-wide text-slate-400">Select Payment Channel</p>
        <div className="mt-2 grid grid-cols-4 gap-1.5">
          {paymentChannels.map((ch) => {
            const Icon = channelIcons[ch.id];
            return (
              <button
                key={ch.id}
                type="button"
                disabled={settled}
                onClick={() => setActiveChannel(ch.id)}
                className={`flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-[11px] font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${
                  activeChannel === ch.id
                    ? "border-brand-cyan bg-status-blue-bg text-brand-cyan"
                    : "border-surface-border text-slate-500 hover:bg-slate-50"
                }`}
              >
                <Icon className="h-4 w-4" />
                {ch.label}
              </button>
            );
          })}
        </div>

        <div className="mt-3 rounded-lg border border-surface-border p-3.5">
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-status-green" />
            <p className="text-xs font-bold text-slate-800">
              {activeChannel === "momo" ? momoPayment.providerLabel : `${paymentChannels.find((c) => c.id === activeChannel)?.label} Payment`}
            </p>
            {activeChannel === "momo" && <span className="ml-auto text-[10px] text-slate-400">{momoPayment.hubId}</span>}
          </div>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {activeChannel === "momo" && (
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                  Payer Mobile Number
                </label>
                <input
                  readOnly
                  value={momoPayment.payerMobile}
                  className="mt-1 w-full rounded-md border border-surface-border px-2.5 py-1.5 text-xs font-medium text-slate-700"
                />
              </div>
            )}
            <div className={activeChannel === "momo" ? "" : "col-span-2"}>
              <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                Payable Amount (GHS)
              </label>
              <input
                disabled={settled}
                inputMode="decimal"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (error) setError(null);
                }}
                className="mt-1 w-full rounded-md border border-surface-border px-2.5 py-1.5 text-xs font-bold text-slate-800 outline-none focus:border-brand-teal disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              {referenceLabel()}
            </label>
            <div className="mt-1 flex gap-2">
              <input
                value={activeChannel === "momo" ? momoPayment.authRef : reference}
                readOnly={activeChannel === "momo"}
                onChange={(e) => setReference(e.target.value)}
                disabled={settled}
                placeholder={activeChannel === "momo" ? undefined : "Enter reference…"}
                className="flex-1 rounded-md border border-surface-border px-2.5 py-1.5 text-xs font-mono text-slate-700 outline-none focus:border-brand-teal disabled:bg-slate-50"
              />
              <button
                type="button"
                disabled={settled}
                onClick={() => {
                  setVerified(true);
                  actionToast("Authorization verified", activeChannel === "momo" ? momoPayment.authRef : reference || "Reference confirmed");
                }}
                className="rounded-md border border-surface-border px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {verified ? "Verified" : "Verify"}
              </button>
            </div>
          </div>
        </div>

        {error && <p className="mt-2 text-xs font-semibold text-status-red">{error}</p>}

        <div className="mt-4 grid grid-cols-2 gap-2">
          <button
            onClick={handleConfirm}
            disabled={settled || submitting}
            className="flex items-center justify-center gap-1.5 rounded-md bg-brand-teal px-3 py-2.5 text-xs font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ReceiptText className="h-3.5 w-3.5" />
            {settled ? "Fully Settled" : submitting ? "Processing…" : "Confirm & GRA Receipt"}
          </button>
          <button
            onClick={handleDischarge}
            className="flex items-center justify-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            Discharge Clearance
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <ShieldCheck className="h-3 w-3 text-status-green" />
            {vatFooter.label}
          </span>
          <span>{vatFooter.sys}</span>
        </div>
      </div>
    </div>
  );
}
