// Mock data for the Billing & Cashier Central Hub.

export const billingHeader = {
  title: "Billing & Cashier Central Hub",
  wing: "Finance Wing · Block C",
  subtitle: "Korle-Bu Central Hospital · Real-time NHIS G-DRG Claims Engine & Point-of-Sale Clearance",
  department: "All Departments",
};

export const dateRangeOptions = ["Today: 24 Oct 2024", "Yesterday: 23 Oct 2024", "This Week", "This Month"];

export const departmentOptions = [
  "All Departments",
  "Cardiology",
  "Maternity",
  "Emergency",
  "Surgical",
  "Pediatrics",
];

export function formatGHS(amount: number): string {
  return amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export type BillingKpi = {
  id: string;
  label: string;
  value: string;
  note: string;
  tone?: "danger";
};

export const billingKpis: BillingKpi[] = [
  { id: "collections", label: "Today's Collections", value: "GH¢184,250.00", note: "↗ +12.4% vs daily quota" },
  { id: "nhis-pending", label: "NHIS Batch Pending", value: "GH¢84,650.00", note: "142 Claims · G-DRG Ready" },
  { id: "private", label: "Private Ins. Ledger", value: "GH¢37,200.00", note: "Enterprise, Glico, Acacia" },
  { id: "momo", label: "MoMo / Out-of-Pocket", value: "GH¢62,400.00", note: "MTN MoMo · Telecel" },
  { id: "unsettled", label: "Unsettled Patient Bills", value: "GH¢29,480.00", note: "34 Inpatients awaiting discharge", tone: "danger" },
];

export const nhisBatchInfo = {
  id: "NHIS Electronic Batch #GHS-KB-2024-W43",
  tariff: "ICD-11 & NHIA Drug Tariff 2024.v2",
  detail:
    "142 clinical encounters validated against National Health Insurance Scheme guidelines. Zero unmapped codes or diagnostic conflicts detected.",
  syncLabel: "Synced with NHIA Claim-it API",
  claimsCount: 142,
  totalAmount: 84650.0,
};

export type InvoiceFilterId = "all" | "pending" | "inpatient" | "nhis";

export const invoiceFilters: { id: InvoiceFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "inpatient", label: "Inpatient" },
  { id: "nhis", label: "NHIS" },
];

export type InvoiceStatus = "Partial Paid" | "Adjudicating" | "Unpaid" | "Paid in Full" | "Cleared" | "Rejected" | "Void";

export type InvoiceCategory = "Inpatient" | "Outpatient";

export type Invoice = {
  id: string;
  patient: string;
  mrn: string;
  encounter: string;
  scheme: string;
  category: InvoiceCategory;
  total: number;
  insurance: number;
  balance: number;
  status: InvoiceStatus;
};

export const invoices: Invoice[] = [
  {
    id: "INV-2024-10941",
    patient: "Kwame Boateng",
    mrn: "MRN-GH-2024-8841",
    encounter: "Cardiology OPD",
    scheme: "NHIS Capitation / G-DRG",
    category: "Outpatient",
    total: 795.0,
    insurance: 680.0,
    balance: 115.0,
    status: "Partial Paid",
  },
  {
    id: "INV-2024-10940",
    patient: "Abena Osei",
    mrn: "MRN-GH-2024-7712",
    encounter: "Maternity Inpatient (Ward 4)",
    scheme: "Nationwide Medical Private",
    category: "Inpatient",
    total: 2450.0,
    insurance: 2450.0,
    balance: 0.0,
    status: "Adjudicating",
  },
  {
    id: "INV-2024-10939",
    patient: "Samuel Tetteh",
    mrn: "MRN-GH-2024-9043",
    encounter: "Trauma / Emergency Resusc.",
    scheme: "Self-Pay / Cash",
    category: "Inpatient",
    total: 1820.0,
    insurance: 0.0,
    balance: 1820.0,
    status: "Unpaid",
  },
  {
    id: "INV-2024-10938",
    patient: "Efua Mensah",
    mrn: "MRN-GH-2024-6520",
    encounter: "Surgical Ward (Cholecystectomy)",
    scheme: "Glico Healthcare Gold",
    category: "Inpatient",
    total: 5400.0,
    insurance: 4800.0,
    balance: 0.0,
    status: "Paid in Full",
  },
  {
    id: "INV-2024-10937",
    patient: "Kojo Antwi",
    mrn: "MRN-GH-2024-8119",
    encounter: "Pediatric Day Clinic",
    scheme: "NHIS Primary Scheme",
    category: "Outpatient",
    total: 320.0,
    insurance: 320.0,
    balance: 0.0,
    status: "Cleared",
  },
];

export const invoicesFooter = {
  cashierDesk: "Cashier Desk #04 Active",
};

// --- Patient payment panel -----------------------------------------------------

// This panel is wired to the itemized encounter for INV-2024-10941 (Kwame Boateng).
export const selectedInvoicePatient = {
  name: "Kwame Boateng",
  sex: "Male",
  age: 54,
  initials: "KB",
  invoiceId: "INV-2024-10941",
  encounterLabel: "Cardiology OPD Workup",
  mrn: "MRN-GH-2024-8841",
  nhis: "89401923",
};

export type LineItem = {
  id: string;
  title: string;
  detail: string;
  amount: string;
  nhisCovered: string;
  patientDue: string;
};

export const lineItems: LineItem[] = [
  {
    id: "li1",
    title: "1. Specialist Consultation Fee",
    detail: "Dr. Kobina Asadu, MD (Cardiology Clinic)",
    amount: "GH¢250.00",
    nhisCovered: "GH¢200",
    patientDue: "GH¢50",
  },
  {
    id: "li2",
    title: "2. 12-Lead Electrocardiogram (ECG)",
    detail: "Diagnostic Unit · Diagnostic Code: CVD-ECG-02",
    amount: "GH¢180.00",
    nhisCovered: "GH¢140",
    patientDue: "GH¢40",
  },
  {
    id: "li3",
    title: "3. Serum Electrolytes & Renal Panel",
    detail: "Central Lab · Lab Order #LAB-8812",
    amount: "GH¢220.00",
    nhisCovered: "GH¢220",
    patientDue: "GH¢0.00",
  },
  {
    id: "li4",
    title: "4. Pharmacy e-Rx Dispensary",
    detail: "Amlodipine 10mg, Telmisartan 40mg (30 Days)",
    amount: "GH¢145.00",
    nhisCovered: "GH¢120",
    patientDue: "GH¢25",
  },
];

export type PaymentChannelId = "momo" | "pos" | "cash" | "bank";

export type PaymentChannel = { id: PaymentChannelId; label: string };

export const paymentChannels: PaymentChannel[] = [
  { id: "momo", label: "MoMo" },
  { id: "pos", label: "POS / Card" },
  { id: "cash", label: "Cash" },
  { id: "bank", label: "Bank" },
];

export const momoPayment = {
  providerLabel: "MTN MoMo / Telecel Instant Push",
  hubId: "Hub ID: MTN-KB-POS-09",
  payerMobile: "+233 24 412 8990",
  authRef: "CR-KB-2024-89912",
};

export const vatFooter = {
  label: "GRA Certified E-VAT Invoicing Active",
  sys: "Sys: AURA-E-VAT-GH99",
};
