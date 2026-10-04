"use client";

import { useState } from "react";
import { AlertTriangle, Lock, Thermometer, DoorOpen, Pencil, PackagePlus, CheckCircle2 } from "lucide-react";
import Card from "../Card";
import Modal from "../ui/Modal";
import ConfirmModal from "../ui/ConfirmModal";
import Button from "../ui/Button";
import {
  lowStockAlerts as initialLowStockAlerts,
  controlledVault,
  coldChainLog,
  dispensaryWindow,
  type LowStockAlert,
} from "@/lib/pharmacy-data";
import { actionToast } from "@/lib/actions";

function parseFirstNumber(text: string, fallback = 0) {
  const match = text.match(/\d+/);
  return match ? parseInt(match[0], 10) : fallback;
}

export default function PharmacySidebar() {
  const [stockItems, setStockItems] = useState<LowStockAlert[]>(initialLowStockAlerts);

  const [reorderItem, setReorderItem] = useState<LowStockAlert | null>(null);
  const [reorderQty, setReorderQty] = useState("");
  const [placingOrder, setPlacingOrder] = useState(false);

  const [adjustItem, setAdjustItem] = useState<LowStockAlert | null>(null);
  const [adjustQty, setAdjustQty] = useState("");
  const [savingAdjust, setSavingAdjust] = useState(false);

  const [vaultFlag, setVaultFlag] = useState<string | null>(null);
  const [showVaultFlagModal, setShowVaultFlagModal] = useState(false);

  const [coldChainFlag, setColdChainFlag] = useState<string | null>(null);
  const [showColdChainModal, setShowColdChainModal] = useState(false);

  const [queueWaiting, setQueueWaiting] = useState(() =>
    parseFirstNumber(dispensaryWindow.queueWaiting, 0)
  );

  function openReorder(item: LowStockAlert) {
    const thresholdNum = parseFirstNumber(item.threshold, 0);
    const qtyNum = parseFirstNumber(item.qty, 0);
    const suggested = Math.max(thresholdNum - qtyNum, 10);
    setReorderQty(String(suggested));
    setReorderItem(item);
  }

  function confirmReorder() {
    if (!reorderItem) return;
    const qty = Number(reorderQty);
    if (!qty || qty <= 0) return;
    setPlacingOrder(true);
    setTimeout(() => {
      const poNumber = `PO #${8800 + Math.floor(Math.random() * 200)}`;
      setStockItems((prev) =>
        prev.map((i) =>
          i.id === reorderItem.id
            ? { ...i, reorder: false, poNote: `${poNumber} Generated (${qty} ${i.unit})` }
            : i
        )
      );
      actionToast("Reorder placed", `${reorderItem.name} · ${qty} ${reorderItem.unit} on order`, "success");
      setPlacingOrder(false);
      setReorderItem(null);
    }, 400);
  }

  function openAdjust(item: LowStockAlert) {
    setAdjustQty(item.qty);
    setAdjustItem(item);
  }

  function confirmAdjust() {
    if (!adjustItem) return;
    const qty = Number(adjustQty);
    if (qty < 0 || Number.isNaN(qty)) return;
    setSavingAdjust(true);
    setTimeout(() => {
      setStockItems((prev) => prev.map((i) => (i.id === adjustItem.id ? { ...i, qty: String(qty) } : i)));
      actionToast("Inventory adjusted", `${adjustItem.name} now at ${qty} ${adjustItem.unit}`, "success");
      setSavingAdjust(false);
      setAdjustItem(null);
    }, 400);
  }

  function callNext() {
    if (queueWaiting <= 0) {
      actionToast("No patients waiting", "Dispensary Window #2 queue is empty", "info");
      return;
    }
    const next = queueWaiting - 1;
    setQueueWaiting(next);
    actionToast(`${dispensaryWindow.actionLabel} confirmed`, `Queue Waiting: ${next} Patients`, "info");
  }

  const adjustInvalid = adjustQty === "" || Number(adjustQty) < 0 || Number.isNaN(Number(adjustQty));
  const reorderInvalid = !reorderQty || Number(reorderQty) <= 0;

  return (
    <div className="space-y-4">
      <Card
        icon={AlertTriangle}
        iconClassName="bg-status-red-bg text-status-red"
        title="Low-Stock Critical Alerts"
        subtitle={`${stockItems.filter((i) => i.reorder).length} items need reorder action`}
        headerClassName="px-4 py-3"
        bodyClassName="p-4"
      >
        <div className="space-y-2.5">
          {stockItems.map((item) => (
            <div key={item.id} className="rounded-lg border border-status-red-bg bg-status-red-bg/40 p-2.5">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold text-slate-800">{item.name}</p>
                <span className="text-[11px] font-extrabold text-status-red">
                  {item.qty} <span className="font-medium text-slate-400">{item.unit}</span>
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500">{item.threshold}</p>
              <div className="mt-1 flex flex-wrap items-center justify-between gap-1.5 text-[10px] text-slate-400">
                <span>{item.supplierNote}</span>
                {item.poNote && <span className="font-semibold text-status-green">{item.poNote}</span>}
              </div>
              <div className="mt-1.5 flex items-center justify-end gap-1.5">
                <Button
                  variant="ghost"
                  className="!rounded-md !px-2 !py-1 !text-[10px]"
                  onClick={() => openAdjust(item)}
                >
                  <Pencil className="h-3 w-3" /> Adjust
                </Button>
                {item.reorder && (
                  <Button
                    variant="danger"
                    className="!rounded-md !px-2 !py-1 !text-[10px]"
                    onClick={() => openReorder(item)}
                  >
                    <PackagePlus className="h-3 w-3" /> Reorder
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card
        icon={Lock}
        iconClassName="bg-slate-100 text-slate-600"
        title="Controlled Substance Vault"
        subtitle="Schedule II Narcotics Ledger"
        headerClassName="px-4 py-3"
        bodyClassName="p-4"
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] font-semibold text-slate-700">{controlledVault.drug}</p>
          <p className="text-lg font-extrabold text-slate-900">
            {controlledVault.qty}
            <span className="ml-1 text-[10px] font-semibold text-slate-400">{controlledVault.unit}</span>
          </p>
        </div>
        <p className="mt-2 text-[10px] leading-snug text-slate-500">{controlledVault.note}</p>
        <p className="mt-1.5 text-[10px] font-semibold text-slate-400">{controlledVault.witnesses}</p>

        {vaultFlag ? (
          <div className="mt-2.5 flex items-center justify-between gap-2 rounded-lg border border-status-red-bg bg-status-red-bg/40 px-2.5 py-2 text-[10px] text-status-red">
            <span className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="h-3 w-3 shrink-0" /> Discrepancy flagged: {vaultFlag}
            </span>
            <Button
              variant="ghost"
              className="!rounded-md !px-2 !py-1 !text-[10px]"
              onClick={() => {
                setVaultFlag(null);
                actionToast("Discrepancy flag cleared", undefined, "info");
              }}
            >
              Clear
            </Button>
          </div>
        ) : (
          <Button
            variant="secondary"
            className="mt-2.5 w-full !py-1.5 !text-[11px]"
            onClick={() => setShowVaultFlagModal(true)}
          >
            <AlertTriangle className="h-3.5 w-3.5" /> Flag Discrepancy
          </Button>
        )}
      </Card>

      <Card
        icon={Thermometer}
        iconClassName="bg-blue-50 text-status-blue"
        title="Cold Chain Monitoring"
        subtitle={coldChainLog.unit}
        headerClassName="px-4 py-3"
        bodyClassName="p-4"
      >
        <div className="flex items-center justify-between">
          <p className="text-[11px] text-slate-500">{coldChainLog.location}</p>
          <p className={`text-lg font-extrabold ${coldChainFlag ? "text-status-red" : "text-status-blue"}`}>
            {coldChainLog.temp}
          </p>
        </div>
        {coldChainFlag ? (
          <div className="mt-1.5 flex items-center justify-between gap-2 rounded-lg border border-status-red-bg bg-status-red-bg/40 px-2.5 py-1.5 text-[10px] text-status-red">
            <span className="flex items-center gap-1.5 font-semibold">
              <AlertTriangle className="h-3 w-3 shrink-0" /> Excursion flagged: {coldChainFlag}
            </span>
            <Button
              variant="ghost"
              className="!rounded-md !px-2 !py-1 !text-[10px]"
              onClick={() => {
                setColdChainFlag(null);
                actionToast("Cold chain issue resolved", coldChainLog.unit, "success");
              }}
            >
              Resolve
            </Button>
          </div>
        ) : (
          <>
            <p className="mt-1.5 text-[10px] font-semibold text-status-green">{coldChainLog.status}</p>
            <Button
              variant="secondary"
              className="mt-2 w-full !py-1.5 !text-[11px]"
              onClick={() => setShowColdChainModal(true)}
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Flag Cold Chain Issue
            </Button>
          </>
        )}
      </Card>

      <Card
        icon={DoorOpen}
        iconClassName="bg-teal-50 text-brand-teal"
        title={dispensaryWindow.label}
        subtitle={`Queue Waiting: ${queueWaiting} Patients`}
        headerClassName="px-4 py-3"
        bodyClassName="p-4"
      >
        <Button
          variant="primary"
          className="w-full !py-2 !text-xs"
          disabled={queueWaiting <= 0}
          onClick={callNext}
        >
          {queueWaiting <= 0 ? (
            <>
              <CheckCircle2 className="h-3.5 w-3.5" /> No Patients Waiting
            </>
          ) : (
            dispensaryWindow.actionLabel
          )}
        </Button>
      </Card>

      {/* Reorder form modal */}
      <Modal
        open={!!reorderItem}
        onClose={() => !placingOrder && setReorderItem(null)}
        title="Place Reorder"
        description={reorderItem ? reorderItem.name : undefined}
        icon={PackagePlus}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReorderItem(null)} disabled={placingOrder}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmReorder} loading={placingOrder} disabled={reorderInvalid}>
              Place Order
            </Button>
          </>
        }
      >
        {reorderItem && (
          <div className="space-y-3">
            <p className="text-xs text-slate-500">{reorderItem.supplierNote}</p>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                Quantity to Order ({reorderItem.unit})
              </label>
              <input
                type="number"
                min={1}
                value={reorderQty}
                onChange={(e) => setReorderQty(e.target.value)}
                className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
              />
              {reorderInvalid && <p className="mt-1 text-[11px] text-slate-400">Enter a quantity greater than 0.</p>}
            </div>
          </div>
        )}
      </Modal>

      {/* Adjust inventory form modal */}
      <Modal
        open={!!adjustItem}
        onClose={() => !savingAdjust && setAdjustItem(null)}
        title="Adjust Inventory"
        description={adjustItem ? adjustItem.name : undefined}
        icon={Pencil}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setAdjustItem(null)} disabled={savingAdjust}>
              Cancel
            </Button>
            <Button variant="primary" onClick={confirmAdjust} loading={savingAdjust} disabled={adjustInvalid}>
              Save Changes
            </Button>
          </>
        }
      >
        {adjustItem && (
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Current Stock ({adjustItem.unit})
            </label>
            <input
              type="number"
              min={0}
              value={adjustQty}
              onChange={(e) => setAdjustQty(e.target.value)}
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
            />
            {adjustInvalid && <p className="mt-1 text-[11px] text-slate-400">Enter a valid quantity (0 or more).</p>}
          </div>
        )}
      </Modal>

      <ConfirmModal
        open={showVaultFlagModal}
        onClose={() => setShowVaultFlagModal(false)}
        onConfirm={(reason) => {
          setVaultFlag(reason || "Count mismatch");
          actionToast("Discrepancy flagged", reason, "warning");
          setShowVaultFlagModal(false);
        }}
        variant="warning"
        title="Flag Controlled Substance Discrepancy"
        description="This locks the vault ledger pending a supervisor audit."
        confirmLabel="Flag Discrepancy"
        requireReason
        reasonLabel="Reason for discrepancy"
        reasonPlaceholder="e.g. Ampoule count off by 1 at shift change…"
      />

      <ConfirmModal
        open={showColdChainModal}
        onClose={() => setShowColdChainModal(false)}
        onConfirm={(reason) => {
          setColdChainFlag(reason || "Temperature excursion");
          actionToast("Cold chain issue flagged", reason, "warning");
          setShowColdChainModal(false);
        }}
        variant="warning"
        title="Flag Cold Chain Issue"
        description={`Report a temperature excursion for ${coldChainLog.unit}. This alerts biomedical engineering.`}
        confirmLabel="Flag Issue"
        requireReason
        reasonLabel="Issue description"
        reasonPlaceholder="e.g. Reading spiked to 9.5°C at 02:00…"
      />
    </div>
  );
}
