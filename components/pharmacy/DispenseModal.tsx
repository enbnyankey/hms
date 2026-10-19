"use client";

import { useState } from "react";
import { CheckCircle2, Lock, PackageSearch, AlertTriangle } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import type { RxDetail } from "@/lib/pharmacy-api";
import { cedis, expiryLabel, fefoPreview } from "@/lib/pharmacy-data";

type LineState = { include: boolean; qty: string };

/**
 * Dispense dialog. The pharmacist only confirms quantities: batches are
 * picked automatically, earliest expiry first (FEFO), and shown here before
 * anything is taken off the shelf.
 */
export default function DispenseModal({
  rx,
  onClose,
  onConfirm,
}: {
  rx: RxDetail | null;
  onClose: () => void;
  onConfirm: (lines: { orderId: string; quantity: number }[], witness?: string) => Promise<boolean>;
}) {
  return (
    <Modal
      open={!!rx}
      onClose={onClose}
      title="Dispense Prescription"
      description={rx ? `${rx.summary.rxRef} · ${rx.summary.patientName} · ${rx.summary.location}` : undefined}
      icon={CheckCircle2}
      tone="success"
      size="lg"
    >
      {rx && <DispenseForm key={rx.summary.patientId + rx.lines.length} rx={rx} onClose={onClose} onConfirm={onConfirm} />}
    </Modal>
  );
}

function DispenseForm({
  rx,
  onClose,
  onConfirm,
}: {
  rx: RxDetail;
  onClose: () => void;
  onConfirm: (lines: { orderId: string; quantity: number }[], witness?: string) => Promise<boolean>;
}) {
  const [state, setState] = useState<Record<string, LineState>>(() =>
    Object.fromEntries(
      rx.lines.map((l) => [
        l.orderId,
        { include: !!l.drugId && l.stockOnHand > 0, qty: String(Math.max(1, Math.min(l.suggestedQty, l.stockOnHand || l.suggestedQty))) },
      ])
    )
  );
  const [witness, setWitness] = useState("");
  const [saving, setSaving] = useState(false);

  const chosen = rx.lines.filter((l) => state[l.orderId]?.include);
  const needsWitness = chosen.some((l) => l.controlled);
  const previews = Object.fromEntries(
    rx.lines.map((l) => [l.orderId, fefoPreview(l.batches, Number(state[l.orderId]?.qty) || 0)])
  );
  const badQty = chosen.some((l) => {
    const q = Number(state[l.orderId].qty);
    return !q || q <= 0 || !Number.isInteger(q) || previews[l.orderId].short > 0;
  });
  const total = chosen.reduce((sum, l) => {
    const q = Number(state[l.orderId].qty) || 0;
    const free = rx.copayFree && l.nhisCovered;
    return sum + (free ? 0 : q * (l.unitPrice ?? 0));
  }, 0);
  const invalid = chosen.length === 0 || badQty || (needsWitness && !witness.trim());

  function set(orderId: string, patch: Partial<LineState>) {
    setState((s) => ({ ...s, [orderId]: { ...s[orderId], ...patch } }));
  }

  async function submit() {
    if (invalid) return;
    setSaving(true);
    const ok = await onConfirm(
      chosen.map((l) => ({ orderId: l.orderId, quantity: Number(state[l.orderId].qty) })),
      needsWitness ? witness.trim() : undefined
    );
    setSaving(false);
    if (ok) onClose();
  }

  return (
    <div className="space-y-3">
      <p className="flex items-center gap-1.5 rounded-md bg-slate-50 px-2.5 py-1.5 text-[11px] text-slate-500">
        <PackageSearch className="h-3.5 w-3.5 shrink-0 text-brand-teal" />
        Batches are picked automatically, earliest expiry first. Unverified lines are verified in your name when you confirm.
      </p>

      {rx.lines.map((l) => {
        const s = state[l.orderId];
        const p = previews[l.orderId];
        const blocked = !l.drugId || l.stockOnHand === 0;
        return (
          <div key={l.orderId} className={`rounded-lg border px-3 py-2 ${s.include ? "border-brand-teal/50 bg-white" : "border-surface-border bg-slate-50"}`}>
            <label className="flex items-start gap-2">
              <input
                type="checkbox"
                className="mt-0.5 accent-teal-600"
                checked={s.include}
                disabled={blocked}
                onChange={(e) => set(l.orderId, { include: e.target.checked })}
              />
              <span className="flex-1">
                <span className="flex flex-wrap items-center gap-1.5 text-[12px] font-bold text-slate-800">
                  {l.drugName ?? l.drug}
                  {l.controlled && (
                    <span className="flex items-center gap-0.5 rounded bg-slate-100 px-1.5 text-[10px] text-slate-600">
                      <Lock className="h-2.5 w-2.5" /> CD
                    </span>
                  )}
                </span>
                <span className="block text-[10px] text-slate-500">
                  Rx: {l.drug} {l.dose} {l.route} · {l.frequency}
                </span>
              </span>
            </label>

            {blocked ? (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-status-red">
                <AlertTriangle className="h-3 w-3" /> {l.problem ?? "Cannot be supplied"} — reject this line from the prescription panel.
              </p>
            ) : (
              s.include && (
                <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-[120px_1fr]">
                  <div>
                    <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Qty ({l.unit})</label>
                    <input
                      type="number"
                      min={1}
                      value={s.qty}
                      onChange={(e) => set(l.orderId, { qty: e.target.value })}
                      className="mt-0.5 w-full rounded-md border border-surface-border px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-brand-teal"
                    />
                    <p className="mt-0.5 text-[10px] text-slate-400">Suggested {l.suggestedQty} · {l.stockOnHand} in stock</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">Auto-selected batch</p>
                    <div className="mt-0.5 space-y-0.5">
                      {p.picks.map((b) => (
                        <p key={b.batchNo} className="rounded bg-teal-50 px-2 py-1 font-mono text-[11px] text-slate-700">
                          {b.batchNo} · exp {expiryLabel(b.expiryDate)} · ×{b.quantity}
                        </p>
                      ))}
                      {p.short > 0 && (
                        <p className="text-[11px] font-semibold text-status-red">
                          {p.short} {l.unit} short — only {l.stockOnHand} in date on the shelf.
                        </p>
                      )}
                    </div>
                    <p className="mt-0.5 text-[10px] text-slate-400">
                      {l.location} · Co-pay{" "}
                      {rx.copayFree && l.nhisCovered ? "GH¢0.00 (NHIS)" : cedis((Number(s.qty) || 0) * (l.unitPrice ?? 0))}
                    </p>
                  </div>
                </div>
              )
            )}
            {l.allergyAlert && (
              <p className="mt-1 flex items-center gap-1 text-[11px] font-semibold text-status-amber">
                <AlertTriangle className="h-3 w-3" /> {l.allergyAlert}
              </p>
            )}
          </div>
        );
      })}

      {needsWitness && (
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Witness (controlled drug)</label>
          <input
            value={witness}
            onChange={(e) => setWitness(e.target.value)}
            placeholder="Name of the second checker"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-surface-border pt-3">
        <p className="text-xs text-slate-500">
          Patient co-pay: <span className="font-bold text-slate-800">{cedis(total)}</span>
          {rx.copayFree ? " · NHIS verified" : rx.nhisStatus ? ` · NHIS ${rx.nhisStatus.replace("_", " ")}` : ""}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button variant="success" onClick={submit} loading={saving} disabled={invalid}>
            Confirm Dispense ({chosen.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
