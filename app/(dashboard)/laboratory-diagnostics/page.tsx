"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import LabHeader, { type NewOrderValues } from "@/components/lab/LabHeader";
import LabKpis from "@/components/lab/LabKpis";
import AccessioningQueue from "@/components/lab/AccessioningQueue";
import SpecimenDetail, { type LabActions } from "@/components/lab/SpecimenDetail";
import LabSidebar from "@/components/lab/LabSidebar";
import { actionToast } from "@/lib/actions";
import { ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { QueueTabId, SpecimenItem } from "@/lib/lab-data";
import {
  createLabOrder,
  enterResults,
  fetchAnalyzers,
  fetchLabSummary,
  fetchLabTests,
  fetchWorklist,
  receiveSpecimen,
  recordCriticalCall,
  recordQcRun,
  rejectSpecimen,
  repeatTest,
  updateAnalyzer,
  validateBatch,
  validateResult,
  type Analyzer,
  type LabSummary,
  type LabTestDto,
} from "@/lib/lab-api";

type LabData = { specimens: SpecimenItem[]; summary: LabSummary; analyzers: Analyzer[] };

async function loadLab(): Promise<LabData> {
  const [specimens, summary, analyzers] = await Promise.all([fetchWorklist(), fetchLabSummary(), fetchAnalyzers()]);
  return { specimens, summary, analyzers };
}

function errorMessage(err: unknown): string {
  return err instanceof ApiError || err instanceof Error ? err.message : "Something went wrong.";
}

export default function LaboratoryDiagnosticsPage() {
  const { user } = useAuth();
  const canWork = user?.role === "admin" || user?.role === "lab_tech";

  const [data, setData] = useState<LabData | null>(null);
  const [tests, setTests] = useState<LabTestDto[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<QueueTabId>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = () =>
      Promise.all([loadLab(), fetchLabTests()])
        .then(([d, t]) => {
          if (cancelled) return;
          setData(d);
          setTests(t);
          setLoadError(null);
          setSelectedId((cur) => cur ?? d.specimens[0]?.id ?? null);
        })
        .catch((err) => !cancelled && setLoadError(errorMessage(err)));
    load();
    const timer = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, []);

  const refresh = useCallback(async () => {
    try {
      setData(await loadLab());
    } catch (err) {
      actionToast("Couldn't refresh the worklist", errorMessage(err), "error");
    }
  }, []);

  async function run(fn: () => Promise<unknown>, success: [string, string?], failTitle: string, tone: "success" | "warning" | "error" = "success") {
    try {
      await fn();
      actionToast(success[0], success[1], tone);
      await refresh();
      return true;
    } catch (err) {
      actionToast(failTitle, errorMessage(err), "error");
      return false;
    }
  }

  const specimens = useMemo(() => data?.specimens ?? [], [data]);
  const selected = specimens.find((s) => s.id === selectedId) ?? null;
  const name = (id: string) => specimens.find((s) => s.id === id);

  const actions: LabActions = {
    receive: (id, analyzerId) => run(() => receiveSpecimen(id, analyzerId), ["Specimen received", name(id)?.testOrder], "Couldn't receive specimen"),
    enterResults: (id, results) => run(() => enterResults(id, results), ["Results saved", name(id)?.specId], "Couldn't save results"),
    validate: (id) => run(() => validateResult(id), ["Validated & released", `${name(id)?.specId} sent to ${name(id)?.consultant}`], "Couldn't validate"),
    reject: (id, reason) => run(() => rejectSpecimen(id, reason), ["Specimen rejected", `${name(id)?.specId}: ${reason}`], "Couldn't reject", "error"),
    repeat: (id, reason) => run(() => repeatTest(id, reason), ["Re-test ordered", `${name(id)?.specId}: ${reason}`], "Couldn't order re-test", "warning"),
    criticalCall: (id, calledTo, readBack) =>
      run(
        () => recordCriticalCall(id, calledTo, readBack),
        readBack ? ["Critical call recorded", `${calledTo} read the result back`] : ["Call recorded", "Read-back not confirmed — result cannot be released yet"],
        "Couldn't record call",
        readBack ? "success" : "warning"
      ),
  };

  async function handleNewOrder(v: NewOrderValues) {
    try {
      const order = await createLabOrder({ patientId: v.patientId, testCode: v.testCode, priority: v.priority, clinicalNotes: v.clinicalNotes || undefined });
      if (v.receiveNow) await receiveSpecimen(order.id, v.analyzerId);
      actionToast(v.receiveNow ? "Specimen accessioned" : "Lab order placed", `${order.testName} · ${order.patientName}`, "success");
      await refresh();
      setSelectedId(order.id);
      setActiveTab("all");
      return true;
    } catch (err) {
      actionToast("Couldn't place order", errorMessage(err), "error");
      await refresh();
      return false;
    }
  }

  if (loadError && !data) {
    return (
      <div className="mt-6 rounded-xl border border-red-200 bg-status-red-bg p-5 text-sm text-status-red">
        <p className="font-semibold">Couldn&apos;t load the laboratory worklist.</p>
        <p className="mt-1">{loadError}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500">
        <Loader2 className="h-4 w-4 animate-spin" /> Loading laboratory…
      </div>
    );
  }

  return (
    <div>
      <LabHeader
        tests={tests}
        analyzers={data.analyzers}
        pendingValidation={specimens.filter((s) => s.backendStatus === "RESULTED" && !s.hasCritical)}
        canWork={canWork}
        onNewOrder={handleNewOrder}
        onBatchValidate={async (ids) => {
          try {
            const r = await validateBatch(ids);
            actionToast(
              "Batch validated",
              `${r.validated} result(s) released.${r.skipped.length ? ` Skipped: ${r.skipped.join("; ")}` : ""}`,
              r.skipped.length ? "warning" : "success"
            );
            await refresh();
            return true;
          } catch (err) {
            actionToast("Couldn't validate batch", errorMessage(err), "error");
            return false;
          }
        }}
        onRecordQc={(v) =>
          run(() => recordQcRun(v), ["QC run recorded", `${v.analyte} ${v.level}`], "Couldn't record QC run")
        }
      />

      <div className="mt-4">
        <LabKpis summary={data.summary} />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[280px_minmax(0,1fr)_280px]">
        <AccessioningQueue
          specimens={specimens}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <SpecimenDetail key={selected?.id ?? "none"} specimen={selected} tests={tests} analyzers={data.analyzers} canWork={canWork} actions={actions} />
        <LabSidebar
          analyzers={data.analyzers}
          specimens={specimens}
          canWork={canWork}
          onSelect={setSelectedId}
          onAnalyzerStatus={(a, status) =>
            run(() => updateAnalyzer(a.id, status, a.note ?? undefined), ["Analyzer updated", `${a.name}: ${status.toLowerCase()}`], "Couldn't update analyzer")
          }
        />
      </div>
    </div>
  );
}
