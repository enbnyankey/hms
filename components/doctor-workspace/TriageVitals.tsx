"use client";

import { useState } from "react";
import { HeartPulse, CheckCircle2, Plus } from "lucide-react";
import {
  triageVitalsMeta,
  bloodPressure as initialBloodPressure,
  bpTrend as initialBpTrend,
  bpTrendDrift as initialBpTrendDrift,
  vitalStats as initialVitalStats,
  bodyStats,
} from "@/lib/doctor-data";
import { actionToast } from "@/lib/actions";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const CHART_WIDTH = 260;
const CHART_HEIGHT = 56;
const PADDING_X = 4;

function bpStage(systolic: number, diastolic: number) {
  if (systolic >= 180 || diastolic >= 120) return "Hypertensive Crisis";
  if (systolic >= 140 || diastolic >= 90) return "Stage 2 High";
  if (systolic >= 130 || diastolic >= 80) return "Stage 1 High";
  if (systolic >= 120) return "Elevated";
  return "Normal";
}

function BpTrendChart({ trend }: { trend: { label: string; value: number }[] }) {
  const values = trend.map((p) => p.value);
  const min = Math.min(...values) - 6;
  const max = Math.max(...values) + 6;
  const span = max - min || 1;
  const step = (CHART_WIDTH - PADDING_X * 2) / (trend.length - 1 || 1);

  const points = trend.map((p, i) => {
    const x = PADDING_X + step * i;
    const y = CHART_HEIGHT - ((p.value - min) / span) * CHART_HEIGHT;
    return { x, y, ...p };
  });

  const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");

  return (
    <svg
      viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
      className="h-14 w-full"
      role="img"
      aria-label={`Blood pressure trend across ${trend.length} visits, latest ${values[values.length - 1]}`}
    >
      <path d={path} fill="none" stroke="#dc2626" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => (
        <circle
          key={`${p.label}-${i}`}
          cx={p.x}
          cy={p.y}
          r={i === points.length - 1 ? 4 : 3}
          fill={i === points.length - 1 ? "#dc2626" : "#ffffff"}
          stroke="#dc2626"
          strokeWidth={2}
        />
      ))}
    </svg>
  );
}

type VitalsFormState = {
  systolic: string;
  diastolic: string;
  pulse: string;
  spo2: string;
  temp: string;
  resp: string;
};

const emptyForm: VitalsFormState = { systolic: "", diastolic: "", pulse: "", spo2: "", temp: "", resp: "" };

export default function TriageVitals() {
  const [bloodPressure, setBloodPressure] = useState(initialBloodPressure);
  const [bpTrend, setBpTrend] = useState(initialBpTrend);
  const [bpTrendDrift, setBpTrendDrift] = useState(initialBpTrendDrift);
  const [vitalStats, setVitalStats] = useState(initialVitalStats);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<VitalsFormState>(emptyForm);

  const isValid = form.systolic.trim().length > 0 && form.diastolic.trim().length > 0;

  function openForm() {
    setForm({
      systolic: String(bloodPressure.systolic),
      diastolic: String(bloodPressure.diastolic),
      pulse: vitalStats.find((v) => v.id === "pulse")?.value ?? "",
      spo2: vitalStats.find((v) => v.id === "spo2")?.value ?? "",
      temp: vitalStats.find((v) => v.id === "temp")?.value ?? "",
      resp: vitalStats.find((v) => v.id === "resp")?.value ?? "",
    });
    setFormOpen(true);
  }

  function handleSubmit() {
    const systolic = Number(form.systolic);
    const diastolic = Number(form.diastolic);
    if (!isValid || Number.isNaN(systolic) || Number.isNaN(diastolic)) return;

    const previousSystolic = bloodPressure.systolic;
    const stageLabel = bpStage(systolic, diastolic);
    const map = Math.round(diastolic + (systolic - diastolic) / 3);

    setBloodPressure({ ...bloodPressure, systolic, diastolic, stageLabel, map });
    setBpTrend((prev) => [...prev.slice(1), { label: "Now", value: systolic }]);
    const drift = systolic - previousSystolic;
    setBpTrendDrift(`${drift >= 0 ? "+" : ""}${drift} mmHg drift`);

    setVitalStats((prev) =>
      prev.map((stat) => {
        if (stat.id === "pulse" && form.pulse) return { ...stat, value: form.pulse };
        if (stat.id === "spo2" && form.spo2) return { ...stat, value: form.spo2 };
        if (stat.id === "temp" && form.temp) return { ...stat, value: form.temp };
        if (stat.id === "resp" && form.resp) return { ...stat, value: form.resp };
        return stat;
      })
    );

    actionToast("Vitals recorded", `BP ${systolic}/${diastolic} mmHg logged for this encounter.`);
    setFormOpen(false);
  }

  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex items-center justify-between border-b border-surface-border px-5 py-4">
        <div className="flex items-center gap-2">
          <HeartPulse className="h-4 w-4 text-brand-cyan" />
          <h2 className="text-sm font-bold text-slate-900">Triage Vitals</h2>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-medium text-slate-400">{triageVitalsMeta.time}</span>
          <button
            type="button"
            onClick={openForm}
            className="flex items-center gap-1 rounded-md border border-surface-border px-2 py-1 text-[11px] font-semibold text-brand-cyan hover:bg-slate-50"
          >
            <Plus className="h-3 w-3" />
            Record
          </button>
        </div>
      </div>

      <div className="px-5 pt-3">
        <p className="flex items-center gap-1 text-[11px] text-slate-400">
          {triageVitalsMeta.recordedBy}
          <CheckCircle2 className="h-3 w-3 text-status-green" />
        </p>
      </div>

      <div className="p-5 pt-3">
        <div className="rounded-lg border border-red-100 bg-status-red-bg p-4">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-bold uppercase leading-snug tracking-wide text-status-red">
              Blood Pressure (Urgent)
            </p>
            <span className="shrink-0 whitespace-nowrap rounded-full bg-status-red px-2 py-1 text-[9px] font-bold leading-none text-white">
              {bloodPressure.stageLabel.toUpperCase()}
            </span>
          </div>
          <p className="mt-1.5 text-3xl font-extrabold text-status-red">
            {bloodPressure.systolic} / {bloodPressure.diastolic}{" "}
            <span className="text-sm font-semibold text-status-red/70">mmHg</span>
          </p>
          <p className="mt-1 text-[11px] text-status-red/80">
            MAP: {bloodPressure.map} mmHg · Target: {bloodPressure.target}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          {vitalStats.map((stat) => (
            <div key={stat.id} className="rounded-lg border border-surface-border p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{stat.label}</p>
              <p className="mt-1 text-lg font-extrabold text-slate-900">
                {stat.value} <span className="text-xs font-medium text-slate-400">{stat.unit}</span>
              </p>
              <p className="text-[11px] text-slate-400">{stat.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3">
          {bodyStats.map((stat) => (
            <div key={stat.id} className="rounded-lg border border-surface-border p-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{stat.label}</p>
              <p className={`mt-1 text-lg font-extrabold ${stat.valueClass ?? "text-slate-900"}`}>
                {stat.value} <span className="text-xs font-medium text-slate-400">{stat.unit}</span>
              </p>
              <p className="text-[11px] text-slate-400">{stat.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-4 rounded-lg border border-surface-border p-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-700">BP Trend (Last {bpTrend.length} Visits)</p>
            <span className="text-[11px] font-bold text-status-red">{bpTrendDrift}</span>
          </div>
          <div className="mt-2">
            <BpTrendChart trend={bpTrend} />
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-slate-400">
            {bpTrend.map((p, i) => (
              <span key={`${p.label}-${i}`} className={i === bpTrend.length - 1 ? "font-bold text-status-red" : ""}>
                {p.label}
                <br />({p.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Record New Vitals"
        description="Log a fresh set of triage vitals for this encounter."
        icon={HeartPulse}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
              Save Vitals
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Systolic</label>
              <input
                inputMode="numeric"
                value={form.systolic}
                onChange={(e) => setForm((f) => ({ ...f, systolic: e.target.value }))}
                className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Diastolic</label>
              <input
                inputMode="numeric"
                value={form.diastolic}
                onChange={(e) => setForm((f) => ({ ...f, diastolic: e.target.value }))}
                className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
              />
            </div>
          </div>
          {!isValid && (
            <p className="text-[11px] text-status-red">Systolic and diastolic readings are required.</p>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Pulse (bpm)</label>
              <input
                inputMode="numeric"
                value={form.pulse}
                onChange={(e) => setForm((f) => ({ ...f, pulse: e.target.value }))}
                className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">SpO2 (%)</label>
              <input
                inputMode="numeric"
                value={form.spo2}
                onChange={(e) => setForm((f) => ({ ...f, spo2: e.target.value }))}
                className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Temp (°C)</label>
              <input
                value={form.temp}
                onChange={(e) => setForm((f) => ({ ...f, temp: e.target.value }))}
                className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Resp. (cpm)</label>
              <input
                inputMode="numeric"
                value={form.resp}
                onChange={(e) => setForm((f) => ({ ...f, resp: e.target.value }))}
                className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
              />
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
