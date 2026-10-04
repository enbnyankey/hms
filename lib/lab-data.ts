// Mock data for the Laboratory & Diagnostic Hub.

export const labHeader = {
  title: "Central Pathology & Clinical Chemistry",
  block: "LAB BLOCK 2",
  supervisor: "Dr. Kwabena Frimpong, PhD, FWAPCMLS",
  role: "Shift Supervisor",
  lisStatus: "LIS Interfaced",
};

export type LabKpi = {
  id: string;
  label: string;
  value: string;
  unit?: string;
  note: string;
  tone?: "danger" | "success";
};

export const labKpis: LabKpi[] = [
  { id: "pending", label: "Pending Accession", value: "22", unit: "Specimens", note: "14 Blood · 5 Urine · 3 CSF" },
  { id: "running", label: "In-Analyzer Run", value: "54", unit: "Tests Active", note: "Cobas 6000 & Sysmex XN" },
  { id: "panic", label: "Critical / Panic Values", value: "3", unit: "Calls Pending", note: "Requires Physician Readback", tone: "danger" },
  { id: "tat", label: "TAT Compliance (STAT)", value: "94.8%", unit: "Target <45m", note: "Avg: 31 mins benchmark", tone: "success" },
];

export type QueueTabId = "all" | "stat" | "chem";

export type QueueTab = { id: QueueTabId; label: string };

export const queueTabs: QueueTab[] = [
  { id: "all", label: "All" },
  { id: "stat", label: "STAT" },
  { id: "chem", label: "Chemistry" },
];

export type SpecimenStatus =
  | "Pending Analysis"
  | "Verification"
  | "STAT Run"
  | "Gram (-) Bacilli"
  | "Centrifuge Rack 3"
  | "Validated"
  | "Rejected"
  | "Repeat Ordered"
  | "Escalated";

export type StatusTone = "blue" | "red" | "amber" | "slate" | "green";

export const STATUS_TONE: Record<SpecimenStatus, StatusTone> = {
  "Pending Analysis": "slate",
  Verification: "blue",
  "STAT Run": "red",
  "Gram (-) Bacilli": "amber",
  "Centrifuge Rack 3": "slate",
  Validated: "green",
  Rejected: "red",
  "Repeat Ordered": "amber",
  Escalated: "amber",
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
  id: string;
  specId: string;
  specType: string;
  status: SpecimenStatus;
  statusTone: StatusTone;
  category: SpecimenCategory;
  urgent?: boolean;
  patient: string;
  age: string;
  sex: string;
  mrn: string;
  ward: string;
  bed: string;
  consultant: string;
  collection: string;
  analyzer: string;
  detail: string;
  containerDot: string;
  container: string;
  testOrder: string;
  analytes: AnalyteRow[];
  signoff?: Signoff;
  rejectReason?: string;
};

export const specimenItems: SpecimenItem[] = [
  {
    id: "s1",
    specId: "#SP-2024-8841-CHM",
    specType: "CHM",
    status: "Verification",
    statusTone: STATUS_TONE["Verification"],
    category: "chem",
    patient: "Kwame Boateng",
    age: "54 yrs",
    sex: "Male",
    mrn: "GH-2024-8841",
    ward: "Block A",
    bed: "12",
    consultant: "Dr. Kobina Asadu",
    collection: "08:35 GMT",
    analyzer: "Roche Cobas 6000 (09:05)",
    detail: "54M · MRN #GH-2024-8841 · Ward A (Bed A-12)",
    containerDot: "bg-amber-400",
    container: "Serum Gel (SST Gold)",
    testOrder: "E/U/Cr + Trop-I",
    analytes: [
      { id: "na", name: "Sodium (Na⁺)", value: "139.0", unit: "mmol/L", range: "135.0 – 145.0", flag: "Normal", flagTone: "normal" },
      { id: "k", name: "Potassium (K⁺)", value: "4.4", unit: "mmol/L", range: "3.5 – 5.0", flag: "Normal", flagTone: "normal" },
      { id: "cl", name: "Chloride (Cl⁻)", value: "102.0", unit: "mmol/L", range: "98.0 – 107.0", flag: "Normal", flagTone: "normal" },
      { id: "bun", name: "Urea Nitrogen (BUN)", value: "6.8", unit: "mmol/L", range: "2.5 – 7.5", flag: "Normal", flagTone: "normal" },
      { id: "creat", name: "Serum Creatinine", value: "104.0", unit: "μmol/L", range: "62.0 – 106.0", flag: "High-Normal", flagTone: "high" },
      { id: "egfr", name: "eGFR (CKD-EPI) [CALC]", value: "74.0", unit: "mL/min/1.73m²", range: "> 90.0", flag: "Stage 2 / Mild", flagTone: "low" },
      { id: "trop", name: "hs-Troponin I (hsTnI)", value: "12.4", unit: "ng/L", range: "< 14.0", flag: "Non-Ischemic, Rule-Out", flagTone: "normal" },
    ],
    signoff: undefined,
  },
  {
    id: "s2",
    specId: "#SP-2024-9102-HEM",
    specType: "HEM",
    status: "STAT Run",
    statusTone: STATUS_TONE["STAT Run"],
    category: "stat",
    urgent: true,
    patient: "Kofi Mensah Addo",
    age: "38 yrs",
    sex: "Male",
    mrn: "GH-2024-9102",
    ward: "Trauma Resus Bay 1",
    bed: "1",
    consultant: "Dr. Ama Serwah",
    collection: "09:02 GMT",
    analyzer: "Sysmex XN-1000 (09:11)",
    detail: "38M · Trauma Resus Bay 1 · Emergency",
    containerDot: "bg-purple-500",
    container: "EDTA Lavender Top",
    testOrder: "FBC + Crossmatch (4U)",
    analytes: [
      { id: "hgb", name: "Hemoglobin (Hgb)", value: "4.8", unit: "g/dL", range: "13.0 – 17.0", flag: "Critical Low", flagTone: "critical" },
      { id: "hct", name: "Hematocrit (Hct)", value: "16.2", unit: "%", range: "40.0 – 52.0", flag: "Critical Low", flagTone: "critical" },
      { id: "wbc", name: "White Cell Count (WBC)", value: "14.9", unit: "x10⁹/L", range: "4.0 – 11.0", flag: "High", flagTone: "high" },
      { id: "plt", name: "Platelets (PLT)", value: "142", unit: "x10⁹/L", range: "150 – 450", flag: "Low", flagTone: "low" },
      { id: "xmatch", name: "Crossmatch Units", value: "4", unit: "Units PRBC", range: "As Ordered", flag: "In Progress", flagTone: "high" },
    ],
    signoff: undefined,
  },
  {
    id: "s3",
    specId: "#SP-2024-9088-MB",
    specType: "MB",
    status: "Gram (-) Bacilli",
    statusTone: STATUS_TONE["Gram (-) Bacilli"],
    category: "other",
    patient: "Akua Darko",
    age: "62 yrs",
    sex: "Female",
    mrn: "GH-2024-9088",
    ward: "ICU",
    bed: "E-02",
    consultant: "Dr. Yaw Boadi",
    collection: "07:48 GMT",
    analyzer: "BD BactEC FX (Flagged 09:00)",
    detail: "62F · ICU Bed E-02 · Sepsis Screen",
    containerDot: "bg-status-green",
    container: "BactEC",
    testOrder: "Blood Culture & AST",
    analytes: [
      { id: "organism", name: "Organism Identification", value: "E. coli (ESBL)", unit: "", range: "No Growth Expected", flag: "Positive", flagTone: "critical" },
      { id: "amp", name: "Ampicillin Sensitivity", value: "Resistant", unit: "", range: "—", flag: "Resistant", flagTone: "high" },
      { id: "cip", name: "Ciprofloxacin Sensitivity", value: "Sensitive", unit: "", range: "—", flag: "Sensitive", flagTone: "normal" },
      { id: "mero", name: "Meropenem Sensitivity", value: "Sensitive", unit: "", range: "—", flag: "Sensitive", flagTone: "normal" },
    ],
    signoff: undefined,
  },
  {
    id: "s4",
    specId: "#SP-2024-9044-CHM",
    specType: "CHM",
    status: "Centrifuge Rack 3",
    statusTone: STATUS_TONE["Centrifuge Rack 3"],
    category: "chem",
    patient: "Baby Kwesi (Neonatal)",
    age: "4 days",
    sex: "Male",
    mrn: "GH-2024-9044",
    ward: "NICU",
    bed: "Cot 07",
    consultant: "Dr. Efua Mensah",
    collection: "06:55 GMT",
    analyzer: "Roche Cobas 6000 (Pending)",
    detail: "4 Days · NICU Cot 07 · Phototherapy",
    containerDot: "bg-amber-400",
    container: "Microtainer Amber",
    testOrder: "Total & Direct Bilirubin",
    analytes: [
      { id: "tbil", name: "Total Bilirubin", value: "18.6", unit: "mg/dL", range: "< 15.0 (Phototherapy Threshold)", flag: "High", flagTone: "high" },
      { id: "dbil", name: "Direct Bilirubin", value: "0.6", unit: "mg/dL", range: "< 0.3", flag: "High", flagTone: "high" },
      { id: "ibil", name: "Indirect Bilirubin [CALC]", value: "18.0", unit: "mg/dL", range: "< 14.7", flag: "High", flagTone: "high" },
    ],
    signoff: undefined,
  },
];

// --- Specimen type / container helpers for the accessioning form -----------

export const specimenTypeOptions: { value: string; label: string; container: string; containerDot: string; category: SpecimenCategory }[] = [
  { value: "CHM", label: "Chemistry (CHM)", container: "Serum Gel (SST Gold)", containerDot: "bg-amber-400", category: "chem" },
  { value: "HEM", label: "Hematology (HEM)", container: "EDTA Lavender Top", containerDot: "bg-purple-500", category: "other" },
  { value: "MB", label: "Microbiology (MB)", container: "BactEC / Sterile Swab", containerDot: "bg-status-green", category: "other" },
  { value: "COAG", label: "Coagulation (COAG)", container: "Sodium Citrate Blue Top", containerDot: "bg-blue-400", category: "other" },
  { value: "URN", label: "Urinalysis (URN)", container: "Sterile Urine Cup", containerDot: "bg-slate-400", category: "other" },
];

// --- Right column ------------------------------------------------------------------

export type Analyzer = {
  id: string;
  name: string;
  desc: string;
  online: boolean;
  note?: string;
  status?: string;
  progressLabel?: string;
  progressPct?: number;
  alert?: string;
};

export const analyzers: Analyzer[] = [
  {
    id: "cobas",
    name: "Roche Cobas 6000",
    desc: "Clinical Chemistry & Immuno",
    online: true,
    note: "QC: Within 1.5 SD",
    status: "Ready (Idle 2m)",
  },
  {
    id: "sysmex",
    name: "Sysmex XN-1000",
    desc: "Automated Hematology Analyzer",
    online: true,
    progressLabel: "Reagents: 78%",
    progressPct: 78,
    status: "4 Tests in Rack",
  },
  {
    id: "bactec",
    name: "BD BactEC™ FX",
    desc: "Continuous Blood Culture Module",
    online: true,
    note: "Bottles: 24 Loaded",
    alert: "1 Positive Flag",
  },
];

export const analyzersOnlineCount = 3;

export type PanicCallState = "Verified" | "Dialing";

export type PanicCall = {
  id: string;
  time: string;
  state: PanicCallState;
  ward: string;
  detail: string;
  note: string;
  actionLabel?: string;
};

export const panicCalls: PanicCall[] = [
  {
    id: "p1",
    time: "09:15 GMT",
    state: "Verified",
    ward: "Male Ward A",
    detail: "MRN #90214 · K⁺ = 6.8 mmol/L (Severe)",
    note: "Dr. Mensah read-back confirmed.",
  },
  {
    id: "p2",
    time: "09:22 GMT",
    state: "Dialing",
    ward: "Trauma Bay",
    detail: "MRN #9102 · Hemoglobin = 4.8 g/dL",
    note: "",
    actionLabel: "Connect Duty Physician",
  },
];

export const accreditation = {
  note: "Korle-Bu Central Diagnostic Network is ISO 15189:2022 compliant and synchronized with West African Health Organization (WAHO) Laboratory Quality Surveillance.",
};
