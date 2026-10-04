"use client";

import { useState } from "react";
import { BedSingle, Sparkles, SprayCan, Inbox } from "lucide-react";
import { maleWard, type Cubicle, type WardBed, type PatientFormValues } from "@/lib/ward-data";
import ConfirmModal from "@/components/ui/ConfirmModal";
import PatientFormModal from "./PatientFormModal";
import PatientViewModal from "./PatientViewModal";

const statusStyle: Record<WardBed["status"], { border: string; bg: string; badge: string }> = {
  occupied: { border: "border-surface-border", bg: "bg-white", badge: "bg-slate-100 text-slate-500" },
  discharge: { border: "border-blue-200", bg: "bg-status-blue-bg", badge: "bg-status-blue text-white" },
  sanitizing: { border: "border-amber-200", bg: "bg-status-amber-bg", badge: "bg-status-amber text-white" },
  ready: { border: "border-green-200", bg: "bg-status-green-bg", badge: "bg-status-green text-white" },
};

function matchesFilters(bed: WardBed, search: string, isolationOnly: boolean) {
  if (isolationOnly && !bed.isolation) return false;
  if (search) {
    const q = search.toLowerCase();
    const haystack = [bed.id, bed.patient?.name, bed.patient?.mrn, bed.dx].filter(Boolean).join(" ").toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

function WardBedTile({
  bed,
  onView,
  onEdit,
  onAdmit,
  onDischarge,
  onTransfer,
  onMarkClean,
}: {
  bed: WardBed;
  onView: (bed: WardBed) => void;
  onEdit: (bed: WardBed) => void;
  onAdmit: (bed: WardBed) => void;
  onDischarge: (bed: WardBed) => void;
  onTransfer: (bed: WardBed) => void;
  onMarkClean: (bed: WardBed) => void;
}) {
  const style = statusStyle[bed.status];

  return (
    <div className={`rounded-lg border p-3.5 ${style.border} ${style.bg}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-extrabold text-slate-800">{bed.id}</span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style.badge}`}>{bed.statusLabel}</span>
      </div>

      {bed.patient && (
        <>
          <p className="mt-2 text-xs font-bold text-slate-800">
            {bed.patient.name}{" "}
            <span className="font-normal text-slate-400">
              {bed.patient.demo} · {bed.patient.mrn} · {bed.patient.day}
            </span>
          </p>
          {bed.dx && <p className="text-[11px] text-slate-500">{bed.dx}</p>}
          {bed.consultant && <p className="text-[11px] text-slate-400">{bed.consultant}</p>}
          {bed.note && <p className="mt-1 text-[11px] font-medium text-slate-600">{bed.note}</p>}
        </>
      )}

      {bed.housekeeping && (
        <div className="mt-2 text-center">
          <SprayCan className="mx-auto h-5 w-5 text-status-amber" />
          <p className="mt-1 text-xs font-bold text-slate-700">{bed.housekeeping.title}</p>
          {bed.housekeeping.lines.map((l) => (
            <p key={l} className="text-[11px] text-slate-400">{l}</p>
          ))}
          <p className="mt-1 text-[11px] font-semibold text-status-amber">{bed.housekeeping.timer}</p>
        </div>
      )}

      {bed.readyDetail && (
        <div className="mt-2 text-center">
          <Sparkles className="mx-auto h-5 w-5 text-status-green" />
          <p className="mt-1 text-xs font-bold text-slate-700">{bed.readyDetail.title}</p>
          {bed.readyDetail.lines.map((l) => (
            <p key={l} className="text-[11px] text-slate-400">{l}</p>
          ))}
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-2">
        <span className="text-[11px] text-slate-400">
          {bed.meta ?? bed.housekeeping?.staff ?? bed.readyDetail?.note ?? ""}
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          {(bed.status === "occupied" || bed.status === "discharge") && (
            <>
              {bed.status === "discharge" && bed.actionLabel && (
                <button
                  onClick={() => onDischarge(bed)}
                  className="rounded-md bg-status-blue px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-blue-700"
                >
                  {bed.actionLabel}
                </button>
              )}
              <button
                onClick={() => onView(bed)}
                className="rounded-md border border-surface-border px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
              >
                View
              </button>
              <button
                onClick={() => onEdit(bed)}
                className="rounded-md border border-surface-border px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
              >
                Edit
              </button>
              <button
                onClick={() => onTransfer(bed)}
                className="rounded-md border border-surface-border px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
              >
                Transfer
              </button>
              {bed.status === "occupied" && (
                <button
                  onClick={() => onDischarge(bed)}
                  className="rounded-md bg-status-red px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-700"
                >
                  Discharge
                </button>
              )}
            </>
          )}

          {bed.status === "sanitizing" && (
            <button
              onClick={() => onMarkClean(bed)}
              className="rounded-md bg-status-amber px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-600"
            >
              Mark Clean
            </button>
          )}

          {bed.status === "ready" && bed.actionLabel && (
            <button
              onClick={() => onAdmit(bed)}
              className="rounded-md bg-brand-cyan px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-cyan-800"
            >
              {bed.actionLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MaleWard({
  cubicles,
  search,
  isolationOnly,
  onAdmit,
  onEdit,
  onDischarge,
  onMarkClean,
  onTransferRequest,
}: {
  cubicles: Cubicle[];
  search: string;
  isolationOnly: boolean;
  onAdmit: (cubicleId: string, bedId: string, values: PatientFormValues) => void;
  onEdit: (cubicleId: string, bedId: string, values: PatientFormValues) => void;
  onDischarge: (cubicleId: string, bedId: string) => void;
  onMarkClean: (cubicleId: string, bedId: string) => void;
  onTransferRequest: (cubicleId: string, bed: WardBed) => void;
}) {
  const [viewBed, setViewBed] = useState<WardBed | null>(null);
  const [editTarget, setEditTarget] = useState<{ cubicleId: string; bed: WardBed } | null>(null);
  const [admitTarget, setAdmitTarget] = useState<{ cubicleId: string; bed: WardBed } | null>(null);
  const [dischargeTarget, setDischargeTarget] = useState<{ cubicleId: string; bed: WardBed } | null>(null);

  const filteredCubicles = cubicles
    .map((c) => ({ ...c, beds: c.beds.filter((b) => matchesFilters(b, search, isolationOnly)) }))
    .filter((c) => c.beds.length > 0);

  return (
    <section className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-surface-border px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-brand-teal">
            <BedSingle className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{maleWard.name}</h2>
            <p className="text-[11px] text-slate-400">
              {maleWard.location} · Charge Nurse: {maleWard.chargeNurse}
            </p>
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-400">
          <p className="font-semibold text-slate-600">{maleWard.bedsTotal}</p>
          <p>
            {maleWard.dayShiftStaff} · {maleWard.ratio}
          </p>
          <p className="font-semibold text-slate-600">{maleWard.occupancy}</p>
        </div>
      </div>

      {filteredCubicles.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-10 text-center">
          <Inbox className="h-6 w-6 text-slate-300" />
          <p className="text-xs font-semibold text-slate-500">No male ward beds match the current filters</p>
          <p className="text-[11px] text-slate-400">Try clearing the search or filter selections above.</p>
        </div>
      ) : (
        <div className="space-y-5 p-5">
          {filteredCubicles.map((cubicle) => (
            <div key={cubicle.id}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-1">
                <p className="text-[11px] font-bold uppercase tracking-wide text-slate-500">{cubicle.title}</p>
                <span className="text-[11px] text-slate-400">{cubicle.subtitle}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {cubicle.beds.map((bed) => (
                  <WardBedTile
                    key={bed.id}
                    bed={bed}
                    onView={setViewBed}
                    onEdit={(b) => setEditTarget({ cubicleId: cubicle.id, bed: b })}
                    onAdmit={(b) => setAdmitTarget({ cubicleId: cubicle.id, bed: b })}
                    onDischarge={(b) => setDischargeTarget({ cubicleId: cubicle.id, bed: b })}
                    onTransfer={(b) => onTransferRequest(cubicle.id, b)}
                    onMarkClean={(b) => onMarkClean(cubicle.id, b.id)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <PatientViewModal
        open={!!viewBed}
        onClose={() => setViewBed(null)}
        title={`Bed ${viewBed?.id ?? ""} Details`}
        description={maleWard.name}
        rows={[
          { label: "Status", value: viewBed?.statusLabel ?? "" },
          { label: "Patient", value: viewBed?.patient?.name ?? "—" },
          { label: "Age / Sex / Day", value: viewBed?.patient ? `${viewBed.patient.demo} · ${viewBed.patient.day}` : "—" },
          { label: "MRN", value: viewBed?.patient?.mrn || "—" },
          { label: "Diagnosis", value: viewBed?.dx || "—" },
          { label: "Consultant", value: viewBed?.consultant || "—" },
          { label: "Note", value: viewBed?.note || viewBed?.meta || "—" },
        ]}
      />

      <PatientFormModal
        open={!!admitTarget}
        onClose={() => setAdmitTarget(null)}
        mode="admit"
        bedId={admitTarget?.bed.id ?? ""}
        onSubmit={(values) => {
          if (admitTarget) onAdmit(admitTarget.cubicleId, admitTarget.bed.id, values);
          setAdmitTarget(null);
        }}
      />

      <PatientFormModal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        mode="edit"
        bedId={editTarget?.bed.id ?? ""}
        initialValues={
          editTarget
            ? {
                name: editTarget.bed.patient?.name ?? "",
                demo: editTarget.bed.patient?.demo ?? "",
                mrn: editTarget.bed.patient?.mrn ?? "",
                dx: editTarget.bed.dx ?? "",
                note: editTarget.bed.note ?? "",
              }
            : undefined
        }
        onSubmit={(values) => {
          if (editTarget) onEdit(editTarget.cubicleId, editTarget.bed.id, values);
          setEditTarget(null);
        }}
      />

      <ConfirmModal
        open={!!dischargeTarget}
        onClose={() => setDischargeTarget(null)}
        onConfirm={() => {
          if (dischargeTarget) onDischarge(dischargeTarget.cubicleId, dischargeTarget.bed.id);
          setDischargeTarget(null);
        }}
        variant="delete"
        title={`Discharge Bed ${dischargeTarget?.bed.id ?? ""}`}
        description={`This will discharge ${dischargeTarget?.bed.patient?.name ?? "the patient"} and send the bed for sanitizing. This cannot be undone.`}
        confirmLabel="Discharge"
      />
    </section>
  );
}
