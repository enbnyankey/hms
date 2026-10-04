// Mock data for the Doctor Workspace — a single active consultation.

export const activePatient = {
  name: "Kwame Boateng",
  sex: "Male" as const,
  age: 54,
  dob: "14 Aug 1970",
  priority: "Priority 2",
  priorityReason: "Hypertensive Urgency",
  mrn: "#GH-2024-8841",
  nhis: "8839-2019-01",
  bloodGroup: "B+",
  encounter: "Cardiac Outpatient (Dr. Kobina Asadu)",
  initials: "KB",
};

export type AlertCard = {
  id: string;
  label: string;
  icon: "allergy" | "risk" | "contact" | "coverage";
  tone: "danger" | "info" | "neutral" | "success";
  lines: { text: string; emphasis?: boolean }[];
  badge?: string;
};

export const alertCards: AlertCard[] = [
  {
    id: "allergies",
    label: "Allergies (Severe High Risk)",
    icon: "allergy",
    tone: "danger",
    lines: [
      { text: "Penicillin (Anaphylaxis)", emphasis: true },
      { text: "Aspirin (Mild Gastric Distress)" },
    ],
  },
  {
    id: "clinical-alerts",
    label: "Clinical Alerts & Risk",
    icon: "risk",
    tone: "info",
    lines: [
      { text: "Fall Risk: Moderate (Morse: 45)", emphasis: true },
      { text: "Vascular: Hypertensive Urgency" },
    ],
  },
  {
    id: "next-of-kin",
    label: "Next of Kin / Contact",
    icon: "contact",
    tone: "neutral",
    lines: [
      { text: "Akua Boateng (Wife)", emphasis: true },
      { text: "+233 24 412 8990 · East Legon" },
    ],
  },
  {
    id: "coverage",
    label: "Coverage Status",
    icon: "coverage",
    tone: "success",
    lines: [
      { text: "NHIS Validated ✓", emphasis: true },
      { text: "Tier-2 Cardiac Formulary Active" },
    ],
    badge: "Active",
  },
];

export type WorkspaceTabId = "overview" | "exam" | "diagnoses" | "prescriptions" | "labs";

export type WorkspaceTab = {
  id: WorkspaceTabId;
  label: string;
  count?: number;
};

export const workspaceTabs: WorkspaceTab[] = [
  { id: "overview", label: "Overview & History" },
  { id: "exam", label: "Physical Examination" },
  { id: "diagnoses", label: "Diagnoses (ICD-11)", count: 2 },
  { id: "prescriptions", label: "Prescriptions (e-Rx)", count: 3 },
  { id: "labs", label: "Lab & Diagnostics", count: 4 },
];

export const triageVitalsMeta = {
  time: "08:30 GMT",
  recordedBy: "Nurse Efua Mensah (Ward A)",
};

export const bloodPressure = {
  systolic: 168,
  diastolic: 102,
  stageLabel: "Stage 2 High",
  map: 124,
  target: "<130/80",
};

export const bpTrend = [
  { label: "12 Mar", value: 142 },
  { label: "19 Jun", value: 148 },
  { label: "22 Aug", value: 154 },
  { label: "Today", value: 168 },
];

export const bpTrendDrift = "+18 mmHg drift";

export type VitalStat = {
  id: string;
  label: string;
  value: string;
  unit?: string;
  note: string;
  valueClass?: string;
};

export const vitalStats: VitalStat[] = [
  { id: "pulse", label: "Pulse Rate", value: "88", unit: "bpm", note: "Regular sinus" },
  { id: "spo2", label: "SpO2 Oxygen", value: "98", unit: "%", note: "Room Air (Ambient)" },
  { id: "temp", label: "Temperature", value: "37.1", unit: "°C", note: "Normothermic" },
  { id: "resp", label: "Resp. Rate", value: "18", unit: "cpm", note: "Unlaboured" },
];

export const bodyStats: VitalStat[] = [
  { id: "bmi", label: "BMI / Weight", value: "28.4", unit: "kg/m²", note: "86 kg · 174 cm (Overwt)", valueClass: "text-status-amber" },
  { id: "glucose", label: "Blood Glucose", value: "7.4", unit: "mmol/L", note: "Random (Non-fasting)", valueClass: "text-status-amber" },
];

export type ProblemListItem = {
  id: string;
  title: string;
  detail: string;
  status: string;
  statusTone: "danger" | "warning" | "info";
};

export const problemList: ProblemListItem[] = [
  {
    id: "htn",
    title: "Essential Hypertension",
    detail: "Onset 2019 (5 yrs) · Primary care follow-up",
    status: "Uncontrolled",
    statusTone: "danger",
  },
  {
    id: "lipid",
    title: "Dyslipidemia / Mixed",
    detail: "Onset 2021 (3 yrs) · Non-compliant on statin",
    status: "Active",
    statusTone: "warning",
  },
  {
    id: "lvh",
    title: "Mild Left Ventricular Strain",
    detail: "Previous echo noted concentric hypertrophy",
    status: "Monitoring",
    statusTone: "info",
  },
];

export const chiefComplaint =
  "Persistent occipital morning headache for the past 5 days, with intermittent chest tightness and lightheadedness after walking moderate distances or climbing stairs at the office.";

export const hpiAuthor = "Dr. Kobina Asadu · Cardiology Template";

export const hpiNotes =
  "Patient is a 54-year-old corporate executive presenting with progressive throbbing morning occipital headaches and lightheadedness for five days. Reports moderate substernal tightness on exertion (Canadian Cardiovascular Society Class II), relieved by rest within 5-10 minutes. Denies true orthopnea, paroxysmal nocturnal dyspnea, or syncope.";

export type ExamFinding = {
  id: string;
  system: string;
  findings: string;
};

export const objectiveExam: ExamFinding[] = [
  {
    id: "cardio",
    system: "Cardiovascular",
    findings:
      "S1, S2 audible, normal heart sounds. No S3/S4 gallop. JVP normal (<3cm). No bilateral pedal edema.",
  },
  {
    id: "resp",
    system: "Respiratory",
    findings:
      "Trachea central. Vesicular breath sounds bilaterally. Lung bases clear to auscultation without crackles or wheezes.",
  },
  {
    id: "neuro",
    system: "Neurological",
    findings:
      "Alert & oriented x3. GCS 15/15. Cranial nerves II-XII intact. Fundoscopy shows no papilledema or AV nicking.",
  },
];

export type DiagnosisEntry = {
  id: string;
  kind: "PRIMARY" | "DIFFERENTIAL";
  code: string;
  title: string;
  detail: string;
};

export const diagnoses: DiagnosisEntry[] = [
  {
    id: "dx1",
    kind: "PRIMARY",
    code: "BA00",
    title: "Essential hypertension (Stage 2 Uncontrolled)",
    detail: "Confirmed · Clinical urgency presentation · Severity: Severe",
  },
  {
    id: "dx2",
    kind: "DIFFERENTIAL",
    code: "BD10",
    title: "Angina pectoris, unspecified",
    detail: "Rule out exertional ischemia · Troponin & ECG dispatched",
  },
];

export type PrescriptionItem = {
  id: string;
  drug: string;
  cost: string;
  dosage: string;
  duration: string;
  tag: string;
};

export const prescriptions: PrescriptionItem[] = [
  {
    id: "rx1",
    drug: "Amlodipine Besylate 10mg Tablets",
    cost: "GHS 0.00 · NHIS 100%",
    dosage: "1 Tab PO OD (Every Morning)",
    duration: "30 Days (Qty: 30 Tabs)",
    tag: "Penicillin-Safe",
  },
  {
    id: "rx2",
    drug: "Telmisartan 40mg Tablets",
    cost: "GHS 0.00 · NHIS 100%",
    dosage: "1 Tab PO OD (Morning with water)",
    duration: "30 Days (Qty: 30 Tabs)",
    tag: "Renal-Monitored",
  },
  {
    id: "rx3",
    drug: "Atorvastatin 20mg Tablets",
    cost: "GHS 0.00 · NHIS 100%",
    dosage: "1 Tab PO Nocte (At Bedtime)",
    duration: "30 Days (Qty: 30 Tabs)",
    tag: "Lipid Goal",
  },
];

export const rxCrossCheckNote =
  "Auto Cross-Check: No interactions with Penicillin or Aspirin triggers detected in this order.";

export type DiagnosticOrder = {
  id: string;
  title: string;
  detail: string;
  tag: string;
  tagTone: "danger" | "warning" | "neutral";
  checked: boolean;
};

export const diagnosticOrders: DiagnosticOrder[] = [
  { id: "eucr", title: "Serum E/U/Cr", detail: "Electrolytes, Urea & Creatinine", tag: "STAT", tagTone: "danger", checked: true },
  { id: "trop", title: "High-Sens Troponin-I", detail: "Cardiac Biomarker (Rule Out MI)", tag: "RAPID", tagTone: "warning", checked: true },
  { id: "lipid", title: "Fasting Lipid Profile", detail: "Chol, HDL, LDL, Triglycerides", tag: "Routine", tagTone: "neutral", checked: true },
  { id: "fbc", title: "Full Blood Count (FBC)", detail: "Hemoglobin, Platelets, Indices", tag: "Routine", tagTone: "neutral", checked: true },
];

export type PriorLab = {
  id: string;
  label: string;
  value: string;
  note: string;
};

export const priorLabs: PriorLab[] = [
  { id: "creat", label: "Creatinine", value: "98 µmol/L", note: "Normal (62-106)" },
  { id: "potassium", label: "Potassium", value: "4.2 mmol/L", note: "Normal (3.5-5.0)" },
];

export const priorLabsDate = "22 Aug 2024";

export type ImagingOrder = {
  id: string;
  title: string;
  detail: string;
  tag: string;
};

export const imagingOrders: ImagingOrder[] = [
  { id: "ecg", title: "12-Lead Electrocardiogram", detail: "Scheduled Today · 09:30 · Room 4B", tag: "Queued" },
  { id: "cxr", title: "Chest X-Ray (PA View)", detail: "Evaluate cardiothoracic ratio & hilar congestion", tag: "Order Sent" },
];

export const disposition = {
  reviewLabel: "Review Appointment",
  reviewWhen: "In 2 Weeks (07 Nov 2024)",
  reviewDetail: "Cardiac Specialist Outpatient · Morning Session",
};

export type PatientDirective = {
  id: string;
  text: string;
  tone: "ok" | "warning";
};

export const patientDirectives: PatientDirective[] = [
  { id: "diet", text: "Strict low-sodium DASH diet (<2g salt/day).", tone: "ok" },
  { id: "bp-log", text: "Twice-daily home BP recording log.", tone: "ok" },
  { id: "er", text: "Report immediately to ER if severe chest pain returns.", tone: "warning" },
];
