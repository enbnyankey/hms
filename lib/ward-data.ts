// Mock data for the Ward & Bed Matrix Manager.

export type CensusKpiView = {
  id: string;
  label: string;
  value: string;
  note: string;
  tone?: "info" | "success" | "warning" | "neutral";
};

export const censusKpis: CensusKpiView[] = [
  { id: "capacity", label: "Total Inpatient Capacity", value: "280", note: "5 Pavilion Wards" },
  { id: "occupied", label: "Occupied Beds", value: "84.6%", note: "237 Active Patients", tone: "info" as const },
  { id: "clean", label: "Available Clean", value: "28", note: "Admit Ready", tone: "success" as const },
  { id: "reserved", label: "Reserved / Transfer", value: "9", note: "3.2% · Theater & Triage", tone: "warning" as const },
  { id: "sanitizing", label: "Sanitizing / Maint.", value: "6", note: "2.1% · Avg turn: 20m", tone: "neutral" as const },
];

// Baseline pavilion-wide bed counts. Ward actions (admit/discharge/transfer)
// nudge these so the KPI strip reflects real interactions in this session.
export type CensusCounts = {
  total: number;
  occupied: number;
  availableClean: number;
  reserved: number;
  sanitizing: number;
};

export const initialCensusCounts: CensusCounts = {
  total: 280,
  occupied: 237,
  availableClean: 28,
  reserved: 9,
  sanitizing: 6,
};

export function buildCensusKpis(counts: CensusCounts): CensusKpiView[] {
  const occupiedPct = ((counts.occupied / counts.total) * 100).toFixed(1);
  const reservedPct = ((counts.reserved / counts.total) * 100).toFixed(1);
  const sanitizingPct = ((counts.sanitizing / counts.total) * 100).toFixed(1);
  return [
    { id: "capacity", label: "Total Inpatient Capacity", value: String(counts.total), note: "5 Pavilion Wards" },
    {
      id: "occupied",
      label: "Occupied Beds",
      value: `${occupiedPct}%`,
      note: `${counts.occupied} Active Patients`,
      tone: "info",
    },
    { id: "clean", label: "Available Clean", value: String(counts.availableClean), note: "Admit Ready", tone: "success" },
    {
      id: "reserved",
      label: "Reserved / Transfer",
      value: String(counts.reserved),
      note: `${reservedPct}% · Theater & Triage`,
      tone: "warning",
    },
    {
      id: "sanitizing",
      label: "Sanitizing / Maint.",
      value: String(counts.sanitizing),
      note: `${sanitizingPct}% · Avg turn: 20m`,
      tone: "neutral",
    },
  ];
}

export type WardFilter = { id: string; label: string; count: number; active?: boolean };

export const wardFilters: WardFilter[] = [
  { id: "all", label: "All Wards", count: 280, active: true },
  { id: "icu", label: "Ward E · ICU", count: 12 },
  { id: "male-med", label: "Ward A · Male Med", count: 64 },
  { id: "fem-surg", label: "Ward B · Fem Surg", count: 58 },
  { id: "peds", label: "Ward C · Peds", count: 48 },
  { id: "maternity", label: "Ward D · Maternity", count: 100 },
];

// A ward-filter id maps to which rendered ward section(s) it corresponds to.
// "peds" and "maternity" have no modeled bed data yet, so they resolve to an
// empty view (used to drive the empty-state UI).
export type WardKey = "icu" | "male" | "female";

export const wardFilterToKey: Record<string, WardKey | null> = {
  all: null, // null = no restriction, show every modeled ward
  icu: "icu",
  "male-med": "male",
  "fem-surg": "female",
  peds: null,
  maternity: null,
};

// Ward-filter ids that have no modeled bed data (used for the empty state).
export const unmodeledWardFilterIds = new Set(["peds", "maternity"]);

// Shared shape used by every Admit / Edit patient-in-bed form across wards.
export type PatientFormValues = {
  name: string;
  demo: string;
  mrn: string;
  dx: string;
  note: string;
};

export const emptyPatientForm: PatientFormValues = { name: "", demo: "", mrn: "", dx: "", note: "" };

// --- Ward E: Intensive Care Unit -------------------------------------------------

export const icuWard = {
  name: "Ward E – Intensive Care Unit (ICU)",
  location: "Floor 2, West Wing",
  chargeNurse: "Sister Grace Mensah, RN",
  occupancy: "10/12 Beds Occupied (83%)",
  nurseRatio: "1:2",
  o2Pressure: "98.4 PSI",
};

export type IcuBedStatus = "occupied" | "alert" | "ready" | "reserved";

export type IcuBed = {
  id: string;
  status: IcuBedStatus;
  statusLabel: string;
  patient?: {
    name: string;
    demo: string;
    mrn: string;
  };
  dx?: string;
  attending?: string;
  extraNote?: string;
  vitals?: { label: string; value: string }[];
  meta?: string;
  actionLabel?: string;
  actionTone?: "danger" | "primary";
  readyDetail?: { title: string; lines: string[]; note: string };
  isolation?: boolean;
};

export const icuBeds: IcuBed[] = [
  {
    id: "E-01",
    status: "occupied",
    statusLabel: "Occupied",
    patient: { name: "Kofi Asante", demo: "62M", mrn: "MRN-88219" },
    dx: "Post-CABG Day 1",
    attending: "Attending: Dr. Kobina Asadu",
    vitals: [
      { label: "HR", value: "78" },
      { label: "BP", value: "124/82" },
      { label: "SpO2", value: "99%" },
    ],
    meta: "Admitted: 28h ago",
  },
  {
    id: "E-02",
    status: "alert",
    statusLabel: "Sepsis Protocol",
    patient: { name: "Akua Darko", demo: "45F", mrn: "MRN-90142" },
    dx: "Urosepsis / Septic Shock",
    attending: "Attending: Dr. E. Boateng · Sr. Cynthia",
    vitals: [
      { label: "Temp", value: "39.1°C" },
      { label: "HR/BP", value: "88/54" },
      { label: "Lactate", value: "3.8" },
    ],
    meta: "Blood Culture STAT",
    actionLabel: "Alert MD",
    actionTone: "danger",
    isolation: true,
  },
  {
    id: "E-03",
    status: "ready",
    statusLabel: "Ready Admit",
    readyDetail: {
      title: "Terminal Clean Verified",
      lines: ["Sterilized 14:15 · Nurse Grace", "Ventilator Check: OK", "Isolation: Negative"],
      note: "Idle: 42 mins",
    },
    actionLabel: "Assign Now",
    actionTone: "primary",
  },
  {
    id: "E-04",
    status: "reserved",
    statusLabel: "Reserved",
    patient: { name: "Kwame Appiah (58M)", demo: "", mrn: "" },
    dx: "Aortic Valve Replacement, in PACU recovery",
    extraNote: "Expected ETA 25 mins",
    meta: "Bed config: Cardiac Level 1 · Hold: 45 min left",
    actionLabel: "View PACU",
  },
];

// --- Ward A: Male Medical Ward ----------------------------------------------------

export const maleWard = {
  name: "Ward A – Male Medical Ward",
  location: "Floor 1, Block C",
  chargeNurse: "Brother Samuel Tetteh, RN",
  bedsTotal: "64 Beds Total",
  dayShiftStaff: "Day Shift Staff: 11 RNs",
  ratio: "Ratio 1:5.8",
  occupancy: "56/64 (87.5%)",
};

export type WardBedStatus = "occupied" | "discharge" | "sanitizing" | "ready";

export type WardBed = {
  id: string;
  status: WardBedStatus;
  statusLabel: string;
  patient?: { name: string; demo: string; mrn: string; day: string };
  dx?: string;
  consultant?: string;
  note?: string;
  meta?: string;
  actionLabel?: string;
  housekeeping?: { title: string; lines: string[]; timer: string; staff: string };
  readyDetail?: { title: string; lines: string[]; note: string };
  isolation?: boolean;
};

export type Cubicle = {
  id: string;
  title: string;
  subtitle: string;
  beds: WardBed[];
};

export const maleCubicles: Cubicle[] = [
  {
    id: "room101",
    title: "Cubicle / Room 101 — Acute Respiratory & Infectious Care",
    subtitle: "4 Beds (3 Occupied, 1 Sanitizing)",
    beds: [
      {
        id: "A-101-A",
        status: "occupied",
        statusLabel: "Occupied",
        patient: { name: "Kwabena Opoku", demo: "56M", mrn: "MRN-74328", day: "Day 6" },
        dx: "Community-Acquired Pneumonia",
        consultant: "Consultant: Dr. K. Frimpong",
        note: "O2 2L/min · Cefotaxime IV",
        meta: "Meds Due: 15:00",
        isolation: true,
      },
      {
        id: "A-101-B",
        status: "occupied",
        statusLabel: "Occupied",
        patient: { name: "Joseph Nunoo", demo: "60M", mrn: "MRN-65021", day: "Day 2" },
        dx: "Hypertensive Crisis w/ Encephalopathy",
        consultant: "Consultant: Dr. Agyeman",
        note: "Labetalol Infusion",
        meta: "BP 148/94 (improving)",
      },
      {
        id: "A-101-C",
        status: "discharge",
        statusLabel: "Discharge Ready",
        patient: { name: "Francis Baah", demo: "59M", mrn: "MRN-83391", day: "Day 6" },
        dx: "Uncomplicated Malaria & Gastroenteritis",
        note: "Pharmacy Bill: Cleared · NHIS Approved",
        meta: "Awaiting family transport pickup. Bed clearance initiated.",
        actionLabel: "Finalize Exit",
      },
      {
        id: "A-101-D",
        status: "sanitizing",
        statusLabel: "Sanitizing",
        housekeeping: {
          title: "Housekeeping Cleaning",
          lines: ["Linen swap & UV sanitization"],
          timer: "Timer: 14 mins remaining",
          staff: "Housekeeper: Joe Mensah · Fast-Track",
        },
      },
    ],
  },
  {
    id: "room102",
    title: "Cubicle / Room 102 — General Cardiology & Stroke Step-Down",
    subtitle: "4 Beds (All Occupied)",
    beds: [
      {
        id: "A-102-A",
        status: "occupied",
        statusLabel: "Occupied",
        patient: { name: "Nana Kwaku Adjei", demo: "71M", mrn: "MRN-51299", day: "Day 5" },
        dx: "Ischemic CVA (Right Hemiparesis)",
        meta: "Physio at 14:00",
      },
      {
        id: "A-102-B",
        status: "occupied",
        statusLabel: "Occupied",
        patient: { name: "Bernard Appiah", demo: "64M", mrn: "MRN-39186", day: "Day 1" },
        dx: "Acute Decompensated Heart Failure",
        meta: "Strict Fluid Chart",
      },
      {
        id: "A-102-C",
        status: "ready",
        statusLabel: "Ready Admit",
        readyDetail: {
          title: "Clean Bed Ready",
          lines: ["Oxygen pipeline certified"],
          note: "Cleaned 12m ago",
        },
        actionLabel: "Assign",
      },
      {
        id: "A-102-D",
        status: "occupied",
        statusLabel: "Occupied",
        patient: { name: "Ebenezer Sowah", demo: "59M", mrn: "MRN-64918", day: "Day 3" },
        dx: "Uncontrolled Type 2 Diabetes / Foot Ulcer",
        meta: "Wound Care: 16:00",
      },
    ],
  },
];

// --- Ward B: Female Surgical Ward --------------------------------------------------

export const femaleWard = {
  name: "Ward B – Female Surgical Ward",
  location: "Floor 1, Block D",
  chargeNurse: "Matron Faustina Armah",
  bedsTotal: "58 Beds Total",
  turnaround: "Turnaround: 18m avg",
  dischargesPending: "4 Discharges Pending",
};

export type SimpleBedStatus = "occupied" | "available" | "cleaned" | "hold";

export type SimpleBed = {
  id: string;
  status: SimpleBedStatus;
  label: string;
};

export const femaleBeds: SimpleBed[] = [
  { id: "B-201", status: "occupied", label: "Y. Amah" },
  { id: "B-202", status: "occupied", label: "E. Osei" },
  { id: "B-203", status: "available", label: "Available" },
  { id: "B-204", status: "cleaned", label: "Cleaned 12m" },
  { id: "B-205", status: "occupied", label: "M. Cudjoe" },
  { id: "B-206", status: "hold", label: "Theater Hold" },
  { id: "B-207", status: "available", label: "Available" },
  { id: "B-208", status: "occupied", label: "D. Kyei" },
];

// --- Admissions queue --------------------------------------------------------------

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
  actionLabel: string;
};

export const admissionsQueue: AdmissionRequest[] = [
  {
    id: "adm1",
    source: "Emergency Triage · Red",
    wait: "Wait: 1h 15m",
    urgency: "critical",
    patient: "Emmanuel Quaye",
    demo: "68M",
    location: "NHIS: 29019281 · ER Bed 04",
    dx: "Severe Bilateral Pneumonia w/ Hypoxia",
    note: "Requires high-flow O2 support. Preferred Ward A (Male Med) or Ward E ICU Step-down.",
    suggestedBed: "A-102-C",
    actionLabel: "Assign Bed",
  },
  {
    id: "adm2",
    source: "Theater Recovery / PACU",
    wait: "Wait: 35m",
    urgency: "warning",
    patient: "Patricia Mensah",
    demo: "34F",
    location: "Private Insurance · PACU Bay 2",
    dx: "Laparoscopic Appendectomy Post-Op",
    note: "Vitals stable, Aldrete score 9/10. Ready for surgical ward bed transfer.",
    suggestedBed: "B-203",
    actionLabel: "Assign Bed",
  },
  {
    id: "adm3",
    source: "Medical OPD Triage",
    wait: "Wait: 50m",
    urgency: "neutral",
    patient: "Yaw Ofori",
    demo: "51M",
    location: "NHIS: 88102941 · OPD Bay 7",
    dx: "Diabetic Ketoacidosis (DKA)",
    note: "Requires continuous IV insulin infusion & hourly glucometer protocol.",
    suggestedBed: "Queue #3 for Ward A",
    actionLabel: "Select Bed",
  },
];

export const urgentHoldsCount = 3;

// --- Infection control ---------------------------------------------------------

export const infectionControl = {
  negativePressure: { value: "2/2", note: "Active" },
  handSanitizer: { value: "96.2%", note: "Pavilion RFID sensors" },
  sterileLinen: { value: "418 sets", note: "CSSD Delivery at 13:00" },
  escalationContact: "Contact IPC Officer Dr. Nsa Menor on Speed Dial 4410.",
};

// --- Nursing rota table ----------------------------------------------------------

export type RotaRow = {
  id: string;
  ward: string;
  chargeNurse: string;
  capacity: number;
  inpatients: number;
  plannedDischarges: number;
  expectedAdmits: number;
  ratio: string;
};

export const nursingRota: RotaRow[] = [
  { id: "e", ward: "Ward E – Intensive Care Unit", chargeNurse: "Sister Grace Mensah, RN", capacity: 12, inpatients: 10, plannedDischarges: 1, expectedAdmits: 2, ratio: "1:2.0" },
  { id: "a", ward: "Ward A – Male Medical Ward", chargeNurse: "Brother Samuel Tetteh, RN", capacity: 64, inpatients: 56, plannedDischarges: 5, expectedAdmits: 3, ratio: "1:5.8" },
  { id: "b", ward: "Ward B – Female Surgical Ward", chargeNurse: "Matron Faustina Armah, RN", capacity: 58, inpatients: 51, plannedDischarges: 4, expectedAdmits: 2, ratio: "1:5.1" },
  { id: "c", ward: "Ward C – Pediatric Complex", chargeNurse: "Sr. Rita Adobea", capacity: 46, inpatients: 38, plannedDischarges: 3, expectedAdmits: 4, ratio: "1:4.5" },
  { id: "d", ward: "Ward D – Maternity / Labor Wing", chargeNurse: "Principal Midwife Nsa Borkor", capacity: 100, inpatients: 82, plannedDischarges: 8, expectedAdmits: 8, ratio: "1:4.8" },
];

export const rotaTotals = {
  capacity: 280,
  inpatients: 237,
  plannedDischarges: "14 Day",
  expectedAdmits: "8 Expected",
  ratio: "1:5.6 (Nominal)",
};

export const shiftLabel = "Day Shift 07:00 – 15:00 · Synced with HMS";
