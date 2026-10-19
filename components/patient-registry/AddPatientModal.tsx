"use client";

import { useEffect, useState } from "react";
import { UserPlus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { emptyPatientForm, type PatientFormValues } from "@/lib/patient-registry-data";

export default function AddPatientModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: PatientFormValues) => void | Promise<void>;
}) {
  const [values, setValues] = useState<PatientFormValues>(emptyPatientForm);
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(emptyPatientForm);
      setTouched(false);
    }
  }, [open]);

  const errors = {
    name: values.name.trim().length === 0 ? "Full name is required" : "",
    age: values.age.trim().length === 0 || Number.isNaN(Number(values.age)) ? "Valid age is required" : "",
    sex: values.sex === "" ? "Sex is required" : "",
    phone: values.phone.trim().length === 0 ? "Phone number is required" : "",
    address: values.address.trim().length === 0 ? "Address is required" : "",
    nextOfKinName: values.nextOfKinName.trim().length === 0 ? "Next of kin name is required" : "",
    nextOfKinPhone: values.nextOfKinPhone.trim().length === 0 ? "Next of kin phone is required" : "",
  };
  const isValid = Object.values(errors).every((e) => !e);

  function set<K extends keyof PatientFormValues>(key: K, val: PatientFormValues[K]) {
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
      await onSubmit(values);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="New Patient Registration"
      description="Add a new record to the Master Patient Index"
      icon={UserPlus}
      tone="default"
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} loading={submitting} disabled={touched && !isValid}>
            Register Patient
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
            placeholder="e.g. Ama Frimpong"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {touched && errors.name && <p className="mt-1 text-[11px] text-status-red">{errors.name}</p>}
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Date of Birth</label>
          <input
            value={values.dob}
            onChange={(e) => set("dob", e.target.value)}
            placeholder="e.g. 14 Feb 1990"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Age</label>
          <input
            value={values.age}
            onChange={(e) => set("age", e.target.value)}
            placeholder="e.g. 34"
            inputMode="numeric"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {touched && errors.age && <p className="mt-1 text-[11px] text-status-red">{errors.age}</p>}
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Sex</label>
          <select
            value={values.sex}
            onChange={(e) => set("sex", e.target.value as PatientFormValues["sex"])}
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
          >
            <option value="">Select…</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          {touched && errors.sex && <p className="mt-1 text-[11px] text-status-red">{errors.sex}</p>}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Phone</label>
          <input
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="e.g. +233 24 000 0000"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {touched && errors.phone && <p className="mt-1 text-[11px] text-status-red">{errors.phone}</p>}
        </div>

        <div className="col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Address</label>
          <input
            value={values.address}
            onChange={(e) => set("address", e.target.value)}
            placeholder="e.g. 22 Spintex Rd, Accra"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {touched && errors.address && <p className="mt-1 text-[11px] text-status-red">{errors.address}</p>}
        </div>

        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Next of Kin Name</label>
          <input
            value={values.nextOfKinName}
            onChange={(e) => set("nextOfKinName", e.target.value)}
            placeholder="e.g. Kofi Frimpong"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {touched && errors.nextOfKinName && <p className="mt-1 text-[11px] text-status-red">{errors.nextOfKinName}</p>}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Next of Kin Phone</label>
          <input
            value={values.nextOfKinPhone}
            onChange={(e) => set("nextOfKinPhone", e.target.value)}
            placeholder="e.g. +233 24 111 2222"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {touched && errors.nextOfKinPhone && (
            <p className="mt-1 text-[11px] text-status-red">{errors.nextOfKinPhone}</p>
          )}
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
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            Allergies (optional)
          </label>
          <input
            value={values.allergies}
            onChange={(e) => set("allergies", e.target.value)}
            placeholder="e.g. Penicillin, none recorded"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>

        <div className="col-span-2">
          <label className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
            <input
              type="checkbox"
              checked={values.walkIn}
              onChange={(e) => set("walkIn", e.target.checked)}
              className="h-3.5 w-3.5 rounded border-surface-border"
            />
            Register as walk-in / NHIS pending verification
          </label>
        </div>
      </div>
    </Modal>
  );
}
