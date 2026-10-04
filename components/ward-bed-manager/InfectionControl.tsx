"use client";

import { useState } from "react";
import { ShieldAlert, Phone, Flag, ShieldCheck } from "lucide-react";
import { infectionControl } from "@/lib/ward-data";
import { actionToast } from "@/lib/actions";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function InfectionControl() {
  const [flagged, setFlagged] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState<"flag" | "clear" | null>(null);

  const [suites, setSuites] = useState({ value: infectionControl.negativePressure.value, note: infectionControl.negativePressure.note });

  function handleFlag(reason?: string) {
    setFlagged(true);
    setSuites({ value: "1/2", note: "1 suite reserved for isolation review" });
    setConfirmOpen(null);
    actionToast("Ward flagged for isolation review", reason || "IPC notified of the escalation.", "warning");
  }

  function handleClear() {
    setFlagged(false);
    setSuites({ value: infectionControl.negativePressure.value, note: infectionControl.negativePressure.note });
    setConfirmOpen(null);
    actionToast("Isolation review cleared", "Negative pressure suite returned to availability.", "success");
  }

  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-surface-border px-5 py-4">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Infection Control Status</h2>
        </div>
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500">
          WHO Standard
        </span>
      </div>

      <div className="space-y-3 p-5">
        <div className="flex items-center justify-between rounded-lg border border-surface-border p-3">
          <div>
            <p className="text-xs font-bold text-slate-800">Negative Pressure Suites</p>
            {flagged && <p className="text-[10px] font-semibold text-status-amber">Flagged for review</p>}
          </div>
          <div className="text-right">
            <p className="text-sm font-extrabold text-status-green">{suites.value}</p>
            <p className="text-[10px] text-slate-400">{suites.note}</p>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-surface-border p-3">
          <div>
            <p className="text-xs font-bold text-slate-800">Hand Sanitizer Compliance</p>
            <p className="text-[10px] text-slate-400">{infectionControl.handSanitizer.note}</p>
          </div>
          <p className="text-sm font-extrabold text-status-green">{infectionControl.handSanitizer.value}</p>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-surface-border p-3">
          <div>
            <p className="text-xs font-bold text-slate-800">Sterile Linen Inventory</p>
            <p className="text-[10px] text-slate-400">{infectionControl.sterileLinen.note}</p>
          </div>
          <p className="text-sm font-extrabold text-slate-800">{infectionControl.sterileLinen.value}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {!flagged ? (
            <button
              onClick={() => setConfirmOpen("flag")}
              className="flex items-center gap-1.5 rounded-md border border-surface-border px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Flag className="h-3 w-3" />
              Flag for Isolation Review
            </button>
          ) : (
            <button
              onClick={() => setConfirmOpen("clear")}
              className="flex items-center gap-1.5 rounded-md border border-surface-border px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              <ShieldCheck className="h-3 w-3" />
              Clear Isolation Review
            </button>
          )}
        </div>

        <div className="flex items-start gap-2 rounded-lg border border-red-100 bg-status-red-bg p-3">
          <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-red" />
          <div className="flex-1">
            <p className="text-xs font-bold text-status-red">Need Isolation Escalation?</p>
            <p className="text-[11px] text-slate-600">{infectionControl.escalationContact}</p>
          </div>
          <button
            onClick={() => actionToast("Escalation call placed", infectionControl.escalationContact, "error")}
            className="shrink-0 rounded-md bg-status-red px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-700"
          >
            Escalate Now
          </button>
        </div>
      </div>

      <ConfirmModal
        open={confirmOpen === "flag"}
        onClose={() => setConfirmOpen(null)}
        onConfirm={(reason) => handleFlag(reason)}
        variant="warning"
        title="Flag Ward for Isolation Review"
        description="This reserves a negative pressure suite and notifies the IPC officer. Provide the reason for escalation."
        confirmLabel="Flag for Review"
        requireReason
        reasonLabel="Reason"
      />

      <ConfirmModal
        open={confirmOpen === "clear"}
        onClose={() => setConfirmOpen(null)}
        onConfirm={() => handleClear()}
        variant="approve"
        title="Clear Isolation Review"
        description="This releases the reserved negative pressure suite back to general availability."
        confirmLabel="Clear Review"
      />
    </div>
  );
}
