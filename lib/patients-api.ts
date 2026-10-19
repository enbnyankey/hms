// Patient Registry calls to the backend (/api/v1/patients). Converts the
// backend's JSON into the PatientRecord shape the registry components use.

import { apiFetch, type Page } from "@/lib/api";
import type {
  NhisStatus,
  PatientCategory,
  PatientFormValues,
  PatientRecord,
  PatientRecordStatus,
} from "@/lib/patient-registry-data";

type PatientDto = {
  id: string;
  mrn: string;
  name: string;
  age: number;
  sex: "Male" | "Female";
  phone: string | null;
  address: string | null;
  dob: string | null;
  nextOfKinName: string | null;
  nextOfKinPhone: string | null;
  nhisNumber: string | null;
  nhisStatus: NhisStatus;
  bloodGroup: string | null;
  allergies: string | null;
  category: PatientCategory;
  lastVisit: string | null;
  registeredBy: string | null;
  registeredOn: string | null;
  status: PatientRecordStatus;
  duplicateFlag: boolean;
};

export function toPatientRecord(p: PatientDto): PatientRecord {
  return {
    id: p.id,
    mrn: p.mrn,
    name: p.name,
    age: p.age,
    sex: p.sex,
    phone: p.phone ?? "",
    address: p.address ?? "",
    dob: p.dob ?? "Not recorded",
    nextOfKinName: p.nextOfKinName ?? "",
    nextOfKinPhone: p.nextOfKinPhone ?? "",
    nhisNumber: p.nhisNumber ?? "",
    nhisStatus: p.nhisStatus,
    bloodGroup: p.bloodGroup ?? "Unknown",
    allergies: p.allergies ?? "None recorded",
    category: p.category,
    lastVisit: p.lastVisit ?? "—",
    registeredBy: p.registeredBy ?? "—",
    registeredOn: p.registeredOn ?? "—",
    status: p.status,
    duplicateFlag: p.duplicateFlag,
  };
}

/** Every patient, newest registration first. */
export async function fetchPatients(): Promise<PatientRecord[]> {
  const page = await apiFetch<Page<PatientDto>>("/patients?size=1000");
  return page.content.map(toPatientRecord);
}

export async function createPatient(values: PatientFormValues): Promise<PatientRecord> {
  const dto = await apiFetch<PatientDto>("/patients", {
    method: "POST",
    body: {
      name: values.name.trim(),
      dob: values.dob.trim() || null,
      age: values.age.trim() || null,
      sex: values.sex || "Male",
      phone: values.phone,
      address: values.address,
      nextOfKinName: values.nextOfKinName,
      nextOfKinPhone: values.nextOfKinPhone,
      nhisNumber: values.nhisNumber,
      bloodGroup: values.bloodGroup,
      allergies: values.allergies,
      category: values.walkIn ? "Walk-in" : "Outpatient",
    },
  });
  return toPatientRecord(dto);
}

export type PatientUpdate = {
  name: string;
  phone: string;
  address: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nhisNumber: string;
  bloodGroup: string;
  allergies: string;
};

export async function updatePatient(id: string, values: PatientUpdate): Promise<PatientRecord> {
  // "Unknown" is only a display placeholder; don't save it as a blood group.
  const body = { ...values, bloodGroup: values.bloodGroup === "Unknown" ? "" : values.bloodGroup };
  return toPatientRecord(await apiFetch<PatientDto>(`/patients/${id}`, { method: "PUT", body }));
}

export async function verifyNhis(id: string): Promise<PatientRecord> {
  return toPatientRecord(await apiFetch<PatientDto>(`/patients/${id}/verify-nhis`, { method: "POST" }));
}

export async function deactivatePatient(id: string): Promise<PatientRecord> {
  return toPatientRecord(await apiFetch<PatientDto>(`/patients/${id}/deactivate`, { method: "POST" }));
}
