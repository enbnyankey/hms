// Ward & Bed Manager calls to the backend (/api/v1/wards, /beds, /admissions,
// /admission-requests). Types mirror hms-backend's WardDtos.java.

import { apiFetch, type Page } from "@/lib/api";

export type BedStatus = "AVAILABLE" | "OCCUPIED" | "RESERVED" | "CLEANING" | "MAINTENANCE";
export type AdmissionStatus = "ACTIVE" | "DISCHARGE_READY" | "DISCHARGED";
export type Urgency = "CRITICAL" | "URGENT" | "ROUTINE";

export type BedCounts = {
  total: number;
  occupied: number;
  available: number;
  reserved: number;
  cleaning: number;
  maintenance: number;
  occupancyPct: number;
};

export type Ward = {
  id: string;
  code: string;
  name: string;
  shortName: string;
  location: string | null;
  chargeNurse: string | null;
  nursesOnDuty: number;
  beds: BedCounts;
  dischargeReady: number;
  expectedAdmissions: number;
  isolationInUse: number;
};

export type Census = {
  beds: BedCounts;
  wards: number;
  dischargeReady: number;
  pendingRequests: number;
  isolationInUse: number;
};

export type Occupant = {
  admissionId: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  sex: "Male" | "Female" | null;
  diagnosis: string;
  attending: string | null;
  notes: string | null;
  admittedAt: string;
  dayOfStay: number;
  admissionStatus: AdmissionStatus;
};

export type Bed = {
  id: string;
  code: string;
  wardId: string;
  wardCode: string;
  room: string | null;
  status: BedStatus;
  isolation: boolean;
  statusNote: string | null;
  statusChangedAt: string;
  occupant: Occupant | null;
};

export type QueueRequest = {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  sex: "Male" | "Female" | null;
  nhisNumber: string | null;
  source: string;
  urgency: Urgency;
  diagnosis: string;
  notes: string | null;
  preferredWardCode: string | null;
  suggestedBedId: string | null;
  suggestedBedCode: string | null;
  status: "PENDING" | "ADMITTED" | "CANCELLED";
  requestedAt: string;
  waitingMinutes: number;
  admissionId: string | null;
};

export type PatientOption = { id: string; mrn: string; name: string; age: number; sex: "Male" | "Female"; status: string };

/** "62M" style age/sex label used on the ward board. */
export function ageSex(age: number, sex: string | null): string {
  return `${age}${sex ? sex[0] : ""}`;
}

/** "28h ago", "5d ago", "12m ago". */
export function timeAgo(iso: string): string {
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

/** "1h 15m" */
export function formatWait(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export const fetchCensus = () => apiFetch<Census>("/wards/census");
export const fetchWards = () => apiFetch<Ward[]>("/wards");
export const fetchBeds = () => apiFetch<Bed[]>("/beds");
export const fetchQueue = () => apiFetch<QueueRequest[]>("/admission-requests");

export async function searchPatients(query: string): Promise<PatientOption[]> {
  const page = await apiFetch<Page<PatientOption>>(`/patients?search=${encodeURIComponent(query)}&size=8`);
  return page.content.filter((p) => p.status === "Active");
}

export function admitPatient(body: {
  patientId: string;
  bedId: string;
  diagnosis: string;
  attending?: string;
  notes?: string;
  admissionRequestId?: string;
}) {
  return apiFetch("/admissions", { method: "POST", body });
}

export function updateAdmission(id: string, body: { diagnosis: string; attending?: string; notes?: string }) {
  return apiFetch(`/admissions/${id}`, { method: "PUT", body });
}

export const markDischargeReady = (id: string) => apiFetch(`/admissions/${id}/discharge-ready`, { method: "POST" });

export const dischargeAdmission = (id: string, notes?: string) =>
  apiFetch(`/admissions/${id}/discharge`, { method: "POST", body: { notes: notes ?? null } });

export const transferAdmission = (id: string, toBedId: string, reason?: string) =>
  apiFetch(`/admissions/${id}/transfer`, { method: "POST", body: { toBedId, reason: reason ?? null } });

export const setBedStatus = (bedId: string, status: BedStatus, note?: string) =>
  apiFetch(`/beds/${bedId}/status`, { method: "PATCH", body: { status, note: note ?? null } });

export const setBedIsolation = (bedId: string, isolation: boolean) =>
  apiFetch(`/beds/${bedId}/isolation`, { method: "PATCH", body: { isolation } });

export const cancelQueueRequest = (id: string, reason?: string) =>
  apiFetch(`/admission-requests/${id}/cancel`, { method: "POST", body: { reason: reason ?? null } });

export const setWardStaffing = (wardId: string, nursesOnDuty: number) =>
  apiFetch(`/wards/${wardId}/staffing`, { method: "PATCH", body: { nursesOnDuty } });
