// View types for the Laboratory & Diagnostic Hub.
// All data comes from the backend: see lib/lab-api.ts.

export type QueueTabId = "all" | "receive" | "stat" | "chem";
export type QueueTab = { id: QueueTabId; label: string };

export const queueTabs: QueueTab[] = [
  { id: "all", label: "All" },
  { id: "receive", label: "Receive" },
  { id: "stat", label: "STAT" },
  { id: "chem", label: "Chemistry" },
];

export type SpecimenStatus =
  | "Awaiting Specimen"
  | "In Analysis"
  | "Verification"
  | "Critical Call"
  | "Validated"
  | "Rejected"
  | "Cancelled";

export type StatusTone = "blue" | "red" | "amber" | "slate" | "green";

export const STATUS_TONE: Record<SpecimenStatus, StatusTone> = {
  "Awaiting Specimen": "slate",
  "In Analysis": "blue",
  Verification: "amber",
  "Critical Call": "red",
  Validated: "green",
  Rejected: "red",
  Cancelled: "slate",
};

export type SpecimenCategory = "stat" | "chem" | "other";

export type ClinicalFlagTone = "normal" | "high" | "low" | "critical";

export type AnalyteRow = {
  id: string;
  name: string;
  value: string;
  unit: string;
  range: string;
  flag: string;
  flagTone: ClinicalFlagTone;
};

export type Signoff = {
  timestamp: string;
  note: string;
};

export type SpecimenItem = {
  /** Lab order id. */
  id: string;
  specId: string;
  specType: string;
  status: SpecimenStatus;
  statusTone: StatusTone;
  category: SpecimenCategory;
  urgent?: boolean;
  priority: "ROUTINE" | "URGENT" | "STAT";
  patientId: string;
  patient: string;
  age: string;
  sex: string;
  mrn: string;
  location: string;
  consultant: string;
  collection: string;
  analyzer: string;
  detail: string;
  containerDot: string;
  container: string;
  testCode: string;
  testOrder: string;
  clinicalNotes: string;
  analytes: AnalyteRow[];
  signoff?: Signoff;
  rejectReason?: string;
  repeatCount: number;
  /** Backend workflow state. */
  backendStatus: "ORDERED" | "RECEIVED" | "RESULTED" | "VALIDATED" | "REJECTED" | "CANCELLED";
  hasCritical: boolean;
  criticalPending: boolean;
  criticalCalls: { id: string; calledTo: string; readBackConfirmed: boolean; calledBy: string; calledAt: string }[];
};

export const CONTAINER_DOT: Record<string, string> = {
  CHM: "bg-amber-400",
  HEM: "bg-purple-500",
  MB: "bg-status-green",
  COAG: "bg-blue-400",
  URN: "bg-slate-400",
};
