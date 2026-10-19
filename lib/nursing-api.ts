// Nursing eMAR calls to the backend (/api/v1/nursing). Converts the backend's
// JSON into the view shapes the nursing-emar components use.

import { apiFetch } from "@/lib/api";
import type { DoseStatus, HandoverNote, MarDose, VitalsReading } from "@/lib/nursing-emar-data";

type DoseState = "UPCOMING" | "DUE_NOW" | "OVERDUE" | "GIVEN" | "HELD" | "PRN";

type DoseRow = {
  key: string;
  administrationId: string | null;
  orderId: string;
  patientName: string;
  mrn: string;
  bedCode: string | null;
  drug: string;
  dose: string;
  route: string;
  frequencyLabel: string;
  indication: string | null;
  prescriber: string;
  controlled: boolean;
  scheduledAt: string | null;
  state: DoseState;
  givenAt: string | null;
  givenBy: string | null;
  witnessedBy: string | null;
  heldReason: string | null;
  history: { time: string; by: string | null; note: string }[];
};

type VitalsRow = {
  admissionId: string;
  patientName: string;
  bedCode: string;
  recordedAt: string | null;
  recordedBy: string | null;
  systolic: number | null;
  diastolic: number | null;
  pulse: number | null;
  temperature: number | null;
  spo2: number | null;
  respRate: number | null;
  overdue: boolean;
};

type HandoverDto = { id: string; author: string; note: string; createdAt: string };

const STATUS: Record<DoseState, DoseStatus> = {
  UPCOMING: "Upcoming",
  DUE_NOW: "Due Now",
  OVERDUE: "Overdue",
  GIVEN: "Given",
  HELD: "Held",
  PRN: "PRN",
};

/** "14:05" from an ISO timestamp. */
export function hhmm(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

/** "24 Sep, 16:00" from an ISO timestamp. */
export function dayTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })}, ${hhmm(iso)}`;
}

function toMarDose(r: DoseRow): MarDose {
  return {
    id: r.key,
    administrationId: r.administrationId,
    orderId: r.orderId,
    patientName: r.patientName,
    mrn: r.mrn,
    bed: r.bedCode ? `Bed ${r.bedCode}` : "—",
    drug: r.drug,
    dose: r.dose,
    route: r.route,
    frequency: r.frequencyLabel,
    indication: r.indication ?? "—",
    scheduledTime: r.scheduledAt ? hhmm(r.scheduledAt) : "PRN",
    status: STATUS[r.state],
    prescribingDoctor: r.prescriber,
    controlled: r.controlled,
    history: r.history.map((h) => ({ time: dayTime(h.time), by: h.by ?? "—", note: h.note })),
    givenAt: r.givenAt ? hhmm(r.givenAt) : undefined,
    givenBy: r.givenBy ?? undefined,
    witnessedBy: r.witnessedBy ?? undefined,
    heldReason: r.heldReason ?? undefined,
  };
}

function toVitals(v: VitalsRow): VitalsReading {
  const dash = (n: number | null) => (n === null || n === undefined ? "—" : String(n));
  return {
    admissionId: v.admissionId,
    patientName: v.patientName,
    bed: `Bed ${v.bedCode}`,
    time: v.recordedAt ? hhmm(v.recordedAt) : "—",
    bp: v.systolic !== null && v.diastolic !== null ? `${v.systolic}/${v.diastolic}` : "—",
    pulse: dash(v.pulse),
    temp: v.temperature === null || v.temperature === undefined ? "—" : Number(v.temperature).toFixed(1),
    spo2: dash(v.spo2),
    resp: dash(v.respRate),
    recordedBy: v.recordedBy ?? undefined,
    overdue: v.overdue,
  };
}

export async function fetchMar(wardId: string): Promise<MarDose[]> {
  return (await apiFetch<DoseRow[]>(`/nursing/wards/${wardId}/mar`)).map(toMarDose);
}

export async function fetchVitals(wardId: string): Promise<VitalsReading[]> {
  return (await apiFetch<VitalsRow[]>(`/nursing/wards/${wardId}/vitals`)).map(toVitals);
}

export async function fetchHandover(wardId: string): Promise<HandoverNote[]> {
  return (await apiFetch<HandoverDto[]>(`/nursing/wards/${wardId}/handover`)).map((n) => ({
    id: n.id,
    nurse: n.author,
    time: dayTime(n.createdAt),
    note: n.note,
  }));
}

export type GiveValues = { givenAt: string; route: string; witnessedBy?: string };

/** Give a scheduled dose, or (for a PRN row) record a new as-needed dose. */
export function giveDose(dose: MarDose, v: GiveValues) {
  const body = { givenAt: v.givenAt, route: v.route, witnessedBy: v.witnessedBy ?? null };
  return dose.administrationId
    ? apiFetch(`/nursing/doses/${dose.administrationId}/give`, { method: "POST", body })
    : apiFetch(`/nursing/orders/${dose.orderId}/prn-dose`, { method: "POST", body });
}

export function holdDose(dose: MarDose, reason: string) {
  return apiFetch(`/nursing/doses/${dose.administrationId}/hold`, { method: "POST", body: { reason } });
}

export type VitalsInput = { systolic: number; diastolic: number; pulse: number; temperature: number; spo2: number; respRate: number };

export function recordVitals(admissionId: string, v: VitalsInput) {
  return apiFetch("/nursing/vitals", { method: "POST", body: { admissionId, ...v } });
}

export function addHandoverNote(wardId: string, note: string) {
  return apiFetch(`/nursing/wards/${wardId}/handover`, { method: "POST", body: { note } });
}
