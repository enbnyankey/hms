"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Settings2 } from "lucide-react";
import WardHeader, { type PendingDischarge } from "@/components/ward-bed-manager/WardHeader";
import CensusKpis from "@/components/ward-bed-manager/CensusKpis";
import WardFilterBar, { type BedStatusFilter } from "@/components/ward-bed-manager/WardFilterBar";
import WardSection, { type BedAction } from "@/components/ward-bed-manager/WardSection";
import AdmissionsQueue from "@/components/ward-bed-manager/AdmissionsQueue";
import InfectionControl from "@/components/ward-bed-manager/InfectionControl";
import NursingRotaTable from "@/components/ward-bed-manager/NursingRotaTable";
import TransferModal, { type TransferTarget } from "@/components/ward-bed-manager/TransferModal";
import AdmitPatientModal, { type AdmitValues } from "@/components/ward-bed-manager/AdmitPatientModal";
import AdmissionDetailsModal from "@/components/ward-bed-manager/AdmissionDetailsModal";
import PatientViewModal from "@/components/ward-bed-manager/PatientViewModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { actionToast } from "@/lib/actions";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { buildCensusKpis, type AdmissionRequest } from "@/lib/ward-data";
import {
  admitPatient,
  ageSex,
  cancelQueueRequest,
  dischargeAdmission,
  fetchBeds,
  fetchCensus,
  fetchQueue,
  fetchWards,
  formatWait,
  markDischargeReady,
  setBedIsolation,
  setBedStatus,
  setWardStaffing,
  transferAdmission,
  updateAdmission,
  type Bed,
  type BedStatus,
  type Census,
  type QueueRequest,
  type Ward,
} from "@/lib/ward-api";

type BoardData = { census: Census; wards: Ward[]; beds: Bed[]; queue: QueueRequest[] };

async function loadBoard(): Promise<BoardData> {
  const [census, wards, beds, queue] = await Promise.all([fetchCensus(), fetchWards(), fetchBeds(), fetchQueue()]);
  return { census, wards, beds, queue };
}

function errorMessage(err: unknown): string {
  return err instanceof ApiError || err instanceof Error ? err.message : "Something went wrong.";
}

function toQueueCard(r: QueueRequest): AdmissionRequest {
  return {
    id: r.id,
    source: r.source,
    wait: `Wait: ${formatWait(r.waitingMinutes)}`,
    urgency: r.urgency === "CRITICAL" ? "critical" : r.urgency === "URGENT" ? "warning" : "neutral",
    patient: r.patientName,
    demo: ageSex(r.age, r.sex),
    location: r.nhisNumber ? `NHIS: ${r.nhisNumber}` : r.mrn,
    dx: r.diagnosis,
    note: r.notes ?? "",
    suggestedBed: r.suggestedBedCode ?? (r.preferredWardCode ? `Any bed in Ward ${r.preferredWardCode}` : "None"),
    suggestedBedId: r.suggestedBedId ?? undefined,
    actionLabel: "Assign Bed",
  };
}

const STATUS_MATCH: Record<BedStatusFilter, (b: Bed) => boolean> = {
  all: () => true,
  occupied: (b) => b.status === "OCCUPIED",
  "discharge-ready": (b) => b.occupant?.admissionStatus === "DISCHARGE_READY",
  available: (b) => b.status === "AVAILABLE",
  reserved: (b) => b.status === "RESERVED",
  cleaning: (b) => b.status === "CLEANING",
  maintenance: (b) => b.status === "MAINTENANCE",
};

type Confirm =
  | { kind: "discharge-ready" | "discharge" | "release" | "mark-clean" | "return-to-service"; bed: Bed }
  | null;

export default function WardBedManagerPage() {
  const { user } = useAuth();
  const canManageBeds = user?.role === "admin" || user?.role === "nurse";

  const [data, setData] = useState<BoardData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isolationOnly, setIsolationOnly] = useState(false);
  const [statusFilter, setStatusFilter] = useState<BedStatusFilter>("all");
  const [highlightUnderstaffed, setHighlightUnderstaffed] = useState(true);

  const [admitFor, setAdmitFor] = useState<{ bed: TransferTarget | null; key: number } | null>(null);
  const [viewBed, setViewBed] = useState<Bed | null>(null);
  const [editBed, setEditBed] = useState<Bed | null>(null);
  const [transferBed, setTransferBed] = useState<Bed | null>(null);
  const [manageBed, setManageBed] = useState<Bed | null>(null);
  const [manageNote, setManageNote] = useState("");
  const [manageBusy, setManageBusy] = useState(false);
  const [confirm, setConfirm] = useState<Confirm>(null);

  // ---- data ------------------------------------------------------------

  useEffect(() => {
    let cancelled = false;
    loadBoard()
      .then((d) => !cancelled && setData(d))
      .catch((err) => !cancelled && setLoadError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      setData(await loadBoard());
    } catch (err) {
      actionToast("Couldn't refresh the bed board", errorMessage(err), "error");
    }
  }, []);

  /** Run a backend action, toast the result, then reload the board. Resolves true on success. */
  const run = useCallback(
    async (action: () => Promise<unknown>, success: [string, string?], failTitle: string): Promise<boolean> => {
      try {
        await action();
        actionToast(success[0], success[1], "success");
        await refresh();
        return true;
      } catch (err) {
        actionToast(failTitle, errorMessage(err), "error");
        await refresh();
        return false;
      }
    },
    [refresh]
  );

  const wardsByCode = useMemo(() => new Map((data?.wards ?? []).map((w) => [w.code, w])), [data]);
  const wardLabel = useCallback((code: string) => wardsByCode.get(code)?.shortName ?? `Ward ${code}`, [wardsByCode]);

  // Beds that can take a patient (admit / transfer / assign from queue).
  const openBeds = useMemo<TransferTarget[]>(
    () =>
      (data?.beds ?? [])
        .filter((b) => b.status === "AVAILABLE" || b.status === "RESERVED")
        .map((b) => ({
          ward: b.wardCode,
          bedId: b.id,
          label: `Ward ${b.wardCode} · ${wardLabel(b.wardCode)} · ${b.code}${b.status === "RESERVED" ? " (Reserved)" : ""}${b.isolation ? " · Isolation" : ""}`,
        })),
    [data, wardLabel]
  );

  const pendingDischarges = useMemo<PendingDischarge[]>(
    () =>
      (data?.beds ?? [])
        .filter((b) => b.occupant?.admissionStatus === "DISCHARGE_READY")
        .map((b) => ({
          ward: wardLabel(b.wardCode),
          bedId: b.code,
          patientName: b.occupant!.patientName,
          eta: `Day ${b.occupant!.dayOfStay}`,
        })),
    [data, wardLabel]
  );

  const wardFilters = useMemo(
    () => [
      { id: "all", label: "All Wards", count: data?.census.beds.total ?? 0 },
      ...(data?.wards ?? []).map((w) => ({ id: w.code, label: `Ward ${w.code} · ${w.shortName}`, count: w.beds.total })),
    ],
    [data]
  );

  const visibleWards = useMemo(() => {
    if (!data) return [];
    const q = search.trim().toLowerCase();
    return data.wards
      .filter((w) => activeFilter === "all" || w.code === activeFilter)
      .map((ward) => ({
        ward,
        beds: data.beds.filter((b) => {
          if (b.wardId !== ward.id) return false;
          if (isolationOnly && !b.isolation) return false;
          if (!STATUS_MATCH[statusFilter](b)) return false;
          if (q) {
            const hay = [b.code, b.room, b.occupant?.patientName, b.occupant?.mrn, b.occupant?.diagnosis]
              .filter(Boolean)
              .join(" ")
              .toLowerCase();
            if (!hay.includes(q)) return false;
          }
          return true;
        }),
      }))
      // While searching, hide wards with no matching beds.
      .filter((v) => !q || v.beds.length > 0);
  }, [data, activeFilter, search, isolationOnly, statusFilter]);

  const understaffedCount = (data?.wards ?? []).filter(
    (w) => w.beds.occupied > 0 && (w.nursesOnDuty === 0 || w.beds.occupied / w.nursesOnDuty > 5)
  ).length;

  // ---- actions -----------------------------------------------------------

  function openAdmit(bed: TransferTarget | null) {
    setAdmitFor({ bed, key: Date.now() });
  }

  function onBedAction(bed: Bed, action: BedAction) {
    switch (action) {
      case "view":
        return setViewBed(bed);
      case "edit":
        return setEditBed(bed);
      case "transfer":
        return setTransferBed(bed);
      case "admit":
        return openAdmit({ ward: bed.wardCode, bedId: bed.id, label: `Bed ${bed.code}` });
      case "manage":
        setManageNote("");
        return setManageBed(bed);
      default:
        return setConfirm({ kind: action, bed });
    }
  }

  async function handleAdmit(v: AdmitValues) {
    return run(
      () =>
        admitPatient({
          patientId: v.patientId,
          bedId: v.bedId,
          diagnosis: v.diagnosis.trim(),
          attending: v.attending.trim() || undefined,
          notes: v.notes.trim() || undefined,
        }),
      ["Patient admitted", `Bed ${data?.beds.find((b) => b.id === v.bedId)?.code ?? ""}`],
      "Couldn't admit patient"
    );
  }

  async function handleConfirm() {
    if (!confirm) return;
    const { kind, bed } = confirm;
    const o = bed.occupant;
    let ok = false;
    if (kind === "discharge-ready" && o) {
      ok = await run(() => markDischargeReady(o.admissionId), ["Marked ready for discharge", `${o.patientName} · Bed ${bed.code}`], "Couldn't update admission");
    } else if (kind === "discharge" && o) {
      ok = await run(() => dischargeAdmission(o.admissionId), ["Patient discharged", `${o.patientName} · Bed ${bed.code} sent for cleaning`], "Couldn't discharge patient");
    } else if (kind === "release") {
      ok = await run(() => setBedStatus(bed.id, "AVAILABLE", "Hold released"), ["Reservation cancelled", `Bed ${bed.code} is ready to admit`], "Couldn't release bed");
    } else if (kind === "mark-clean") {
      ok = await run(() => setBedStatus(bed.id, "AVAILABLE", "Terminal clean complete"), ["Bed marked clean", `Bed ${bed.code} ready to admit`], "Couldn't update bed");
    } else if (kind === "return-to-service") {
      ok = await run(() => setBedStatus(bed.id, "AVAILABLE", "Returned to service"), ["Bed back in service", `Bed ${bed.code} ready to admit`], "Couldn't update bed");
    }
    if (ok) setConfirm(null);
  }

  async function handleManage(status: BedStatus | "isolation-on" | "isolation-off") {
    if (!manageBed) return;
    const bed = manageBed;
    const note = manageNote.trim() || undefined;
    setManageBusy(true);
    let ok: boolean;
    if (status === "isolation-on" || status === "isolation-off") {
      const on = status === "isolation-on";
      ok = await run(() => setBedIsolation(bed.id, on), [on ? "Isolation started" : "Isolation ended", `Bed ${bed.code}`], "Couldn't update isolation");
    } else {
      const labels: Partial<Record<BedStatus, string>> = {
        AVAILABLE: "Bed available",
        RESERVED: "Bed reserved",
        CLEANING: "Sent for cleaning",
        MAINTENANCE: "Bed taken out of service",
      };
      ok = await run(() => setBedStatus(bed.id, status, note), [labels[status] ?? "Bed updated", `Bed ${bed.code}`], "Couldn't update bed");
    }
    setManageBusy(false);
    if (ok) setManageBed(null);
  }

  // ---- render --------------------------------------------------------------

  if (loadError && !data) {
    return (
      <div>
        <WardHeader onNewAdmission={() => undefined} />
        <div className="mt-6 rounded-xl border border-red-200 bg-status-red-bg p-5 text-sm text-status-red">
          <p className="font-semibold">Couldn&apos;t load the bed board.</p>
          <p className="mt-1">{loadError}</p>
          <button
            onClick={() => {
              setLoadError(null);
              loadBoard().then(setData).catch((err) => setLoadError(errorMessage(err)));
            }}
            className="mt-3 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-status-red shadow-sm hover:bg-red-50"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <WardHeader onNewAdmission={() => undefined} />
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading bed board…
        </div>
      </div>
    );
  }

  const isolationBeds = data.beds.filter((b) => b.isolation).length;
  const viewO = viewBed?.occupant;

  return (
    <div>
      <WardHeader
        census={data.census}
        pendingDischarges={pendingDischarges}
        understaffedCount={understaffedCount}
        onNewAdmission={() => openAdmit(null)}
      />
      <CensusKpis kpis={buildCensusKpis(data.census)} />
      <WardFilterBar
        wardFilters={wardFilters}
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        search={search}
        onSearchChange={setSearch}
        isolationOnly={isolationOnly}
        onIsolationOnlyChange={setIsolationOnly}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        highlightUnderstaffed={highlightUnderstaffed}
        onHighlightUnderstaffedChange={setHighlightUnderstaffed}
      />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-5">
          {visibleWards.length === 0 ? (
            <div className="rounded-xl border border-dashed border-surface-border bg-white p-10 text-center shadow-card">
              <p className="text-sm font-semibold text-slate-600">No beds match the current filters</p>
              <p className="mt-1 text-xs text-slate-400">Try clearing the search or filter selections above.</p>
            </div>
          ) : (
            visibleWards.map(({ ward, beds }) => (
              <WardSection
                key={ward.id}
                ward={ward}
                beds={beds}
                showAvailable={statusFilter === "all" || statusFilter === "available"}
                canManageBeds={canManageBeds}
                onAction={onBedAction}
              />
            ))
          )}
        </div>

        <div className="space-y-5">
          <AdmissionsQueue
            queue={data.queue.map(toQueueCard)}
            availableTargets={openBeds}
            onAssign={async (requestId, target) => {
              const r = data.queue.find((q) => q.id === requestId);
              if (!r) return false;
              return run(
                () => admitPatient({ patientId: r.patientId, bedId: target.bedId, diagnosis: r.diagnosis, notes: r.notes ?? undefined, admissionRequestId: r.id }),
                ["Patient admitted", `${r.patientName} → ${target.label}`],
                "Couldn't assign bed"
              );
            }}
            onDecline={async (requestId, reason) => {
              const r = data.queue.find((q) => q.id === requestId);
              return run(() => cancelQueueRequest(requestId, reason), ["Admission declined", r ? `${r.patientName} — ${reason}` : reason], "Couldn't decline request");
            }}
          />
          <InfectionControl
            isolationInUse={data.census.isolationInUse}
            isolationBeds={isolationBeds}
            cleaning={data.census.beds.cleaning}
            outOfService={data.census.beds.maintenance}
          />
        </div>
      </div>

      <div className="mt-5">
        <NursingRotaTable
          wards={data.wards}
          highlightUnderstaffed={highlightUnderstaffed}
          canEditStaffing={canManageBeds}
          onUpdateStaffing={async (ward, n) => {
            await run(() => setWardStaffing(ward.id, n), ["Staffing updated", `${ward.name}: ${n} nurses on duty`], "Couldn't update staffing");
          }}
        />
      </div>

      {/* ---- dialogs ---- */}

      {admitFor && (
        <AdmitPatientModal
          key={admitFor.key}
          open
          onClose={() => setAdmitFor(null)}
          bed={admitFor.bed}
          bedOptions={openBeds}
          onSubmit={handleAdmit}
        />
      )}

      <AdmissionDetailsModal
        key={editBed?.id ?? "none"}
        bed={editBed}
        onClose={() => setEditBed(null)}
        onSubmit={(v) =>
          editBed?.occupant
            ? run(
                () =>
                  updateAdmission(editBed.occupant!.admissionId, {
                    diagnosis: v.diagnosis.trim(),
                    attending: v.attending.trim() || undefined,
                    notes: v.notes.trim() || undefined,
                  }),
                ["Bed details updated", `Bed ${editBed.code} · ${editBed.occupant.patientName}`],
                "Couldn't save changes"
              )
            : Promise.resolve(false)
        }
      />

      <PatientViewModal
        open={!!viewBed}
        onClose={() => setViewBed(null)}
        title={`Bed ${viewBed?.code ?? ""} Details`}
        description={viewBed ? wardsByCode.get(viewBed.wardCode)?.name : undefined}
        rows={[
          { label: "Status", value: viewO?.admissionStatus === "DISCHARGE_READY" ? "Discharge Ready" : viewBed?.status ?? "" },
          { label: "Patient", value: viewO?.patientName ?? "—" },
          { label: "Age / Sex", value: viewO ? ageSex(viewO.age, viewO.sex) : "—" },
          { label: "MRN", value: viewO?.mrn ?? "—" },
          { label: "Diagnosis", value: viewO?.diagnosis ?? "—" },
          { label: "Attending", value: viewO?.attending ?? "—" },
          { label: "Admitted", value: viewO ? `${new Date(viewO.admittedAt).toLocaleString("en-GB")} (Day ${viewO.dayOfStay})` : "—" },
          { label: "Note", value: viewO?.notes ?? viewBed?.statusNote ?? "—" },
          { label: "Isolation", value: viewBed?.isolation ? "Yes" : "No" },
        ]}
      />

      <TransferModal
        open={!!transferBed}
        onClose={() => setTransferBed(null)}
        sourceLabel={transferBed ? `Ward ${transferBed.wardCode} · Bed ${transferBed.code}` : ""}
        patientName={transferBed?.occupant?.patientName}
        availableTargets={openBeds}
        onConfirm={async (target) => {
          if (!transferBed?.occupant) return;
          const ok = await run(
            () => transferAdmission(transferBed.occupant!.admissionId, target.bedId),
            ["Patient transferred", `${transferBed.occupant.patientName} moved to ${target.label}`],
            "Couldn't transfer patient"
          );
          if (ok) setTransferBed(null);
        }}
      />

      <ConfirmModal
        open={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleConfirm}
        variant={confirm?.kind === "discharge" ? "delete" : confirm?.kind === "discharge-ready" ? "warning" : "approve"}
        title={
          confirm
            ? {
                "discharge-ready": `Ready for Discharge — Bed ${confirm.bed.code}`,
                discharge: `Discharge Bed ${confirm.bed.code}`,
                release: `Cancel Hold — Bed ${confirm.bed.code}`,
                "mark-clean": `Mark Bed ${confirm.bed.code} Clean`,
                "return-to-service": `Return Bed ${confirm.bed.code} to Service`,
              }[confirm.kind]
            : ""
        }
        description={
          confirm
            ? {
                "discharge-ready": `Mark ${confirm.bed.occupant?.patientName ?? "the patient"} as ready to go home. They stay in the bed until discharged and appear in the Discharge Tracker.`,
                discharge: `This discharges ${confirm.bed.occupant?.patientName ?? "the patient"} and sends the bed for cleaning. This cannot be undone.`,
                release: "This releases the reservation and returns the bed to ready-to-admit status.",
                "mark-clean": "Confirm the terminal clean is complete. The bed becomes available for admission.",
                "return-to-service": "Confirm the bed is fit for use again. It becomes available for admission.",
              }[confirm.kind]
            : ""
        }
        confirmLabel={
          confirm
            ? { "discharge-ready": "Mark Ready", discharge: "Discharge", release: "Free Bed", "mark-clean": "Mark Clean", "return-to-service": "Return to Service" }[confirm.kind]
            : ""
        }
      />

      <Modal
        open={!!manageBed}
        onClose={() => !manageBusy && setManageBed(null)}
        title={`Bed ${manageBed?.code ?? ""}`}
        description={manageBed ? `${wardsByCode.get(manageBed.wardCode)?.name ?? ""} · ${manageBed.status.toLowerCase()}${manageBed.isolation ? " · isolation" : ""}` : undefined}
        icon={Settings2}
        size="sm"
        footer={
          <Button variant="secondary" onClick={() => setManageBed(null)} disabled={manageBusy}>
            Close
          </Button>
        }
      >
        {manageBed && (
          <div className="space-y-3">
            {(manageBed.status === "AVAILABLE" || manageBed.status === "RESERVED") && (
              <Button
                variant="primary"
                className="w-full"
                disabled={manageBusy}
                onClick={() => {
                  const b = manageBed;
                  setManageBed(null);
                  openAdmit({ ward: b.wardCode, bedId: b.id, label: `Bed ${b.code}` });
                }}
              >
                Admit a Patient
              </Button>
            )}
            {canManageBeds ? (
              <>
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Note (optional)</label>
                  <input
                    value={manageNote}
                    onChange={(e) => setManageNote(e.target.value)}
                    placeholder="e.g. Held for PACU patient · Broken bed rail"
                    className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {manageBed.status !== "RESERVED" && (
                    <Button variant="secondary" disabled={manageBusy} onClick={() => handleManage("RESERVED")}>
                      Reserve
                    </Button>
                  )}
                  {manageBed.status !== "CLEANING" && (
                    <Button variant="secondary" disabled={manageBusy} onClick={() => handleManage("CLEANING")}>
                      Send for Cleaning
                    </Button>
                  )}
                  {manageBed.status !== "MAINTENANCE" && (
                    <Button variant="secondary" disabled={manageBusy} onClick={() => handleManage("MAINTENANCE")}>
                      Out of Service
                    </Button>
                  )}
                  {manageBed.status !== "AVAILABLE" && (
                    <Button variant="secondary" disabled={manageBusy} onClick={() => handleManage("AVAILABLE")}>
                      Make Available
                    </Button>
                  )}
                  <Button
                    variant="secondary"
                    disabled={manageBusy}
                    onClick={() => handleManage(manageBed.isolation ? "isolation-off" : "isolation-on")}
                  >
                    {manageBed.isolation ? "End Isolation" : "Start Isolation"}
                  </Button>
                </div>
              </>
            ) : (
              <p className="text-[11px] text-slate-400">Only nurses and administrators can change a bed&apos;s status.</p>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
