// Display helpers for the Pharmacy & Dispensary Hub. All data comes from the
// backend through lib/pharmacy-api.ts.

import type { Batch } from "@/lib/pharmacy-api";

export const CATEGORY_LABEL: Record<string, string> = { stat: "STAT", ward: "Ward", opd: "OPD" };

export const STATUS_STYLE: Record<string, string> = {
  "Ready for Final Check": "bg-status-green-bg text-status-green",
  "STAT / Emergency": "bg-status-red-bg text-status-red",
  "Flagged for Review": "bg-status-amber-bg text-status-amber",
  "Stock / Formulary Issue": "bg-status-red-bg text-status-red",
  "Awaiting Verification": "bg-status-blue-bg text-status-blue",
};

export function cedis(n: number | null | undefined): string {
  return `GH¢${(n ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** "2027-03-31" -> "03/2027" */
export function expiryLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  const [y, m] = iso.split("-");
  return `${m}/${y}`;
}

export function waitLabel(minutes: number): string {
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  return `${h}h ${minutes % 60}m`;
}

export function dateTimeLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function timeLabel(iso: string | null | undefined): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export type FefoPick = { batchNo: string; expiryDate: string; quantity: number };

/**
 * Which batches the server will take `qty` from: earliest expiry first,
 * skipping expired or empty batches. Mirrors PharmacyService.dispense so the
 * pharmacist sees the batch before confirming — nothing is typed by hand.
 */
export function fefoPreview(batches: Batch[], qty: number): { picks: FefoPick[]; short: number } {
  let remaining = Math.max(0, Math.floor(qty));
  const picks: FefoPick[] = [];
  const usable = batches
    .filter((b) => !b.expired && b.qtyOnHand > 0)
    .sort((a, b) => a.expiryDate.localeCompare(b.expiryDate));
  for (const b of usable) {
    if (remaining === 0) break;
    const take = Math.min(remaining, b.qtyOnHand);
    picks.push({ batchNo: b.batchNo, expiryDate: b.expiryDate, quantity: take });
    remaining -= take;
  }
  return { picks, short: remaining };
}

/** Today + n months as yyyy-mm-dd, for expiry date defaults. */
export function monthsFromNow(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() + n);
  return d.toISOString().slice(0, 10);
}
