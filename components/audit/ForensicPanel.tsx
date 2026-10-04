"use client";

import { useState } from "react";
import { FileJson, Copy, Download, Loader2, Inbox, RefreshCcw } from "lucide-react";
import type { LedgerEvent } from "@/lib/audit-log-data";
import { actionToast } from "@/lib/actions";

export default function ForensicPanel({
  event,
  onRecalculateHash,
}: {
  event: LedgerEvent | null;
  onRecalculateHash: () => void;
}) {
  const [exporting, setExporting] = useState(false);
  const [recalculating, setRecalculating] = useState(false);

  if (!event) {
    return (
      <div className="flex h-full min-h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-white p-8 text-center">
        <Inbox className="h-6 w-6 text-slate-300" />
        <p className="mt-2 text-sm font-semibold text-slate-500">Select a ledger event</p>
        <p className="text-xs text-slate-400">Choose a row from the Master Ledger Stream to inspect its forensic payload.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <FileJson className="h-4 w-4 text-brand-teal" />
            Forensic Event Payload
          </h3>
          <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-mono font-semibold text-slate-500">
            AH-EVT-{event.id.split("-")[1]}0412
          </span>
        </div>

        <div className="mt-3 space-y-1.5 text-[11px]">
          <Row label="Ledger Block Index" value={event.ledgerIndex} mono />
          <Row label="Consensus Status" value={event.consensusStatus} tone="success" />
          <Row label="Origin Physical Beacon" value={event.originBeacon} mono />
          <Row label="Auth Channel" value={event.authChannel} />
        </div>

        <div className="mt-3 rounded-md bg-slate-900 p-3 text-[11px] text-slate-200">
          <p className="font-semibold uppercase tracking-wide text-slate-400">Merkle Proof Slice &amp; Signature</p>
          <p className="mt-1.5 break-all font-mono text-emerald-400">SHA256: {event.merkleHash}</p>
          <p className="mt-1 break-all font-mono text-slate-400">PREV_HASH: {event.prevHash}</p>
          <p className="mt-1 text-slate-400">SEAL_DAEMON: AuraCore Security Node ACC-CL-091</p>
        </div>

        <div className="mt-3">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Raw Clinical JSON Telemetry</p>
            <button
              onClick={() => actionToast("Copied to clipboard", "Raw JSON telemetry copied.", "info")}
              className="flex items-center gap-1 text-[10px] font-semibold text-brand-cyan hover:underline"
            >
              <Copy className="h-3 w-3" />
              Copy
            </button>
          </div>
          <pre className="max-h-48 overflow-auto rounded-md bg-slate-50 p-3 text-[10px] leading-relaxed text-slate-600">{event.rawJson}</pre>
        </div>

        <button
          onClick={() => {
            setExporting(true);
            setTimeout(() => {
              setExporting(false);
              actionToast("Dossier exported", `${event.id}.json downloaded with full chain-of-custody metadata.`, "success");
            }, 600);
          }}
          disabled={exporting}
          className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:opacity-60"
        >
          {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Export Dossier (.JSON)
        </button>
      </div>

      <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold text-slate-800">Cryptographic Merkle Root Integrity Assured</p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              AuraHealth HMS synchronizes all state transitions to an append-only cryptographic ledger with zero data loss or log manipulation
              toleration.
            </p>
          </div>
          <div className="shrink-0 text-right text-[11px] text-slate-500">
            <p>
              Last Block Confirmed <span className="font-mono font-semibold text-slate-700">#1,849,204</span> · 14ms Latency
            </p>
            <button
              onClick={() => {
                setRecalculating(true);
                setTimeout(() => {
                  setRecalculating(false);
                  onRecalculateHash();
                  actionToast("Hash recalculated", "Merkle root integrity confirmed — zero drift detected.", "success");
                }, 800);
              }}
              disabled={recalculating}
              className="mt-1 flex items-center gap-1 rounded-md border border-surface-border px-2.5 py-1.5 font-semibold text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              {recalculating ? <Loader2 className="h-3 w-3 animate-spin" /> : <RefreshCcw className="h-3 w-3" />}
              Recalculate Hash
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value, mono, tone }: { label: string; value: string; mono?: boolean; tone?: "success" }) {
  return (
    <div className="flex items-center justify-between border-b border-surface-border pb-1.5 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className={`font-semibold ${mono ? "font-mono" : ""} ${tone === "success" ? "text-status-green" : "text-slate-700"}`}>{value}</span>
    </div>
  );
}
