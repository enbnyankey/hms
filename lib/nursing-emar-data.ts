// View types and KPI builder for the Nursing & eMAR module.
// All data comes from the backend: see lib/nursing-api.ts.

export type EmarKpiTone = "info" | "success" | "warning" | "danger" | "neutral";

export type EmarKpi = {
  id: string;
  label: string;
  value: string;
  note: string;
  tone?: EmarKpiTone;
};

export function buildEmarKpis(counts: {
  dueThisHour: number;
  overdue: number;
  vitalsOverdue: number;
  onRoster: number;
  witnessPending: number;
  givenToday: number;
}): EmarKpi[] {
  return [
    {
      id: "due",
      label: "Meds Due Now",
      value: String(counts.dueThisHour),
      note: "Within an hour of their time",
      tone: "info",
    },
    {
      id: "overdue",
      label: "Overdue Doses",
      value: String(counts.overdue),
      note: counts.overdue > 0 ? "Needs immediate attention" : "None outstanding",
      tone: counts.overdue > 0 ? "danger" : "success",
    },
    {
      id: "vitals",
      label: "Vitals Overdue",
      value: String(counts.vitalsOverdue),
      note: "4-hourly obs cycle",
      tone: counts.vitalsOverdue > 0 ? "warning" : "success",
    },
    {
      id: "roster",
      label: "Patients on Roster",
      value: String(counts.onRoster),
      note: "Currently admitted on this ward",
      tone: "neutral",
    },
    {
      id: "witness",
      label: "Controlled-Drug Doses Pending Witness",
      value: String(counts.witnessPending),
      note: "Schedule II/III agents",
      tone: counts.witnessPending > 0 ? "warning" : "success",
    },
    {
      id: "given",
      label: "Doses Given Today",
      value: String(counts.givenToday),
      note: "Since midnight",
      tone: "success",
    },
  ];
}

export type DoseStatus = "Due Now" | "Overdue" | "Upcoming" | "PRN" | "Given" | "Held";

export type DoseFilter = { id: string; label: string };

export const doseFilters: DoseFilter[] = [
  { id: "all", label: "All" },
  { id: "due", label: "Due Now" },
  { id: "overdue", label: "Overdue" },
  { id: "upcoming", label: "Later Today" },
  { id: "prn", label: "PRN" },
  { id: "completed", label: "Completed" },
];

export type AdministrationHistoryEntry = {
  time: string;
  by: string;
  note: string;
};

export type MarDose = {
  /** Row key (administration id, or "prn:<orderId>" for a PRN order). */
  id: string;
  /** Backend dose id; null for a PRN order row (give creates a new dose). */
  administrationId: string | null;
  orderId: string;
  patientName: string;
  mrn: string;
  bed: string;
  drug: string;
  dose: string;
  route: string;
  frequency: string;
  indication: string;
  /** "12:00", or "PRN" for as-needed medicines. */
  scheduledTime: string;
  status: DoseStatus;
  prescribingDoctor: string;
  controlled: boolean;
  history: AdministrationHistoryEntry[];
  givenAt?: string;
  givenBy?: string;
  witnessedBy?: string;
  heldReason?: string;
};

export type VitalsReading = {
  admissionId: string;
  patientName: string;
  bed: string;
  /** "06:15", or "—" when nothing has been recorded yet. */
  time: string;
  bp: string;
  pulse: string;
  temp: string;
  spo2: string;
  resp: string;
  recordedBy?: string;
  overdue?: boolean;
};

export type HandoverNote = {
  id: string;
  nurse: string;
  time: string;
  note: string;
};
