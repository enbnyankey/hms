"use client";

import { ShieldCheck, Download, Send, CheckCircle2 } from "lucide-react";
import { nhisBatchInfo, formatGHS } from "@/lib/billing-data";
import { actionToast } from "@/lib/actions";

export default function NhisBatchCard({
  submitted,
  onSubmitBatch,
}: {
  submitted: boolean;
  onSubmitBatch: () => void;
}) {
  return (
    <div className="mt-5 rounded-xl border border-surface-border bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-brand-teal">
            <ShieldCheck className="h-4 w-4" />
          </span>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-bold text-slate-900">{nhisBatchInfo.id}</h2>
              <span className="rounded-full bg-status-green-bg px-2.5 py-0.5 text-[10px] font-bold text-status-green">
                {submitted ? "Submitted: Awaiting Adjudication" : "Auto-Adjudicated: 100% Passed"}
              </span>
            </div>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">{nhisBatchInfo.tariff}</p>
            <p className="mt-1 max-w-2xl text-[11px] leading-snug text-slate-400">{nhisBatchInfo.detail}</p>
            <p className="mt-1 text-[11px] font-semibold text-slate-500">
              {nhisBatchInfo.claimsCount} claims · GH¢{formatGHS(nhisBatchInfo.totalAmount)} pending
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <span className="flex items-center gap-1.5 text-[11px] font-medium text-status-green">
            <span className="h-1.5 w-1.5 rounded-full bg-status-green" />
            {nhisBatchInfo.syncLabel}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => actionToast("EDI file exported", `${nhisBatchInfo.id} packaged for download.`)}
              className="flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Download className="h-3.5 w-3.5" />
              Export Batch EDI
            </button>
            <button
              onClick={onSubmitBatch}
              disabled={submitted}
              className="flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitted ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Send className="h-3.5 w-3.5" />}
              {submitted ? "Submitted to NHIA" : "Submit Batch to NHIA"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
