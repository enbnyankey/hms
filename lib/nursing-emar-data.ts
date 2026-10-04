// Mock data for the Nursing & eMAR (electronic Medication Administration Record) module.

export const nursingHeader = {
  facility: "Korle-Bu Central Hospital",
  ward: "Ward A – Male Medical Ward",
  shift: "Day Shift · 07:00 – 19:00",
  date: "Fri, 25 Sep 2026",
  nurseInCharge: "Nurse-in-Charge: Abena Owusu, RGN",
};

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
      label: "Meds Due This Hour",
      value: String(counts.dueThisHour),
      note: "Across all beds",
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
      note: "Ward A · 20 beds",
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
      note: "Since 07:00 shift start",
      tone: "success",
    },
  ];
}

export type DoseStatus = "Due Now" | "Overdue" | "Given" | "Held";

export type DoseFilter = { id: string; label: string };

export const doseFilters: DoseFilter[] = [
  { id: "all", label: "All" },
  { id: "due", label: "Due Now" },
  { id: "overdue", label: "Overdue" },
  { id: "completed", label: "Completed" },
];

export type AdministrationHistoryEntry = {
  time: string;
  by: string;
  note: string;
};

export type MarDose = {
  id: string;
  patientName: string;
  mrn: string;
  bed: string;
  drug: string;
  dose: string;
  route: string;
  frequency: string;
  indication: string;
  scheduledTime: string;
  status: DoseStatus;
  prescribingDoctor: string;
  controlled: boolean;
  history: AdministrationHistoryEntry[];
  // Filled in once actioned this session
  givenAt?: string;
  givenBy?: string;
  witnessedBy?: string;
  heldReason?: string;
};

export const initialMarDoses: MarDose[] = [
  {
    id: "d1",
    patientName: "Kwabena Mensah",
    mrn: "MRN-58213",
    bed: "Ward A · Bed 03",
    drug: "Amoxicillin",
    dose: "500 mg",
    route: "PO",
    frequency: "TDS (every 8h)",
    indication: "Community-acquired pneumonia",
    scheduledTime: "08:00",
    status: "Overdue",
    prescribingDoctor: "Dr. Yaw Boateng",
    controlled: false,
    history: [
      { time: "24 Sep, 16:00", by: "Nurse Comfort Asante", note: "Given on time, tolerated well" },
      { time: "24 Sep, 08:00", by: "Nurse Abena Owusu", note: "Given on time" },
    ],
  },
  {
    id: "d2",
    patientName: "Efua Asante",
    mrn: "MRN-58244",
    bed: "Ward A · Bed 05",
    drug: "Morphine Sulfate",
    dose: "5 mg",
    route: "IV",
    frequency: "PRN (every 4h)",
    indication: "Post-operative pain, appendectomy",
    scheduledTime: "09:00",
    status: "Due Now",
    prescribingDoctor: "Dr. Nana Adjei",
    controlled: true,
    history: [{ time: "24 Sep, 21:00", by: "Nurse Comfort Asante", note: "Given, witnessed by Nurse J. Owusu" }],
  },
  {
    id: "d3",
    patientName: "Kofi Owusu",
    mrn: "MRN-58109",
    bed: "Ward A · Bed 07",
    drug: "Metformin",
    dose: "1000 mg",
    route: "PO",
    frequency: "BD (every 12h)",
    indication: "Type 2 diabetes mellitus",
    scheduledTime: "08:00",
    status: "Overdue",
    prescribingDoctor: "Dr. Yaw Boateng",
    controlled: false,
    history: [
      { time: "24 Sep, 20:00", by: "Nurse Abena Owusu", note: "Given on time" },
      { time: "24 Sep, 08:00", by: "Nurse Comfort Asante", note: "Given on time" },
    ],
  },
  {
    id: "d4",
    patientName: "Ama Darko",
    mrn: "MRN-58390",
    bed: "Ward A · Bed 09",
    drug: "Paracetamol",
    dose: "1 g",
    route: "PO",
    frequency: "QDS (every 6h)",
    indication: "Fever, malaria (confirmed)",
    scheduledTime: "10:00",
    status: "Due Now",
    prescribingDoctor: "Dr. Nana Adjei",
    controlled: false,
    history: [{ time: "25 Sep, 04:00", by: "Nurse Abena Owusu", note: "Given on time" }],
  },
  {
    id: "d5",
    patientName: "Yaw Frimpong",
    mrn: "MRN-58177",
    bed: "Ward A · Bed 11",
    drug: "Diazepam",
    dose: "5 mg",
    route: "PO",
    frequency: "Nocte",
    indication: "Alcohol withdrawal, seizure prophylaxis",
    scheduledTime: "07:30",
    status: "Held",
    prescribingDoctor: "Dr. Yaw Boateng",
    controlled: true,
    history: [{ time: "24 Sep, 22:00", by: "Nurse Comfort Asante", note: "Given, witnessed by Nurse A. Owusu" }],
    heldReason: "Patient drowsy, GCS 13 — deferred pending doctor review",
  },
  {
    id: "d6",
    patientName: "Abena Boateng",
    mrn: "MRN-58455",
    bed: "Ward A · Bed 13",
    drug: "Ceftriaxone",
    dose: "1 g",
    route: "IV",
    frequency: "OD (every 24h)",
    indication: "Urinary tract infection, sepsis workup",
    scheduledTime: "09:30",
    status: "Due Now",
    prescribingDoctor: "Dr. Nana Adjei",
    controlled: false,
    history: [{ time: "24 Sep, 09:30", by: "Nurse Abena Owusu", note: "Given on time" }],
  },
  {
    id: "d7",
    patientName: "Kwame Appiah",
    mrn: "MRN-58061",
    bed: "Ward A · Bed 15",
    drug: "Enoxaparin",
    dose: "40 mg",
    route: "SC",
    frequency: "OD (every 24h)",
    indication: "DVT prophylaxis, post-op",
    scheduledTime: "08:00",
    status: "Overdue",
    prescribingDoctor: "Dr. Yaw Boateng",
    controlled: false,
    history: [{ time: "24 Sep, 08:00", by: "Nurse Comfort Asante", note: "Given on time" }],
  },
  {
    id: "d8",
    patientName: "Akosua Sarpong",
    mrn: "MRN-58502",
    bed: "Ward A · Bed 17",
    drug: "Salbutamol Nebule",
    dose: "2.5 mg",
    route: "Inhaled",
    frequency: "QDS (every 6h)",
    indication: "Acute exacerbation of asthma",
    scheduledTime: "10:00",
    status: "Due Now",
    prescribingDoctor: "Dr. Nana Adjei",
    controlled: false,
    history: [{ time: "25 Sep, 04:00", by: "Nurse Abena Owusu", note: "Given on time, SpO2 improved to 96%" }],
  },
  {
    id: "d9",
    patientName: "Kwabena Mensah",
    mrn: "MRN-58213",
    bed: "Ward A · Bed 03",
    drug: "Paracetamol",
    dose: "1 g",
    route: "PO",
    frequency: "QDS (every 6h)",
    indication: "Fever",
    scheduledTime: "07:00",
    status: "Given",
    prescribingDoctor: "Dr. Yaw Boateng",
    controlled: false,
    givenAt: "07:05",
    givenBy: "Nurse Abena Owusu",
    history: [{ time: "25 Sep, 07:05", by: "Nurse Abena Owusu", note: "Given on time" }],
  },
  {
    id: "d10",
    patientName: "Yaw Frimpong",
    mrn: "MRN-58177",
    bed: "Ward A · Bed 11",
    drug: "Thiamine",
    dose: "100 mg",
    route: "IV",
    frequency: "OD (every 24h)",
    indication: "Alcohol withdrawal, Wernicke's prophylaxis",
    scheduledTime: "07:00",
    status: "Given",
    prescribingDoctor: "Dr. Yaw Boateng",
    controlled: false,
    givenAt: "07:10",
    givenBy: "Nurse Abena Owusu",
    history: [{ time: "25 Sep, 07:10", by: "Nurse Abena Owusu", note: "Given on time" }],
  },
];

export type VitalsReading = {
  patientName: string;
  bed: string;
  time: string;
  bp: string;
  pulse: string;
  temp: string;
  spo2: string;
  resp: string;
  overdue?: boolean;
};

export const initialVitalsReadings: VitalsReading[] = [
  { patientName: "Kwabena Mensah", bed: "Bed 03", time: "06:15", bp: "128/82", pulse: "88", temp: "38.4", spo2: "96", resp: "20" },
  { patientName: "Efua Asante", bed: "Bed 05", time: "05:50", bp: "118/76", pulse: "92", temp: "37.1", spo2: "98", resp: "18" },
  { patientName: "Kofi Owusu", bed: "Bed 07", time: "02:30", bp: "134/88", pulse: "80", temp: "36.9", spo2: "97", resp: "16", overdue: true },
  { patientName: "Ama Darko", bed: "Bed 09", time: "06:40", bp: "110/70", pulse: "104", temp: "39.2", spo2: "95", resp: "22" },
  { patientName: "Yaw Frimpong", bed: "Bed 11", time: "03:00", bp: "142/90", pulse: "96", temp: "37.4", spo2: "97", resp: "19", overdue: true },
];

export const patientRoster = Array.from(new Set(initialMarDoses.map((d) => `${d.patientName} · ${d.bed}`)));

export type HandoverNote = {
  id: string;
  nurse: string;
  time: string;
  note: string;
};

export const initialHandoverNotes: HandoverNote[] = [
  {
    id: "h1",
    nurse: "Nurse Comfort Asante",
    time: "24 Sep, 18:45",
    note: "Bed 11 (Y. Frimpong) remains drowsy post-diazepam, GCS 13 at last check — flagged to Dr. Boateng, awaiting review before next dose.",
  },
  {
    id: "h2",
    nurse: "Nurse Abena Owusu",
    time: "24 Sep, 18:30",
    note: "Bed 09 (A. Darko) spiking temps overnight, malaria RDT confirmed positive — started on antimalarial + paracetamol QDS, monitor 4-hourly.",
  },
  {
    id: "h3",
    nurse: "Nurse Joyce Owusu",
    time: "24 Sep, 06:50",
    note: "Bed 05 (E. Asante) day 1 post-appendectomy, pain well controlled on PRN morphine, tolerating oral fluids. Encourage early mobilisation.",
  },
];
