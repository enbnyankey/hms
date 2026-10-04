"use client";

import { useState } from "react";
import { BarChart3, Download, Loader2, Mail } from "lucide-react";
import { reportsHeader, dateRanges, type DateRangeId } from "@/lib/reports-analytics-data";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { actionToast } from "@/lib/actions";

export default function ReportsHeader({
  range,
  onRangeChange,
}: {
  range: DateRangeId;
  onRangeChange: (range: DateRangeId) => void;
}) {
  const [exporting, setExporting] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailTo, setEmailTo] = useState("");
  const [sending, setSending] = useState(false);

  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-teal text-white">
          <BarChart3 className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Leadership &amp; Governance</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">{reportsHeader.title}</h1>
          <p className="text-xs text-slate-500">{reportsHeader.subtitle}</p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 rounded-md border border-surface-border bg-white p-1">
          {dateRanges.map((r) => (
            <button
              key={r.id}
              onClick={() => onRangeChange(r.id)}
              className={`rounded px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                range === r.id ? "bg-slate-800 text-white" : "text-slate-500 hover:bg-slate-100"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setEmailOpen(true)}
          className="flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <Mail className="h-3.5 w-3.5" />
          Email Digest
        </button>

        <button
          onClick={() => {
            setExporting(true);
            setTimeout(() => {
              setExporting(false);
              actionToast("Dashboard exported", "A PDF snapshot of this dashboard has been downloaded.", "success");
            }, 700);
          }}
          disabled={exporting}
          className="flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Export Dashboard
        </button>
      </div>

      <Modal
        open={emailOpen}
        onClose={() => setEmailOpen(false)}
        title="Email Analytics Digest"
        description="Send this dashboard's summary to a leadership distribution list"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEmailOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              loading={sending}
              onClick={() => {
                if (!emailTo.trim()) {
                  actionToast("Recipient required", "Enter at least one email address.", "warning");
                  return;
                }
                setSending(true);
                setTimeout(() => {
                  setSending(false);
                  setEmailOpen(false);
                  actionToast("Digest sent", `Analytics summary emailed to ${emailTo}.`, "success");
                  setEmailTo("");
                }, 600);
              }}
            >
              Send Digest
            </Button>
          </>
        }
      >
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Recipients</label>
        <input
          value={emailTo}
          onChange={(e) => setEmailTo(e.target.value)}
          placeholder="cos@aurahealth.gh, board@aurahealth.gh"
          className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
        />
      </Modal>
    </div>
  );
}
