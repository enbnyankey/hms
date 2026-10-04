"use client";

import { useState } from "react";
import { Snowflake, Sparkles, Clock, Inbox } from "lucide-react";
import { icuWard, type IcuBed, type PatientFormValues } from "@/lib/ward-data";
import { actionToast } from "@/lib/actions";
import { useSettings } from "@/lib/settings";
import ConfirmModal from "@/components/ui/ConfirmModal";
import PatientFormModal from "./PatientFormModal";
import PatientViewModal from "./PatientViewModal";
import type { TransferTarget } from "./TransferModal";

const statusStyle: Record<IcuBed["status"], { border: string; bg: string; badge: string }> = {
  occupied: { border: "border-surface-border", bg: "bg-white", badge: "bg-slate-100 text-slate-500" },
  alert: { border: "border-red-200", bg: "bg-status-red-bg", badge: "bg-status-red text-white" },
  ready: { border: "border-green-200", bg: "bg-status-green-bg", badge: "bg-status-green text-white" },
  reserved: { border: "border-amber-200", bg: "bg-status-amber-bg", badge: "bg-status-amber text-white" },
};

function matchesFilters(bed: IcuBed, search: string, isolationOnly: boolean, criticalOnly: boolean) {
  if (isolationOnly && !bed.isolation) return false;
  if (criticalOnly && bed.status !== "alert") return false;
  if (search) {
    const q = search.toLowerCase();
    const haystack = [bed.id, bed.patient?.name, bed.patient?.mrn, bed.dx].filter(Boolean).join(" ").toLowerCase();
    if (!haystack.includes(q)) return false;
  }
  return true;
}

function IcuBedTile({
  bed,
  onView,
  onEdit,
  onAdmit,
  onDischarge,
  onTransfer,
  onFreeReserved,
  onAlert,
  alerted,
}: {
  bed: IcuBed;
  onView: (bed: IcuBed) => void;
  onEdit: (bed: IcuBed) => void;
  onAdmit: (bed: IcuBed) => void;
  onDischarge: (bed: IcuBed) => void;
  onTransfer: (bed: IcuBed) => void;
  onFreeReserved: (bed: IcuBed) => void;
  onAlert: (bed: IcuBed) => void;
  alerted: boolean;
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
            {bed.patient.name}
            {bed.patient.demo && <span className="ml-1 font-normal text-slate-400">{bed.patient.demo}</span>}
            {bed.patient.mrn && <span className="ml-1 font-normal text-slate-400">· {bed.patient.mrn}</span>}
          </p>
          {bed.dx && <p className="text-[11px] text-slate-500">Dx: {bed.dx}</p>}
          {bed.attending && <p className="text-[11px] text-slate-400">{bed.attending}</p>}
          {bed.extraNote && <p className="text-[11px] text-slate-400">{bed.extraNote}</p>}
        </>
      )}

      {bed.vitals && (
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] font-medium text-slate-600">
          {bed.vitals.map((v) => (
            <span key={v.label}>
              {v.label}: <span className="font-bold">{v.value}</span>
            </span>
          ))}
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
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          {bed.meta && (
            <>
              <Clock className="h-3 w-3" />
              {bed.meta}
            </>
          )}
          {bed.readyDetail?.note && !bed.meta && (
            <>
              <Clock className="h-3 w-3" />
              {bed.readyDetail.note}
            </>
          )}
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          {(bed.status === "occupied" || bed.status === "alert") && (
            <>
              {bed.status === "alert" && bed.actionLabel && (
                <button
                  onClick={() => onAlert(bed)}
                  disabled={alerted}
                  className="rounded-md bg-status-red px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {alerted ? "MD Notified" : bed.actionLabel}
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
              <button
                onClick={() => onDischarge(bed)}
                className="rounded-md bg-status-red px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-700"
              >
                Discharge
              </button>
            </>
          )}

          {bed.status === "ready" && (
            <button
              onClick={() => onAdmit(bed)}
              className="rounded-md bg-brand-cyan px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-cyan-800"
            >
              Assign Now
            </button>
          )}

          {bed.status === "reserved" && (
            <>
              <button
                onClick={() => onView(bed)}
                className="rounded-md border border-surface-border px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
              >
                View PACU
              </button>
              <button
                onClick={() => onFreeReserved(bed)}
                className="rounded-md bg-status-amber px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-600"
              >
                Free Bed
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function IcuWard({
  beds,
  search,
  isolationOnly,
  criticalOnly,
  onAdmit,
  onEdit,
  onDischarge,
  onFreeReserved,
  onTransferRequest,
}: {
  beds: IcuBed[];
  search: string;
  isolationOnly: boolean;
  criticalOnly: boolean;
  onAdmit: (bedId: string, values: PatientFormValues) => void;
  onEdit: (bedId: string, values: PatientFormValues) => void;
  onDischarge: (bedId: string) => void;
  onFreeReserved: (bedId: string) => void;
  onTransferRequest: (bed: IcuBed) => void;
}) {
  const [viewBed, setViewBed] = useState<IcuBed | null>(null);
  const [editBed, setEditBed] = useState<IcuBed | null>(null);
  const [admitBed, setAdmitBed] = useState<IcuBed | null>(null);
  const [dischargeBed, setDischargeBed] = useState<IcuBed | null>(null);
  const [freeBed, setFreeBed] = useState<IcuBed | null>(null);
  const [alertBed, setAlertBed] = useState<IcuBed | null>(null);
  const [alertedIds, setAlertedIds] = useState<Set<string>>(new Set());
  const { notify, playAlertTone } = useSettings();

  const filteredBeds = beds.filter((b) => matchesFilters(b, search, isolationOnly, criticalOnly));

  return (
    <section className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-surface-border px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-status-blue">
            <Snowflake className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{icuWard.name}</h2>
            <p className="text-[11px] text-slate-400">
              {icuWard.location} · Charge Nurse: {icuWard.chargeNurse}
            </p>
            <p className="text-[11px] font-semibold text-slate-500">{icuWard.occupancy}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-right text-[11px] text-slate-400">
          <div>
            <p className="font-semibold text-slate-600">Max Acuity</p>
            <p>Nurse Ratio {icuWard.nurseRatio}</p>
          </div>
          <div>
            <p className="font-semibold text-slate-600">O2 Central</p>
            <p>{icuWard.o2Pressure}</p>
          </div>
        </div>
      </div>

      {filteredBeds.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-10 text-center">
          <Inbox className="h-6 w-6 text-slate-300" />
          <p className="text-xs font-semibold text-slate-500">No ICU beds match the current filters</p>
          <p className="text-[11px] text-slate-400">Try clearing the search or filter selections above.</p>
        </div>
      ) : (
        <div className="grid gap-3 p-5 sm:grid-cols-2">
          {filteredBeds.map((bed) => (
            <IcuBedTile
              key={bed.id}
              bed={bed}
              onView={setViewBed}
              onEdit={setEditBed}
              onAdmit={setAdmitBed}
              onDischarge={setDischargeBed}
              onTransfer={onTransferRequest}
              onFreeReserved={setFreeBed}
              onAlert={setAlertBed}
              alerted={alertedIds.has(bed.id)}
            />
          ))}
        </div>
      )}

      <PatientViewModal
        open={!!viewBed}
        onClose={() => setViewBed(null)}
        title={`Bed ${viewBed?.id ?? ""} Details`}
        description={icuWard.name}
        rows={[
          { label: "Status", value: viewBed?.statusLabel ?? "" },
          { label: "Patient", value: viewBed?.patient?.name ?? "—" },
          { label: "Age / Sex", value: viewBed?.patient?.demo || "—" },
          { label: "MRN", value: viewBed?.patient?.mrn || "—" },
          { label: "Diagnosis", value: viewBed?.dx || "—" },
          { label: "Attending", value: viewBed?.attending || "—" },
          { label: "Note", value: viewBed?.meta || viewBed?.extraNote || "—" },
        ]}
      />

      <PatientFormModal
        open={!!admitBed}
        onClose={() => setAdmitBed(null)}
        mode="admit"
        bedId={admitBed?.id ?? ""}
        onSubmit={(values) => {
          if (admitBed) onAdmit(admitBed.id, values);
          setAdmitBed(null);
        }}
      />

      <PatientFormModal
        open={!!editBed}
        onClose={() => setEditBed(null)}
        mode="edit"
        bedId={editBed?.id ?? ""}
        initialValues={
          editBed
            ? {
                name: editBed.patient?.name ?? "",
                demo: editBed.patient?.demo ?? "",
                mrn: editBed.patient?.mrn ?? "",
                dx: editBed.dx ?? "",
                note: editBed.meta ?? "",
              }
            : undefined
        }
        onSubmit={(values) => {
          if (editBed) onEdit(editBed.id, values);
          setEditBed(null);
        }}
      />

      <ConfirmModal
        open={!!dischargeBed}
        onClose={() => setDischargeBed(null)}
        onConfirm={() => {
          if (dischargeBed) onDischarge(dischargeBed.id);
          setDischargeBed(null);
        }}
        variant="delete"
        title={`Discharge Bed ${dischargeBed?.id ?? ""}`}
        description={`This will discharge ${dischargeBed?.patient?.name ?? "the patient"} and free the bed for cleaning. This cannot be undone.`}
        confirmLabel="Discharge"
      />

      <ConfirmModal
        open={!!freeBed}
        onClose={() => setFreeBed(null)}
        onConfirm={() => {
          if (freeBed) onFreeReserved(freeBed.id);
          setFreeBed(null);
        }}
        variant="warning"
        title={`Cancel Hold — Bed ${freeBed?.id ?? ""}`}
        description="This releases the reservation and returns the bed to ready-to-admit status."
        confirmLabel="Free Bed"
      />

      <ConfirmModal
        open={!!alertBed}
        onClose={() => setAlertBed(null)}
        onConfirm={() => {
          if (alertBed) {
            setAlertedIds((prev) => new Set(prev).add(alertBed.id));
            actionToast(`${alertBed.actionLabel} — ${alertBed.id}`, alertBed.patient?.name, "warning");
            playAlertTone();
            notify(`${alertBed.actionLabel} — Bed ${alertBed.id}`, alertBed.patient?.name ?? "Attending physician notified");
          }
          setAlertBed(null);
        }}
        variant="warning"
        title={`${alertBed?.actionLabel ?? "Alert"} — Bed ${alertBed?.id ?? ""}`}
        description={
          alertBed
            ? `This notifies the attending physician immediately for ${alertBed.patient?.name ?? "this patient"}${
                alertBed.dx ? ` (${alertBed.dx})` : ""
              }. Confirm this critical alert.`
            : ""
        }
        confirmLabel="Send Alert"
      />
    </section>
  );
}
