"use client";

import { useState } from "react";
import {
  Search,
  X,
  Eye,
  CheckCircle2,
  XCircle,
  Inbox,
  ClipboardList,
  ShieldAlert,
} from "lucide-react";
import Card from "@/components/Card";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { doseFilters, type MarDose, type DoseStatus } from "@/lib/nursing-emar-data";
import AdministerDoseModal from "./AdministerDoseModal";
import DoseViewModal from "./DoseViewModal";

const statusStyle: Record<DoseStatus, string> = {
  "Due Now": "bg-status-blue-bg text-status-blue",
  Overdue: "bg-status-red-bg text-status-red",
  Upcoming: "bg-slate-100 text-slate-500",
  PRN: "bg-teal-50 text-brand-teal",
  Given: "bg-status-green-bg text-status-green",
  Held: "bg-status-amber-bg text-status-amber",
};

export default function MarQueue({
  doses,
  onGive,
  onHold,
}: {
  doses: MarDose[];
  /** Resolve true when saved (closes the dialog). */
  onGive: (dose: MarDose, values: { givenAt: string; route: string; witnessedBy?: string }) => Promise<boolean>;
  onHold: (dose: MarDose, reason: string) => Promise<boolean>;
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");

  const [viewDose, setViewDose] = useState<MarDose | null>(null);
  const [administerDose, setAdministerDose] = useState<MarDose | null>(null);
  const [holdDose, setHoldDose] = useState<MarDose | null>(null);

  const counts: Record<string, number> = {
    all: doses.length,
    due: doses.filter((d) => d.status === "Due Now").length,
    overdue: doses.filter((d) => d.status === "Overdue").length,
    upcoming: doses.filter((d) => d.status === "Upcoming").length,
    prn: doses.filter((d) => d.status === "PRN").length,
    completed: doses.filter((d) => d.status === "Given" || d.status === "Held").length,
  };

  const query = search.trim().toLowerCase();
  const filtered = doses.filter((d) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "due" && d.status === "Due Now") ||
      (activeFilter === "overdue" && d.status === "Overdue") ||
      (activeFilter === "upcoming" && d.status === "Upcoming") ||
      (activeFilter === "prn" && d.status === "PRN") ||
      (activeFilter === "completed" && (d.status === "Given" || d.status === "Held"));
    if (!matchesFilter) return false;
    if (!query) return true;
    return (
      d.patientName.toLowerCase().includes(query) ||
      d.mrn.toLowerCase().includes(query) ||
      d.drug.toLowerCase().includes(query)
    );
  });

  async function confirmAdminister(doseId: string, values: { givenAt: string; route: string; witnessedBy?: string }) {
    const dose = doses.find((d) => d.id === doseId);
    if (dose && (await onGive(dose, values))) setAdministerDose(null);
  }

  async function confirmHold(reason?: string) {
    if (holdDose && (await onHold(holdDose, reason ?? ""))) setHoldDose(null);
  }

  return (
    <Card
      icon={ClipboardList}
      iconClassName="bg-teal-50 text-brand-teal"
      title="Electronic Medication Administration Record (eMAR)"
      subtitle="Today’s doses for patients on this ward"
      headerClassName="px-4 py-3"
      bodyClassName="p-4"
      action={
        <div className="flex flex-wrap items-center gap-1.5">
          {doseFilters.map((f) => (
            <Button
              key={f.id}
              variant={activeFilter === f.id ? "primary" : "secondary"}
              onClick={() => setActiveFilter(f.id)}
              className={`!rounded-md !px-2.5 !py-1 !text-[11px] ${
                activeFilter === f.id ? "" : "!border-0 !bg-slate-100 !text-slate-500 hover:!bg-slate-200"
              }`}
            >
              {f.label} <span className="opacity-75">{counts[f.id] ?? 0}</span>
            </Button>
          ))}
        </div>
      }
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient, MRN, or drug…"
            className="w-full rounded-md border border-surface-border py-1.5 pl-8 pr-2.5 text-xs text-slate-700 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
        {search && (
          <Button
            variant="secondary"
            className="!rounded-md !px-2.5 !py-1.5 !text-[11px]"
            onClick={() => setSearch("")}
          >
            <X className="h-3 w-3" /> Clear
          </Button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left">
          <thead>
            <tr className="border-b border-surface-border text-[10px] font-semibold uppercase tracking-wide text-slate-400">
              <th className="px-2 py-2">Patient / Bed</th>
              <th className="px-2 py-2">Drug / Dose / Route</th>
              <th className="px-2 py-2">Scheduled</th>
              <th className="px-2 py-2">Status</th>
              <th className="px-2 py-2">Prescriber</th>
              <th className="px-2 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((dose) => (
              <tr key={dose.id} className="border-b border-surface-border last:border-0 hover:bg-slate-50/60">
                <td className="px-2 py-2.5 align-top">
                  <p className="text-xs font-bold text-slate-800">{dose.patientName}</p>
                  <p className="text-[11px] text-slate-400">
                    {dose.mrn} · {dose.bed}
                  </p>
                </td>
                <td className="px-2 py-2.5 align-top">
                  <p className="flex items-center gap-1 text-xs font-semibold text-slate-700">
                    {dose.drug} {dose.dose}
                    {dose.controlled && <ShieldAlert className="h-3 w-3 text-status-amber" />}
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {dose.route} · {dose.frequency}
                  </p>
                </td>
                <td className="px-2 py-2.5 align-top text-xs font-medium text-slate-600">{dose.scheduledTime}</td>
                <td className="px-2 py-2.5 align-top">
                  <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${statusStyle[dose.status]}`}>
                    {dose.status}
                  </span>
                  {dose.status === "Held" && dose.heldReason && (
                    <p className="mt-1 max-w-[160px] text-[10px] text-slate-400">{dose.heldReason}</p>
                  )}
                  {dose.status === "Given" && dose.givenAt && (
                    <p className="mt-1 text-[10px] text-slate-400">at {dose.givenAt}</p>
                  )}
                </td>
                <td className="px-2 py-2.5 align-top text-[11px] text-slate-500">{dose.prescribingDoctor}</td>
                <td className="px-2 py-2.5 align-top">
                  <div className="flex items-center justify-end gap-1.5">
                    <Button
                      variant="ghost"
                      className="!rounded-md !px-2 !py-1 !text-[10px]"
                      onClick={() => setViewDose(dose)}
                    >
                      <Eye className="h-3 w-3" /> View
                    </Button>
                    <Button
                      variant="danger"
                      className="!rounded-md !px-2 !py-1 !text-[10px]"
                      disabled={dose.status === "Given" || dose.status === "Held" || dose.status === "PRN"}
                      onClick={() => setHoldDose(dose)}
                    >
                      <XCircle className="h-3 w-3" /> Hold
                    </Button>
                    <Button
                      variant="success"
                      className="!rounded-md !px-2 !py-1 !text-[10px]"
                      disabled={dose.status === "Given" || dose.status === "Held" || dose.status === "Upcoming"}
                      title={dose.status === "Upcoming" ? "Doses can be given from an hour before their time" : undefined}
                      onClick={() => setAdministerDose(dose)}
                    >
                      <CheckCircle2 className="h-3 w-3" /> Give
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-surface-border py-10 text-center">
            <Inbox className="h-6 w-6 text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">No doses match this view</p>
            <p className="text-[11px] text-slate-400">Try a different filter, or clear your search.</p>
          </div>
        )}
      </div>

      <DoseViewModal dose={viewDose} onClose={() => setViewDose(null)} />

      <AdministerDoseModal
        dose={administerDose}
        onClose={() => setAdministerDose(null)}
        onConfirm={confirmAdminister}
      />

      <ConfirmModal
        open={!!holdDose}
        onClose={() => setHoldDose(null)}
        onConfirm={(reason) => confirmHold(reason)}
        variant="reject"
        title="Hold / Refuse Dose"
        description={
          holdDose
            ? `Hold ${holdDose.drug} ${holdDose.dose} for ${holdDose.patientName} (${holdDose.bed})? A reason is required for the medication record.`
            : ""
        }
        confirmLabel="Hold Dose"
        requireReason
        reasonLabel="Reason for holding / refusal"
        reasonPlaceholder="e.g. Patient refused, NPO for procedure, clinical concern…"
      />
    </Card>
  );
}
