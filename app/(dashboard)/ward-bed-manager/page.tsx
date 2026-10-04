"use client";

import { useMemo, useState } from "react";
import WardHeader from "@/components/ward-bed-manager/WardHeader";
import CensusKpis from "@/components/ward-bed-manager/CensusKpis";
import WardFilterBar from "@/components/ward-bed-manager/WardFilterBar";
import IcuWard from "@/components/ward-bed-manager/IcuWard";
import MaleWard from "@/components/ward-bed-manager/MaleWard";
import FemaleWard from "@/components/ward-bed-manager/FemaleWard";
import AdmissionsQueue from "@/components/ward-bed-manager/AdmissionsQueue";
import InfectionControl from "@/components/ward-bed-manager/InfectionControl";
import NursingRotaTable from "@/components/ward-bed-manager/NursingRotaTable";
import TransferModal, { type TransferTarget } from "@/components/ward-bed-manager/TransferModal";
import { actionToast } from "@/lib/actions";
import {
  icuBeds as initialIcuBeds,
  maleCubicles as initialMaleCubicles,
  femaleBeds as initialFemaleBeds,
  admissionsQueue as initialAdmissionsQueue,
  initialCensusCounts,
  buildCensusKpis,
  wardFilterToKey,
  unmodeledWardFilterIds,
  emptyPatientForm,
  type IcuBed,
  type Cubicle,
  type WardBed,
  type SimpleBed,
  type AdmissionRequest,
  type PatientFormValues,
  type CensusCounts,
  type WardKey,
} from "@/lib/ward-data";

type TransferSource = {
  ward: WardKey;
  bedId: string;
  cubicleId?: string;
  label: string;
  patientName?: string;
  formValues: PatientFormValues;
};

export default function WardBedManagerPage() {
  const [icuBeds, setIcuBeds] = useState<IcuBed[]>(initialIcuBeds);
  const [maleCubicles, setMaleCubicles] = useState<Cubicle[]>(initialMaleCubicles);
  const [femaleBeds, setFemaleBeds] = useState<SimpleBed[]>(initialFemaleBeds);
  const [queue, setQueue] = useState<AdmissionRequest[]>(initialAdmissionsQueue);
  const [counts, setCounts] = useState<CensusCounts>(initialCensusCounts);

  const [activeFilter, setActiveFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [isolationOnly, setIsolationOnly] = useState(false);
  const [criticalOnly, setCriticalOnly] = useState(false);
  const [highlightUnderstaffed, setHighlightUnderstaffed] = useState(true);

  const [transferSource, setTransferSource] = useState<TransferSource | null>(null);

  const kpis = useMemo(() => buildCensusKpis(counts), [counts]);
  const pendingDischarges = useMemo(
    () =>
      maleCubicles.flatMap((c) =>
        c.beds
          .filter((b) => b.status === "discharge")
          .map((b) => ({
            ward: "Male Ward",
            bedId: b.id,
            patientName: b.patient?.name ?? "Unknown patient",
            eta: b.meta ?? "Pending",
          }))
      ),
    [maleCubicles]
  );
  const visibleWardKey = wardFilterToKey[activeFilter];
  const isUnmodeledFilter = unmodeledWardFilterIds.has(activeFilter);

  function adjustCounts(delta: Partial<CensusCounts>) {
    setCounts((c) => ({
      total: c.total,
      occupied: Math.max(0, c.occupied + (delta.occupied ?? 0)),
      availableClean: Math.max(0, c.availableClean + (delta.availableClean ?? 0)),
      reserved: Math.max(0, c.reserved + (delta.reserved ?? 0)),
      sanitizing: Math.max(0, c.sanitizing + (delta.sanitizing ?? 0)),
    }));
  }

  function findMaleCubicleIdForBed(bedId: string): string | undefined {
    return maleCubicles.find((c) => c.beds.some((b) => b.id === bedId))?.id;
  }

  function buildAvailableTargets(excludeWard?: WardKey, excludeBedId?: string): TransferTarget[] {
    const targets: TransferTarget[] = [];
    icuBeds.forEach((b) => {
      if (b.status === "ready" && !(excludeWard === "icu" && excludeBedId === b.id)) {
        targets.push({ ward: "icu", bedId: b.id, label: `ICU · ${b.id} (Ready Admit)` });
      }
    });
    maleCubicles.forEach((c) =>
      c.beds.forEach((b) => {
        if (b.status === "ready" && !(excludeWard === "male" && excludeBedId === b.id)) {
          targets.push({ ward: "male", bedId: b.id, label: `Male Ward · ${b.id} (Ready Admit)` });
        }
      })
    );
    femaleBeds.forEach((b) => {
      if ((b.status === "available" || b.status === "cleaned") && !(excludeWard === "female" && excludeBedId === b.id)) {
        targets.push({ ward: "female", bedId: b.id, label: `Female Ward · ${b.id} (${b.status === "available" ? "Available" : "Cleaned"})` });
      }
    });
    return targets;
  }

  // ---- ICU handlers ----------------------------------------------------

  function admitIcuBed(bedId: string, values: PatientFormValues) {
    setIcuBeds((beds) =>
      beds.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: "occupied",
              statusLabel: "Occupied",
              patient: { name: values.name, demo: values.demo, mrn: values.mrn },
              dx: values.dx,
              meta: values.note || "Admitted just now",
              readyDetail: undefined,
              actionLabel: undefined,
              actionTone: undefined,
            }
          : b
      )
    );
    adjustCounts({ occupied: 1, availableClean: -1 });
    actionToast("Patient admitted", `${values.name} → Bed ${bedId}`, "success");
  }

  function editIcuBed(bedId: string, values: PatientFormValues) {
    setIcuBeds((beds) =>
      beds.map((b) =>
        b.id === bedId
          ? { ...b, patient: { name: values.name, demo: values.demo, mrn: values.mrn }, dx: values.dx, meta: values.note }
          : b
      )
    );
    actionToast("Bed details updated", `Bed ${bedId} · ${values.name}`, "info");
  }

  function dischargeIcuBed(bedId: string) {
    const bed = icuBeds.find((b) => b.id === bedId);
    setIcuBeds((beds) =>
      beds.map((b) =>
        b.id === bedId
          ? {
              id: b.id,
              status: "ready",
              statusLabel: "Ready Admit",
              readyDetail: { title: "Bed Cleared", lines: ["Discharged just now"], note: "Awaiting terminal clean" },
              actionLabel: "Assign Now",
              actionTone: "primary",
            }
          : b
      )
    );
    adjustCounts({ occupied: -1, availableClean: 1 });
    actionToast("Patient discharged", bed?.patient?.name ? `${bed.patient.name} · Bed ${bedId}` : `Bed ${bedId}`, "success");
  }

  function freeReservedIcuBed(bedId: string) {
    setIcuBeds((beds) =>
      beds.map((b) =>
        b.id === bedId
          ? {
              id: b.id,
              status: "ready",
              statusLabel: "Ready Admit",
              readyDetail: { title: "Bed Cleared", lines: ["Hold cancelled"], note: "Ready to admit" },
              actionLabel: "Assign Now",
              actionTone: "primary",
            }
          : b
      )
    );
    adjustCounts({ reserved: -1, availableClean: 1 });
    actionToast("Reservation cancelled", `Bed ${bedId} is now ready to admit`, "info");
  }

  function vacateIcuBed(bedId: string) {
    dischargeIcuBed(bedId);
  }

  function occupyIcuBed(bedId: string, values: PatientFormValues) {
    admitIcuBed(bedId, values);
  }

  // ---- Male ward handlers ------------------------------------------------

  function admitMaleBed(cubicleId: string, bedId: string, values: PatientFormValues) {
    setMaleCubicles((cubicles) =>
      cubicles.map((c) =>
        c.id !== cubicleId
          ? c
          : {
              ...c,
              beds: c.beds.map((b) =>
                b.id === bedId
                  ? {
                      ...b,
                      status: "occupied",
                      statusLabel: "Occupied",
                      patient: { name: values.name, demo: values.demo, mrn: values.mrn, day: "Day 1" },
                      dx: values.dx,
                      note: values.note,
                      readyDetail: undefined,
                      housekeeping: undefined,
                      actionLabel: undefined,
                    }
                  : b
              ),
            }
      )
    );
    adjustCounts({ occupied: 1, availableClean: -1 });
    actionToast("Patient admitted", `${values.name} → Bed ${bedId}`, "success");
  }

  function editMaleBed(cubicleId: string, bedId: string, values: PatientFormValues) {
    setMaleCubicles((cubicles) =>
      cubicles.map((c) =>
        c.id !== cubicleId
          ? c
          : {
              ...c,
              beds: c.beds.map((b) =>
                b.id === bedId
                  ? { ...b, patient: { name: values.name, demo: values.demo, mrn: values.mrn, day: b.patient?.day ?? "Day 1" }, dx: values.dx, note: values.note }
                  : b
              ),
            }
      )
    );
    actionToast("Bed details updated", `Bed ${bedId} · ${values.name}`, "info");
  }

  function dischargeMaleBed(cubicleId: string, bedId: string) {
    const patientName = maleCubicles.find((c) => c.id === cubicleId)?.beds.find((b) => b.id === bedId)?.patient?.name;
    setMaleCubicles((cubicles) =>
      cubicles.map((c) =>
        c.id !== cubicleId
          ? c
          : {
              ...c,
              beds: c.beds.map((b) =>
                b.id === bedId
                  ? {
                      id: b.id,
                      status: "sanitizing",
                      statusLabel: "Sanitizing",
                      housekeeping: {
                        title: "Housekeeping Cleaning",
                        lines: ["Terminal clean in progress"],
                        timer: "Timer: 20 mins remaining",
                        staff: "Housekeeper: Assigned on request",
                      },
                    }
                  : b
              ),
            }
      )
    );
    adjustCounts({ occupied: -1, sanitizing: 1 });
    actionToast("Patient discharged", patientName ? `${patientName} · Bed ${bedId}` : `Bed ${bedId}`, "success");
  }

  function markMaleBedClean(cubicleId: string, bedId: string) {
    setMaleCubicles((cubicles) =>
      cubicles.map((c) =>
        c.id !== cubicleId
          ? c
          : {
              ...c,
              beds: c.beds.map((b) =>
                b.id === bedId
                  ? {
                      id: b.id,
                      status: "ready",
                      statusLabel: "Ready Admit",
                      readyDetail: { title: "Clean Bed Ready", lines: ["Terminal clean complete"], note: "Cleaned just now" },
                      actionLabel: "Assign",
                    }
                  : b
              ),
            }
      )
    );
    adjustCounts({ sanitizing: -1, availableClean: 1 });
    actionToast("Bed marked clean", `Bed ${bedId} ready to admit`, "success");
  }

  function vacateMaleBed(cubicleId: string, bedId: string) {
    dischargeMaleBed(cubicleId, bedId);
  }

  function occupyMaleBed(bedId: string, values: PatientFormValues) {
    const cubicleId = findMaleCubicleIdForBed(bedId);
    if (!cubicleId) return;
    admitMaleBed(cubicleId, bedId, values);
  }

  // ---- Female ward handlers ----------------------------------------------

  function assignFemaleBed(bedId: string, label: string) {
    setFemaleBeds((beds) => beds.map((b) => (b.id === bedId ? { ...b, status: "occupied", label } : b)));
    adjustCounts({ occupied: 1, availableClean: -1 });
    actionToast("Patient admitted", `${label} → Bed ${bedId}`, "success");
  }

  function editFemaleBed(bedId: string, label: string) {
    setFemaleBeds((beds) => beds.map((b) => (b.id === bedId ? { ...b, label } : b)));
    actionToast("Bed details updated", `Bed ${bedId} · ${label}`, "info");
  }

  function freeHoldFemaleBed(bedId: string) {
    setFemaleBeds((beds) => beds.map((b) => (b.id === bedId ? { ...b, status: "available", label: "Available" } : b)));
    adjustCounts({ reserved: -1, availableClean: 1 });
    actionToast("Hold released", `Bed ${bedId} is now available`, "info");
  }

  function dischargeFemaleBed(bedId: string) {
    const patientName = femaleBeds.find((b) => b.id === bedId)?.label;
    setFemaleBeds((beds) => beds.map((b) => (b.id === bedId ? { ...b, status: "cleaned", label: "Cleaned just now" } : b)));
    adjustCounts({ occupied: -1, availableClean: 1 });
    actionToast("Patient discharged", patientName ? `${patientName} · Bed ${bedId}` : `Bed ${bedId}`, "success");
  }

  function vacateFemaleBed(bedId: string) {
    dischargeFemaleBed(bedId);
  }

  function occupyFemaleBed(bedId: string, values: PatientFormValues) {
    assignFemaleBed(bedId, values.name);
  }

  // ---- Cross-ward: transfer & admissions queue ---------------------------

  function requestTransferFromIcu(bed: IcuBed) {
    setTransferSource({
      ward: "icu",
      bedId: bed.id,
      label: `ICU Bed ${bed.id}`,
      patientName: bed.patient?.name,
      formValues: { name: bed.patient?.name ?? "", demo: bed.patient?.demo ?? "", mrn: bed.patient?.mrn ?? "", dx: bed.dx ?? "", note: bed.meta ?? "" },
    });
  }

  function requestTransferFromMale(cubicleId: string, bed: WardBed) {
    setTransferSource({
      ward: "male",
      bedId: bed.id,
      cubicleId,
      label: `Male Ward Bed ${bed.id}`,
      patientName: bed.patient?.name,
      formValues: { name: bed.patient?.name ?? "", demo: bed.patient?.demo ?? "", mrn: bed.patient?.mrn ?? "", dx: bed.dx ?? "", note: bed.note ?? "" },
    });
  }

  function requestTransferFromFemale(bed: SimpleBed) {
    setTransferSource({
      ward: "female",
      bedId: bed.id,
      label: `Female Ward Bed ${bed.id}`,
      patientName: bed.label,
      formValues: { ...emptyPatientForm, name: bed.label },
    });
  }

  function performTransfer(target: TransferTarget) {
    if (!transferSource) return;
    const { ward, bedId, cubicleId, formValues, patientName } = transferSource;

    if (ward === "icu") vacateIcuBed(bedId);
    else if (ward === "male" && cubicleId) vacateMaleBed(cubicleId, bedId);
    else if (ward === "female") vacateFemaleBed(bedId);

    if (target.ward === "icu") occupyIcuBed(target.bedId, formValues);
    else if (target.ward === "male") occupyMaleBed(target.bedId, formValues);
    else if (target.ward === "female") occupyFemaleBed(target.bedId, formValues);

    actionToast("Patient transferred", `${patientName ?? "Patient"} moved to ${target.label}`, "success");
    setTransferSource(null);
  }

  function quickAdmitPatient(target: TransferTarget, patientName: string) {
    const values: PatientFormValues = { ...emptyPatientForm, name: patientName };
    if (target.ward === "icu") occupyIcuBed(target.bedId, values);
    else if (target.ward === "male") occupyMaleBed(target.bedId, values);
    else if (target.ward === "female") occupyFemaleBed(target.bedId, values);
  }

  function assignQueueRequest(requestId: string, target: TransferTarget) {
    const request = queue.find((r) => r.id === requestId);
    if (!request) return;
    const values: PatientFormValues = { name: request.patient, demo: request.demo, mrn: "", dx: request.dx, note: request.note };

    if (target.ward === "icu") occupyIcuBed(target.bedId, values);
    else if (target.ward === "male") occupyMaleBed(target.bedId, values);
    else if (target.ward === "female") occupyFemaleBed(target.bedId, values);

    setQueue((q) => q.filter((r) => r.id !== requestId));
  }

  function declineQueueRequest(requestId: string, reason: string) {
    const request = queue.find((r) => r.id === requestId);
    setQueue((q) => q.filter((r) => r.id !== requestId));
    actionToast("Admission declined", request ? `${request.patient} — ${reason}` : reason, "warning");
  }

  const showIcu = visibleWardKey === null || visibleWardKey === "icu";
  const showMale = visibleWardKey === null || visibleWardKey === "male";
  const showFemale = visibleWardKey === null || visibleWardKey === "female";
  const noWardSectionsVisible = isUnmodeledFilter;

  return (
    <div>
      <WardHeader
        counts={counts}
        pendingDischarges={pendingDischarges}
        quickAdmitTargets={buildAvailableTargets()}
        onQuickAdmit={quickAdmitPatient}
      />
      <CensusKpis kpis={kpis} />
      <WardFilterBar
        activeFilter={activeFilter}
        onFilterChange={setActiveFilter}
        search={search}
        onSearchChange={setSearch}
        isolationOnly={isolationOnly}
        onIsolationOnlyChange={setIsolationOnly}
        criticalOnly={criticalOnly}
        onCriticalOnlyChange={setCriticalOnly}
        highlightUnderstaffed={highlightUnderstaffed}
        onHighlightUnderstaffedChange={setHighlightUnderstaffed}
      />

      {noWardSectionsVisible ? (
        <div className="mt-5 rounded-xl border border-dashed border-surface-border bg-white p-10 text-center shadow-card">
          <p className="text-sm font-semibold text-slate-600">No bed data available for this ward yet</p>
          <p className="mt-1 text-xs text-slate-400">
            This ward hasn&apos;t been onboarded into the live bed matrix. Select another ward filter above.
          </p>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
          <div className="space-y-5">
            {showIcu && (
              <IcuWard
                beds={icuBeds}
                search={search}
                isolationOnly={isolationOnly}
                criticalOnly={criticalOnly}
                onAdmit={admitIcuBed}
                onEdit={editIcuBed}
                onDischarge={dischargeIcuBed}
                onFreeReserved={freeReservedIcuBed}
                onTransferRequest={requestTransferFromIcu}
              />
            )}
            {showMale && (
              <MaleWard
                cubicles={maleCubicles}
                search={search}
                isolationOnly={isolationOnly}
                onAdmit={admitMaleBed}
                onEdit={editMaleBed}
                onDischarge={dischargeMaleBed}
                onMarkClean={markMaleBedClean}
                onTransferRequest={requestTransferFromMale}
              />
            )}
            {!showIcu && !showMale && (
              <div className="rounded-xl border border-dashed border-surface-border bg-white p-8 text-center shadow-card">
                <p className="text-xs font-semibold text-slate-500">No wards in this column match the current filter</p>
              </div>
            )}
          </div>

          <div className="space-y-5">
            <AdmissionsQueue
              queue={queue}
              availableTargets={buildAvailableTargets()}
              onAssign={assignQueueRequest}
              onDecline={declineQueueRequest}
            />
            <InfectionControl />
            {showFemale && (
              <FemaleWard
                beds={femaleBeds}
                search={search}
                isolationOnly={isolationOnly}
                onAssign={assignFemaleBed}
                onEdit={editFemaleBed}
                onFreeHold={freeHoldFemaleBed}
                onDischarge={dischargeFemaleBed}
                onTransferRequest={requestTransferFromFemale}
              />
            )}
          </div>
        </div>
      )}

      <div className="mt-5">
        <NursingRotaTable highlightUnderstaffed={highlightUnderstaffed} />
      </div>

      <TransferModal
        open={!!transferSource}
        onClose={() => setTransferSource(null)}
        onConfirm={performTransfer}
        sourceLabel={transferSource?.label ?? ""}
        patientName={transferSource?.patientName}
        availableTargets={buildAvailableTargets(transferSource?.ward, transferSource?.bedId)}
      />
    </div>
  );
}
