"use client";

import { useRef, useState } from "react";
import { Microscope, LineChart, ClipboardCheck, PlusCircle, Beaker, CheckCircle2, Search } from "lucide-react";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import type { SpecimenItem } from "@/lib/lab-data";
import type { Analyzer, LabTestDto, QcRun } from "@/lib/lab-api";
import { dayClock, fetchQcRuns } from "@/lib/lab-api";
import { searchPatients, ageSex, type PatientOption } from "@/lib/ward-api";

const inputClass =
  "mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal";

export type NewOrderValues = { patientId: string; testCode: string; priority: string; clinicalNotes: string; receiveNow: boolean; analyzerId: string };

export default function LabHeader({
  tests,
  analyzers,
  pendingValidation,
  canWork,
  onNewOrder,
  onBatchValidate,
  onRecordQc,
}: {
  tests: LabTestDto[];
  analyzers: Analyzer[];
  /** Resulted specimens without critical values (safe to release together). */
  pendingValidation: SpecimenItem[];
  canWork: boolean;
  onNewOrder: (v: NewOrderValues) => Promise<boolean>;
  onBatchValidate: (ids: string[]) => Promise<boolean>;
  onRecordQc: (v: { analyzerId: string; analyte: string; level: string; targetMean: number; targetSd: number; result: number }) => Promise<boolean>;
}) {
  // ---- new order ----
  const [orderOpen, setOrderOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientOption[]>([]);
  const [patient, setPatient] = useState<PatientOption | null>(null);
  const [testCode, setTestCode] = useState("");
  const [priority, setPriority] = useState("ROUTINE");
  const [notes, setNotes] = useState("");
  const [receiveNow, setReceiveNow] = useState(true);
  const [analyzerId, setAnalyzerId] = useState("");
  const [busy, setBusy] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ---- QC ----
  const [qcOpen, setQcOpen] = useState(false);
  const [qcRuns, setQcRuns] = useState<QcRun[] | null>(null);
  const [qc, setQc] = useState({ analyzerId: "", analyte: "", level: "Level 1", targetMean: "", targetSd: "", result: "" });

  // ---- batch ----
  const [batchOpen, setBatchOpen] = useState(false);

  const online = analyzers.filter((a) => a.status === "ONLINE");

  function openOrder() {
    setQuery("");
    setResults([]);
    setPatient(null);
    setTestCode(tests[0]?.code ?? "");
    setPriority("ROUTINE");
    setNotes("");
    setReceiveNow(canWork);
    setAnalyzerId("");
    setOrderOpen(true);
  }

  function onQuery(v: string) {
    setQuery(v);
    setPatient(null);
    if (timer.current) clearTimeout(timer.current);
    if (v.trim().length < 2) return setResults([]);
    timer.current = setTimeout(async () => {
      try {
        setResults(await searchPatients(v.trim()));
      } catch {
        setResults([]);
      }
    }, 250);
  }

  async function submitOrder() {
    if (!patient || !testCode) return;
    setBusy(true);
    try {
      const ok = await onNewOrder({ patientId: patient.id, testCode, priority, clinicalNotes: notes.trim(), receiveNow, analyzerId });
      if (ok) setOrderOpen(false);
    } finally {
      setBusy(false);
    }
  }

  async function openQc() {
    setQcOpen(true);
    setQc({ analyzerId: online[0]?.id ?? "", analyte: "", level: "Level 1", targetMean: "", targetSd: "", result: "" });
    setQcRuns(null);
    try {
      setQcRuns(await fetchQcRuns());
    } catch {
      setQcRuns([]);
    }
  }

  const qcValid =
    qc.analyzerId && qc.analyte.trim() && [qc.targetMean, qc.targetSd, qc.result].every((x) => x.trim() !== "" && !Number.isNaN(Number(x))) && Number(qc.targetSd) > 0;

  async function submitQc() {
    if (!qcValid) return;
    setBusy(true);
    try {
      const ok = await onRecordQc({
        analyzerId: qc.analyzerId,
        analyte: qc.analyte.trim(),
        level: qc.level,
        targetMean: Number(qc.targetMean),
        targetSd: Number(qc.targetSd),
        result: Number(qc.result),
      });
      if (ok) {
        setQc((q) => ({ ...q, result: "" }));
        setQcRuns(await fetchQcRuns());
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-brand-teal">
          <Microscope className="h-5 w-5" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">Central Pathology &amp; Clinical Chemistry</h1>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">LAB BLOCK 2</span>
          </div>
          <p className="text-xs text-slate-400">
            Laboratory Information System · <span className="font-semibold text-status-green">{online.length} of {analyzers.length} analyzers online</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={openQc} className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50">
          <LineChart className="h-3.5 w-3.5" /> QC Log
        </button>
        {canWork && (
          <button
            onClick={() => setBatchOpen(true)}
            className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            <ClipboardCheck className="h-3.5 w-3.5" /> Batch Validation ({pendingValidation.length})
          </button>
        )}
        <button onClick={openOrder} className="flex items-center gap-1.5 rounded-lg bg-brand-teal px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700">
          <PlusCircle className="h-3.5 w-3.5" /> New Lab Order
        </button>
      </div>

      {/* ---- new order ---- */}
      <Modal
        open={orderOpen}
        onClose={() => !busy && setOrderOpen(false)}
        title="New Lab Order"
        description="Request a test for a registered patient"
        icon={Beaker}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setOrderOpen(false)} disabled={busy}>Cancel</Button>
            <Button variant="primary" onClick={submitOrder} loading={busy} disabled={!patient || !testCode}>
              {receiveNow ? "Order & Receive" : "Place Order"}
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Patient</label>
            {patient ? (
              <div className="mt-1 flex items-center justify-between rounded-md border border-teal-200 bg-teal-50 px-3 py-2">
                <p className="text-sm font-semibold text-slate-800">
                  {patient.name} <span className="text-[11px] font-normal text-slate-500">{patient.mrn} · {ageSex(patient.age, patient.sex)}</span>
                </p>
                <button onClick={() => setPatient(null)} className="text-[11px] font-semibold text-brand-teal hover:underline">Change</button>
              </div>
            ) : (
              <>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 mt-0.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
                  <input value={query} onChange={(e) => onQuery(e.target.value)} placeholder="Search name, MRN or phone…" className={`${inputClass} pl-8`} />
                </div>
                {query.trim().length >= 2 && (
                  <div className="mt-1 max-h-40 overflow-y-auto rounded-md border border-surface-border">
                    {results.length === 0 ? (
                      <p className="px-3 py-2 text-xs text-slate-400">No active patient matches.</p>
                    ) : (
                      results.map((p) => (
                        <button key={p.id} onClick={() => setPatient(p)} className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50">
                          <span className="text-xs font-semibold text-slate-700">{p.name}</span>
                          <span className="text-[11px] text-slate-400">{p.mrn} · {ageSex(p.age, p.sex)}</span>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Test</label>
              <select value={testCode} onChange={(e) => setTestCode(e.target.value)} className={inputClass}>
                {tests.map((t) => (
                  <option key={t.code} value={t.code}>{t.name} ({t.specimenType})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className={inputClass}>
                <option value="ROUTINE">Routine</option>
                <option value="URGENT">Urgent</option>
                <option value="STAT">STAT</option>
              </select>
            </div>
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Clinical notes (optional)</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Query sepsis, on IV antibiotics" className={inputClass} />
          </div>
          {canWork && (
            <div className="rounded-md border border-surface-border bg-slate-50 p-2.5">
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                <input type="checkbox" checked={receiveNow} onChange={(e) => setReceiveNow(e.target.checked)} className="h-3.5 w-3.5" />
                Specimen is here — receive it now
              </label>
              {receiveNow && (
                <select value={analyzerId} onChange={(e) => setAnalyzerId(e.target.value)} className={inputClass}>
                  <option value="">Manual / bench</option>
                  {online.map((a) => (
                    <option key={a.id} value={a.id}>{a.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}
        </div>
      </Modal>

      {/* ---- QC ---- */}
      <Modal
        open={qcOpen}
        onClose={() => !busy && setQcOpen(false)}
        title="Quality Control Log"
        description="In control when within ±2 SD of target (Westgard 1-2s)"
        icon={LineChart}
        size="lg"
        footer={<Button variant="secondary" onClick={() => setQcOpen(false)} disabled={busy}>Close</Button>}
      >
        {canWork && (
          <div className="mb-3 grid grid-cols-6 items-end gap-2 rounded-md border border-surface-border bg-slate-50 p-2.5">
            <div className="col-span-2">
              <label className="text-[10px] font-semibold uppercase text-slate-400">Analyzer</label>
              <select value={qc.analyzerId} onChange={(e) => setQc({ ...qc, analyzerId: e.target.value })} className="mt-1 w-full rounded border border-surface-border px-2 py-1.5 text-xs">
                {analyzers.map((a) => (
                  <option key={a.id} value={a.id}>{a.name}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-semibold uppercase text-slate-400">Analyte</label>
              <input value={qc.analyte} onChange={(e) => setQc({ ...qc, analyte: e.target.value })} placeholder="e.g. Potassium" className="mt-1 w-full rounded border border-surface-border px-2 py-1.5 text-xs" />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-semibold uppercase text-slate-400">Level</label>
              <select value={qc.level} onChange={(e) => setQc({ ...qc, level: e.target.value })} className="mt-1 w-full rounded border border-surface-border px-2 py-1.5 text-xs">
                <option>Level 1</option>
                <option>Level 2</option>
                <option>Level 3</option>
              </select>
            </div>
            {(["targetMean", "targetSd", "result"] as const).map((k) => (
              <div key={k} className="col-span-2">
                <label className="text-[10px] font-semibold uppercase text-slate-400">{k === "targetMean" ? "Target mean" : k === "targetSd" ? "Target SD" : "Result"}</label>
                <input value={qc[k]} onChange={(e) => setQc({ ...qc, [k]: e.target.value })} inputMode="decimal" className="mt-1 w-full rounded border border-surface-border px-2 py-1.5 text-xs" />
              </div>
            ))}
            <div className="col-span-6 flex justify-end">
              <Button variant="primary" onClick={submitQc} loading={busy} disabled={!qcValid}>Record QC Run</Button>
            </div>
          </div>
        )}
        {qcRuns === null ? (
          <p className="py-4 text-center text-xs text-slate-400">Loading…</p>
        ) : qcRuns.length === 0 ? (
          <p className="py-4 text-center text-xs text-slate-400">No QC runs recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-slate-400">
                  <th className="pb-2 font-semibold">When</th>
                  <th className="pb-2 font-semibold">Analyzer</th>
                  <th className="pb-2 font-semibold">Analyte / Level</th>
                  <th className="pb-2 font-semibold">Target</th>
                  <th className="pb-2 font-semibold">Result</th>
                  <th className="pb-2 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {qcRuns.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 pr-2 text-slate-500">{dayClock(r.runAt)}</td>
                    <td className="py-2 pr-2 text-slate-500">{r.analyzer}</td>
                    <td className="py-2 pr-2 font-medium text-slate-700">{r.analyte} ({r.level})</td>
                    <td className="py-2 pr-2 text-slate-500">{r.targetMean} ± {r.targetSd}</td>
                    <td className="py-2 pr-2 font-semibold text-slate-800">{r.result} <span className="font-normal text-slate-400">({r.zScore} SD)</span></td>
                    <td className="py-2 text-right">
                      <span className={`rounded px-2 py-0.5 text-[10px] font-bold ${r.inControl ? "bg-status-green-bg text-status-green" : "bg-status-red-bg text-status-red"}`}>
                        {r.inControl ? "In Control" : "Out of Control"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Modal>

      {/* ---- batch validation ---- */}
      <Modal
        open={batchOpen}
        onClose={() => !busy && setBatchOpen(false)}
        title="Batch Validation"
        description="Resulted specimens with no critical values"
        icon={ClipboardCheck}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBatchOpen(false)} disabled={busy}>Close</Button>
            {pendingValidation.length > 0 && (
              <Button
                variant="primary"
                loading={busy}
                onClick={async () => {
                  setBusy(true);
                  try {
                    if (await onBatchValidate(pendingValidation.map((s) => s.id))) setBatchOpen(false);
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                Validate All ({pendingValidation.length})
              </Button>
            )}
          </>
        }
      >
        {pendingValidation.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-status-green" />
            <p className="text-sm font-semibold text-slate-700">Nothing waiting</p>
            <p className="text-xs text-slate-400">Results with critical values are validated one by one after the phone call.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingValidation.map((row) => (
              <div key={row.id} className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-800">{row.patient}</p>
                  <p className="text-[11px] text-slate-400">{row.specId} · {row.testOrder}</p>
                </div>
                <span className="text-[10px] text-slate-400">{row.analytes.filter((a) => a.flagTone !== "normal").length} abnormal</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}
