"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import RegistryHeader from "@/components/patient-registry/RegistryHeader";
import RegistryKpis from "@/components/patient-registry/RegistryKpis";
import PatientIndexTable from "@/components/patient-registry/PatientIndexTable";
import RecentActivityPanel, { type ActivityEntry } from "@/components/patient-registry/RecentActivityPanel";
import PatientViewModal from "@/components/patient-registry/PatientViewModal";
import PatientEditModal, { type PatientEditValues } from "@/components/patient-registry/PatientEditModal";
import AddPatientModal from "@/components/patient-registry/AddPatientModal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import { actionToast } from "@/lib/actions";
import {
  patientRecords as initialPatientRecords,
  nextMrn,
  type PatientRecord,
  type PatientFormValues,
} from "@/lib/patient-registry-data";

let activityCounter = 0;
function makeActivityId() {
  activityCounter += 1;
  return `act-${activityCounter}`;
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
  const [patients, setPatients] = useState<PatientRecord[]>(initialPatientRecords);
  const [activity, setActivity] = useState<ActivityEntry[]>([
    { id: makeActivityId(), type: "register", message: "Samuel Tetteh registered as a walk-in patient.", timestamp: "Today · 08:12 AM" },
    { id: makeActivityId(), type: "register", message: "Adwoa Serwaa registered, NHIS pending verification.", timestamp: "Today · 08:40 AM" },
  ]);

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

  useEffect(() => {
    if (searchParams.get("openAdd") === "1") {
      setAddOpen(true);
      router.replace("/patient-registry");
    }
  }, [searchParams, router]);

  function pushActivity(type: ActivityEntry["type"], message: string) {
    setActivity((prev) => [{ id: makeActivityId(), type, message, timestamp: "Just now" }, ...prev].slice(0, 20));
  }

  function handleAddPatient(values: PatientFormValues) {
    const mrn = nextMrn();
    const newPatient: PatientRecord = {
      id: `p-${mrn}`,
      mrn,
      name: values.name.trim(),
      age: Number(values.age) || 0,
      sex: (values.sex || "Male") as "Male" | "Female",
      phone: values.phone.trim(),
      address: values.address.trim(),
      dob: values.dob.trim() || "Not recorded",
      nextOfKinName: values.nextOfKinName.trim(),
      nextOfKinPhone: values.nextOfKinPhone.trim(),
      nhisNumber: values.nhisNumber.trim(),
      nhisStatus: values.nhisNumber.trim() ? (values.walkIn ? "Pending" : "Verified") : values.walkIn ? "Pending" : "Not Enrolled",
      bloodGroup: values.bloodGroup || "Unknown",
      allergies: values.allergies.trim() || "None recorded",
      category: values.walkIn ? "Walk-in" : "Outpatient",
      lastVisit: "25 Sep 2026",
      registeredBy: "Nadine Yankey",
      registeredOn: "25 Sep 2026",
      status: "Active",
      duplicateFlag: false,
    };
    setPatients((prev) => [newPatient, ...prev]);
    pushActivity("register", `${newPatient.name} registered with MRN ${mrn}.`);
    actionToast("Patient registered", `${newPatient.name} added to the Master Patient Index (${mrn}).`, "success");
    setAddOpen(false);
  }

  function handleEditSubmit(id: string, values: PatientEditValues) {
    setPatients((prev) => prev.map((p) => (p.id === id ? { ...p, ...values } : p)));
    const patient = patients.find((p) => p.id === id);
    pushActivity("edit", `${values.name} demographics updated.`);
    actionToast("Changes saved", patient ? `${patient.mrn} demographics were updated.` : undefined, "success");
    setEditPatientId(null);
  }

  function handleVerifyConfirm() {
    if (!verifyPatient) return;
    setPatients((prev) =>
      prev.map((p) => (p.id === verifyPatient.id ? { ...p, nhisStatus: "Verified" } : p))
    );
    pushActivity("verify", `${verifyPatient.name}'s NHIS coverage verified.`);
    actionToast("NHIS verified", `${verifyPatient.name} (${verifyPatient.mrn}) now shows active NHIS coverage.`, "success");
    setVerifyPatientId(null);
  }

  function handleDeactivateConfirm() {
    if (!deactivatePatient) return;
    setPatients((prev) =>
      prev.map((p) => (p.id === deactivatePatient.id ? { ...p, status: "Inactive" } : p))
    );
    pushActivity("deactivate", `${deactivatePatient.name}'s record was deactivated.`);
    actionToast("Record deactivated", `${deactivatePatient.name} (${deactivatePatient.mrn}) removed from the active index.`, "warning");
    setDeactivatePatientId(null);
  }

  return (
    <div>
      <RegistryHeader onNewRegistration={() => setAddOpen(true)} />
      <RegistryKpis patients={patients} />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_340px]">
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
