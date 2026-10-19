"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  Printer,
  CheckCircle2,
  Circle,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  Lock,
  Inbox,
  Loader2,
} from "lucide-react";
import Card from "../Card";
import ConfirmModal from "../ui/ConfirmModal";
import Button from "../ui/Button";
import type { DispenseResult, RxDetail, RxLine } from "@/lib/pharmacy-api";
import { cedis, dateTimeLabel, expiryLabel } from "@/lib/pharmacy-data";

export type RxActions = {
  verify: (line: RxLine, verified: boolean) => Promise<boolean>;
  flag: (reason: string) => Promise<boolean>;
  clearFlag: () => Promise<boolean>;
  rejectLine: (line: RxLine, reason: string) => Promise<boolean>;
  openDispense: () => void;
};

export default function PrescriptionDetail({
  rx,
  loading,
  lastDispensed,
  canWork,
  actions,
}: {
  rx: RxDetail | null;
  loading: boolean;
  lastDispensed: DispenseResult | null;
  canWork: boolean;
  actions: RxActions;
}) {
  const [busyLine, setBusyLine] = useState<string | null>(null);
  const [showFlag, setShowFlag] = useState(false);
  const [rejectLine, setRejectLine] = useState<RxLine | null>(null);
  const [clearing, setClearing] = useState(false);

  if (!rx) {
    return (
      <Card icon={ClipboardCheck} iconClassName="bg-teal-50 text-brand-teal" title="Prescription" headerClassName="px-4 py-3" bodyClassName="p-4">
        {loading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-xs text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading prescription…
          </div>
        ) : lastDispensed ? (
          <DispensedLabel result={lastDispensed} />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 py-16 text-center">
            <Inbox className="h-6 w-6 text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">Select a prescription from the queue</p>
          </div>
        )}
      </Card>
    );
  }

  const s = rx.summary;
  const verifiedCount = rx.lines.filter((l) => l.verified).length;
  const allVerified = verifiedCount === rx.lines.length;
  const supplyable = rx.lines.some((l) => l.drugId && l.stockOnHand > 0);
  const canDispense = canWork && allVerified && !s.flag && supplyable;

  const clinical = [
    {
      id: "allergy",
      ok: !rx.allergies || /^(none|nkda|no known)/i.test(rx.allergies.trim()),
      title: !rx.allergies || /^(none|nkda|no known)/i.test(rx.allergies.trim()) ? "No Known Allergies" : "Allergies",
      line: rx.allergies && !/^(none|nkda|no known)/i.test(rx.allergies.trim()) ? rx.allergies : "Checked against every line",
    },
    {
      id: "nhis",
      ok: rx.copayFree,
      title: rx.nhisStatus ? `NHIS ${rx.nhisStatus.replace("_", " ")}` : "No NHIS record",
      line: rx.copayFree ? `#${rx.nhisNumber} · covered items GH¢0 co-pay` : "Patient pays formulary price",
    },
    {
      id: "weight",
      ok: true,
      title: rx.weightKg != null ? `Weight ${rx.weightKg} kg` : "No weight recorded",
      line: `Blood group ${rx.bloodGroup ?? "—"}`,
    },
  ];

  return (
    <Card
      icon={ClipboardCheck}
      iconClassName="bg-teal-50 text-brand-teal"
      title={`${s.rxRef} · ${s.patientName}`}
      subtitle={`${s.mrn} · ${s.location} · ${s.prescriber}`}
      headerClassName="px-4 py-3"
      bodyClassName="p-4"
      action={
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            allVerified ? "bg-status-green-bg text-status-green" : "bg-status-amber-bg text-status-amber"
          }`}
        >
          {verifiedCount}/{rx.lines.length} Verified
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-2 rounded-lg border border-surface-border bg-slate-50 p-2.5 text-[11px] sm:grid-cols-4">
        <Info label="Date of Birth" value={rx.dob ? new Date(rx.dob).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—"} />
        <Info label="Age / Sex" value={[s.age != null ? `${s.age} yrs` : null, s.sex].filter(Boolean).join(" · ") || "—"} />
        <Info label="Blood Group" value={rx.bloodGroup ?? "—"} />
        <Info label="Weight" value={rx.weightKg != null ? `${rx.weightKg} kg` : "—"} />
      </div>

      <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
        {clinical.map((f) => (
          <div key={f.id} className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-white px-2.5 py-1.5">
            {f.ok ? (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-status-green" />
            ) : (
              <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-status-amber" />
            )}
            <div className="min-w-0 leading-tight">
              <p className="text-[11px] font-bold text-slate-700">{f.title}</p>
              <p className="truncate text-[10px] text-slate-400" title={f.line}>
                {f.line}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1.5">
        {rx.lines.map((l) => {
          const first = l.batches.find((b) => !b.expired);
          return (
            <div key={l.orderId} className="rounded-lg border border-surface-border bg-white px-3 py-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="flex items-center gap-1.5 text-[12px] font-bold text-slate-800">
                    {l.drugName ?? l.drug}
                    {l.controlled && (
                      <span className="flex items-center gap-0.5 rounded bg-slate-100 px-1.5 text-[10px] text-slate-600">
                        <Lock className="h-2.5 w-2.5" /> CD
                      </span>
                    )}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    {l.dose} {l.route} · {l.frequency}
                    {l.indication ? ` · ${l.indication}` : ""} · Supply {l.suggestedQty} {l.unit ?? ""} · Co-pay{" "}
                    {!l.drugId ? "—" : rx.copayFree && l.nhisCovered ? "GH¢0.00" : cedis(l.suggestedQty * (l.unitPrice ?? 0))}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {canWork && (
                    <button
                      type="button"
                      title="Reject this line"
                      onClick={() => setRejectLine(l)}
                      className="rounded-full p-1 text-slate-300 hover:bg-status-red-bg hover:text-status-red"
                    >
                      <XCircle className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    disabled={!canWork || busyLine === l.orderId}
                    onClick={async () => {
                      setBusyLine(l.orderId);
                      await actions.verify(l, !l.verified);
                      setBusyLine(null);
                    }}
                    title={l.verified ? `Verified by ${l.verifiedBy} · ${dateTimeLabel(l.verifiedAt)}` : "Mark as verified"}
                    className={`flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors disabled:cursor-not-allowed ${
                      l.verified
                        ? "bg-status-green-bg text-status-green hover:bg-status-green/20"
                        : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                    }`}
                  >
                    {busyLine === l.orderId ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : l.verified ? (
                      <CheckCircle2 className="h-3 w-3" />
                    ) : (
                      <Circle className="h-3 w-3" />
                    )}
                    {l.verified ? "Verified" : "Unverified"}
                  </button>
                </div>
              </div>
              <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 border-t border-surface-border pt-1 text-[10px] text-slate-400">
                {l.drugId ? (
                  <>
                    <span>Next batch: {first ? `${first.batchNo} (exp ${expiryLabel(first.expiryDate)})` : "none in date"}</span>
                    <span>{l.location}</span>
                    <span>{l.drugCode}</span>
                    <span>Stock: {l.stockOnHand.toLocaleString()} {l.unit}</span>
                  </>
                ) : (
                  <span>Prescribed as “{l.drug} {l.dose}”</span>
                )}
                {l.verified && l.verifiedBy && <span>Verified by {l.verifiedBy}</span>}
              </div>
              {l.problem && (
                <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-status-red">
                  <AlertTriangle className="h-3 w-3" /> {l.problem}
                </p>
              )}
              {l.allergyAlert && (
                <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-status-amber">
                  <AlertTriangle className="h-3 w-3" /> {l.allergyAlert}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {s.flag && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-status-amber-bg bg-status-amber-bg/40 px-3 py-2 text-[11px] text-status-amber">
          <span className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Flagged for pharmacist review: {s.flag}
          </span>
          {canWork && (
            <Button
              variant="ghost"
              className="!rounded-md !px-2 !py-1 !text-[10px]"
              loading={clearing}
              onClick={async () => {
                setClearing(true);
                await actions.clearFlag();
                setClearing(false);
              }}
            >
              Clear
            </Button>
          )}
        </div>
      )}

      {lastDispensed && lastDispensed.patientId === s.patientId && <DispensedLabel result={lastDispensed} />}

      {canWork && (
        <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" onClick={() => setShowFlag(true)} disabled={!!s.flag}>
            <AlertTriangle className="h-3.5 w-3.5" />
            {s.flag ? "Flagged" : "Flag for Review"}
          </Button>
          <Button
            variant="primary"
            disabled={!canDispense}
            title={
              !allVerified ? "Verify all items before dispensing" : s.flag ? "Clear the flag before dispensing" : !supplyable ? "Nothing on this prescription can be supplied" : undefined
            }
            onClick={actions.openDispense}
          >
            <Printer className="h-3.5 w-3.5" /> Dispense &amp; Print Label
          </Button>
        </div>
      )}

      <ConfirmModal
        open={showFlag}
        onClose={() => setShowFlag(false)}
        onConfirm={async (reason) => {
          if (await actions.flag(reason ?? "")) setShowFlag(false);
        }}
        variant="warning"
        title="Flag for Pharmacist Review"
        description="Dispensing on this prescription is paused until the flag is cleared."
        confirmLabel="Flag Prescription"
        requireReason
        reasonLabel="Reason for flag"
        reasonPlaceholder="e.g. Unusual dose, interaction concern…"
      />

      <ConfirmModal
        open={!!rejectLine}
        onClose={() => setRejectLine(null)}
        onConfirm={async (reason) => {
          if (rejectLine && (await actions.rejectLine(rejectLine, reason ?? ""))) setRejectLine(null);
        }}
        variant="reject"
        title="Reject Line"
        description={rejectLine ? `Reject ${rejectLine.drug} ${rejectLine.dose} for ${s.patientName}? The rest of the prescription stays in the queue.` : ""}
        confirmLabel="Reject Line"
        requireReason
        reasonLabel="Reason"
        reasonPlaceholder="e.g. Not on formulary — suggest alternative…"
      />
    </Card>
  );
}

/** Label for the most recent supply, with a real print. */
function DispensedLabel({ result }: { result: DispenseResult }) {
  function print() {
    const w = window.open("", "_blank", "width=420,height=600");
    if (!w) return;
    const esc = (t: string) => t.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c] as string);
    const body = result.lines
      .map(
        (l) =>
          `<div class="l"><b>${esc(l.drugName)}</b> &times;${l.quantity} ${esc(l.unit)}<br/>${esc(l.sig)}<br/>Batch ${l.batches
            .map((b) => `${esc(b.batchNo)} (exp ${expiryLabel(b.expiryDate)})`)
            .join(", ")}</div>`
      )
      .join("");
    w.document.write(
      `<html><head><title>${esc(result.rxRef)}</title><style>body{font:12px monospace;padding:12px}.l{border-top:1px dashed #999;padding:6px 0}h3{margin:0;text-align:center}</style></head><body>` +
        `<h3>AURAHEALTH PHARMACY</h3><p>PATIENT: ${esc(result.patientName.toUpperCase())} (${esc(result.mrn)})<br/>RX: ${esc(result.rxRef)}</p>${body}` +
        `<p>DISPENSED: ${esc(dateTimeLabel(result.dispensedAt))}<br/>BY: ${esc(result.dispensedBy.toUpperCase())}<br/>CO-PAY: ${esc(cedis(result.totalCopay))}</p></body></html>`
    );
    w.document.close();
    w.focus();
    w.print();
  }

  return (
    <div className="mt-3 rounded-lg border border-status-green-bg bg-status-green-bg/30 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-[11px] font-semibold text-status-green">
          <CheckCircle2 className="h-3.5 w-3.5" />
          {result.rxRef} dispensed to {result.patientName}
          {result.awaitingCollection ? " · waiting at the window" : " · sent to ward"}
        </p>
        <Button variant="secondary" className="!rounded-md !px-2 !py-1 !text-[10px]" onClick={print}>
          <Printer className="h-3 w-3" /> Print Label
        </Button>
      </div>
      <div className="mt-2 rounded-md border border-slate-300 bg-white p-2.5 font-mono text-[10px] leading-snug text-slate-700">
        <p className="text-center font-bold">AURAHEALTH PHARMACY</p>
        <p className="mt-1">
          PATIENT: {result.patientName.toUpperCase()} ({result.mrn}) | {result.rxRef}
        </p>
        {result.lines.map((l) => (
          <p key={l.orderId} className="mt-1 border-t border-dashed border-slate-200 pt-1">
            {l.drugName} ×{l.quantity} {l.unit} — {l.sig}
            <br />
            BATCH {l.batches.map((b) => `${b.batchNo} (EXP ${expiryLabel(b.expiryDate)}) ×${b.quantity}`).join(", ")}
          </p>
        ))}
        <p className="mt-1">
          DISPENSED: {dateTimeLabel(result.dispensedAt)} · BY {result.dispensedBy.toUpperCase()} · CO-PAY {cedis(result.totalCopay)}
        </p>
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-semibold text-slate-700">{value}</p>
    </div>
  );
}
