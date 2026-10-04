"use client";

import { useState } from "react";
import { Receipt, CalendarDays, ChevronDown, FilePlus2, Wallet, ShieldCheck, FileSpreadsheet, Check, Building2 } from "lucide-react";
import { billingHeader, dateRangeOptions, departmentOptions } from "@/lib/billing-data";
import { actionToast } from "@/lib/actions";

function Dropdown({
  icon: Icon,
  value,
  options,
  onSelect,
}: {
  icon: typeof CalendarDays;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
      >
        <Icon className="h-3.5 w-3.5 text-slate-400" />
        {value}
        <ChevronDown className="h-3 w-3 text-slate-400" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 z-20 mt-1 w-56 rounded-md border border-surface-border bg-white py-1 shadow-lg">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-1.5 text-left text-xs font-medium text-slate-600 hover:bg-slate-50"
              >
                {opt}
                {opt === value && <Check className="h-3.5 w-3.5 text-brand-teal" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function BillingHeader({
  onReceivePayment,
  onBatchNhis,
  batchSubmitted,
}: {
  onReceivePayment: () => void;
  onBatchNhis: () => void;
  batchSubmitted: boolean;
}) {
  const [date, setDate] = useState(dateRangeOptions[0]);
  const [department, setDepartment] = useState(billingHeader.department);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
            <Receipt className="h-4 w-4" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{billingHeader.title}</h1>
              <span className="rounded-md bg-status-blue-bg px-2 py-1 text-[11px] font-semibold text-status-blue">
                {billingHeader.wing}
              </span>
            </div>
            <p className="text-xs text-slate-500">{billingHeader.subtitle}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Dropdown icon={CalendarDays} value={date} options={dateRangeOptions} onSelect={setDate} />
          <Dropdown icon={Building2} value={department} options={departmentOptions} onSelect={setDepartment} />
          <button
            onClick={() => actionToast("New bill drafted", "A blank invoice has been opened for a new patient.")}
            className="flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <FilePlus2 className="h-3.5 w-3.5" />
            Generate Bill
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={onReceivePayment}
          className="flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700"
        >
          <Wallet className="h-3.5 w-3.5" />
          Receive Payment
        </button>
        <button
          onClick={onBatchNhis}
          disabled={batchSubmitted}
          className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          {batchSubmitted ? "Batch Submitted" : "Batch NHIS"}
        </button>
        <button
          onClick={() => actionToast("Reconciliation started", "Matching cashier totals against the day's ledger.", "info")}
          className="flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <FileSpreadsheet className="h-3.5 w-3.5" />
          Reconciliation
        </button>
      </div>
    </div>
  );
}
