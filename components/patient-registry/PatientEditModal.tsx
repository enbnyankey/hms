"use client";

import { useEffect, useState } from "react";
import { Pencil } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { PatientRecord } from "@/lib/patient-registry-data";

export type PatientEditValues = {
  name: string;
  phone: string;
  address: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nhisNumber: string;
  bloodGroup: string;
  allergies: string;
};

function toEditValues(p: PatientRecord): PatientEditValues {
  return {
    name: p.name,
    phone: p.phone,
    address: p.address,
    nextOfKinName: p.nextOfKinName,
    nextOfKinPhone: p.nextOfKinPhone,
    nhisNumber: p.nhisNumber,
    bloodGroup: p.bloodGroup,
    allergies: p.allergies,
  };
}

function emptyEditValues(): PatientEditValues {
  return {
    name: "",
    phone: "",
    address: "",
    nextOfKinName: "",
    nextOfKinPhone: "",
    nhisNumber: "",
    bloodGroup: "",
    allergies: "",
  };
}

export default function PatientEditModal({
  patient,
  open,
  onClose,
  onSubmit,
}: {
  patient: PatientRecord | null;
  open: boolean;
  onClose: () => void;
  onSubmit: (id: string, values: PatientEditValues) => void | Promise<void>;
}) {
  const [values, setValues] = useState<PatientEditValues>(() =>
    patient ? toEditValues(patient) : emptyEditValues()
  );
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && patient) {
      setValues(toEditValues(patient));
      setTouched(false);
    }
  }, [open, patient]);

  if (!patient) return null;
  const currentPatient = patient;

  const errors = {
    name: (values.name ?? "").trim().length === 0 ? "Full name is required" : "",
    phone: (values.phone ?? "").trim().length === 0 ? "Phone number is required" : "",
    nextOfKinName: (values.nextOfKinName ?? "").trim().length === 0 ? "Next of kin name is required" : "",
    nextOfKinPhone: (values.nextOfKinPhone ?? "").trim().length === 0 ? "Next of kin phone is required" : "",
  };
  const isValid = !errors.name && !errors.phone && !errors.nextOfKinName && !errors.nextOfKinPhone;

  function set<K extends keyof PatientEditValues>(key: K, val: string) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  async function handleSubmit() {
    setTouched(true);
    if (!isValid) return;
    setSubmitting(true);
    try {
      await onSubmit(currentPatient.id, values);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Edit Patient — ${patient.mrn}`}
      description="Update demographics and contact information"
      icon={Pencil}
      tone="default"
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting}>
            Save Changes
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Full Name</label>
          <input
            value={values.name}
            onChange={(e) => set("name", e.target.value)}
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {touched && errors.name && <p className="mt-1 text-[11px] text-status-red">{errors.name}</p>}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Phone</label>
          <input
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {touched && errors.phone && <p className="mt-1 text-[11px] text-status-red">{errors.phone}</p>}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">NHIS Number</label>
          <input
            value={values.nhisNumber}
            onChange={(e) => set("nhisNumber", e.target.value)}
            placeholder="Optional"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
        <div className="col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Address</label>
          <input
            value={values.address}
            onChange={(e) => set("address", e.target.value)}
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Next of Kin Name</label>
          <input
            value={values.nextOfKinName}
            onChange={(e) => set("nextOfKinName", e.target.value)}
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {touched && errors.nextOfKinName && <p className="mt-1 text-[11px] text-status-red">{errors.nextOfKinName}</p>}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Next of Kin Phone</label>
          <input
            value={values.nextOfKinPhone}
            onChange={(e) => set("nextOfKinPhone", e.target.value)}
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {touched && errors.nextOfKinPhone && (
            <p className="mt-1 text-[11px] text-status-red">{errors.nextOfKinPhone}</p>
          )}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Blood Group</label>
          <select
            value={values.bloodGroup}
            onChange={(e) => set("bloodGroup", e.target.value)}
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
          >
            {["", "O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"].map((bg) => (
              <option key={bg} value={bg}>
                {bg || "Unknown"}
              </option>
            ))}
          </select>
        </div>
        <div className="col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Allergies</label>
          <input
            value={values.allergies}
            onChange={(e) => set("allergies", e.target.value)}
            placeholder="e.g. Penicillin, none recorded"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
      </div>
    </Modal>
  );
}
