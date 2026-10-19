// Laboratory calls to the backend (/api/v1/lab).

import { apiFetch } from "@/lib/api";
import { CONTAINER_DOT, STATUS_TONE, type ClinicalFlagTone, type SpecimenItem, type SpecimenStatus } from "@/lib/lab-data";

type Flag = "NORMAL" | "LOW" | "HIGH" | "CRITICAL_LOW" | "CRITICAL_HIGH" | "ABNORMAL";

export type LabOrderDto = {
  id: string;
  specimenNo: string | null;
  patientId: string;
  patientName: string;
  mrn: string;
  age: number;
  sex: string | null;
  location: string;
  testCode: string;
  testName: string;
  specimenType: string;
  container: string;
  priority: "ROUTINE" | "URGENT" | "STAT";
  status: SpecimenItem["backendStatus"];
  clinicalNotes: string | null;
  orderedBy: string;
  orderedAt: string;
  receivedBy: string | null;
  receivedAt: string | null;
  analyzer: string | null;
  resultedBy: string | null;
  resultedAt: string | null;
  validatedBy: string | null;
  validatedAt: string | null;
  rejectReason: string | null;
  repeatCount: number;
  results: { code: string; name: string; value: string; unit: string | null; referenceRange: string; flag: Flag }[];
  hasCritical: boolean;
  criticalPending: boolean;
  criticalCalls: SpecimenItem["criticalCalls"];
};

export type LabTestDto = {
  code: string;
  name: string;
  specimenType: string;
  container: string;
  analytes: { code: string; name: string; unit: string | null; referenceRange: string; textResult: boolean }[];
};

export type LabSummary = {
  awaitingAccession: number;
  inAnalysis: number;
  awaitingValidation: number;
  criticalPending: number;
  statTatCompliancePct: number | null;
  statAvgTatMinutes: number | null;
  statValidatedToday: number;
};

export type Analyzer = {
  id: string;
  name: string;
  description: string | null;
  status: "ONLINE" | "MAINTENANCE" | "OFFLINE";
  note: string | null;
  updatedAt: string;
};

export type QcRun = {
  id: string;
  analyzer: string;
  analyte: string;
  level: string;
  targetMean: number;
  targetSd: number;
  result: number;
  zScore: number;
  inControl: boolean;
  runBy: string;
  runAt: string;
};

const FLAG_LABEL: Record<Flag, [string, ClinicalFlagTone]> = {
  NORMAL: ["Normal", "normal"],
  LOW: ["Low", "low"],
  HIGH: ["High", "high"],
  CRITICAL_LOW: ["Critical Low", "critical"],
  CRITICAL_HIGH: ["Critical High", "critical"],
  ABNORMAL: ["Abnormal", "high"],
};

export function clock(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export function dayClock(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${d.toLocaleString("en-GB", { month: "short" })} ${clock(iso)}`;
}

function statusLabel(o: LabOrderDto): SpecimenStatus {
  switch (o.status) {
    case "ORDERED":
      return "Awaiting Specimen";
    case "RECEIVED":
      return "In Analysis";
    case "RESULTED":
      return o.criticalPending ? "Critical Call" : "Verification";
    case "VALIDATED":
      return "Validated";
    case "REJECTED":
      return "Rejected";
    default:
      return "Cancelled";
  }
}

export function toSpecimen(o: LabOrderDto): SpecimenItem {
  const status = statusLabel(o);
  const sexLetter = o.sex ? o.sex[0] : "";
  return {
    id: o.id,
    specId: o.specimenNo ?? "Not yet received",
    specType: o.specimenType,
    status,
    statusTone: STATUS_TONE[status],
    category: o.priority === "STAT" ? "stat" : o.specimenType === "CHM" ? "chem" : "other",
    urgent: o.priority === "STAT",
    priority: o.priority,
    patientId: o.patientId,
    patient: o.patientName,
    age: `${o.age} yrs`,
    sex: o.sex ?? "—",
    mrn: o.mrn,
    location: o.location,
    consultant: o.orderedBy,
    collection: o.receivedAt ? `${clock(o.receivedAt)} by ${o.receivedBy ?? "—"}` : `Ordered ${clock(o.orderedAt)}`,
    analyzer: o.analyzer ?? "—",
    detail: `${o.age}${sexLetter} · ${o.mrn} · ${o.location}`,
    containerDot: CONTAINER_DOT[o.specimenType] ?? "bg-slate-400",
    container: o.container,
    testCode: o.testCode,
    testOrder: o.testName + (o.priority !== "ROUTINE" ? ` · ${o.priority}` : ""),
    clinicalNotes: o.clinicalNotes ?? "",
    analytes: o.results.map((r) => ({
      id: r.code,
      name: r.name,
      value: r.value,
      unit: r.unit ?? "",
      range: r.referenceRange,
      flag: FLAG_LABEL[r.flag][0],
      flagTone: FLAG_LABEL[r.flag][1],
    })),
    signoff: o.validatedAt
      ? { timestamp: dayClock(o.validatedAt), note: `Validated and released by ${o.validatedBy}. Results entered by ${o.resultedBy ?? "—"}.` }
      : undefined,
    rejectReason: o.rejectReason ?? undefined,
    repeatCount: o.repeatCount,
    backendStatus: o.status,
    hasCritical: o.hasCritical,
    criticalPending: o.criticalPending,
    criticalCalls: o.criticalCalls,
  };
}

export const fetchWorklist = async () => (await apiFetch<LabOrderDto[]>("/lab/worklist")).map(toSpecimen);
export const fetchLabSummary = () => apiFetch<LabSummary>("/lab/summary");
export const fetchLabTests = () => apiFetch<LabTestDto[]>("/lab/tests");
export const fetchAnalyzers = () => apiFetch<Analyzer[]>("/lab/analyzers");
export const fetchQcRuns = () => apiFetch<QcRun[]>("/lab/qc");
export const fetchPatientLabHistory = async (patientId: string) =>
  (await apiFetch<LabOrderDto[]>(`/lab/patients/${patientId}/orders`)).map(toSpecimen);

export const createLabOrder = (body: { patientId: string; testCode: string; priority: string; clinicalNotes?: string }) =>
  apiFetch<LabOrderDto>("/lab/orders", { method: "POST", body });
export const receiveSpecimen = (id: string, analyzerId?: string) =>
  apiFetch<LabOrderDto>(`/lab/orders/${id}/receive`, { method: "POST", body: { analyzerId: analyzerId || null } });
export const enterResults = (id: string, results: { code: string; value: string }[]) =>
  apiFetch(`/lab/orders/${id}/results`, { method: "PUT", body: { results } });
export const validateResult = (id: string) => apiFetch(`/lab/orders/${id}/validate`, { method: "POST" });
export const validateBatch = (orderIds: string[]) =>
  apiFetch<{ validated: number; skipped: string[] }>("/lab/orders/validate-batch", { method: "POST", body: { orderIds } });
export const rejectSpecimen = (id: string, reason: string) => apiFetch(`/lab/orders/${id}/reject`, { method: "POST", body: { reason } });
export const repeatTest = (id: string, reason: string) => apiFetch(`/lab/orders/${id}/repeat`, { method: "POST", body: { reason } });
export const recordCriticalCall = (id: string, calledTo: string, readBackConfirmed: boolean) =>
  apiFetch(`/lab/orders/${id}/critical-call`, { method: "POST", body: { calledTo, readBackConfirmed } });
export const updateAnalyzer = (id: string, status: Analyzer["status"], note?: string) =>
  apiFetch(`/lab/analyzers/${id}`, { method: "PATCH", body: { status, note: note ?? null } });
export const recordQcRun = (body: { analyzerId: string; analyte: string; level: string; targetMean: number; targetSd: number; result: number }) =>
  apiFetch<QcRun>("/lab/qc", { method: "POST", body });
