"use client";

import { useEffect, useState } from "react";
import { HeartHandshake, Inbox, UserPlus, FileText } from "lucide-react";
import { femaleWard, type SimpleBed } from "@/lib/ward-data";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";

const dotTone: Record<SimpleBed["status"], string> = {
  occupied: "bg-brand-cyan",
  available: "bg-status-green",
  cleaned: "bg-status-blue",
  hold: "bg-status-amber",
};

const bgTone: Record<SimpleBed["status"], string> = {
  occupied: "border-surface-border bg-white",
  available: "border-green-200 bg-status-green-bg",
  cleaned: "border-blue-200 bg-status-blue-bg",
  hold: "border-amber-200 bg-status-amber-bg",
};

function LabelFormModal({
  open,
  onClose,
  onSubmit,
  bedId,
  mode,
  initialLabel,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (label: string) => void;
  bedId: string;
  mode: "admit" | "edit";
  initialLabel?: string;
}) {
  const [label, setLabel] = useState(initialLabel ?? "");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setLabel(initialLabel ?? "");
      setTouched(false);
    }
  }, [open, initialLabel]);

  const error = label.trim().length === 0 ? "Patient name is required" : "";

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  function handleSubmit() {
    setTouched(true);
    if (error) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit(label.trim());
      setSubmitting(false);
    }, 400);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={mode === "admit" ? `Admit Patient — Bed ${bedId}` : `Edit Bed ${bedId}`}
      description={mode === "admit" ? "Assign an incoming patient to this bed" : "Update the patient name on this bed"}
      icon={UserPlus}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>
            {mode === "admit" ? "Admit Patient" : "Save Changes"}
          </Button>
        </>
      }
    >
      <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Patient Name</label>
      <input
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="e.g. Y. Amah"
        className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
      />
      {touched && error && <p className="mt-1 text-[11px] text-status-red">{error}</p>}
    </Modal>
  );
}

export default function FemaleWard({
  beds,
  search,
  isolationOnly,
  onAssign,
  onEdit,
  onFreeHold,
  onDischarge,
  onTransferRequest,
}: {
  beds: SimpleBed[];
  search: string;
  isolationOnly: boolean;
  onAssign: (bedId: string, label: string) => void;
  onEdit: (bedId: string, label: string) => void;
  onFreeHold: (bedId: string) => void;
  onDischarge: (bedId: string) => void;
  onTransferRequest: (bed: SimpleBed) => void;
}) {
  const [viewBed, setViewBed] = useState<SimpleBed | null>(null);
  const [admitBed, setAdmitBed] = useState<SimpleBed | null>(null);
  const [editBed, setEditBed] = useState<SimpleBed | null>(null);
  const [freeBed, setFreeBed] = useState<SimpleBed | null>(null);
  const [dischargeBed, setDischargeBed] = useState<SimpleBed | null>(null);

  // Female ward beds have no isolation flag modeled, so "isolation only" hides all of them.
  const filteredBeds = beds.filter((b) => {
    if (isolationOnly) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!`${b.id} ${b.label}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <section className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-2 border-b border-surface-border px-4 py-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-pink-50 text-pink-500">
            <HeartHandshake className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{femaleWard.name}</h2>
            <p className="text-[11px] text-slate-400">
              {femaleWard.location} · Charge Nurse: {femaleWard.chargeNurse}
            </p>
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-400">
          <p className="font-semibold text-slate-600">{femaleWard.bedsTotal}</p>
          <p>{femaleWard.turnaround}</p>
          <p className="font-semibold text-status-amber">{femaleWard.dischargesPending}</p>
        </div>
      </div>

      {filteredBeds.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-8 text-center">
          <Inbox className="h-5 w-5 text-slate-300" />
          <p className="text-xs font-semibold text-slate-500">No female ward beds match the current filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-4 gap-2 p-4">
          {filteredBeds.map((bed) => (
            <button
              key={bed.id}
              type="button"
              onClick={() => {
                if (bed.status === "occupied") setViewBed(bed);
                else if (bed.status === "hold") setFreeBed(bed);
                else setAdmitBed(bed);
              }}
              className={`rounded-lg border p-2 text-center transition-colors hover:brightness-95 ${bgTone[bed.status]}`}
              title={
                bed.status === "occupied"
                  ? "View patient"
                  : bed.status === "hold"
                  ? "Free theater hold"
                  : "Assign patient"
              }
            >
              <p className="text-[11px] font-bold text-slate-700">{bed.id}</p>
              <p className="mt-0.5 truncate text-[10px] text-slate-500">{bed.label}</p>
              <span className={`mx-auto mt-1 block h-1.5 w-1.5 rounded-full ${dotTone[bed.status]}`} />
            </button>
          ))}
        </div>
      )}

      <Modal
        open={!!viewBed}
        onClose={() => setViewBed(null)}
        title={`Bed ${viewBed?.id ?? ""} Details`}
        description={femaleWard.name}
        icon={FileText}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewBed(null)}>
              Close
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setEditBed(viewBed);
                setViewBed(null);
              }}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                if (viewBed) onTransferRequest(viewBed);
                setViewBed(null);
              }}
            >
              Transfer
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                setDischargeBed(viewBed);
                setViewBed(null);
              }}
            >
              Discharge
            </Button>
          </>
        }
      >
        <dl className="space-y-2.5">
          <div className="flex items-start justify-between gap-3 border-b border-surface-border pb-2">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Status</dt>
            <dd className="text-right text-xs font-medium capitalize text-slate-700">{viewBed?.status}</dd>
          </div>
          <div className="flex items-start justify-between gap-3">
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Patient</dt>
            <dd className="text-right text-xs font-medium text-slate-700">{viewBed?.label || "—"}</dd>
          </div>
        </dl>
      </Modal>

      <LabelFormModal
        open={!!admitBed}
        onClose={() => setAdmitBed(null)}
        mode="admit"
        bedId={admitBed?.id ?? ""}
        onSubmit={(label) => {
          if (admitBed) onAssign(admitBed.id, label);
          setAdmitBed(null);
        }}
      />

      <LabelFormModal
        open={!!editBed}
        onClose={() => setEditBed(null)}
        mode="edit"
        bedId={editBed?.id ?? ""}
        initialLabel={editBed?.label}
        onSubmit={(label) => {
          if (editBed) onEdit(editBed.id, label);
          setEditBed(null);
        }}
      />

      <ConfirmModal
        open={!!freeBed}
        onClose={() => setFreeBed(null)}
        onConfirm={() => {
          if (freeBed) onFreeHold(freeBed.id);
          setFreeBed(null);
        }}
        variant="warning"
        title={`Free Bed ${freeBed?.id ?? ""}`}
        description="This releases the theater hold and marks the bed available."
        confirmLabel="Free Bed"
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
        description={`This will discharge ${dischargeBed?.label || "the patient"} and send the bed for cleaning.`}
        confirmLabel="Discharge"
      />
    </section>
  );
}
