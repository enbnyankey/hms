"use client";

import { useState } from "react";
import { Printer, FlaskConical, BedDouble, CheckCircle2 } from "lucide-react";
import { activePatient } from "@/lib/doctor-data";
import { actionToast } from "@/lib/actions";
import ConfirmModal from "@/components/ui/ConfirmModal";

export default function PatientHeader() {
  const [admitOpen, setAdmitOpen] = useState(false);
  const [finishOpen, setFinishOpen] = useState(false);
  const [admitted, setAdmitted] = useState(false);
  const [finished, setFinished] = useState(false);

  return (
    <div className="rounded-xl border border-surface-border bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-slate-800 text-lg font-bold text-white">
            {activePatient.initials}
          </div>
          <div>
            <div className="flex flex-wrap items-baseline gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">{activePatient.name}</h1>
              <span className="text-xs font-medium text-slate-400">
                {activePatient.sex}, {activePatient.age} yrs ({activePatient.dob})
              </span>
            </div>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-status-red-bg px-2.5 py-1 text-[11px] font-bold text-status-red">
                <span className="h-1.5 w-1.5 rounded-full bg-status-red" />
                {activePatient.priority} · {activePatient.priorityReason}
              </span>
              {admitted && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-status-blue-bg px-2.5 py-1 text-[11px] font-bold text-brand-cyan">
                  Admitted to Ward
                </span>
              )}
              {finished && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-status-green-bg px-2.5 py-1 text-[11px] font-bold text-status-green">
                  Consultation Finished
                </span>
              )}
            </div>
            <p className="mt-2 text-xs text-slate-500">
              <span className="font-semibold text-slate-600">MRN: {activePatient.mrn}</span>
              <span className="mx-2 text-slate-300">·</span>
              NHIS: {activePatient.nhis}
              <span className="mx-2 text-slate-300">·</span>
              Blood Group: <span className="font-semibold text-slate-700">{activePatient.bloodGroup}</span>
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              Encounter: <span className="text-slate-600">{activePatient.encounter}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => actionToast("Summary sent to printer", `Clinical summary for ${activePatient.name} is printing.`)}
            className="flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <Printer className="h-3.5 w-3.5" />
            Print Summary
          </button>
          <button
            onClick={() => actionToast("STAT lab order dispatched", "Rapid panel routed to Central Pathology & Clinical Chemistry.", "warning")}
            className="flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-brand-cyan hover:bg-slate-50"
          >
            <FlaskConical className="h-3.5 w-3.5" />
            Rapid STAT Lab
          </button>
          <button
            onClick={() => setAdmitOpen(true)}
            disabled={admitted || finished}
            className="flex items-center gap-1.5 rounded-md bg-status-red px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <BedDouble className="h-3.5 w-3.5" />
            {admitted ? "Admitted" : "Admit to Ward"}
          </button>
          <button
            onClick={() => setFinishOpen(true)}
            disabled={finished}
            className="flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {finished ? "Finished" : "Finish Consultation"}
          </button>
        </div>
      </div>

      <ConfirmModal
        open={admitOpen}
        onClose={() => setAdmitOpen(false)}
        onConfirm={(reason) => {
          setAdmitted(true);
          actionToast("Ward admission requested", `${activePatient.name} queued for a bed assignment. Reason: ${reason}`, "warning");
        }}
        variant="warning"
        title="Admit to Ward"
        description={`Request an inpatient bed assignment for ${activePatient.name}. Provide the clinical reason for admission.`}
        confirmLabel="Admit Patient"
        requireReason
        reasonLabel="Reason for Admission"
        reasonPlaceholder="e.g. Hypertensive urgency requiring inpatient monitoring"
      />

      <ConfirmModal
        open={finishOpen}
        onClose={() => setFinishOpen(false)}
        onConfirm={() => {
          setFinished(true);
          actionToast("Consultation finished", "Encounter notes locked and saved to the patient record.");
        }}
        variant="approve"
        title="Finish Consultation"
        description={`Sign off and lock the encounter notes for ${activePatient.name}? This finalizes the consultation record.`}
        confirmLabel="Finish & Lock"
      />
    </div>
  );
}
