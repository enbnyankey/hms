"use client";

import { useState } from "react";
import { Microscope, LineChart, ClipboardCheck, PlusCircle, Beaker, CheckCircle2 } from "lucide-react";
import { labHeader, specimenTypeOptions, STATUS_TONE, type SpecimenItem } from "@/lib/lab-data";
import { actionToast } from "@/lib/actions";
import Modal from "../ui/Modal";
import Button from "../ui/Button";

const qcRuns = [
  { analyte: "Glucose (Level 1)", target: "5.0 mmol/L", result: "5.1 mmol/L", status: "In Control" },
  { analyte: "Glucose (Level 2)", target: "12.0 mmol/L", result: "12.4 mmol/L", status: "In Control" },
  { analyte: "Creatinine (Level 1)", target: "88 µmol/L", result: "91 µmol/L", status: "In Control" },
  { analyte: "Potassium (Level 2)", target: "5.5 mmol/L", result: "6.3 mmol/L", status: "Westgard 1-3s Flag" },
  { analyte: "Hemoglobin (Level 1)", target: "12.0 g/dL", result: "12.1 g/dL", status: "In Control" },
];

const validationBatch = [
  { specId: "#SP-2024-9412-CHM", patient: "Kofi Mensah", test: "Fasting Lipid Profile" },
  { specId: "#SP-2024-9418-HEM", patient: "Adjoa Sarpong", test: "Full Blood Count" },
  { specId: "#SP-2024-9421-CHM", patient: "Yaw Boadi", test: "Liver Function Panel" },
];

type FormState = {
  patient: string;
  age: string;
  sex: string;
  mrn: string;
  ward: string;
  bed: string;
  consultant: string;
  specType: string;
  testOrder: string;
  urgent: boolean;
};

const emptyForm: FormState = {
  patient: "",
  age: "",
  sex: "Male",
  mrn: "",
  ward: "",
  bed: "",
  consultant: "",
  specType: "CHM",
  testOrder: "",
  urgent: false,
};

let nextSpecimenSeq = 9500;

export default function LabHeader({ onAccession }: { onAccession: (specimen: SpecimenItem) => void }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [qcOpen, setQcOpen] = useState(false);
  const [batchOpen, setBatchOpen] = useState(false);
  const [validating, setValidating] = useState(false);
  const [validated, setValidated] = useState(false);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function validate(): boolean {
    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.patient.trim()) next.patient = "Patient name is required.";
    if (!form.mrn.trim()) next.mrn = "MRN is required.";
    if (!form.age.trim()) next.age = "Age is required.";
    if (!form.ward.trim()) next.ward = "Ward is required.";
    if (!form.testOrder.trim()) next.testOrder = "Test order is required.";
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleClose() {
    if (submitting) return;
    setOpen(false);
    setForm(emptyForm);
    setErrors({});
  }

  function handleSubmit() {
    if (!validate()) return;
    setSubmitting(true);
    setTimeout(() => {
      const typeCfg = specimenTypeOptions.find((t) => t.value === form.specType) ?? specimenTypeOptions[0];
      const seq = nextSpecimenSeq++;
      const status = form.urgent ? "STAT Run" : "Pending Analysis";
      const specimen: SpecimenItem = {
        id: `s-${seq}`,
        specId: `#SP-2024-${seq}-${typeCfg.value}`,
        specType: typeCfg.value,
        status,
        statusTone: STATUS_TONE[status],
        category: form.urgent ? "stat" : typeCfg.category,
        urgent: form.urgent,
        patient: form.patient.trim(),
        age: `${form.age.trim()} yrs`,
        sex: form.sex,
        mrn: form.mrn.trim(),
        ward: form.ward.trim(),
        bed: form.bed.trim() || "—",
        consultant: form.consultant.trim() || "Unassigned",
        collection: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " GMT",
        analyzer: "Awaiting Assignment",
        detail: `${form.age.trim()}${form.sex[0]} · MRN #${form.mrn.trim()} · ${form.ward.trim()}`,
        containerDot: typeCfg.containerDot,
        container: typeCfg.container,
        testOrder: form.testOrder.trim(),
        analytes: [],
      };
      onAccession(specimen);
      actionToast("New specimen accessioned", `${specimen.specId} · ${specimen.patient} added to the queue.`, "success");
      setSubmitting(false);
      setOpen(false);
      setForm(emptyForm);
      setErrors({});
    }, 400);
  }

  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-brand-teal">
          <Microscope className="h-5 w-5" />
        </span>
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900">{labHeader.title}</h1>
            <span className="rounded bg-slate-800 px-2 py-0.5 text-[10px] font-bold tracking-wide text-white">
              {labHeader.block}
            </span>
          </div>
          <p className="text-xs text-slate-400">
            {labHeader.supervisor} · {labHeader.role} · <span className="font-semibold text-status-green">{labHeader.lisStatus}</span>
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setQcOpen(true)}
          className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <LineChart className="h-3.5 w-3.5" />
          QC Log (Levey-Jennings)
        </button>
        <button
          onClick={() => {
            setBatchOpen(true);
            setValidated(false);
          }}
          className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          <ClipboardCheck className="h-3.5 w-3.5" />
          Batch Validation
        </button>
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 rounded-lg bg-brand-teal px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700"
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Accession Specimen
        </button>
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        title="Accession New Specimen"
        description="Register a newly received specimen into the LIS queue."
        icon={Beaker}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting}>
              Accession Specimen
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <Field label="Patient Name" error={errors.patient} className="col-span-2">
            <input
              value={form.patient}
              onChange={(e) => set("patient", e.target.value)}
              placeholder="e.g. Ama Owusu"
              className={inputClass(!!errors.patient)}
            />
          </Field>
          <Field label="Age" error={errors.age}>
            <input
              value={form.age}
              onChange={(e) => set("age", e.target.value)}
              placeholder="e.g. 45"
              className={inputClass(!!errors.age)}
            />
          </Field>
          <Field label="Sex">
            <select value={form.sex} onChange={(e) => set("sex", e.target.value)} className={inputClass(false)}>
              <option>Male</option>
              <option>Female</option>
            </select>
          </Field>
          <Field label="MRN" error={errors.mrn}>
            <input
              value={form.mrn}
              onChange={(e) => set("mrn", e.target.value)}
              placeholder="e.g. GH-2024-1234"
              className={inputClass(!!errors.mrn)}
            />
          </Field>
          <Field label="Ward" error={errors.ward}>
            <input
              value={form.ward}
              onChange={(e) => set("ward", e.target.value)}
              placeholder="e.g. Ward B"
              className={inputClass(!!errors.ward)}
            />
          </Field>
          <Field label="Bed">
            <input
              value={form.bed}
              onChange={(e) => set("bed", e.target.value)}
              placeholder="e.g. B-04"
              className={inputClass(false)}
            />
          </Field>
          <Field label="Consultant">
            <input
              value={form.consultant}
              onChange={(e) => set("consultant", e.target.value)}
              placeholder="e.g. Dr. Ansah"
              className={inputClass(false)}
            />
          </Field>
          <Field label="Specimen Type" className="col-span-2">
            <select value={form.specType} onChange={(e) => set("specType", e.target.value)} className={inputClass(false)}>
              {specimenTypeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Test Order" error={errors.testOrder} className="col-span-2">
            <input
              value={form.testOrder}
              onChange={(e) => set("testOrder", e.target.value)}
              placeholder="e.g. FBC + ESR"
              className={inputClass(!!errors.testOrder)}
            />
          </Field>
          <label className="col-span-2 flex items-center gap-2 text-xs font-semibold text-slate-600">
            <input
              type="checkbox"
              checked={form.urgent}
              onChange={(e) => set("urgent", e.target.checked)}
              className="h-3.5 w-3.5 rounded border-surface-border text-brand-teal focus:ring-brand-teal"
            />
            Mark as STAT / Urgent
          </label>
        </div>
      </Modal>

      <Modal
        open={qcOpen}
        onClose={() => setQcOpen(false)}
        title="QC Log — Levey-Jennings"
        description="Current run · Chemistry Analyzer 2"
        icon={LineChart}
        size="md"
        footer={<Button variant="secondary" onClick={() => setQcOpen(false)}>Close</Button>}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="text-[10px] uppercase tracking-wide text-slate-400">
                <th className="pb-2 font-semibold">Analyte / Level</th>
                <th className="pb-2 font-semibold">Target</th>
                <th className="pb-2 font-semibold">Result</th>
                <th className="pb-2 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border">
              {qcRuns.map((row) => (
                <tr key={row.analyte}>
                  <td className="py-2 pr-2 font-medium text-slate-700">{row.analyte}</td>
                  <td className="py-2 pr-2 text-slate-500">{row.target}</td>
                  <td className="py-2 pr-2 font-semibold text-slate-800">{row.result}</td>
                  <td className="py-2 text-right">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        row.status === "In Control"
                          ? "bg-status-green-bg text-status-green"
                          : "bg-status-amber-bg text-status-amber"
                      }`}
                    >
                      {row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>

      <Modal
        open={batchOpen}
        onClose={() => {
          if (validating) return;
          setBatchOpen(false);
        }}
        title="Batch Validation"
        description="Pending analyte results awaiting supervisory sign-off"
        icon={ClipboardCheck}
        size="md"
        footer={
          <>
            <Button variant="secondary" onClick={() => setBatchOpen(false)} disabled={validating}>
              Close
            </Button>
            {!validated && (
              <Button
                variant="primary"
                loading={validating}
                onClick={() => {
                  setValidating(true);
                  setTimeout(() => {
                    setValidating(false);
                    setValidated(true);
                    actionToast("Batch validated", `${validationBatch.length} specimen results validated and released.`, "success");
                  }, 700);
                }}
              >
                Validate All
              </Button>
            )}
          </>
        }
      >
        {validated ? (
          <div className="flex flex-col items-center gap-2 py-6 text-center">
            <CheckCircle2 className="h-8 w-8 text-status-green" />
            <p className="text-sm font-semibold text-slate-700">Batch validated</p>
            <p className="text-xs text-slate-400">All {validationBatch.length} results have been released to their ordering physicians.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {validationBatch.map((row) => (
              <div key={row.specId} className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2">
                <div>
                  <p className="text-xs font-semibold text-slate-800">{row.patient}</p>
                  <p className="text-[11px] text-slate-400">{row.specId} · {row.test}</p>
                </div>
                <span className="rounded bg-status-amber-bg px-2 py-0.5 text-[10px] font-bold text-status-amber">Pending</span>
              </div>
            ))}
          </div>
        )}
      </Modal>
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `mt-1 w-full rounded-md border px-2.5 py-1.5 text-xs text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal ${
    hasError ? "border-status-red" : "border-surface-border"
  }`;
}

function Field({
  label,
  error,
  className = "",
  children,
}: {
  label: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={className}>
      <label className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{label}</label>
      {children}
      {error && <p className="mt-0.5 text-[10px] font-medium text-status-red">{error}</p>}
    </div>
  );
}
