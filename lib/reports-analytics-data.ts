// Mock data for the Reports & Analytics module.

export const reportsHeader = {
  title: "Reports & Analytics",
  subtitle: "Korle-Bu Central Hospital · Operational, clinical & financial reporting for hospital leadership",
};

export type DateRangeId = "7d" | "30d" | "quarter" | "year";

export const dateRanges: { id: DateRangeId; label: string }[] = [
  { id: "7d", label: "Last 7 Days" },
  { id: "30d", label: "Last 30 Days" },
  { id: "quarter", label: "This Quarter" },
  { id: "year", label: "Year to Date" },
];

export type TrendPoint = { label: string; value: number };

// Multipliers applied to a base monthly trend so switching date range visibly
// changes the numbers without maintaining four separate datasets by hand.
export const rangeMultiplier: Record<DateRangeId, number> = {
  "7d": 0.22,
  "30d": 1,
  quarter: 3.1,
  year: 11.4,
};

export const patientVolumeTrend: TrendPoint[] = [
  { label: "Apr", value: 1180 },
  { label: "May", value: 1240 },
  { label: "Jun", value: 1310 },
  { label: "Jul", value: 1275 },
  { label: "Aug", value: 1390 },
  { label: "Sep", value: 1462 },
];

export const departmentRevenue = [
  { id: "outpatient", label: "Outpatient Consults", amount: 68400, colorClass: "bg-brand-teal" },
  { id: "inpatient", label: "Inpatient & Ward Care", amount: 91200, colorClass: "bg-brand-cyan" },
  { id: "pharmacy", label: "Pharmacy Dispensing", amount: 34700, colorClass: "bg-amber-400" },
  { id: "lab", label: "Laboratory & Diagnostics", amount: 22150, colorClass: "bg-violet-400" },
];

export const departmentRevenueDotColor: Record<string, string> = {
  "bg-brand-teal": "#0d9488",
  "bg-brand-cyan": "#0e7490",
  "bg-amber-400": "#fbbf24",
  "bg-violet-400": "#a78bfa",
};

export type ReportCategory = "clinical" | "financial" | "operational" | "compliance";

export const reportCategories: { id: ReportCategory; label: string }[] = [
  { id: "clinical", label: "Clinical" },
  { id: "financial", label: "Financial" },
  { id: "operational", label: "Operational" },
  { id: "compliance", label: "Compliance" },
];

export type ReportFormat = "PDF" | "CSV" | "XLSX";

export type SavedReport = {
  id: string;
  title: string;
  category: ReportCategory;
  range: string;
  generatedBy: string;
  generatedOn: string;
  format: ReportFormat;
  sizeKb: number;
};

export function nextReportId() {
  return `rpt-${Math.random().toString(36).slice(2, 9)}`;
}

export const initialSavedReports: SavedReport[] = [
  {
    id: "rpt-1001",
    title: "Monthly Clinical Outcomes Summary",
    category: "clinical",
    range: "01 Sep 2026 – 25 Sep 2026",
    generatedBy: "Dr. Kobina Asadu",
    generatedOn: "24 Sep 2026",
    format: "PDF",
    sizeKb: 842,
  },
  {
    id: "rpt-1002",
    title: "NHIS Claims Reconciliation Report",
    category: "financial",
    range: "Q3 2026",
    generatedBy: "Nadine Yankey",
    generatedOn: "23 Sep 2026",
    format: "XLSX",
    sizeKb: 1290,
  },
  {
    id: "rpt-1003",
    title: "Ward & Bed Occupancy Trend",
    category: "operational",
    range: "Last 30 Days",
    generatedBy: "Efua Mensah",
    generatedOn: "22 Sep 2026",
    format: "CSV",
    sizeKb: 214,
  },
  {
    id: "rpt-1004",
    title: "HIPAA / Ghana DPA Compliance Audit",
    category: "compliance",
    range: "Q3 2026",
    generatedBy: "Compliance Office",
    generatedOn: "18 Sep 2026",
    format: "PDF",
    sizeKb: 1774,
  },
  {
    id: "rpt-1005",
    title: "Pharmacy Inventory Turnover Report",
    category: "operational",
    range: "Last 30 Days",
    generatedBy: "Kojo Antwi",
    generatedOn: "16 Sep 2026",
    format: "XLSX",
    sizeKb: 588,
  },
];

export const reportTemplates: { id: string; category: ReportCategory; title: string; description: string }[] = [
  { id: "tpl-1", category: "clinical", title: "Clinical Outcomes Summary", description: "Diagnoses, treatment outcomes, and readmission rates." },
  { id: "tpl-2", category: "clinical", title: "Mortality & Morbidity Review", description: "Case-level review data for the M&M committee." },
  { id: "tpl-3", category: "financial", title: "Revenue & Collections Report", description: "Cash, NHIS, and private insurance revenue breakdown." },
  { id: "tpl-4", category: "financial", title: "NHIS Claims Reconciliation", description: "Submitted vs. approved claims, rejection reasons." },
  { id: "tpl-5", category: "operational", title: "Ward & Bed Occupancy Trend", description: "Occupancy rates and turnover time by ward." },
  { id: "tpl-6", category: "operational", title: "Staff Utilization Report", description: "Shift coverage and overtime by department." },
  { id: "tpl-7", category: "compliance", title: "Regulatory Compliance Audit", description: "HIPAA, ISO 27001 and Ghana DPA checklist status." },
  { id: "tpl-8", category: "compliance", title: "Access & Credentialing Review", description: "Staff privilege grants and re-verification status." },
];
