"use client";

import { useRef, useState } from "react";
import { UserPlus, Search, Check } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { searchPatients, ageSex, type PatientOption } from "@/lib/ward-api";
import type { TransferTarget } from "./TransferModal";

export type AdmitValues = {
  patientId: string;
  bedId: string;
  diagnosis: string;
  attending: string;
  notes: string;
};

/**
 * Admit a registered patient into a bed. The patient is picked from the
 * registry (search by name, MRN or phone), so every admission is tied to a
 * real patient record. Pass `bed` to admit into a specific bed, otherwise the
 * user chooses one from `bedOptions`.
 */
export default function AdmitPatientModal({
  open,
  onClose,
  onSubmit,
  bed,
  bedOptions,
}: {
  open: boolean;
  onClose: () => void;
  /** Resolve true when the admission succeeded (closes the dialog). */
  onSubmit: (values: AdmitValues) => Promise<boolean>;
  bed?: TransferTarget | null;
  bedOptions: TransferTarget[];
}) {
  // The parent remounts this component (via key) each time it opens, so
  // initial state is the reset state.
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<PatientOption[]>([]);
  const [searching, setSearching] = useState(false);
  const [patient, setPatient] = useState<PatientOption | null>(null);
  const [bedKey, setBedKey] = useState(bed ? bed.bedId : "");
  const [diagnosis, setDiagnosis] = useState("");
  const [attending, setAttending] = useState("");
  const [notes, setNotes] = useState("");
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function onQueryChange(value: string) {
    setQuery(value);
    setPatient(null);
    if (timer.current) clearTimeout(timer.current);
    if (value.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    timer.current = setTimeout(async () => {
      try {
        setResults(await searchPatients(value.trim()));
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
  }

  const errors = {
    patient: patient ? "" : "Choose a registered patient",
    bed: bedKey ? "" : "Choose a bed",
    diagnosis: diagnosis.trim() ? "" : "Diagnosis is required",
  };
  const isValid = !errors.patient && !errors.bed && !errors.diagnosis;

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  async function handleSubmit() {
    setTouched(true);
    if (!isValid || !patient) return;
    setSubmitting(true);
    try {
      const ok = await onSubmit({ patientId: patient.id, bedId: bedKey, diagnosis, attending, notes });
      if (ok) onClose();
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal";

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={bed ? `Admit Patient — ${bed.label}` : "New Bed Admission"}
      description="Find the patient in the registry, then record the reason for admission"
      icon={UserPlus}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>
            Admit Patient
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Patient</label>
          {patient ? (
            <div className="mt-1 flex items-center justify-between rounded-md border border-teal-200 bg-teal-50 px-3 py-2">
              <div>
                <p className="text-sm font-semibold text-slate-800">{patient.name}</p>
                <p className="text-[11px] text-slate-500">
                  {patient.mrn} · {ageSex(patient.age, patient.sex)}
                </p>
              </div>
              <button
                onClick={() => {
                  setPatient(null);
                  setQuery("");
                  setResults([]);
                }}
                className="text-[11px] font-semibold text-brand-teal hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 mt-0.5 h-3.5 w-3.5 -translate-y-1/2 text-slate-300" />
                <input
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                  placeholder="Search name, MRN or phone…"
                  className={`${inputClass} pl-8`}
                  autoFocus
                />
              </div>
              {query.trim().length >= 2 && (
                <div className="mt-1 max-h-48 overflow-y-auto rounded-md border border-surface-border">
                  {searching && results.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-slate-400">Searching…</p>
                  ) : results.length === 0 ? (
                    <p className="px-3 py-2 text-xs text-slate-400">
                      No active patient matches. Register them in Patient Registry first.
                    </p>
                  ) : (
                    results.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => setPatient(p)}
                        className="flex w-full items-center justify-between px-3 py-2 text-left hover:bg-slate-50"
                      >
                        <span className="text-xs font-semibold text-slate-700">{p.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {p.mrn} · {ageSex(p.age, p.sex)}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
              {touched && errors.patient && <p className="mt-1 text-[11px] text-status-red">{errors.patient}</p>}
            </>
          )}
        </div>

        {!bed && (
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Bed</label>
            <select value={bedKey} onChange={(e) => setBedKey(e.target.value)} className={inputClass}>
              <option value="">Select a bed…</option>
              {bedOptions.map((t) => (
                <option key={t.bedId} value={t.bedId}>
                  {t.label}
                </option>
              ))}
            </select>
            {touched && errors.bed && <p className="mt-1 text-[11px] text-status-red">{errors.bed}</p>}
          </div>
        )}

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Diagnosis / Reason for Admission
          </label>
          <input
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            placeholder="e.g. Community-Acquired Pneumonia"
            className={inputClass}
          />
          {touched && errors.diagnosis && <p className="mt-1 text-[11px] text-status-red">{errors.diagnosis}</p>}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Attending (optional)</label>
            <input value={attending} onChange={(e) => setAttending(e.target.value)} placeholder="e.g. Dr. K. Frimpong" className={inputClass} />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Clinical Note (optional)</label>
            <input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. O2 2L/min" className={inputClass} />
          </div>
        </div>
        {patient && (
          <p className="flex items-center gap-1 text-[11px] text-slate-400">
            <Check className="h-3 w-3 text-status-green" /> The patient&apos;s registry record will be marked Inpatient.
          </p>
        )}
      </div>
    </Modal>
  );
}
