"use client";

import { useState } from "react";
import { FlaskConical, History, RotateCcw, Printer, Send, FileText, XCircle, ArrowUpCircle, ClipboardList } from "lucide-react";
import Card from "../Card";
import Modal from "../ui/Modal";
import ConfirmModal from "../ui/ConfirmModal";
import Button from "../ui/Button";
import { type SpecimenItem, type ClinicalFlagTone } from "@/lib/lab-data";
import { actionToast } from "@/lib/actions";

const flagStyle: Record<ClinicalFlagTone, string> = {
  normal: "bg-status-green-bg text-status-green",
  high: "bg-status-amber-bg text-status-amber",
  low: "bg-status-blue-bg text-status-blue",
  critical: "bg-status-red-bg text-status-red",
};

export default function SpecimenDetail({
  specimen,
  onValidate,
  onReject,
  onRetest,
  onEscalate,
}: {
  specimen: SpecimenItem | null;
  onValidate: (id: string) => void;
  onReject: (id: string, reason: string) => void;
  onRetest: (id: string) => void;
  onEscalate: (id: string) => void;
}) {
  const [viewOpen, setViewOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [retestOpen, setRetestOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);

  if (!specimen) {
    return (
      <div className="min-w-0">
        <Card
          icon={FlaskConical}
          iconClassName="bg-teal-50 text-brand-teal"
          title="Analyte Result Matrix"
          headerClassName="px-4 py-2.5"
          bodyClassName="p-8"
        >
          <div className="flex flex-col items-center gap-1.5 text-center">
            <ClipboardList className="h-6 w-6 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">No specimen selected</p>
            <p className="text-xs text-slate-400">Choose a specimen from the Accessioning Queue to view its results.</p>
          </div>
        </Card>
      </div>
    );
  }

  const initials = specimen.patient
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("");

  const isFinalized = specimen.status === "Validated" || specimen.status === "Rejected";

  return (
    <div className="min-w-0 space-y-3">
      <div className="rounded-xl border border-surface-border bg-white p-3 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">
              {initials}
            </span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900">{specimen.patient}</p>
                <span className="text-[11px] text-slate-400">
                  {specimen.age} · {specimen.sex}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500">
                MRN: {specimen.mrn} · Ward: {specimen.ward} · Bed {specimen.bed} · Consultant: {specimen.consultant}
              </p>
              <p className="text-[10px] text-slate-400">
                Collection: {specimen.collection} · Analyzer: {specimen.analyzer}
              </p>
            </div>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-right text-[10px] font-bold text-slate-600">
            {specimen.specId}
          </span>
        </div>
        {specimen.status === "Rejected" && specimen.rejectReason && (
          <div className="mt-2 rounded-md border border-status-red-bg bg-status-red-bg/60 px-2.5 py-1.5 text-[11px] text-status-red">
            <span className="font-bold">Rejected: </span>
            {specimen.rejectReason}
          </div>
        )}
      </div>

      <Card
        icon={FlaskConical}
        iconClassName="bg-teal-50 text-brand-teal"
        title="Analyte Result Matrix"
        headerClassName="px-4 py-2.5"
        bodyClassName="p-3"
        action={
          <div className="flex items-center gap-2 text-[10px] font-semibold">
            <span className="rounded-full bg-status-blue-bg px-2 py-0.5 text-status-blue">Instrument Interfaced</span>
            <button
              onClick={() => actionToast("Historical trend loaded", `${specimen.patient} · last 48h`, "info")}
              className="flex items-center gap-1 text-brand-teal hover:underline"
            >
              <History className="h-3 w-3" />
              Show Historical Trend (48h)
            </button>
            <button
              onClick={() => setViewOpen(true)}
              className="flex items-center gap-1 text-slate-500 hover:underline"
            >
              <FileText className="h-3 w-3" />
              View Full Report
            </button>
          </div>
        }
      >
        {specimen.analytes.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8 text-center">
            <p className="text-xs font-semibold text-slate-500">No results yet</p>
            <p className="text-[11px] text-slate-400">This specimen is pending analyzer run.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {specimen.analytes.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2.5 text-[11px]">
                <span className="flex-1 font-semibold text-slate-700">{row.name}</span>
                <span className="w-36 shrink-0 font-mono font-bold text-slate-800">
                  {row.value} <span className="font-sans font-normal text-slate-400">{row.unit}</span>
                </span>
                <span className="w-28 shrink-0 text-slate-400">{row.range}</span>
                <span className="w-32 shrink-0 text-right">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${flagStyle[row.flagTone]}`}>{row.flag}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-2 rounded-lg border border-surface-border bg-slate-50 p-2">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
            <span>Pathologist & Medical Scientist Validation Sign-off</span>
            {specimen.signoff && <span className="text-slate-400">Audit Timestamp: {specimen.signoff.timestamp}</span>}
          </div>
          <p className="mt-0.5 text-[10px] leading-snug text-slate-500">
            {specimen.signoff?.note ?? "Awaiting pathologist review and sign-off."}
          </p>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" onClick={() => setRetestOpen(true)} disabled={isFinalized} className="text-[11px]">
            <RotateCcw className="h-3.5 w-3.5" />
            Order Re-test / Dilution
          </Button>
          <Button variant="secondary" onClick={() => setEscalateOpen(true)} disabled={isFinalized} className="text-[11px]">
            <ArrowUpCircle className="h-3.5 w-3.5" />
            Escalate to Senior Pathologist
          </Button>
          <Button
            variant="secondary"
            onClick={() => actionToast("Report printed", `NRA accredited report · ${specimen.specId}`, "success")}
            className="text-[11px]"
          >
            <Printer className="h-3.5 w-3.5" />
            Print NRA Accredited Report
          </Button>
          <Button variant="danger" onClick={() => setRejectOpen(true)} disabled={isFinalized} className="text-[11px]">
            <XCircle className="h-3.5 w-3.5" />
            Reject / Flag Specimen
          </Button>
          <Button variant="primary" onClick={() => setApproveOpen(true)} disabled={isFinalized} className="text-[11px]">
            <Send className="h-3.5 w-3.5" />
            Validate & Transmit to Ward Workspace
          </Button>
        </div>
      </Card>

      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Full Specimen Report"
        description={`${specimen.specId} · ${specimen.patient}`}
        icon={FileText}
        size="lg"
        footer={
          <Button variant="secondary" onClick={() => setViewOpen(false)}>
            Close
          </Button>
        }
      >
        <div className="space-y-3 text-xs text-slate-600">
          <div className="grid grid-cols-2 gap-2 rounded-md border border-surface-border bg-slate-50 p-3">
            <p><span className="font-semibold text-slate-700">Patient:</span> {specimen.patient}</p>
            <p><span className="font-semibold text-slate-700">Age / Sex:</span> {specimen.age} · {specimen.sex}</p>
            <p><span className="font-semibold text-slate-700">MRN:</span> {specimen.mrn}</p>
            <p><span className="font-semibold text-slate-700">Ward / Bed:</span> {specimen.ward} · {specimen.bed}</p>
            <p><span className="font-semibold text-slate-700">Consultant:</span> {specimen.consultant}</p>
            <p><span className="font-semibold text-slate-700">Collection:</span> {specimen.collection}</p>
            <p><span className="font-semibold text-slate-700">Analyzer:</span> {specimen.analyzer}</p>
            <p><span className="font-semibold text-slate-700">Test Order:</span> {specimen.testOrder}</p>
            <p><span className="font-semibold text-slate-700">Container:</span> {specimen.container}</p>
            <p><span className="font-semibold text-slate-700">Status:</span> {specimen.status}</p>
          </div>

          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Analyte Results</p>
            {specimen.analytes.length === 0 ? (
              <p className="text-[11px] text-slate-400">No results yet — pending analyzer run.</p>
            ) : (
              <div className="divide-y divide-surface-border rounded-md border border-surface-border">
                {specimen.analytes.map((row) => (
                  <div key={row.id} className="flex flex-wrap items-center gap-x-4 gap-y-1 px-2.5 py-2 text-[11px]">
                    <span className="flex-1 font-semibold text-slate-700">{row.name}</span>
                    <span className="font-mono font-bold text-slate-800">
                      {row.value} <span className="font-sans font-normal text-slate-400">{row.unit}</span>
                    </span>
                    <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${flagStyle[row.flagTone]}`}>{row.flag}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <p className="mb-1 text-[11px] font-bold uppercase tracking-wide text-slate-400">Sign-off</p>
            <p className="text-[11px] text-slate-500">
              {specimen.signoff ? `${specimen.signoff.note} (${specimen.signoff.timestamp})` : "Awaiting pathologist review and sign-off."}
            </p>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={() => {
          onValidate(specimen.id);
          actionToast("Validated & transmitted", `${specimen.specId} sent to ${specimen.ward} workspace.`, "success");
          setApproveOpen(false);
        }}
        variant="approve"
        title="Validate & Transmit Result"
        description={`Confirm sign-off for ${specimen.specId} (${specimen.patient}). This will transmit the validated result to the ${specimen.ward} workspace.`}
        confirmLabel="Validate & Transmit"
      />

      <ConfirmModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={(reason) => {
          onReject(specimen.id, reason ?? "");
          actionToast("Specimen rejected", `${specimen.specId} flagged and removed from active workflow.`, "error");
          setRejectOpen(false);
        }}
        variant="reject"
        title="Reject / Flag Specimen"
        description={`This will reject ${specimen.specId} (${specimen.patient}) and flag it for recollection. A reason is required for the audit trail.`}
        confirmLabel="Reject Specimen"
        requireReason
        reasonLabel="Rejection Reason"
        reasonPlaceholder="e.g. Hemolyzed sample, insufficient volume, mislabeled…"
      />

      <ConfirmModal
        open={retestOpen}
        onClose={() => setRetestOpen(false)}
        onConfirm={() => {
          onRetest(specimen.id);
          actionToast("Re-test / dilution ordered", specimen.specId, "warning");
          setRetestOpen(false);
        }}
        variant="warning"
        title="Order Re-test / Dilution"
        description={`Order a repeat run or dilution for ${specimen.specId} (${specimen.patient})? The specimen will be marked as Repeat Ordered.`}
        confirmLabel="Order Re-test"
      />

      <ConfirmModal
        open={escalateOpen}
        onClose={() => setEscalateOpen(false)}
        onConfirm={() => {
          onEscalate(specimen.id);
          actionToast("Escalated to senior pathologist", specimen.specId, "warning");
          setEscalateOpen(false);
        }}
        variant="warning"
        title="Escalate to Senior Pathologist"
        description={`Escalate ${specimen.specId} (${specimen.patient}) for senior pathologist review before sign-off?`}
        confirmLabel="Escalate"
      />
    </div>
  );
}
