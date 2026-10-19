// View types and KPI builders for the Ward & Bed Matrix Manager.
// All bed, ward and admission data comes from the backend: see lib/ward-api.ts.

import type { Census } from "@/lib/ward-api";

export type CensusKpiView = {
  id: string;
  label: string;
  value: string;
  note: string;
  tone?: "info" | "success" | "warning" | "neutral";
};

export function buildCensusKpis(c: Census): CensusKpiView[] {
  const pct = (n: number) => (c.beds.total ? ((n / c.beds.total) * 100).toFixed(1) : "0.0");
  return [
    { id: "capacity", label: "Total Inpatient Capacity", value: String(c.beds.total), note: `${c.wards} Wards` },
    {
      id: "occupied",
      label: "Occupied Beds",
      value: `${c.beds.occupancyPct}%`,
      note: `${c.beds.occupied} Active Patients`,
      tone: "info",
    },
    { id: "clean", label: "Available Clean", value: String(c.beds.available), note: "Admit Ready", tone: "success" },
    {
      id: "reserved",
      label: "Reserved / Transfer",
      value: String(c.beds.reserved),
      note: `${pct(c.beds.reserved)}% · ${c.pendingRequests} waiting for a bed`,
      tone: "warning",
    },
    {
      id: "sanitizing",
      label: "Sanitizing / Maint.",
      value: String(c.beds.cleaning + c.beds.maintenance),
      note: `${c.beds.cleaning} cleaning · ${c.beds.maintenance} out of service`,
      tone: "neutral",
    },
  ];
}

// Admissions queue card (components/ward-bed-manager/AdmissionsQueue.tsx).
export type QueueUrgency = "critical" | "warning" | "neutral";

export type AdmissionRequest = {
  id: string;
  source: string;
  wait: string;
  urgency: QueueUrgency;
  patient: string;
  demo: string;
  location: string;
  dx: string;
  note: string;
  suggestedBed: string;
  /** Backend bed id of the suggestion, used to preselect it. */
  suggestedBedId?: string;
  actionLabel: string;
};
