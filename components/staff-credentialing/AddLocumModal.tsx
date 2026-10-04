"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { CredentialCategory } from "@/lib/staff-credentialing-data";

export type LocumFormValues = {
  name: string;
  roleTitle: string;
  department: string;
  registryNo: string;
  category: CredentialCategory;
  tier: 1 | 2 | 3;
  email: string;
  phone: string;
};

const emptyForm: LocumFormValues = {
  name: "",
  roleTitle: "",
  department: "",
  registryNo: "",
  category: "attending",
  tier: 2,
  email: "",
  phone: "",
};

export default function AddLocumModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: LocumFormValues) => void;
}) {
  const [values, setValues] = useState<LocumFormValues>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [touched, setTouched] = useState(false);

  const errors = {
    name: values.name.trim() ? "" : "Full name is required",
    roleTitle: values.roleTitle.trim() ? "" : "Role / title is required",
    registryNo: values.registryNo.trim() ? "" : "Council registry number is required",
  };
  const isValid = !errors.name && !errors.roleTitle && !errors.registryNo;

  function set<K extends keyof LocumFormValues>(key: K, val: LocumFormValues[K]) {
    setValues((v) => ({ ...v, [key]: val }));
  }

  function handleClose() {
    if (submitting) return;
    setValues(emptyForm);
    setTouched(false);
    onClose();
  }

  function handleSubmit() {
    setTouched(true);
    if (!isValid) return;
    setSubmitting(true);
    setTimeout(() => {
      onSubmit(values);
      setSubmitting(false);
      setValues(emptyForm);
      setTouched(false);
    }, 500);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Fast-Track Locum Credentialing"
      description="Provision a temporary or locum staff member for expedited council review"
      icon={UserPlus}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" loading={submitting} onClick={handleSubmit}>
            Submit for Review
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
            placeholder="e.g. Dr. Ama Boateng"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {touched && errors.name && <p className="mt-1 text-[11px] text-status-red">{errors.name}</p>}
        </div>
        <div className="col-span-2">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Role / Title</label>
          <input
            value={values.roleTitle}
            onChange={(e) => set("roleTitle", e.target.value)}
            placeholder="e.g. Locum Anesthesiologist"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {touched && errors.roleTitle && <p className="mt-1 text-[11px] text-status-red">{errors.roleTitle}</p>}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Department</label>
          <input
            value={values.department}
            onChange={(e) => set("department", e.target.value)}
            placeholder="e.g. Surgical Theatre"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Council Registry No.</label>
          <input
            value={values.registryNo}
            onChange={(e) => set("registryNo", e.target.value)}
            placeholder="e.g. MDC/G/90211-A"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {touched && errors.registryNo && <p className="mt-1 text-[11px] text-status-red">{errors.registryNo}</p>}
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Category</label>
          <select
            value={values.category}
            onChange={(e) => set("category", e.target.value as CredentialCategory)}
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
          >
            <option value="attending">Attending / Clinical</option>
            <option value="nursing">Nursing</option>
            <option value="pharm_lis">Pharmacy / Lab</option>
            <option value="admin">Administrative</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Access Tier</label>
          <select
            value={values.tier}
            onChange={(e) => set("tier", Number(e.target.value) as 1 | 2 | 3)}
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
          >
            <option value={1}>Tier 1 — Attending Lead</option>
            <option value={2}>Tier 2 — Clinical Staff</option>
            <option value={3}>Tier 3 — Support Staff</option>
          </select>
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Email</label>
          <input
            value={values.email}
            onChange={(e) => set("email", e.target.value)}
            placeholder="e.g. locum@aurahealth.org"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Phone</label>
          <input
            value={values.phone}
            onChange={(e) => set("phone", e.target.value)}
            placeholder="e.g. +233 24 000 0000"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
      </div>
    </Modal>
  );
}
