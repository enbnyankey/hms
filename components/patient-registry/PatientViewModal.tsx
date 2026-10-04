"use client";

import { FileText } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { PatientRecord } from "@/lib/patient-registry-data";

export default function PatientViewModal({
  patient,
  open,
  onClose,
}: {
  patient: PatientRecord | null;
  open: boolean;
  onClose: () => void;
}) {
  if (!patient) return null;

  const rows: { label: string; value: string }[] = [
    { label: "MRN", value: patient.mrn },
    { label: "Full Name", value: patient.name },
    { label: "Date of Birth", value: patient.dob },
    { label: "Age / Sex", value: `${patient.age}y · ${patient.sex}` },
    { label: "Phone", value: patient.phone },
    { label: "Address", value: patient.address },
    { label: "Next of Kin", value: `${patient.nextOfKinName} · ${patient.nextOfKinPhone}` },
    { label: "NHIS Number", value: patient.nhisNumber || "Not enrolled" },
    { label: "NHIS Status", value: patient.nhisStatus },
    { label: "Blood Group", value: patient.bloodGroup },
    { label: "Allergies", value: patient.allergies },
    { label: "Category", value: patient.category },
    { label: "Last Visit", value: patient.lastVisit },
    { label: "Registered By", value: `${patient.registeredBy} · ${patient.registeredOn}` },
  ];

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={patient.name}
      description={`MRN ${patient.mrn} · Master Patient Index record`}
      icon={FileText}
      tone="default"
      size="md"
      footer={
        <Button variant="secondary" onClick={onClose}>
          Close
        </Button>
      }
    >
      <dl className="space-y-2.5">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-start justify-between gap-3 border-b border-surface-border pb-2 last:border-0 last:pb-0"
          >
            <dt className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{r.label}</dt>
            <dd className="text-right text-xs font-medium text-slate-700">{r.value}</dd>
          </div>
        ))}
      </dl>
    </Modal>
  );
}
