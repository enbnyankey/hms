"use client";

import { useState } from "react";
import {
  FlaskConical,
  History,
  RotateCcw,
  Printer,
  Send,
  FileText,
  XCircle,
  PhoneCall,
  ClipboardList,
  ScanBarcode,
  PencilLine,
} from "lucide-react";
import Card from "../Card";
import Modal from "../ui/Modal";
import ConfirmModal from "../ui/ConfirmModal";
import Button from "../ui/Button";
import { type SpecimenItem, type ClinicalFlagTone } from "@/lib/lab-data";
import { dayClock, fetchPatientLabHistory, type Analyzer, type LabTestDto } from "@/lib/lab-api";

const flagStyle: Record<ClinicalFlagTone, string> = {
  normal: "bg-status-green-bg text-status-green",
  high: "bg-status-amber-bg text-status-amber",
  low: "bg-status-blue-bg text-status-blue",
  critical: "bg-status-red-bg text-status-red",
};

const inputClass =
  "mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal";

export type LabActions = {
  receive: (id: string, analyzerId: string) => Promise<boolean>;
  enterResults: (id: string, results: { code: string; value: string }[]) => Promise<boolean>;
  validate: (id: string) => Promise<boolean>;
  reject: (id: string, reason: string) => Promise<boolean>;
  repeat: (id: string, reason: string) => Promise<boolean>;
  criticalCall: (id: string, calledTo: string, readBack: boolean) => Promise<boolean>;
};

export default function SpecimenDetail({
  specimen,
  tests,
  analyzers,
  canWork,
  actions,
}: {
  specimen: SpecimenItem | null;
  tests: LabTestDto[];
  analyzers: Analyzer[];
  /** Lab tech / admin: can receive, result and release. Doctors only read. */
  canWork: boolean;
  actions: LabActions;
}) {
  const [viewOpen, setViewOpen] = useState(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [rejectOpen, setRejectOpen] = useState(false);
  const [retestOpen, setRetestOpen] = useState(false);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [analyzerId, setAnalyzerId] = useState("");
  const [resultsOpen, setResultsOpen] = useState(false);
  const [values, setValues] = useState<Record<string, string>>({});
  const [callOpen, setCallOpen] = useState(false);
  const [calledTo, setCalledTo] = useState("");
  const [readBack, setReadBack] = useState(false);
  const [busy, setBusy] = useState(false);
  const [history, setHistory] = useState<SpecimenItem[] | null>(null);

  if (!specimen) {
    return (
      <div className="min-w-0">
        <Card icon={FlaskConical} iconClassName="bg-teal-50 text-brand-teal" title="Analyte Result Matrix" headerClassName="px-4 py-2.5" bodyClassName="p-8">
          <div className="flex flex-col items-center gap-1.5 text-center">
            <ClipboardList className="h-6 w-6 text-slate-300" />
            <p className="text-sm font-semibold text-slate-500">No specimen selected</p>
            <p className="text-xs text-slate-400">Choose a specimen from the worklist to view its results.</p>
          </div>
        </Card>
      </div>
    );
  }

  const s = specimen;
  const test = tests.find((t) => t.code === s.testCode);
  const initials = s.patient.split(" ").map((n) => n[0]).slice(0, 2).join("");
  const st = s.backendStatus;
  const onlineAnalyzers = analyzers.filter((a) => a.status === "ONLINE");

  async function run(fn: () => Promise<boolean>, close: () => void) {
    setBusy(true);
    try {
      if (await fn()) close();
    } finally {
      setBusy(false);
    }
  }

  function openResults() {
    const initial: Record<string, string> = {};
    (test?.analytes ?? []).forEach((a) => {
      initial[a.code] = s.analytes.find((r) => r.id === a.code)?.value ?? "";
    });
    setValues(initial);
    setResultsOpen(true);
  }

  async function openHistory() {
    setHistory([]);
    try {
      const all = await fetchPatientLabHistory(s.patientId);
      setHistory(all.filter((o) => o.testCode === s.testCode && o.id !== s.id && o.analytes.length > 0));
    } catch {
      setHistory([]);
    }
  }

  const resultsComplete = (test?.analytes ?? []).every((a) => (values[a.code] ?? "").trim().length > 0);

  return (
    <div className="min-w-0 space-y-3">
      <div className="rounded-xl border border-surface-border bg-white p-3 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-800 text-xs font-bold text-white">{initials}</span>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-bold text-slate-900">{s.patient}</p>
                <span className="text-[11px] text-slate-400">
                  {s.age} · {s.sex}
                </span>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-500">
                MRN: {s.mrn} · {s.location} · Requested by {s.consultant}
              </p>
              <p className="text-[10px] text-slate-400">
                {s.testOrder} · {s.collection} · Analyzer: {s.analyzer}
                {s.repeatCount > 0 && ` · Re-run ×${s.repeatCount}`}
              </p>
              {s.clinicalNotes && <p className="text-[10px] italic text-slate-400">Clinical notes: {s.clinicalNotes}</p>}
            </div>
          </div>
          <span className="rounded-md bg-slate-100 px-2 py-1 text-right text-[10px] font-bold text-slate-600">{s.specId}</span>
        </div>
        {s.status === "Rejected" && s.rejectReason && (
          <div className="mt-2 rounded-md border border-status-red-bg bg-status-red-bg/60 px-2.5 py-1.5 text-[11px] text-status-red">
            <span className="font-bold">Rejected: </span>
            {s.rejectReason}
          </div>
        )}
        {s.criticalPending && (
          <div className="mt-2 rounded-md border border-red-200 bg-status-red-bg px-2.5 py-1.5 text-[11px] font-semibold text-status-red">
            Critical value — phone the requesting clinician and record the read-back before releasing.
          </div>
        )}
      </div>

      <Card
        icon={FlaskConical}
        iconClassName="bg-teal-50 text-brand-teal"
        title="Analyte Result Matrix"
        headerClassName="px-4 py-2.5"
        bodyClassName="p-3"
        action={
          <div className="flex items-center gap-2 text-[10px] font-semibold">
            <button onClick={openHistory} className="flex items-center gap-1 text-brand-teal hover:underline">
              <History className="h-3 w-3" />
              Previous Results
            </button>
            <button onClick={() => setViewOpen(true)} className="flex items-center gap-1 text-slate-500 hover:underline">
              <FileText className="h-3 w-3" />
              View Full Report
            </button>
          </div>
        }
      >
        {s.analytes.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8 text-center">
            <p className="text-xs font-semibold text-slate-500">No results yet</p>
            <p className="text-[11px] text-slate-400">
              {st === "ORDERED" ? "Waiting for the specimen to reach the lab." : st === "RECEIVED" ? "Specimen is in analysis — enter results when the run completes." : "No results recorded."}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {s.analytes.map((row) => (
              <div key={row.id} className="flex flex-wrap items-center gap-x-4 gap-y-1.5 py-2.5 text-[11px]">
                <span className="flex-1 font-semibold text-slate-700">{row.name}</span>
                <span className="w-36 shrink-0 font-mono font-bold text-slate-800">
                  {row.value} <span className="font-sans font-normal text-slate-400">{row.unit}</span>
                </span>
                <span className="w-28 shrink-0 text-slate-400">{row.range}</span>
                <span className="w-32 shrink-0 text-right">
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${flagStyle[row.flagTone]}`}>{row.flag}</span>
                </span>
              </div>
            ))}
          </div>
        )}

        {s.criticalCalls.length > 0 && (
          <div className="mt-2 space-y-1">
            {s.criticalCalls.map((c) => (
              <p key={c.id} className="text-[10px] text-slate-500">
                <PhoneCall className="mr-1 inline h-3 w-3" />
                Phoned to {c.calledTo} by {c.calledBy} at {dayClock(c.calledAt)} ·{" "}
                <span className={c.readBackConfirmed ? "font-semibold text-status-green" : "font-semibold text-status-red"}>
                  {c.readBackConfirmed ? "read-back confirmed" : "no read-back"}
                </span>
              </p>
            ))}
          </div>
        )}

        <div className="mt-2 rounded-lg border border-surface-border bg-slate-50 p-2">
          <div className="flex items-center justify-between text-[10px] font-semibold text-slate-600">
            <span>Validation Sign-off</span>
            {s.signoff && <span className="text-slate-400">{s.signoff.timestamp}</span>}
          </div>
          <p className="mt-0.5 text-[10px] leading-snug text-slate-500">{s.signoff?.note ?? "Awaiting validation and release."}</p>
        </div>

        {canWork && (
          <div className="mt-2 flex flex-wrap items-center justify-end gap-2">
            {st === "ORDERED" && (
              <Button
                variant="primary"
                className="text-[11px]"
                onClick={() => {
                  setAnalyzerId(onlineAnalyzers[0]?.id ?? "");
                  setReceiveOpen(true);
                }}
              >
                <ScanBarcode className="h-3.5 w-3.5" /> Receive Specimen
              </Button>
            )}
            {st === "RECEIVED" && (
              <Button variant="primary" className="text-[11px]" onClick={openResults}>
                <PencilLine className="h-3.5 w-3.5" /> Enter Results
              </Button>
            )}
            {st === "RESULTED" && (
              <>
                <Button variant="secondary" className="text-[11px]" onClick={openResults}>
                  <PencilLine className="h-3.5 w-3.5" /> Edit Results
                </Button>
                <Button variant="secondary" className="text-[11px]" onClick={() => setRetestOpen(true)}>
                  <RotateCcw className="h-3.5 w-3.5" /> Order Re-test
                </Button>
                {s.hasCritical && (
                  <Button
                    variant="secondary"
                    className="text-[11px]"
                    onClick={() => {
                      setCalledTo(s.consultant);
                      setReadBack(false);
                      setCallOpen(true);
                    }}
                  >
                    <PhoneCall className="h-3.5 w-3.5" /> Record Critical Call
                  </Button>
                )}
              </>
            )}
            {(st === "ORDERED" || st === "RECEIVED" || st === "RESULTED") && (
              <Button variant="danger" className="text-[11px]" onClick={() => setRejectOpen(true)}>
                <XCircle className="h-3.5 w-3.5" /> Reject
              </Button>
            )}
            {st === "RESULTED" && (
              <Button variant="primary" className="text-[11px]" onClick={() => setApproveOpen(true)} disabled={s.criticalPending}>
                <Send className="h-3.5 w-3.5" /> Validate &amp; Release
              </Button>
            )}
            {st === "VALIDATED" && (
              <Button variant="secondary" className="text-[11px]" onClick={() => setViewOpen(true)}>
                <Printer className="h-3.5 w-3.5" /> Print Report
              </Button>
            )}
          </div>
        )}
      </Card>

      {/* ---- full report ---- */}
      <Modal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        title="Laboratory Report"
        description={`${s.specId} · ${s.testOrder}`}
        icon={FileText}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setViewOpen(false)}>Close</Button>
            <Button variant="primary" onClick={() => window.print()} disabled={st !== "VALIDATED"}>
              <Printer className="h-3.5 w-3.5" /> Print
            </Button>
          </>
        }
      >
        <div className="space-y-3 text-xs">
          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <p><span className="font-semibold">Patient:</span> {s.patient} ({s.age}, {s.sex})</p>
            <p><span className="font-semibold">MRN:</span> {s.mrn}</p>
            <p><span className="font-semibold">Location:</span> {s.location}</p>
            <p><span className="font-semibold">Requested by:</span> {s.consultant}</p>
            <p><span className="font-semibold">Specimen:</span> {s.specId} · {s.container}</p>
            <p><span className="font-semibold">Received:</span> {s.collection}</p>
          </div>
          {s.analytes.length === 0 ? (
            <p className="text-slate-400">No results recorded.</p>
          ) : (
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] uppercase tracking-wide text-slate-400">
                  <th className="pb-1">Analyte</th><th className="pb-1">Result</th><th className="pb-1">Reference</th><th className="pb-1 text-right">Flag</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {s.analytes.map((r) => (
                  <tr key={r.id}>
                    <td className="py-1.5">{r.name}</td>
                    <td className="py-1.5 font-mono font-bold">{r.value} {r.unit}</td>
                    <td className="py-1.5 text-slate-400">{r.range}</td>
                    <td className="py-1.5 text-right">{r.flag}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="text-[11px] text-slate-500">{s.signoff ? `${s.signoff.note} (${s.signoff.timestamp})` : "Not yet validated — not for clinical use."}</p>
        </div>
      </Modal>

      {/* ---- previous results ---- */}
      <Modal
        open={history !== null}
        onClose={() => setHistory(null)}
        title="Previous Results"
        description={`${s.patient} · ${s.testOrder.split(" · ")[0]}`}
        icon={History}
        size="lg"
        footer={<Button variant="secondary" onClick={() => setHistory(null)}>Close</Button>}
      >
        {history && history.length === 0 ? (
          <p className="py-6 text-center text-xs text-slate-400">No earlier results for this test.</p>
        ) : (
          <div className="space-y-3">
            {(history ?? []).map((h) => (
              <div key={h.id} className="rounded-md border border-surface-border p-2.5">
                <p className="text-[11px] font-semibold text-slate-600">{h.specId} · {h.signoff?.timestamp ?? h.collection} · {h.status}</p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {h.analytes.map((a) => `${a.name}: ${a.value}${a.unit ? " " + a.unit : ""} (${a.flag})`).join(" · ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </Modal>

      {/* ---- receive ---- */}
      <Modal
        open={receiveOpen}
        onClose={() => !busy && setReceiveOpen(false)}
        title="Receive Specimen"
        description={`${s.testOrder} · ${s.container}`}
        icon={ScanBarcode}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setReceiveOpen(false)} disabled={busy}>Cancel</Button>
            <Button variant="primary" loading={busy} onClick={() => run(() => actions.receive(s.id, analyzerId), () => setReceiveOpen(false))}>
              Receive &amp; Label
            </Button>
          </>
        }
      >
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Analyzer</label>
        <select value={analyzerId} onChange={(e) => setAnalyzerId(e.target.value)} className={inputClass}>
          <option value="">Manual / bench</option>
          {onlineAnalyzers.map((a) => (
            <option key={a.id} value={a.id}>{a.name}</option>
          ))}
        </select>
        <p className="mt-2 text-[11px] text-slate-400">A specimen number is assigned when you receive it.</p>
      </Modal>

      {/* ---- results entry ---- */}
      <Modal
        open={resultsOpen}
        onClose={() => !busy && setResultsOpen(false)}
        title={st === "RESULTED" ? "Edit Results" : "Enter Results"}
        description={`${s.specId} · ${s.testOrder}`}
        icon={PencilLine}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResultsOpen(false)} disabled={busy}>Cancel</Button>
            <Button
              variant="primary"
              loading={busy}
              disabled={!resultsComplete}
              onClick={() =>
                run(
                  () => actions.enterResults(s.id, Object.entries(values).map(([code, value]) => ({ code, value: value.trim() }))),
                  () => setResultsOpen(false)
                )
              }
            >
              Save Results
            </Button>
          </>
        }
      >
        <div className="space-y-2.5">
          {(test?.analytes ?? []).map((a) => (
            <div key={a.code} className="grid grid-cols-[1fr_140px] items-center gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-700">{a.name}</p>
                <p className="text-[10px] text-slate-400">
                  {a.textResult ? "Free text (e.g. No parasites seen)" : `Ref ${a.referenceRange || "—"} ${a.unit ?? ""}`}
                </p>
              </div>
              <input
                value={values[a.code] ?? ""}
                onChange={(e) => setValues((v) => ({ ...v, [a.code]: e.target.value }))}
                inputMode={a.textResult ? "text" : "decimal"}
                placeholder={a.unit ?? ""}
                className="rounded-md border border-surface-border px-2.5 py-1.5 text-sm text-slate-800 outline-none focus:border-brand-teal"
              />
            </div>
          ))}
          <p className="text-[11px] text-slate-400">Flags (high, low, critical) are worked out from the reference ranges when you save.</p>
        </div>
      </Modal>

      {/* ---- critical call ---- */}
      <Modal
        open={callOpen}
        onClose={() => !busy && setCallOpen(false)}
        title="Record Critical Value Call"
        description={`${s.patient} · ${s.specId}`}
        icon={PhoneCall}
        tone="danger"
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setCallOpen(false)} disabled={busy}>Cancel</Button>
            <Button variant="danger" loading={busy} disabled={!calledTo.trim()} onClick={() => run(() => actions.criticalCall(s.id, calledTo.trim(), readBack), () => setCallOpen(false))}>
              Save Call
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <p className="rounded-md bg-status-red-bg px-2.5 py-1.5 text-[11px] text-status-red">
            {s.analytes.filter((a) => a.flagTone === "critical").map((a) => `${a.name} ${a.value} ${a.unit}`).join(" · ")}
          </p>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Clinician informed</label>
            <input value={calledTo} onChange={(e) => setCalledTo(e.target.value)} placeholder="e.g. Dr. Mensah" className={inputClass} />
          </div>
          <label className="flex items-center gap-2 text-xs text-slate-600">
            <input type="checkbox" checked={readBack} onChange={(e) => setReadBack(e.target.checked)} className="h-3.5 w-3.5" />
            Clinician read the value back correctly
          </label>
        </div>
      </Modal>

      <ConfirmModal
        open={approveOpen}
        onClose={() => setApproveOpen(false)}
        onConfirm={() => run(() => actions.validate(s.id), () => setApproveOpen(false))}
        variant="approve"
        title="Validate & Release Result"
        description={`Release ${s.specId} (${s.testOrder}) to ${s.consultant}? Released results appear in the patient's record.`}
        confirmLabel="Validate & Release"
      />

      <ConfirmModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        onConfirm={(reason) => run(() => actions.reject(s.id, reason ?? ""), () => setRejectOpen(false))}
        variant="reject"
        title="Reject Specimen"
        description="The order is closed and the ward must send a new specimen. A reason is required."
        confirmLabel="Reject Specimen"
        requireReason
        reasonLabel="Rejection Reason"
        reasonPlaceholder="e.g. Haemolysed, insufficient volume, mislabelled…"
      />

      <ConfirmModal
        open={retestOpen}
        onClose={() => setRetestOpen(false)}
        onConfirm={(reason) => run(() => actions.repeat(s.id, reason ?? ""), () => setRetestOpen(false))}
        variant="warning"
        title="Order Re-test"
        description="Clears the current results and puts the specimen back in analysis."
        confirmLabel="Re-test"
        requireReason
        reasonLabel="Reason"
        reasonPlaceholder="e.g. Delta check failed, dilution required…"
      />
    </div>
  );
}
