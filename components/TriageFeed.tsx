"use client";

import { useState } from "react";
import { Siren, Activity, LogOut } from "lucide-react";
import Card from "./Card";
import { triageFeed as initialTriageFeed, triageLevelMeta, type TriagePatient } from "@/lib/mock-data";
import { actionToast } from "@/lib/actions";
import Modal from "./ui/Modal";
import ConfirmModal from "./ui/ConfirmModal";
import Button from "./ui/Button";

export default function TriageFeed() {
  const [feed, setFeed] = useState<TriagePatient[]>(initialTriageFeed);
  const [viewing, setViewing] = useState<TriagePatient | null>(null);
  const [discharging, setDischarging] = useState<TriagePatient | null>(null);

  const summary = {
    red: feed.filter((p) => p.level.includes("RED")).length,
    orange: feed.filter((p) => p.level === "URGENT").length,
    yellow: feed.filter((p) => p.level === "VERY URGENT").length,
    green: feed.filter((p) => p.level === "STANDARD").length,
  };

  function handleDischarge(patient: TriagePatient) {
    setFeed((prev) => prev.filter((p) => p.id !== patient.id));
    actionToast(`${patient.name} discharged from ER`, `${patient.assignedBay} is now clear.`, "success");
  }

  return (
    <Card
      icon={Siren}
      iconClassName="bg-status-red-bg text-status-red"
      title="Accra Trauma & Emergency Triage Feed"
      subtitle="Real-time Manchester Triage Categorization · Resuscitation Quad Bay"
      action={
        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <LegendDot color="bg-status-red" label={`Red: ${summary.red}`} />
          <LegendDot color="bg-status-orange" label={`Orange: ${summary.orange}`} />
          <LegendDot color="bg-amber-400" label={`Yellow: ${summary.yellow}`} />
          <LegendDot color="bg-status-green" label={`Green: ${summary.green}`} />
        </div>
      }
      className="h-full flex flex-col"
      bodyClassName="p-5 flex-1"
    >
      {feed.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-surface-border py-10 text-center">
          <Siren className="h-6 w-6 text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-500">No patients currently in the triage feed</p>
          <p className="text-xs text-slate-400">Newly triaged patients will appear here.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-xs">
            <thead>
              <tr className="text-[11px] uppercase tracking-wide text-slate-400">
                <th className="pb-2 font-semibold">Triage ID & Patient</th>
                <th className="pb-2 font-semibold">Category</th>
                <th className="pb-2 font-semibold">Chief Complaint</th>
                <th className="pb-2 font-semibold">Assigned Bay / MD</th>
                <th className="pb-2 font-semibold">Elapsed</th>
                <th className="pb-2 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {feed.map((patient) => {
                const meta = triageLevelMeta[patient.level];
                return (
                  <tr key={patient.id} className="align-top">
                    <td className="py-3 pr-3">
                      <p className="font-semibold text-slate-800">{patient.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {patient.mrn} · {patient.age}y / {patient.sex}
                      </p>
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold ${meta.bgClass} ${meta.textClass}`}
                      >
                        {meta.label}
                      </span>
                      <p className="mt-1 text-[11px] text-slate-500">{patient.category}</p>
                    </td>
                    <td className="py-3 pr-3 text-slate-500">{patient.chiefComplaint}</td>
                    <td className="py-3 pr-3">
                      <p className="font-medium text-slate-700">{patient.assignedBay}</p>
                      <p className="text-[11px] text-slate-400">{patient.assignedMd}</p>
                    </td>
                    <td className="py-3 pr-3 font-mono font-semibold text-slate-700">{patient.elapsed}</td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setViewing(patient)}
                          title="View vitals"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-status-red hover:bg-status-red-bg"
                        >
                          <Activity className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setDischarging(patient)}
                          title="Discharge from ER"
                          className="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                        >
                          <LogOut className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing ? viewing.name : ""}
        description={viewing ? `${viewing.mrn} · ${viewing.age}y / ${viewing.sex}` : undefined}
        icon={Activity}
        tone="danger"
        footer={<Button variant="secondary" onClick={() => setViewing(null)}>Close</Button>}
      >
        {viewing && (
          <div className="space-y-2.5 text-sm">
            <Row label="Triage level" value={triageLevelMeta[viewing.level].label} />
            <Row label="Category" value={viewing.category} />
            <Row label="Chief complaint" value={viewing.chiefComplaint} />
            <Row label="Assigned bay" value={viewing.assignedBay} />
            <Row label="Assigned physician" value={viewing.assignedMd} />
            <Row label="Elapsed time" value={viewing.elapsed} />
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={!!discharging}
        onClose={() => setDischarging(null)}
        onConfirm={() => {
          if (discharging) handleDischarge(discharging);
          setDischarging(null);
        }}
        variant="approve"
        title="Discharge from ER"
        description={
          discharging
            ? `Confirm ${discharging.name} is stable for discharge or transfer from ${discharging.assignedBay}. This removes them from the active triage feed.`
            : ""
        }
        confirmLabel="Confirm Discharge"
      />
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-surface-border pb-2 last:border-0 last:pb-0">
      <span className="text-slate-400">{label}</span>
      <span className="text-right font-semibold text-slate-800">{value}</span>
    </div>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="flex items-center gap-1 text-slate-500">
      <span className={`h-2 w-2 rounded-full ${color}`} />
      {label}
    </span>
  );
}
