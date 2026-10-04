"use client";

import { useState } from "react";
import { Building2, Activity, ClipboardList, LogOut, BellRing, PlusCircle } from "lucide-react";
import { actionToast } from "@/lib/actions";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Button from "@/components/ui/Button";
import type { CensusCounts } from "@/lib/ward-data";
import type { TransferTarget } from "./TransferModal";

export type PendingDischarge = { ward: string; bedId: string; patientName: string; eta: string };

export default function WardHeader({
  counts,
  pendingDischarges = [],
  understaffedCount = 0,
  quickAdmitTargets,
  onQuickAdmit,
}: {
  counts?: CensusCounts;
  pendingDischarges?: PendingDischarge[];
  understaffedCount?: number;
  quickAdmitTargets?: TransferTarget[];
  onQuickAdmit?: (target: TransferTarget, patientName: string) => void;
}) {
  const [censusOpen, setCensusOpen] = useState(false);
  const [dischargeOpen, setDischargeOpen] = useState(false);
  const [reallocateOpen, setReallocateOpen] = useState(false);
  const [admitOpen, setAdmitOpen] = useState(false);
  const [admitPatientName, setAdmitPatientName] = useState("");
  const [admitTargetKey, setAdmitTargetKey] = useState("");
  const [admitting, setAdmitting] = useState(false);
  const [admitError, setAdmitError] = useState("");

  const targets = quickAdmitTargets ?? [];

  function handleQuickAdmitSubmit() {
    if (!admitPatientName.trim()) {
      setAdmitError("Patient name is required.");
      return;
    }
    const target = targets.find((t) => `${t.ward}-${t.bedId}` === admitTargetKey);
    if (!target) {
      setAdmitError("Select a bed to admit to.");
      return;
    }
    setAdmitting(true);
    setTimeout(() => {
      onQuickAdmit?.(target, admitPatientName.trim());
      setAdmitting(false);
      setAdmitOpen(false);
      setAdmitPatientName("");
      setAdmitTargetKey("");
      setAdmitError("");
    }, 400);
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
          <Building2 className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Ward Infrastructure
          </p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Ward & Bed Matrix Manager</h1>
          <p className="text-xs text-slate-500">Korle-Bu Inpatient Sector (Blocks A-D)</p>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-semibold text-status-green">
          <Activity className="h-3.5 w-3.5" />
          Real-Time Census
          <span className="font-normal text-slate-400">· Live Bed Flow & Infection Isolation Grid</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setCensusOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Ward Census
          </button>
          <button
            onClick={() => setDischargeOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <LogOut className="h-3.5 w-3.5" />
            Discharge Tracker
          </button>
          <button
            onClick={() => setReallocateOpen(true)}
            className="flex items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <BellRing className="h-3.5 w-3.5" />
            Reallocation Alert
          </button>
          <button
            onClick={() => setAdmitOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700"
          >
            <PlusCircle className="h-3.5 w-3.5" />
            New Bed Admission
          </button>
        </div>
      </div>

      <Modal
        open={censusOpen}
        onClose={() => setCensusOpen(false)}
        title="Ward Census"
        description="Full bed occupancy across Blocks A-D"
        icon={ClipboardList}
        footer={<Button variant="secondary" onClick={() => setCensusOpen(false)}>Close</Button>}
      >
        {counts ? (
          <div className="grid grid-cols-2 gap-3 text-sm">
            <CensusStat label="Total Beds" value={counts.total} />
            <CensusStat label="Occupied" value={counts.occupied} />
            <CensusStat label="Available / Clean" value={counts.availableClean} />
            <CensusStat label="Reserved" value={counts.reserved} />
            <CensusStat label="Sanitizing" value={counts.sanitizing} />
            <CensusStat
              label="Occupancy Rate"
              value={`${counts.total ? Math.round((counts.occupied / counts.total) * 100) : 0}%`}
            />
          </div>
        ) : (
          <p className="text-sm text-slate-400">Census data is unavailable right now.</p>
        )}
      </Modal>

      <Modal
        open={dischargeOpen}
        onClose={() => setDischargeOpen(false)}
        title="Discharge Tracker"
        description={`${pendingDischarges.length} discharges pending across the pavilion today`}
        icon={LogOut}
        footer={<Button variant="secondary" onClick={() => setDischargeOpen(false)}>Close</Button>}
      >
        {pendingDischarges.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">No discharges are pending in wards you can currently see.</p>
        ) : (
          <div className="space-y-2">
            {pendingDischarges.map((d) => (
              <div key={`${d.ward}-${d.bedId}`} className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-800">{d.patientName}</p>
                  <p className="text-[11px] text-slate-400">{d.ward} · Bed {d.bedId}</p>
                </div>
                <span className="rounded bg-status-amber-bg px-2 py-0.5 text-[10px] font-bold text-status-amber">{d.eta}</span>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={reallocateOpen}
        onClose={() => setReallocateOpen(false)}
        onConfirm={() => {
          actionToast("Reallocation alert sent", "Bed managers notified of the current capacity pressure.", "warning");
          setReallocateOpen(false);
        }}
        variant="warning"
        title="Send Reallocation Alert"
        description={
          understaffedCount > 0
            ? `${understaffedCount} shift(s) are currently understaffed. This notifies bed managers and nursing supervisors of the capacity pressure so staff can be reallocated.`
            : "This notifies bed managers and nursing supervisors of the current capacity pressure so staff can be reallocated."
        }
        confirmLabel="Send Alert"
      />

      <Modal
        open={admitOpen}
        onClose={() => {
          if (admitting) return;
          setAdmitOpen(false);
          setAdmitPatientName("");
          setAdmitTargetKey("");
          setAdmitError("");
        }}
        title="New Bed Admission"
        description="Select a ward and bed to admit the incoming patient"
        icon={PlusCircle}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdmitOpen(false)} disabled={admitting}>
              Cancel
            </Button>
            <Button variant="primary" loading={admitting} onClick={handleQuickAdmitSubmit}>
              Admit Patient
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Patient Name</label>
            <input
              value={admitPatientName}
              onChange={(e) => {
                setAdmitPatientName(e.target.value);
                setAdmitError("");
              }}
              placeholder="e.g. Efua Mensima"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Available Bed</label>
            <select
              value={admitTargetKey}
              onChange={(e) => {
                setAdmitTargetKey(e.target.value);
                setAdmitError("");
              }}
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
            >
              <option value="">Select a ward and bed…</option>
              {targets.map((t) => (
                <option key={`${t.ward}-${t.bedId}`} value={`${t.ward}-${t.bedId}`}>
                  {t.label}
                </option>
              ))}
            </select>
            {targets.length === 0 && (
              <p className="mt-1 text-[11px] text-slate-400">No ready-to-admit beds are currently available.</p>
            )}
          </div>
          {admitError && <p className="text-[11px] text-status-red">{admitError}</p>}
        </div>
      </Modal>
    </div>
  );
}

function CensusStat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-md border border-surface-border px-3 py-2.5">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-lg font-extrabold text-slate-900">{value}</p>
    </div>
  );
}
