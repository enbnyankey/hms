"use client";

import { useState } from "react";
import { BadgeCheck, Download, ScanLine, UserPlus, Loader2 } from "lucide-react";
import Button from "@/components/ui/Button";
import { actionToast } from "@/lib/actions";

export default function CredentialHeader({ onFastTrack }: { onFastTrack: () => void }) {
  const [exporting, setExporting] = useState(false);
  const [verifying, setVerifying] = useState(false);

  return (
    <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-brand-teal">
          <BadgeCheck className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Institutional Governance
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Staff Credentialing &amp; RBAC
          </h1>
          <p className="text-xs text-slate-500">
            Council license verification, hardware key issuance &amp; role-based access provisioning
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => {
            setExporting(true);
            setTimeout(() => {
              setExporting(false);
              actionToast("Audit ledger exported", "Credentialing history exported for the current campus.", "success");
            }, 700);
          }}
          disabled={exporting}
          className="flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          Export Audit Ledger
        </button>
        <button
          onClick={() => {
            setVerifying(true);
            setTimeout(() => {
              setVerifying(false);
              actionToast("Batch MDCG verification complete", "9 of 14 pending credentials re-synced against council registries.", "success");
            }, 900);
          }}
          disabled={verifying}
          className="flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {verifying ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ScanLine className="h-3.5 w-3.5" />}
          Batch MDCG Verify
        </button>
        <Button variant="primary" onClick={onFastTrack}>
          <UserPlus className="h-3.5 w-3.5" />
          Fast-Track Locum
        </Button>
      </div>
    </div>
  );
}
