"use client";

import { useEffect, useState } from "react";
import { Wallet } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { formatGHS, type Invoice, type PaymentChannelId } from "@/lib/billing-data";

const methods: { id: PaymentChannelId; label: string }[] = [
  { id: "momo", label: "MoMo" },
  { id: "pos", label: "POS / Card" },
  { id: "cash", label: "Cash" },
  { id: "bank", label: "Bank" },
];

export default function PaymentModal({
  invoice,
  open,
  onClose,
  onSubmit,
}: {
  invoice: Invoice | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (amount: number) => void;
}) {
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentChannelId>("momo");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && invoice) {
      setAmount(invoice.balance.toFixed(2));
      setMethod("momo");
      setError(null);
      setSubmitting(false);
    }
  }, [open, invoice]);

  if (!invoice) return null;

  function handleSubmit() {
    if (!invoice) return;
    const parsed = Number(amount);
    if (!amount.trim() || Number.isNaN(parsed)) {
      setError("Enter a valid numeric amount.");
      return;
    }
    if (parsed <= 0) {
      setError("Amount must be greater than zero.");
      return;
    }
    if (parsed > invoice.balance) {
      setError(`Amount cannot exceed the outstanding balance of GH¢${formatGHS(invoice.balance)}.`);
      return;
    }
    setError(null);
    setSubmitting(true);
    setTimeout(() => {
      onSubmit(parsed);
      setSubmitting(false);
    }, 400);
  }

  return (
    <Modal
      open={open}
      onClose={() => (!submitting ? onClose() : undefined)}
      title="Record payment"
      description={`${invoice.id} · ${invoice.patient}`}
      icon={Wallet}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>
            Record Payment
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <p className="text-xs text-slate-500">
          Outstanding balance: <span className="font-semibold text-status-red">GH¢{formatGHS(invoice.balance)}</span>
        </p>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Amount (GHS)</label>
          <input
            type="text"
            inputMode="decimal"
            value={amount}
            onChange={(e) => {
              setAmount(e.target.value);
              if (error) setError(null);
            }}
            placeholder="0.00"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm font-semibold text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Payment Method</label>
          <div className="mt-1 grid grid-cols-4 gap-1.5">
            {methods.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setMethod(m.id)}
                className={`rounded-md border px-2 py-1.5 text-[11px] font-semibold ${
                  method === m.id
                    ? "border-brand-cyan bg-status-blue-bg text-brand-cyan"
                    : "border-surface-border text-slate-500 hover:bg-slate-50"
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {error && <p className="text-xs font-semibold text-status-red">{error}</p>}
      </div>
    </Modal>
  );
}
