"use client";

import { useCallback, useEffect, useState } from "react";
import PharmacyHeader from "@/components/pharmacy/PharmacyHeader";
import PharmacyKpis from "@/components/pharmacy/PharmacyKpis";
import IngestionQueue from "@/components/pharmacy/IngestionQueue";
import PrescriptionDetail, { type RxActions } from "@/components/pharmacy/PrescriptionDetail";
import PharmacySidebar, { type SidebarActions } from "@/components/pharmacy/PharmacySidebar";
import DispenseModal from "@/components/pharmacy/DispenseModal";
import SystemLoader from "@/components/ui/SystemLoader";
import { actionToast } from "@/lib/actions";
import { ApiError } from "@/lib/api";
import { ROLE_LABELS, useAuth } from "@/lib/auth";
import {
  callNextPatient,
  cancelPurchaseOrder,
  clearRxFlag,
  countStock,
  createPurchaseOrder,
  dispenseRx,
  fetchColdChain,
  fetchFormulary,
  fetchPharmacySummary,
  fetchQueue,
  fetchRx,
  fetchVault,
  fetchWindow,
  flagRx,
  receivePurchaseOrder,
  receiveStock,
  recordColdChainReading,
  recordVaultCount,
  rejectLine,
  rejectRx,
  resolveColdChainReading,
  resolveVaultCount,
  verifyLine,
  type ColdChainUnit,
  type DispensaryWindow,
  type DispenseResult,
  type DrugStock,
  type PharmacySummary,
  type QueueItem,
  type ReceiveValues,
  type RxDetail,
  type VaultItem,
} from "@/lib/pharmacy-api";

type Board = {
  summary: PharmacySummary;
  queue: QueueItem[];
  drugs: DrugStock[];
  vault: VaultItem[];
  coldChain: ColdChainUnit[];
  window: DispensaryWindow;
  refreshedAt: string;
};

async function loadBoard(): Promise<Board> {
  const [summary, queue, drugs, vault, coldChain, window] = await Promise.all([
    fetchPharmacySummary(),
    fetchQueue(),
    fetchFormulary(),
    fetchVault(),
    fetchColdChain(),
    fetchWindow(),
  ]);
  return { summary, queue, drugs, vault, coldChain, window, refreshedAt: new Date().toISOString() };
}

/** The batch just created: the typed lot, else the newest auto-numbered one. */
function batchLabel(d: DrugStock, v: ReceiveValues): string {
  const lot = v.batchNo?.trim().toUpperCase();
  const b = lot
    ? d.batches.find((x) => x.batchNo === lot)
    : d.batches
        .filter((x) => x.qtyOnHand === v.quantity && /-\d{4}-\d+$/.test(x.batchNo))
        .sort((a, b) => Number(b.batchNo.split("-").pop()) - Number(a.batchNo.split("-").pop()))[0];
  return b ? ` · batch ${b.batchNo}` : "";
}

function errorMessage(err: unknown): string {
  return err instanceof ApiError || err instanceof Error ? err.message : "Something went wrong.";
}

export default function PharmacyInventoryPage() {
  const { user } = useAuth();
  const canWork = user?.role === "admin" || user?.role === "pharmacist";

  const [board, setBoard] = useState<Board | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rx, setRx] = useState<RxDetail | null>(null);
  const [rxLoading, setRxLoading] = useState(false);
  const [dispenseRxDetail, setDispenseRxDetail] = useState<RxDetail | null>(null);
  const [lastDispensed, setLastDispensed] = useState<DispenseResult | null>(null);

  // Board: first load, then every 60 s so new prescriptions show up.
  useEffect(() => {
    let cancelled = false;
    const load = () =>
      loadBoard()
        .then((b) => {
          if (cancelled) return;
          setBoard(b);
          setLoadError(null);
          setSelectedId((cur) => (cur && b.queue.some((q) => q.patientId === cur) ? cur : b.queue[0]?.patientId ?? null));
        })
        .catch((err) => !cancelled && setLoadError(errorMessage(err)));
    load();
    const timer = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  // Selected prescription detail.
  useEffect(() => {
    let cancelled = false;
    if (!selectedId) {
      Promise.resolve().then(() => !cancelled && setRx(null));
      return () => {
        cancelled = true;
      };
    }
    Promise.resolve()
      .then(() => {
        if (cancelled) return null;
        setRxLoading(true);
        return fetchRx(selectedId);
      })
      .then((d) => !cancelled && d && setRx(d))
      .catch(() => !cancelled && setRx(null))
      .finally(() => !cancelled && setRxLoading(false));
    return () => {
      cancelled = true;
    };
  }, [selectedId, board?.refreshedAt]);

  const refresh = useCallback(async () => {
    try {
      const b = await loadBoard();
      setBoard(b);
      setSelectedId((cur) => (cur && b.queue.some((q) => q.patientId === cur) ? cur : null));
    } catch (err) {
      actionToast("Couldn't refresh the pharmacy", errorMessage(err), "error");
    }
  }, []);

  async function run<T>(
    fn: () => Promise<T>,
    success: [string, string?] | ((result: T) => [string, string?]),
    failTitle: string,
    tone: "success" | "info" | "warning" | "error" = "success"
  ): Promise<boolean> {
    try {
      const result = await fn();
      const [title, description] = typeof success === "function" ? success(result) : success;
      actionToast(title, description, tone);
      await refresh();
      return true;
    } catch (err) {
      actionToast(failTitle, errorMessage(err), "error");
      await refresh();
      return false;
    }
  }

  async function openDispense(patientId: string) {
    try {
      setSelectedId(patientId);
      setDispenseRxDetail(await fetchRx(patientId));
    } catch (err) {
      actionToast("Couldn't open prescription", errorMessage(err), "error");
    }
  }

  async function confirmDispense(lines: { orderId: string; quantity: number }[], witness?: string) {
    if (!dispenseRxDetail) return false;
    try {
      const result = await dispenseRx(dispenseRxDetail.summary.patientId, lines, witness);
      setLastDispensed(result);
      const batches = result.lines.flatMap((l) => l.batches.map((b) => b.batchNo)).join(", ");
      actionToast(
        "Prescription dispensed",
        `${result.rxRef} · ${result.patientName} · Batch ${batches}${result.awaitingCollection ? " · added to window queue" : " · sent to ward"}`,
        "success"
      );
      await refresh();
      return true;
    } catch (err) {
      actionToast("Couldn't dispense", errorMessage(err), "error");
      await refresh();
      return false;
    }
  }

  const rxActions: RxActions = {
    verify: (line, verified) =>
      run(
        () => verifyLine(line.orderId, verified),
        [verified ? "Line verified" : "Verification removed", `${line.drug} ${line.dose}`],
        "Couldn't update verification",
        verified ? "success" : "info"
      ),
    flag: (reason) =>
      rx ? run(() => flagRx(rx.summary.patientId, reason), ["Flagged for review", reason], "Couldn't flag prescription", "warning") : Promise.resolve(false),
    clearFlag: () =>
      rx ? run(() => clearRxFlag(rx.summary.patientId), ["Flag cleared", `${rx.summary.rxRef} can be dispensed`], "Couldn't clear flag", "info") : Promise.resolve(false),
    rejectLine: (line, reason) =>
      run(() => rejectLine(line.orderId, reason), ["Line rejected", `${line.drug} ${line.dose}: ${reason}`], "Couldn't reject line", "error"),
    openDispense: () => rx && openDispense(rx.summary.patientId),
  };

  const sidebarActions: SidebarActions = {
    reorder: (drug, qty, supplier) =>
      run(
        () => createPurchaseOrder(drug.id, qty, supplier),
        (po) => ["Reorder placed", `${po.poNumber} · ${qty} ${drug.unit} of ${drug.name} from ${po.supplier}`],
        "Couldn't place reorder"
      ),
    receivePo: (po, v) =>
      run(
        () => receivePurchaseOrder(po.id, v),
        (d) => ["Delivery received", `${po.poNumber} · ${v.quantity} ${d.unit} of ${d.name}${batchLabel(d, v)}`],
        "Couldn't receive delivery"
      ),
    cancelPo: (po, reason) => run(() => cancelPurchaseOrder(po.id, reason), ["Purchase order cancelled", `${po.poNumber}: ${reason}`], "Couldn't cancel order", "warning"),
    count: (drug, counts, note) => run(() => countStock(drug.id, counts, note), ["Stock adjusted", `${drug.name}: ${note}`], "Couldn't save the count"),
    vaultCount: (item, counted, witness, note) =>
      run(
        () => recordVaultCount(item.drugId, counted, witness, note),
        counted === item.onHand
          ? ["Vault count balanced", `${item.drugName}: ${counted} ${item.unit} · witness ${witness}`]
          : ["Discrepancy recorded", `${item.drugName}: counted ${counted}, register ${item.onHand}`],
        "Couldn't save the count",
        counted === item.onHand ? "success" : "warning"
      ),
    resolveVault: (c, note) => run(() => resolveVaultCount(c.id, note), ["Discrepancy resolved", `${c.drugName}: ${note}`], "Couldn't resolve"),
    reading: (unit, temperature, note, flag) =>
      run(
        () => recordColdChainReading(unit, temperature, note, flag),
        temperature < 2 || temperature > 8 || flag
          ? ["Cold chain issue flagged", `${unit}: ${temperature.toFixed(1)}°C${note ? ` · ${note}` : ""}`]
          : ["Reading logged", `${unit}: ${temperature.toFixed(1)}°C`],
        "Couldn't save reading",
        temperature < 2 || temperature > 8 || flag ? "warning" : "success"
      ),
    resolveReading: (r) => run(() => resolveColdChainReading(r.id), ["Cold chain issue resolved", r.unitName], "Couldn't resolve"),
    callNext: async () => {
      try {
        const r = await callNextPatient();
        actionToast("Patient called", `${r.patientName} (${r.mrn}) · ${r.itemsHandedOver} item(s) handed over · ${r.stillWaiting} still waiting`, "info");
        await refresh();
        return true;
      } catch (err) {
        actionToast("Couldn't call next patient", errorMessage(err), "error");
        await refresh();
        return false;
      }
    },
  };

  if (loadError && !board) {
    return (
      <div className="mt-6 rounded-xl border border-red-200 bg-status-red-bg p-5 text-sm text-status-red">
        <p className="font-semibold">Couldn&apos;t load the pharmacy.</p>
        <p className="mt-1">{loadError}</p>
      </div>
    );
  }

  if (!board) {
    return <SystemLoader title="Loading pharmacy" subtitle="Fetching the prescription queue and stock…" className="min-h-[60vh]" />;
  }

  return (
    <div>
      <PharmacyHeader
        userName={user?.name}
        roleLabel={user ? ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] : undefined}
        refreshedAt={board.refreshedAt}
        drugs={board.drugs}
        canWork={canWork}
        onReceive={async (v) =>
          run(
            () => receiveStock(v),
            (d) => ["Stock received", `${v.quantity} ${d.unit} of ${d.name}${batchLabel(d, v)}`],
            "Couldn't receive stock"
          )
        }
      />

      <div className="mt-5">
        <PharmacyKpis summary={board.summary} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)_290px]">
        <IngestionQueue
          items={board.queue}
          selectedId={selectedId}
          canWork={canWork}
          onSelect={setSelectedId}
          onDispense={openDispense}
          onReject={(item, reason) =>
            run(() => rejectRx(item.patientId, reason), ["Prescription rejected", `${item.rxRef} · ${reason}`], "Couldn't reject", "error")
          }
        />
        <PrescriptionDetail
          rx={selectedId ? rx : null}
          loading={rxLoading && !rx}
          lastDispensed={lastDispensed}
          canWork={canWork}
          actions={rxActions}
        />
        <PharmacySidebar
          drugs={board.drugs}
          vault={board.vault}
          coldChain={board.coldChain}
          window={board.window}
          canWork={canWork}
          actions={sidebarActions}
        />
      </div>

      <DispenseModal rx={dispenseRxDetail} onClose={() => setDispenseRxDetail(null)} onConfirm={confirmDispense} />
    </div>
  );
}
