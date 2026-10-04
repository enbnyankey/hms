// Mock data for the Executive Hospital Operations dashboard.
// Shapes here are intentionally close to what a real API would return,
// so wiring up a backend later is mostly a fetch-and-swap.

export type TriageLevel = "RESUS-1 RED" | "RESUS-2 RED" | "VERY URGENT" | "URGENT" | "STANDARD";

export type TriageLevelMeta = {
  label: TriageLevel;
  textClass: string;
  bgClass: string;
};

export const triageLevelMeta: Record<TriageLevel, TriageLevelMeta> = {
  "RESUS-1 RED": { label: "RESUS-1 RED", textClass: "text-status-red", bgClass: "bg-status-red-bg" },
  "RESUS-2 RED": { label: "RESUS-2 RED", textClass: "text-status-red", bgClass: "bg-status-red-bg" },
  "VERY URGENT": { label: "VERY URGENT", textClass: "text-status-amber", bgClass: "bg-status-amber-bg" },
  URGENT: { label: "URGENT", textClass: "text-status-orange", bgClass: "bg-status-orange-bg" },
  STANDARD: { label: "STANDARD", textClass: "text-status-green", bgClass: "bg-status-green-bg" },
};

export type TriagePatient = {
  id: string;
  mrn: string;
  name: string;
  age: number;
  sex: "M" | "F";
  level: TriageLevel;
  category: string;
  chiefComplaint: string;
  assignedBay: string;
  assignedMd: string;
  elapsed: string;
};

export const triageFeed: TriagePatient[] = [
  {
    id: "t1",
    mrn: "KB-ER-8842",
    name: "Kofi Mensah Addo",
    age: 42,
    sex: "M",
    level: "RESUS-1 RED",
    category: "Motorbike RTA",
    chiefComplaint: "Poly-trauma & Hypovolemic Shock",
    assignedBay: "Trauma Bay 01",
    assignedMd: "Dr. Boateng",
    elapsed: "04m 12s",
  },
  {
    id: "t2",
    mrn: "KB-ER-8849",
    name: "Abena Osei Poku",
    age: 29,
    sex: "F",
    level: "RESUS-2 RED",
    category: "Antepartum Hemorrhage (34 wks)",
    chiefComplaint: "Maternity Bay 03",
    assignedBay: "Maternity Bay 03",
    assignedMd: "Dr. Sutherland",
    elapsed: "09m 45s",
  },
  {
    id: "t3",
    mrn: "KB-ER-8851",
    name: "Emmanuel Kwesi Tagoe",
    age: 58,
    sex: "M",
    level: "VERY URGENT",
    category: "Acute STEMI Suspected",
    chiefComplaint: "Chest Pain radiate L-arm",
    assignedBay: "Cardio Bay 02",
    assignedMd: "Dr. Asadu",
    elapsed: "14m 20s",
  },
  {
    id: "t4",
    mrn: "KB-ER-8855",
    name: "Efua Ansah Darko",
    age: 6,
    sex: "F",
    level: "URGENT",
    category: "Severe Malaria",
    chiefComplaint: "Febrile Convulsion resolved • Temp 39.4°C",
    assignedBay: "Peds Acute Bay",
    assignedMd: "Dr. Quaye",
    elapsed: "22m 04s",
  },
];

export const triageSummary = { red: 2, orange: 4, yellow: 11, green: 13 };

export type KpiCard = {
  id: string;
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "up" | "down" | "neutral";
  breakdown?: string;
  sub?: string;
  tone?: "default" | "danger";
};

export const kpiCards: KpiCard[] = [
  {
    id: "patients-today",
    label: "Patients Today",
    value: "342",
    delta: "+8.4%",
    deltaTone: "up",
    sub: "OPD: 218 · IPD: 94 · ER: 30",
  },
  {
    id: "bed-occupancy",
    label: "Bed Occupancy",
    value: "84.6%",
    breakdown: "237/280",
    sub: "Avail: 28 · Rsrv: 9 · Maint: 6",
  },
  {
    id: "clinical-queue",
    label: "Clinical Queue",
    value: "42",
    delta: "Avg 24m",
    sub: "Cardiology: 14 · OPD: 18 · Peds: 10",
  },
  {
    id: "staff-roster",
    label: "Staff on Roster",
    value: "145",
    sub: "Doctors: 38 · Nurses: 84 · Pharm: 14 · Lab Tech: 9",
    breakdown: "Active",
  },
  {
    id: "revenue",
    label: "Revenue (GHS)",
    value: "GH¢184,250",
    sub: "MoMo: 62.4k · NHIS: Private: GH¢37,200",
  },
  {
    id: "pending-actions",
    label: "Pending Actions",
    value: "16",
    sub: "Lab Panic: 5 · Trauma Admissions: 3 · Rx Authorizations: 8",
    tone: "danger",
  },
];

export type WardStat = {
  id: string;
  name: string;
  occupied: number;
  total: number;
  note: string;
  tone: "red" | "amber" | "green";
};

export const wardStats: WardStat[] = [
  { id: "icu", name: "Intensive Care Unit (ICU)", occupied: 23, total: 25, note: "2 Ventilator Beds Free", tone: "red" },
  { id: "maternity", name: "Maternity Ward & NICU", occupied: 38, total: 40, note: "2 Incubators Unoccupied", tone: "red" },
  { id: "male-medical", name: "Male Medical Ward A & B", occupied: 44, total: 50, note: "6 General Beds Available", tone: "amber" },
  { id: "female-surgical", name: "Female Surgical Ward", occupied: 38, total: 50, note: "12 Beds Ready for Transfer", tone: "green" },
  { id: "peds", name: "Princess Marie Louise Peds", occupied: 34, total: 50, note: "16 Beds Free (Low Acuity)", tone: "green" },
];

export const wardTotals = { occupied: 237, total: 280 };

export const wardEscalation = {
  title: "Transfer Escalation",
  detail: "3 Pending Discharges — Ward Block A running at 91% total strain; overflow re-routed to West Annex.",
};

export type RevenueChannel = {
  id: string;
  label: string;
  amount: string;
  colorClass: string;
};

export const revenueChannels: RevenueChannel[] = [
  { id: "nhis", label: "NHIS Claims", amount: "GH¢84,650", colorClass: "bg-brand-cyan" },
  { id: "momo", label: "MoMo / Cash", amount: "GH¢62,400", colorClass: "bg-brand-teal" },
  { id: "private", label: "Private Ins.", amount: "GH¢37,200", colorClass: "bg-amber-400" },
];

export const revenueBreakdown = [
  { id: "momo-gw", label: "MTN MoMo Gateway", amount: "GH¢44,900.00" },
  { id: "telecel", label: "Telecel Cash", amount: "GH¢17,500.00" },
  { id: "enterprise", label: "Enterprise Life & Nationwide", amount: "GH¢37,200.00" },
];

export const revenueTotal = "GH¢184,250";
export const nhisBatchStatus = "Validated (0 errors)";

export type OutpatientRoom = {
  id: string;
  room: string;
  specialty: string;
  clinician: string;
  session: string;
  waiting: number;
  avgWait: string;
};

export const outpatientRooms: OutpatientRoom[] = [
  {
    id: "room1",
    room: "Room 1 · Cardiology",
    specialty: "Cardiology",
    clinician: "Dr. Kobina Asadu, MD",
    session: "In Session: Kwame Nyarko (NHIS #4902148)",
    waiting: 4,
    avgWait: "Avg 18m",
  },
  {
    id: "room2",
    room: "Room 2 · Internal Medicine",
    specialty: "Internal Medicine",
    clinician: "Dr. Akosua Mensah, FWACP",
    session: "In Session: Yaa Serwaa Baidoo (Private)",
    waiting: 7,
    avgWait: "Avg 22m",
  },
  {
    id: "room3",
    room: "Room 3 · General Surgery",
    specialty: "General Surgery",
    clinician: "Dr. Kwame Boateng, FGCS",
    session: "In Session: Bernard Lamptey (Post-Op Check)",
    waiting: 3,
    avgWait: "Avg 29m",
  },
  {
    id: "room4",
    room: "Room 4 · Pediatrics Clinic",
    specialty: "Pediatrics",
    clinician: "Dr. Esi Sutherland, MD",
    session: "In Session: Baby Maame Araba (Immunization)",
    waiting: 5,
    avgWait: "Avg 15m",
  },
];

export type AlertSeverity = "critical" | "warning" | "info";

export type LiveAlert = {
  id: string;
  title: string;
  time: string;
  severity: AlertSeverity;
  detail: string;
  meta: string;
  actionLabel: string;
  actionSecondaryLabel?: string;
};

export const liveAlerts: LiveAlert[] = [
  {
    id: "a1",
    title: "PANIC LAB VALUE",
    time: "13:58 GMT",
    severity: "critical",
    detail: "Potassium level 6.8 mmol/L detected for patient MRN-GH-90214 (Male Ward A).",
    meta: "Reported by: Central Biochemistry Lab · Dr. Mensah paged",
    actionLabel: "Acknowledge",
  },
  {
    id: "a2",
    title: "TRANSFUSION VERIFIED",
    time: "13:45 GMT",
    severity: "warning",
    detail: "Emergency crossmatch 4 Units O-Neg cleared for Main Surgical Theater 2 (Lap Emergency).",
    meta: "Recipient: Abena Badu · Courier in transit to OR 2",
    actionLabel: "Track Dispatch",
  },
  {
    id: "a3",
    title: "BIOMEDICAL ENGINEERING",
    time: "13:30 GMT",
    severity: "info",
    detail: "Ward B Central Pipeline O2 Pressure nominal at 4.2 bar. Backup manifold tank recharged.",
    meta: "Inspected by: Ing. K. Darko (BioMed Tech lead)",
    actionLabel: "View Log",
  },
];

export const clinicalNotice =
  "Korle-Bu Central Oxygen Plant Line 2 verified · NHIS claims electronic gateway online · Blood Bank inventory for O-Neg at critical threshold (4 units remain).";

export const facility = {
  name: "Korle-Bu Central Hospital",
  location: "Accra · Ward Block A",
  region: "Accra Metropolitan Area · Korle-Bu Main Clinical Quadrant · Sub-Saharan Referral Center",
  tier: "Level 1 Tertiary Facility · Normal State",
  date: "Today · 24 Oct 2024",
  shiftLabel: "Day Shift A (07:00 - 15:30)",
  syncTime: "14:02 GMT",
};

export const currentUser = {
  name: "Dr. Kobina Asadu, MD",
  role: "Chief Medical Officer",
};

export const reviewProtocol = {
  title: "O-Neg Critical Threshold Protocol",
  updated: "Revised 14 Aug 2024 · Blood Bank & Transfusion Committee",
  steps: [
    "Notify the on-call transfusion medicine officer once O-Neg stock falls below 5 units.",
    "Restrict O-Neg issue to confirmed massive-transfusion and unmatched-emergency cases only.",
    "Activate the walking-donor panel and notify the regional blood bank for an emergency resupply.",
    "Log every unit issued against this protocol in the Blood Bank Critical Stock Register.",
  ],
};
