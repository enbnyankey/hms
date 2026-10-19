// Pharmacy calls to the backend (/api/v1/pharmacy).

import { apiFetch } from "@/lib/api";

export type QueueCategory = "stat" | "ward" | "opd";

export type PharmacySummary = {
  pendingRx: number;
  pendingLines: number;
  avgWaitMinutes: number;
  dispensedToday: number;
  valueToday: number;
  lowStockCount: number;
  nhisCoveragePct: number | null;
  nhisLinesToday: number;
};

export type QueueItem = {
  patientId: string;
  rxRef: string;
  patientName: string;
  mrn: string;
  age: number | null;
  sex: string | null;
  category: QueueCategory;
  status: string;
  location: string;
  itemsSummary: string;
  lineCount: number;
  verifiedCount: number;
  prescriber: string;
  waitMinutes: number;
  flag: string | null;
  controlled: boolean;
};

export type Batch = { id: string; batchNo: string; expiryDate: string; qtyOnHand: number; expired: boolean };

export type RxLine = {
  orderId: string;
  drug: string;
  dose: string;
  route: string;
  frequency: string;
  indication: string | null;
  prescriber: string;
  orderedAt: string;
  verified: boolean;
  verifiedBy: string | null;
  verifiedAt: string | null;
  controlled: boolean;
  drugId: string | null;
  drugCode: string | null;
  drugName: string | null;
  unit: string | null;
  location: string | null;
  unitPrice: number | null;
  nhisCovered: boolean;
  stockOnHand: number;
  suggestedQty: number;
  batches: Batch[];
  problem: string | null;
  allergyAlert: string | null;
};

export type RxDetail = {
  summary: QueueItem;
  dob: string | null;
  bloodGroup: string | null;
  allergies: string | null;
  nhisNumber: string | null;
  nhisStatus: string | null;
  weightKg: number | null;
  copayFree: boolean;
  lines: RxLine[];
};

export type DispenseResult = {
  patientId: string;
  rxRef: string;
  patientName: string;
  mrn: string;
  category: QueueCategory;
  lines: {
    orderId: string;
    drugName: string;
    sig: string;
    quantity: number;
    unit: string;
    copay: number;
    batches: { batchNo: string; expiryDate: string; quantity: number }[];
  }[];
  totalCopay: number;
  dispensedBy: string;
  dispensedAt: string;
  awaitingCollection: boolean;
};

export type PurchaseOrder = {
  id: string;
  poNumber: string;
  drugId: string;
  drugName: string;
  quantity: number;
  unit: string;
  supplier: string;
  status: "ORDERED" | "RECEIVED" | "CANCELLED";
  orderedBy: string;
  orderedAt: string;
  receivedBy: string | null;
  receivedAt: string | null;
  batchNo: string | null;
};

export type DrugStock = {
  id: string;
  code: string;
  name: string;
  genericName: string;
  strength: string;
  form: string;
  unit: string;
  unitPrice: number;
  nhisCovered: boolean;
  controlled: boolean;
  coldChain: boolean;
  reorderLevel: number;
  location: string | null;
  supplier: string | null;
  onHand: number;
  expiredQty: number;
  nextExpiry: string | null;
  lowStock: boolean;
  batches: Batch[];
  openOrder: PurchaseOrder | null;
};

export type ControlledCount = {
  id: string;
  drugId: string;
  drugName: string;
  systemQty: number;
  countedQty: number;
  countedBy: string;
  witness: string;
  note: string | null;
  resolved: boolean;
  resolvedBy: string | null;
  resolvedAt: string | null;
  countedAt: string;
};

export type VaultItem = {
  drugId: string;
  drugName: string;
  unit: string;
  onHand: number;
  lastCount: ControlledCount | null;
  openDiscrepancies: ControlledCount[];
};

export type ColdChainReading = {
  id: string;
  unitName: string;
  temperature: number;
  inRange: boolean;
  note: string | null;
  recordedBy: string;
  recordedAt: string;
  resolved: boolean;
  resolvedBy: string | null;
  resolvedAt: string | null;
};

export type ColdChainUnit = {
  unitName: string;
  latest: ColdChainReading;
  openExcursions: ColdChainReading[];
  recent: ColdChainReading[];
};

export type DispensaryWindow = {
  waitingPatients: number;
  waiting: { patientId: string; patientName: string; mrn: string; items: number; readySince: string }[];
};

export type CallNextResult = { patientId: string; patientName: string; mrn: string; itemsHandedOver: number; stillWaiting: number };

export type ReceiveValues = { drugId?: string; quantity: number; expiryDate: string; batchNo?: string; supplier?: string };

const P = "/pharmacy";

export const fetchPharmacySummary = () => apiFetch<PharmacySummary>(`${P}/summary`);
export const fetchQueue = () => apiFetch<QueueItem[]>(`${P}/queue`);
export const fetchRx = (patientId: string) => apiFetch<RxDetail>(`${P}/rx/${patientId}`);
export const fetchFormulary = () => apiFetch<DrugStock[]>(`${P}/drugs`);
export const fetchVault = () => apiFetch<VaultItem[]>(`${P}/vault`);
export const fetchColdChain = () => apiFetch<ColdChainUnit[]>(`${P}/cold-chain`);
export const fetchWindow = () => apiFetch<DispensaryWindow>(`${P}/window`);

export const verifyLine = (orderId: string, verified: boolean) =>
  apiFetch<RxLine>(`${P}/orders/${orderId}/verify`, { method: "POST", body: { verified } });
export const rejectLine = (orderId: string, reason: string) =>
  apiFetch<void>(`${P}/orders/${orderId}/reject`, { method: "POST", body: { reason } });
export const flagRx = (patientId: string, reason: string) =>
  apiFetch<void>(`${P}/rx/${patientId}/flag`, { method: "POST", body: { reason } });
export const clearRxFlag = (patientId: string) => apiFetch<void>(`${P}/rx/${patientId}/flag`, { method: "DELETE" });
export const rejectRx = (patientId: string, reason: string) =>
  apiFetch<{ rejected: number }>(`${P}/rx/${patientId}/reject`, { method: "POST", body: { reason } });
export const dispenseRx = (patientId: string, lines: { orderId: string; quantity: number }[], witness?: string) =>
  apiFetch<DispenseResult>(`${P}/rx/${patientId}/dispense`, { method: "POST", body: { lines, witness: witness || undefined } });

export const createPurchaseOrder = (drugId: string, quantity: number, supplier?: string) =>
  apiFetch<PurchaseOrder>(`${P}/purchase-orders`, { method: "POST", body: { drugId, quantity, supplier: supplier || undefined } });
export const receivePurchaseOrder = (poId: string, v: ReceiveValues) =>
  apiFetch<DrugStock>(`${P}/purchase-orders/${poId}/receive`, { method: "POST", body: v });
export const cancelPurchaseOrder = (poId: string, reason: string) =>
  apiFetch<PurchaseOrder>(`${P}/purchase-orders/${poId}/cancel`, { method: "POST", body: { reason } });
export const receiveStock = (v: ReceiveValues) => apiFetch<DrugStock>(`${P}/stock/receive`, { method: "POST", body: v });
export const countStock = (drugId: string, counts: { batchId: string; quantity: number }[], note: string) =>
  apiFetch<DrugStock>(`${P}/drugs/${drugId}/count`, { method: "POST", body: { counts, note } });

export const recordVaultCount = (drugId: string, countedQty: number, witness: string, note?: string) =>
  apiFetch<ControlledCount>(`${P}/vault/counts`, { method: "POST", body: { drugId, countedQty, witness, note: note || undefined } });
export const resolveVaultCount = (id: string, note: string) =>
  apiFetch<ControlledCount>(`${P}/vault/counts/${id}/resolve`, { method: "POST", body: { note } });

export const recordColdChainReading = (unitName: string, temperature: number, note?: string, flag?: boolean) =>
  apiFetch<ColdChainReading>(`${P}/cold-chain/readings`, { method: "POST", body: { unitName, temperature, note: note || undefined, flag } });
export const resolveColdChainReading = (id: string) =>
  apiFetch<ColdChainReading>(`${P}/cold-chain/readings/${id}/resolve`, { method: "POST" });

export const callNextPatient = () => apiFetch<CallNextResult>(`${P}/window/call-next`, { method: "POST" });
