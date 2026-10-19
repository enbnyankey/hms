"use client";

import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import SystemLoader from "@/components/ui/SystemLoader";
import RegistryHeader from "@/components/patient-registry/RegistryHeader";
import RegistryKpis from "@/components/patient-registry/RegistryKpis";
import PatientIndexTable from "@/components/patient-registry/PatientIndexTable";
import RecentActivityPanel, { type ActivityEntry } from "@/components/patient-registry/RecentActivityPanel";
import PatientViewModal from "@/components/patient-registry/PatientViewModal";
import PatientEditModal, { type PatientEditValues } from "@/components/patient-registry/PatientEditModal";
import AddPatientModal from "@/components/patient-registry/AddPatientModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { actionToast } from "@/lib/actions";
import { ApiError, fetchActivity, formatActivityTime, type AuditEvent } from "@/lib/api";
import {
  createPatient,
  deactivatePatient as deactivatePatientApi,
  fetchPatients,
  updatePatient,
  verifyNhis,
} from "@/lib/patients-api";
import type { PatientRecord, PatientFormValues } from "@/lib/patient-registry-data";

const ACTIVITY_MODULE = "patient-registry";

function toActivityEntry(e: AuditEvent): ActivityEntry {
  const type: ActivityEntry["type"] =
    e.action === "register" || e.action === "verify" || e.action === "edit" || e.action === "deactivate"
      ? e.action
      : e.action === "reactivate"
        ? "verify"
        : "edit";
  return { id: e.id, type, message: e.summary, timestamp: formatActivityTime(e.occurredAt) };
}

function errorMessage(err: unknown): string {
  return err instanceof ApiError || err instanceof Error ? err.message : "Something went wrong.";
}

export default function PatientRegistryPage() {
  return (
    <Suspense fallback={null}>
      <PatientRegistryPageInner />
    </Suspense>
  );
}

function PatientRegistryPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [activity, setActivity] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [addOpen, setAddOpen] = useState(false);
  const [viewPatientId, setViewPatientId] = useState<string | null>(null);
  const [editPatientId, setEditPatientId] = useState<string | null>(null);
  const [verifyPatientId, setVerifyPatientId] = useState<string | null>(null);
  const [deactivatePatientId, setDeactivatePatientId] = useState<string | null>(null);

  const viewPatient = useMemo(() => patients.find((p) => p.id === viewPatientId) ?? null, [patients, viewPatientId]);
  const editPatient = useMemo(() => patients.find((p) => p.id === editPatientId) ?? null, [patients, editPatientId]);
  const verifyPatient = useMemo(() => patients.find((p) => p.id === verifyPatientId) ?? null, [patients, verifyPatientId]);
  const deactivatePatient = useMemo(
    () => patients.find((p) => p.id === deactivatePatientId) ?? null,
    [patients, deactivatePatientId]
  );

  const refreshActivity = useCallback(async () => {
    try {
      setActivity((await fetchActivity(ACTIVITY_MODULE, 20)).map(toActivityEntry));
    } catch {
      // The activity panel is secondary; leave the last good list on screen.
    }
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const list = await fetchPatients();
      setPatients(list);
      setLoadError(null);
      await refreshActivity();
    } catch (err) {
      setLoadError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [refreshActivity]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([fetchPatients(), fetchActivity(ACTIVITY_MODULE, 20).catch(() => [] as AuditEvent[])])
      .then(([list, events]) => {
        if (cancelled) return;
        setPatients(list);
        setActivity(events.map(toActivityEntry));
      })
      .catch((err) => {
        if (!cancelled) setLoadError(errorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function retryLoad() {
    setLoading(true);
    setLoadError(null);
    fetchAll();
  }

  useEffect(() => {
    if (searchParams.get("openAdd") === "1") {
      setAddOpen(true);
      router.replace("/patient-registry");
    }
  }, [searchParams, router]);

  function replacePatient(updated: PatientRecord) {
    setPatients((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  }

  async function handleAddPatient(values: PatientFormValues) {
    try {
      const created = await createPatient(values);
      setPatients((prev) => [created, ...prev]);
      actionToast(
        "Patient registered",
        `${created.name} added to the Master Patient Index (${created.mrn}).` +
          (created.duplicateFlag ? " Flagged as a possible duplicate." : ""),
        created.duplicateFlag ? "warning" : "success"
      );
      setAddOpen(false);
      refreshActivity();
    } catch (err) {
      actionToast("Couldn't register patient", errorMessage(err), "error");
    }
  }

  async function handleEditSubmit(id: string, values: PatientEditValues) {
    try {
      const updated = await updatePatient(id, values);
      replacePatient(updated);
      actionToast("Changes saved", `${updated.mrn} demographics were updated.`, "success");
      setEditPatientId(null);
      refreshActivity();
    } catch (err) {
      actionToast("Couldn't save changes", errorMessage(err), "error");
    }
  }

  async function handleVerifyConfirm() {
    if (!verifyPatient) return;
    try {
      const updated = await verifyNhis(verifyPatient.id);
      replacePatient(updated);
      actionToast("NHIS verified", `${updated.name} (${updated.mrn}) now shows active NHIS coverage.`, "success");
      setVerifyPatientId(null);
      refreshActivity();
    } catch (err) {
      actionToast("Couldn't verify NHIS", errorMessage(err), "error");
    }
  }

  async function handleDeactivateConfirm() {
    if (!deactivatePatient) return;
    try {
      const updated = await deactivatePatientApi(deactivatePatient.id);
      replacePatient(updated);
      actionToast("Record deactivated", `${updated.name} (${updated.mrn}) removed from the active index.`, "warning");
      setDeactivatePatientId(null);
      refreshActivity();
    } catch (err) {
      actionToast("Couldn't deactivate record", errorMessage(err), "error");
    }
  }

  if (loading && patients.length === 0) {
    return (
      <div>
        <RegistryHeader onNewRegistration={() => setAddOpen(true)} />
        <div className="mt-10">
          <SystemLoader title="Loading patients" subtitle="Fetching the master patient index…" />
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div>
        <RegistryHeader onNewRegistration={() => setAddOpen(true)} />
        <div className="mt-6 rounded-xl border border-red-200 bg-status-red-bg p-5 text-sm text-status-red">
          <p className="font-semibold">Couldn&apos;t load the patient registry.</p>
          <p className="mt-1">{loadError}</p>
          <button
            onClick={retryLoad}
            className="mt-3 rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-status-red shadow-sm hover:bg-red-50"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <RegistryHeader onNewRegistration={() => setAddOpen(true)} />
      <RegistryKpis patients={patients} />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <PatientIndexTable
          patients={patients}
          onView={setViewPatientId}
          onEdit={setEditPatientId}
          onVerifyNhis={setVerifyPatientId}
          onDeactivate={setDeactivatePatientId}
        />
        <RecentActivityPanel entries={activity} />
      </div>

      <AddPatientModal open={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleAddPatient} />

      <PatientViewModal patient={viewPatient} open={!!viewPatient} onClose={() => setViewPatientId(null)} />

      <PatientEditModal
        patient={editPatient}
        open={!!editPatient}
        onClose={() => setEditPatientId(null)}
        onSubmit={handleEditSubmit}
      />

      <ConfirmModal
        open={!!verifyPatient}
        onClose={() => setVerifyPatientId(null)}
        onConfirm={handleVerifyConfirm}
        variant="approve"
        title="Verify NHIS coverage"
        description={
          verifyPatient
            ? `Confirm that ${verifyPatient.name}'s NHIS number (${verifyPatient.nhisNumber || "not provided"}) has been validated against the NHIA registry. This will mark their coverage as Verified.`
            : ""
        }
        confirmLabel="Verify Coverage"
      />

      <ConfirmModal
        open={!!deactivatePatient}
        onClose={() => setDeactivatePatientId(null)}
        onConfirm={handleDeactivateConfirm}
        variant="delete"
        title="Deactivate patient record"
        description={
          deactivatePatient
            ? `This will deactivate ${deactivatePatient.name}'s record (${deactivatePatient.mrn}) and remove it from the active Master Patient Index. This can be reversed by an administrator.`
            : ""
        }
        confirmLabel="Deactivate Record"
      />
    </div>
  );
}
