"use client";

import { useState } from "react";
import {
  AlertTriangle,
  Lock,
  Thermometer,
  DoorOpen,
  Pencil,
  PackagePlus,
  PackageCheck,
  CheckCircle2,
  ClipboardList,
  Plus,
} from "lucide-react";
import Card from "../Card";
import Modal from "../ui/Modal";
import ConfirmModal from "../ui/ConfirmModal";
import Button from "../ui/Button";
import ReceiveStockModal from "./ReceiveStockModal";
import type {
  ColdChainReading,
  ColdChainUnit,
  ControlledCount,
  DispensaryWindow,
  DrugStock,
  PurchaseOrder,
  ReceiveValues,
  VaultItem,
} from "@/lib/pharmacy-api";
import { dateTimeLabel, expiryLabel, timeLabel } from "@/lib/pharmacy-data";

export type SidebarActions = {
  reorder: (drug: DrugStock, qty: number, supplier: string) => Promise<boolean>;
  receivePo: (po: PurchaseOrder, v: ReceiveValues) => Promise<boolean>;
  cancelPo: (po: PurchaseOrder, reason: string) => Promise<boolean>;
  count: (drug: DrugStock, counts: { batchId: string; quantity: number }[], note: string) => Promise<boolean>;
  vaultCount: (item: VaultItem, counted: number, witness: string, note: string) => Promise<boolean>;
  resolveVault: (c: ControlledCount, note: string) => Promise<boolean>;
  reading: (unit: string, temperature: number, note: string, flag: boolean) => Promise<boolean>;
  resolveReading: (r: ColdChainReading) => Promise<boolean>;
  callNext: () => Promise<boolean>;
};

const input =
  "mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal";
const label = "text-[11px] font-semibold uppercase tracking-wide text-slate-400";
const small = "!rounded-md !px-2 !py-1 !text-[10px]";

export default function PharmacySidebar({
  drugs,
  vault,
  coldChain,
  window: win,
  canWork,
  actions,
}: {
  drugs: DrugStock[];
  vault: VaultItem[];
  coldChain: ColdChainUnit[];
  window: DispensaryWindow;
  canWork: boolean;
  actions: SidebarActions;
}) {
  const low = drugs
    .filter((d) => d.lowStock)
    .sort((a, b) => a.onHand / Math.max(1, a.reorderLevel) - b.onHand / Math.max(1, b.reorderLevel));

  const [reorderDrug, setReorderDrug] = useState<DrugStock | null>(null);
  const [receivePo, setReceivePo] = useState<PurchaseOrder | null>(null);
  const [cancelPo, setCancelPo] = useState<PurchaseOrder | null>(null);
  const [countDrugId, setCountDrugId] = useState<string | null>(null);
  const [vaultOpen, setVaultOpen] = useState(false);
  const [resolveCount, setResolveCount] = useState<ControlledCount | null>(null);
  const [readingOpen, setReadingOpen] = useState(false);
  const [calling, setCalling] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);

  const vaultIssues = vault.flatMap((v) => v.openDiscrepancies);
  const lastVaultCount = vault
    .map((v) => v.lastCount)
    .filter((c): c is ControlledCount => !!c)
    .sort((a, b) => b.countedAt.localeCompare(a.countedAt))[0];

  return (
    <div className="space-y-4">
      {/* ---- Low stock ---- */}
      <Card
        icon={AlertTriangle}
        iconClassName="bg-status-red-bg text-status-red"
        title="Low-Stock Alerts"
        subtitle={`${low.length} item(s) at or below reorder level`}
        headerClassName="px-4 py-3"
        bodyClassName="p-4"
        action={
          canWork ? (
            <Button variant="ghost" className={small} onClick={() => setCountDrugId("")} title="Count any shelf">
              <ClipboardList className="h-3 w-3" /> Count
            </Button>
          ) : undefined
        }
      >
        <div className="space-y-2.5">
          {low.length === 0 && <p className="text-[11px] text-slate-400">All stock is above its reorder level.</p>}
          {low.map((d) => (
            <div key={d.id} className="rounded-lg border border-status-red-bg bg-status-red-bg/40 p-2.5">
              <div className="flex items-start justify-between gap-2">
                <p className="text-[11px] font-bold text-slate-800">{d.name}</p>
                <span className="shrink-0 text-[11px] font-extrabold text-status-red">
                  {d.onHand} <span className="font-medium text-slate-400">{d.unit}</span>
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500">
                Reorder level {d.reorderLevel} · {d.supplier ?? "No supplier"}
                {d.nextExpiry ? ` · next exp ${expiryLabel(d.nextExpiry)}` : ""}
              </p>
              {d.openOrder && (
                <p className="mt-0.5 text-[10px] font-semibold text-status-green">
                  {d.openOrder.poNumber} on order · {d.openOrder.quantity} {d.unit} · {dateTimeLabel(d.openOrder.orderedAt)}
                </p>
              )}
              {canWork && (
                <div className="mt-1.5 flex flex-wrap items-center justify-end gap-1.5">
                  <Button variant="ghost" className={small} onClick={() => setCountDrugId(d.id)}>
                    <Pencil className="h-3 w-3" /> Adjust
                  </Button>
                  {d.openOrder ? (
                    <>
                      <Button variant="ghost" className={small} onClick={() => setCancelPo(d.openOrder)}>
                        Cancel PO
                      </Button>
                      <Button variant="primary" className={small} onClick={() => setReceivePo(d.openOrder)}>
                        <PackageCheck className="h-3 w-3" /> Receive
                      </Button>
                    </>
                  ) : (
                    <Button variant="danger" className={small} onClick={() => setReorderDrug(d)}>
                      <PackagePlus className="h-3 w-3" /> Reorder
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* ---- Controlled vault ---- */}
      <Card
        icon={Lock}
        iconClassName="bg-slate-100 text-slate-600"
        title="Controlled Drug Vault"
        subtitle={lastVaultCount ? `Last count ${dateTimeLabel(lastVaultCount.countedAt)}` : "No counts recorded"}
        headerClassName="px-4 py-3"
        bodyClassName="p-4"
      >
        <div className="space-y-1.5">
          {vault.map((v) => (
            <div key={v.drugId} className="flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-slate-700">{v.drugName}</p>
              <p className="shrink-0 text-sm font-extrabold text-slate-900">
                {v.onHand}
                <span className="ml-1 text-[10px] font-semibold text-slate-400">{v.unit}</span>
              </p>
            </div>
          ))}
        </div>
        {lastVaultCount && (
          <p className="mt-2 text-[10px] text-slate-400">
            Counted by {lastVaultCount.countedBy}, witness {lastVaultCount.witness}
          </p>
        )}
        {vaultIssues.map((c) => (
          <div key={c.id} className="mt-2 rounded-lg border border-status-red-bg bg-status-red-bg/40 px-2.5 py-2 text-[10px] text-status-red">
            <p className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="h-3 w-3 shrink-0" /> {c.drugName}: counted {c.countedQty}, register {c.systemQty}
            </p>
            <p className="mt-0.5 text-slate-500">
              {dateTimeLabel(c.countedAt)} · {c.countedBy} / {c.witness}
              {c.note ? ` · ${c.note}` : ""}
            </p>
            {canWork && (
              <div className="mt-1 text-right">
                <Button variant="ghost" className={small} onClick={() => setResolveCount(c)}>
                  Resolve
                </Button>
              </div>
            )}
          </div>
        ))}
        {canWork && (
          <Button variant="secondary" className="mt-2.5 w-full !py-1.5 !text-[11px]" onClick={() => setVaultOpen(true)}>
            <ClipboardList className="h-3.5 w-3.5" /> Record Vault Count
          </Button>
        )}
      </Card>

      {/* ---- Cold chain ---- */}
      <Card
        icon={Thermometer}
        iconClassName="bg-blue-50 text-status-blue"
        title="Cold Chain Monitoring"
        subtitle="Safe range 2 °C – 8 °C"
        headerClassName="px-4 py-3"
        bodyClassName="p-4"
      >
        <div className="space-y-2">
          {coldChain.map((u) => {
            const bad = u.openExcursions.length > 0;
            return (
              <div key={u.unitName}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-semibold text-slate-700">{u.unitName}</p>
                    <p className="text-[10px] text-slate-400">
                      {timeLabel(u.latest.recordedAt)} · {u.latest.recordedBy}
                    </p>
                  </div>
                  <p className={`text-lg font-extrabold ${bad || !u.latest.inRange ? "text-status-red" : "text-status-blue"}`}>
                    {Number(u.latest.temperature).toFixed(1)}°C
                  </p>
                </div>
                {u.openExcursions.map((x) => (
                  <div
                    key={x.id}
                    className="mt-1 flex items-center justify-between gap-2 rounded-lg border border-status-red-bg bg-status-red-bg/40 px-2.5 py-1.5 text-[10px] text-status-red"
                  >
                    <span className="font-semibold">
                      {Number(x.temperature).toFixed(1)}°C at {timeLabel(x.recordedAt)}
                      {x.note ? ` — ${x.note}` : ""}
                    </span>
                    {canWork && (
                      <Button
                        variant="ghost"
                        className={small}
                        loading={resolvingId === x.id}
                        onClick={async () => {
                          setResolvingId(x.id);
                          await actions.resolveReading(x);
                          setResolvingId(null);
                        }}
                      >
                        Resolve
                      </Button>
                    )}
                  </div>
                ))}
                {!bad && <p className="text-[10px] font-semibold text-status-green">Within safe range</p>}
              </div>
            );
          })}
        </div>
        {canWork && (
          <Button variant="secondary" className="mt-2.5 w-full !py-1.5 !text-[11px]" onClick={() => setReadingOpen(true)}>
            <Plus className="h-3.5 w-3.5" /> Log Reading / Flag Issue
          </Button>
        )}
      </Card>

      {/* ---- Dispensary window ---- */}
      <Card
        icon={DoorOpen}
        iconClassName="bg-teal-50 text-brand-teal"
        title="Dispensary Window"
        subtitle={`Waiting to collect: ${win.waitingPatients} patient(s)`}
        headerClassName="px-4 py-3"
        bodyClassName="p-4"
      >
        {win.waiting.slice(0, 4).map((w, i) => (
          <p key={w.patientId} className={`text-[11px] ${i === 0 ? "font-bold text-slate-800" : "text-slate-500"}`}>
            {i === 0 ? "Next: " : ""}
            {w.patientName} · {w.items} item(s) · ready {timeLabel(w.readySince)}
          </p>
        ))}
        {canWork && (
          <Button
            variant="primary"
            className="mt-2 w-full !py-2 !text-xs"
            disabled={win.waitingPatients <= 0}
            loading={calling}
            onClick={async () => {
              setCalling(true);
              await actions.callNext();
              setCalling(false);
            }}
          >
            {win.waitingPatients <= 0 ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" /> No Patients Waiting
              </>
            ) : (
              "Call Next & Hand Over"
            )}
          </Button>
        )}
      </Card>

      {/* ---- Modals ---- */}
      <ReorderModal drug={reorderDrug} onClose={() => setReorderDrug(null)} onSubmit={actions.reorder} />
      <ReceiveStockModal
        open={!!receivePo}
        onClose={() => setReceivePo(null)}
        drugs={drugs}
        purchaseOrder={receivePo}
        onSubmit={(v) => (receivePo ? actions.receivePo(receivePo, v) : Promise.resolve(false))}
      />
      <CountModal drugId={countDrugId} drugs={drugs} onClose={() => setCountDrugId(null)} onSubmit={actions.count} />
      <VaultCountModal open={vaultOpen} vault={vault} onClose={() => setVaultOpen(false)} onSubmit={actions.vaultCount} />
      <ReadingModal open={readingOpen} units={coldChain.map((u) => u.unitName)} onClose={() => setReadingOpen(false)} onSubmit={actions.reading} />

      <ConfirmModal
        open={!!cancelPo}
        onClose={() => setCancelPo(null)}
        onConfirm={async (reason) => {
          if (cancelPo && (await actions.cancelPo(cancelPo, reason ?? ""))) setCancelPo(null);
        }}
        variant="reject"
        title="Cancel Purchase Order"
        description={cancelPo ? `Cancel ${cancelPo.poNumber} (${cancelPo.quantity} ${cancelPo.unit} of ${cancelPo.drugName})?` : ""}
        confirmLabel="Cancel Order"
        cancelLabel="Keep Order"
        requireReason
        reasonLabel="Reason"
        reasonPlaceholder="e.g. Supplier out of stock, ordering from CMS instead…"
      />
      <ConfirmModal
        open={!!resolveCount}
        onClose={() => setResolveCount(null)}
        onConfirm={async (note) => {
          if (resolveCount && (await actions.resolveVault(resolveCount, note ?? ""))) setResolveCount(null);
        }}
        variant="approve"
        title="Resolve Vault Discrepancy"
        description={
          resolveCount
            ? `${resolveCount.drugName}: counted ${resolveCount.countedQty}, register ${resolveCount.systemQty}. Record how it was resolved.`
            : ""
        }
        confirmLabel="Mark Resolved"
        requireReason
        reasonLabel="Resolution"
        reasonPlaceholder="e.g. Ampoule found in ICU return bag, register reconciled…"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------

function Footer({ onCancel, onSave, saving, disabled, label: text }: { onCancel: () => void; onSave: () => void; saving: boolean; disabled: boolean; label: string }) {
  return (
    <div className="flex justify-end gap-2 border-t border-surface-border pt-3">
      <Button variant="secondary" onClick={onCancel} disabled={saving}>
        Cancel
      </Button>
      <Button variant="primary" onClick={onSave} loading={saving} disabled={disabled}>
        {text}
      </Button>
    </div>
  );
}

function ReorderModal({
  drug,
  onClose,
  onSubmit,
}: {
  drug: DrugStock | null;
  onClose: () => void;
  onSubmit: (drug: DrugStock, qty: number, supplier: string) => Promise<boolean>;
}) {
  return (
    <Modal open={!!drug} onClose={onClose} title="Place Reorder" description={drug?.name} icon={PackagePlus} size="sm">
      {drug && <ReorderForm key={drug.id} drug={drug} onClose={onClose} onSubmit={onSubmit} />}
    </Modal>
  );
}

function ReorderForm({ drug, onClose, onSubmit }: { drug: DrugStock; onClose: () => void; onSubmit: (drug: DrugStock, qty: number, supplier: string) => Promise<boolean> }) {
  const [qty, setQty] = useState(String(Math.max(drug.reorderLevel * 2 - drug.onHand, 10)));
  const [supplier, setSupplier] = useState(drug.supplier ?? "");
  const [saving, setSaving] = useState(false);
  const invalid = !qty || Number(qty) <= 0 || !supplier.trim();
  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500">
        {drug.onHand} {drug.unit} on hand · reorder level {drug.reorderLevel}. A PO number is generated when you place the order.
      </p>
      <div>
        <label className={label}>Quantity ({drug.unit})</label>
        <input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} className={input} />
      </div>
      <div>
        <label className={label}>Supplier</label>
        <input value={supplier} onChange={(e) => setSupplier(e.target.value)} className={input} />
      </div>
      <Footer
        onCancel={onClose}
        saving={saving}
        disabled={invalid}
        label="Place Order"
        onSave={async () => {
          setSaving(true);
          const ok = await onSubmit(drug, Number(qty), supplier.trim());
          setSaving(false);
          if (ok) onClose();
        }}
      />
    </div>
  );
}

function CountModal({
  drugId,
  drugs,
  onClose,
  onSubmit,
}: {
  drugId: string | null;
  drugs: DrugStock[];
  onClose: () => void;
  onSubmit: (drug: DrugStock, counts: { batchId: string; quantity: number }[], note: string) => Promise<boolean>;
}) {
  return (
    <Modal open={drugId !== null} onClose={onClose} title="Stock Count / Adjust" description="Enter what is physically on the shelf" icon={Pencil} size="sm">
      {drugId !== null && <CountForm key={drugId} initialDrugId={drugId} drugs={drugs} onClose={onClose} onSubmit={onSubmit} />}
    </Modal>
  );
}

function CountForm({
  initialDrugId,
  drugs,
  onClose,
  onSubmit,
}: {
  initialDrugId: string;
  drugs: DrugStock[];
  onClose: () => void;
  onSubmit: (drug: DrugStock, counts: { batchId: string; quantity: number }[], note: string) => Promise<boolean>;
}) {
  const [drugId, setDrugId] = useState(initialDrugId);
  const drug = drugs.find((d) => d.id === drugId);
  const [counts, setCounts] = useState<Record<string, string>>(() =>
    Object.fromEntries((drug?.batches ?? []).map((b) => [b.id, String(b.qtyOnHand)]))
  );
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const changed = (drug?.batches ?? []).filter((b) => counts[b.id] !== undefined && Number(counts[b.id]) !== b.qtyOnHand);
  const bad = (drug?.batches ?? []).some((b) => counts[b.id] === "" || Number(counts[b.id]) < 0 || !Number.isInteger(Number(counts[b.id])));
  const invalid = !drug || changed.length === 0 || bad || !note.trim();

  return (
    <div className="space-y-3">
      <div>
        <label className={label}>Drug</label>
        <select
          value={drugId}
          onChange={(e) => {
            setDrugId(e.target.value);
            const d = drugs.find((x) => x.id === e.target.value);
            setCounts(Object.fromEntries((d?.batches ?? []).map((b) => [b.id, String(b.qtyOnHand)])));
          }}
          className={input}
        >
          <option value="">Select a drug…</option>
          {drugs.map((d) => (
            <option key={d.id} value={d.id}>
              {d.name}
            </option>
          ))}
        </select>
      </div>
      {drug && (
        <div className="space-y-1.5">
          {drug.batches.length === 0 && <p className="text-[11px] text-slate-400">No batches on record. Use Receive Stock to add one.</p>}
          {drug.batches.map((b) => (
            <div key={b.id} className="grid grid-cols-[1fr_90px] items-center gap-2">
              <p className="text-[11px] text-slate-600">
                <span className="font-mono font-semibold">{b.batchNo}</span> · exp {expiryLabel(b.expiryDate)}
                {b.expired && <span className="ml-1 font-semibold text-status-red">EXPIRED</span>}
                <span className="block text-[10px] text-slate-400">System: {b.qtyOnHand}</span>
              </p>
              <input
                type="number"
                min={0}
                value={counts[b.id] ?? ""}
                onChange={(e) => setCounts((c) => ({ ...c, [b.id]: e.target.value }))}
                className="w-full rounded-md border border-surface-border px-2 py-1.5 text-sm text-slate-800 outline-none focus:border-brand-teal"
              />
            </div>
          ))}
        </div>
      )}
      <div>
        <label className={label}>Reason</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Monthly count, 1 vial broken, expired stock removed…" className={input} />
      </div>
      <Footer
        onCancel={onClose}
        saving={saving}
        disabled={invalid}
        label={changed.length ? `Save ${changed.length} change(s)` : "No changes"}
        onSave={async () => {
          if (!drug) return;
          setSaving(true);
          const ok = await onSubmit(drug, changed.map((b) => ({ batchId: b.id, quantity: Number(counts[b.id]) })), note.trim());
          setSaving(false);
          if (ok) onClose();
        }}
      />
    </div>
  );
}

function VaultCountModal({
  open,
  vault,
  onClose,
  onSubmit,
}: {
  open: boolean;
  vault: VaultItem[];
  onClose: () => void;
  onSubmit: (item: VaultItem, counted: number, witness: string, note: string) => Promise<boolean>;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Record Vault Count" description="Two-person count of a controlled drug" icon={Lock} size="sm">
      {open && <VaultForm vault={vault} onClose={onClose} onSubmit={onSubmit} />}
    </Modal>
  );
}

function VaultForm({ vault, onClose, onSubmit }: { vault: VaultItem[]; onClose: () => void; onSubmit: (item: VaultItem, counted: number, witness: string, note: string) => Promise<boolean> }) {
  const [drugId, setDrugId] = useState(vault[0]?.drugId ?? "");
  const [counted, setCounted] = useState("");
  const [witness, setWitness] = useState("");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const item = vault.find((v) => v.drugId === drugId);
  const invalid = !item || counted === "" || Number(counted) < 0 || !witness.trim();
  const mismatch = item && counted !== "" && Number(counted) !== item.onHand;
  return (
    <div className="space-y-3">
      <div>
        <label className={label}>Drug</label>
        <select value={drugId} onChange={(e) => setDrugId(e.target.value)} className={input}>
          {vault.map((v) => (
            <option key={v.drugId} value={v.drugId}>
              {v.drugName}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className={label}>Counted quantity{item ? ` (${item.unit})` : ""}</label>
        <input type="number" min={0} value={counted} onChange={(e) => setCounted(e.target.value)} className={input} />
        <p className="mt-1 text-[11px] text-slate-400">Count first, then compare: the register figure is shown after you enter yours.</p>
        {item && counted !== "" && (
          <p className={`mt-1 text-[11px] font-semibold ${mismatch ? "text-status-red" : "text-status-green"}`}>
            Register: {item.onHand} {item.unit} — {mismatch ? "this will be recorded as a discrepancy" : "balanced"}
          </p>
        )}
      </div>
      <div>
        <label className={label}>Witness</label>
        <input value={witness} onChange={(e) => setWitness(e.target.value)} placeholder="Second person counting" className={input} />
      </div>
      <div>
        <label className={label}>Note</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Shift handover count" className={input} />
      </div>
      <Footer
        onCancel={onClose}
        saving={saving}
        disabled={invalid}
        label="Save Count"
        onSave={async () => {
          if (!item) return;
          setSaving(true);
          const ok = await onSubmit(item, Number(counted), witness.trim(), note.trim());
          setSaving(false);
          if (ok) onClose();
        }}
      />
    </div>
  );
}

function ReadingModal({
  open,
  units,
  onClose,
  onSubmit,
}: {
  open: boolean;
  units: string[];
  onClose: () => void;
  onSubmit: (unit: string, temperature: number, note: string, flag: boolean) => Promise<boolean>;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Cold Chain Reading" description="Log a fridge temperature or flag a problem" icon={Thermometer} size="sm">
      {open && <ReadingForm units={units} onClose={onClose} onSubmit={onSubmit} />}
    </Modal>
  );
}

function ReadingForm({ units, onClose, onSubmit }: { units: string[]; onClose: () => void; onSubmit: (unit: string, temperature: number, note: string, flag: boolean) => Promise<boolean> }) {
  const [unit, setUnit] = useState(units[0] ?? "");
  const [temp, setTemp] = useState("");
  const [note, setNote] = useState("");
  const [flag, setFlag] = useState(false);
  const [saving, setSaving] = useState(false);
  const t = Number(temp);
  const outOfRange = temp !== "" && (t < 2 || t > 8);
  const invalid = !unit.trim() || temp === "" || Number.isNaN(t) || t < -40 || t > 60 || (flag && !note.trim());
  return (
    <div className="space-y-3">
      <div>
        <label className={label}>Unit</label>
        <input list="cold-units" value={unit} onChange={(e) => setUnit(e.target.value)} className={input} />
        <datalist id="cold-units">
          {units.map((u) => (
            <option key={u} value={u} />
          ))}
        </datalist>
      </div>
      <div>
        <label className={label}>Temperature (°C)</label>
        <input type="number" step="0.1" value={temp} onChange={(e) => setTemp(e.target.value)} className={input} />
        {outOfRange && <p className="mt-1 text-[11px] font-semibold text-status-red">Outside 2–8 °C: this will be logged as an excursion.</p>}
      </div>
      <label className="flex items-center gap-2 text-xs text-slate-600">
        <input type="checkbox" className="accent-teal-600" checked={flag} onChange={(e) => setFlag(e.target.checked)} />
        Flag an issue even if the reading is in range (door left open, alarm, power cut)
      </label>
      <div>
        <label className={label}>Note{flag ? "" : " (optional)"}</label>
        <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Door found ajar at 02:00" className={input} />
      </div>
      <Footer
        onCancel={onClose}
        saving={saving}
        disabled={invalid}
        label="Save Reading"
        onSave={async () => {
          setSaving(true);
          const ok = await onSubmit(unit.trim(), t, note.trim(), flag);
          setSaving(false);
          if (ok) onClose();
        }}
      />
    </div>
  );
}
