// Mock data for the Pharmacy & Dispensary Hub.

export const pharmacyHeader = {
  title: "Korle-Bu Central Pharmacy & Dispensary Division",
  location: "Ground Floor · Wing B",
  fdaReg: "FDA Reg #FDA/DR-KBTH-0041",
  chiefPharmacist: "Pharm. Kweku Annan, BPharm, MPSGH",
  liveStatus: "Live Real-time e-Dispensing Active",
};

export type PharmacyKpi = {
  id: string;
  label: string;
  value: string;
  unit?: string;
  note: string;
  tone?: "danger" | "success";
};

export const pharmacyKpis: PharmacyKpi[] = [
  { id: "queue", label: "Pending Rx Queue", value: "38", unit: "prescriptions", note: "Avg Wait: 11 mins (Within GHS SLA)" },
  { id: "dispensed", label: "Dispensed Today", value: "264", unit: "orders filled", note: "GHS 41,200.00 cleared" },
  { id: "low-stock", label: "Low-Stock Critical", value: "7", unit: "medications", note: "G-DRG Essential Formulary List", tone: "danger" },
  { id: "nhis", label: "NHIS Instant Clearance", value: "98.4%", unit: "Direct Tier-2", note: "0 unadjudicated claims", tone: "success" },
];

export type QueueFilter = { id: string; label: string; count: number; active?: boolean };

export const queueFilters: QueueFilter[] = [
  { id: "all", label: "All", count: 38, active: true },
  { id: "stat", label: "STAT", count: 4 },
  { id: "ward", label: "Ward", count: 18 },
  { id: "opd", label: "OPD", count: 16 },
];

export type QueueStatus = "Ready for Final Check" | "STAT / Emergency" | "Insurance Clearance" | "Verification Passed";

export type QueueCategory = "stat" | "ward" | "opd";

export type QueueItem = {
  id: string;
  rxId: string;
  status: QueueStatus;
  category: QueueCategory;
  patient: string;
  location: string;
  detail?: string;
  detailUrgent?: boolean;
  statusNote?: string;
  prescriber: string;
  waitLabel: string;
  wait: string;
  itemsNote?: string;
  selected?: boolean;
};

export const queueItems: QueueItem[] = [
  {
    id: "q1",
    rxId: "#RX-2024-9014",
    status: "Ready for Final Check",
    category: "opd",
    patient: "Kwame Boateng",
    location: "MRN: GH-2024-8841 · Male, 58y · Cardiology OPD",
    prescriber: "Dr. Kobina Asadu",
    waitLabel: "",
    wait: "",
    itemsNote: "3 Rx Items",
    selected: true,
  },
  {
    id: "q2",
    rxId: "#RX-2024-9015",
    status: "STAT / Emergency",
    category: "stat",
    patient: "Akua Darko",
    location: "ICU Block · Bed E-02 · Female, 67y",
    detail: "Norepinephrine Infusion + Meropenem 1g IV",
    detailUrgent: true,
    statusNote: "Status: In Compounding Hood 2",
    prescriber: "Dr. Boateng",
    waitLabel: "Elapsed:",
    wait: "4m",
  },
  {
    id: "q3",
    rxId: "#RX-2024-9016",
    status: "Insurance Clearance",
    category: "ward",
    patient: "Abena Osei",
    location: "Maternity Ward 4 · Bed M-11",
    detail: "Iron Sucrose IV 100mg, Cefuroxime 500mg PO",
    prescriber: "Dr. Mercy Mensah",
    waitLabel: "OPD Wait:",
    wait: "16m",
  },
  {
    id: "q4",
    rxId: "#RX-2024-9017",
    status: "Verification Passed",
    category: "stat",
    patient: "Samuel Tetteh",
    location: "Trauma & Emergency · Bay 3",
    detail: "Tramadol 50mg IV, Ringers Lactate 1000mL IV",
    prescriber: "Dr. K. Appiah",
    waitLabel: "OPD Wait:",
    wait: "8m",
  },
];

// --- Selected prescription detail ------------------------------------------------

export const selectedRxPatient = {
  name: "Kwame Boateng",
  nhis: "NHIS #0921-4432-8",
  rxId: "E-Prescription #RX-2024-9014",
  dob: "14 Aug 1966 (58 yrs)",
  sex: "Male",
  blood: "O+",
  weight: "84.2 kg",
};

export type ClinicalFlag = { id: string; title: string; lines: string[] };

export const clinicalFlags: ClinicalFlag[] = [
  { id: "allergy", title: "No Known Allergies", lines: ["Penicillin Checked"] },
  { id: "renal", title: "eGFR: 88 mL/min", lines: ["Hepatic Clear: Normal"] },
  { id: "formulary", title: "Tier-2 Formulary", lines: ["100% GHS Tariff Copay"] },
];

export type RxLineItem = {
  id: string;
  name: string;
  qty: string;
  copay: string;
  sig: string;
  batch: string;
  exp: string;
  location: string;
  gtin: string;
  stock: string;
  verified: boolean;
};

export const rxLineItems: RxLineItem[] = [
  {
    id: "rli1",
    name: "Amlodipine Besylate 10mg Tablets",
    qty: "30 Tabs",
    copay: "GH¢0.00",
    sig: "Take 1 tablet by mouth daily in morning. (Cardiology Regimen)",
    batch: "AML-2024-69",
    exp: "11/2026",
    location: "Bay 04 · Shelf B",
    gtin: "GTIN-06041289",
    stock: "1,420 tabs",
    verified: true,
  },
  {
    id: "rli2",
    name: "Telmisartan 40mg Tablets",
    qty: "30 Tabs",
    copay: "GH¢0.00",
    sig: "Take 1 tablet once daily with water.",
    batch: "TEL-2024-03",
    exp: "08/2026",
    location: "Bay 03 · Shelf D",
    gtin: "GTIN-06048123",
    stock: "860 tabs",
    verified: true,
  },
  {
    id: "rli3",
    name: "Atorvastatin Calcium 20mg Tablets",
    qty: "30 Tabs",
    copay: "GH¢0.00",
    sig: "Take 1 tablet at bedtime for hypercholesterolemia.",
    batch: "ATO-2025-11",
    exp: "03/2027",
    location: "Bay 06 · Shelf A",
    gtin: "GTIN-06019944",
    stock: "410 tabs",
    verified: true,
  },
];

export const rxVerifiedCount = { verified: 3, total: 3 };

export const thermalLabel = {
  device: "Zebra ZD420 · Label Station 2",
  hospitalName: "KORLE-BU CENTRAL HOSPITAL PHARMACY",
  phone: "TEL: +233-302-665401",
  patientLine: "PATIENT: KWAME BOATENG (GH-2024-8841) | RX# 9014",
  instructions: "Take 1 tablet daily with morning meal. Maintain low sodium diet. Report any swelling to clinic.",
  dispensed: "DISPENSED: 24-MAY-2024",
  dispenser: "DISPENSER: PHARM. K. ANNAN",
};

// --- Right column ------------------------------------------------------------------

export type LowStockAlert = {
  id: string;
  name: string;
  qty: string;
  unit: string;
  threshold: string;
  supplierNote: string;
  poNote?: string;
  reorder?: boolean;
};

export const lowStockAlerts: LowStockAlert[] = [
  {
    id: "ls1",
    name: "Insulin Actrapid 100IU/mL",
    qty: "12",
    unit: "Vials",
    threshold: "Min Safety Threshold: 50 vials",
    supplierNote: "Ernest Chemists Ltd",
    poNote: "PO #8821 Generated",
  },
  {
    id: "ls2",
    name: "Ceftriaxone 1g Powder Inj",
    qty: "28",
    unit: "Vials",
    threshold: "Threshold: 100 vials",
    supplierNote: "Supplier: Tobinco Pharm",
    reorder: true,
  },
  {
    id: "ls3",
    name: "Hydrocortisone 100mg Inj",
    qty: "15",
    unit: "Vials",
    threshold: "Threshold: 60 vials",
    supplierNote: "Supplier: Central Medical Stores",
    reorder: true,
  },
];

export const lowStockActionCount = 7;

export const controlledVault = {
  drug: "Morphine Sulfate 10mg Inj",
  qty: "42",
  unit: "Ampoules",
  note: "Handoff Count verified at 07:00 Shift Change. Double-witness electronic signature intact.",
  witnesses: "Witnesses: PK-Annan / RN-Mensah",
};

export const coldChainLog = {
  unit: "Vaccine Refrigerator A",
  location: "Biologics & Insulin Rack",
  temp: "4.2°C",
  status: "Within Safe Range (2°C – 8°C)",
};

export const dispensaryWindow = {
  label: "Dispensary Window #2 Active",
  queueWaiting: "Queue Waiting: 3 Patients",
  actionLabel: "Call Next Token",
};
