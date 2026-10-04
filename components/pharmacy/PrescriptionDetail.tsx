"use client";

import { useState } from "react";
import {
  ClipboardCheck,
  Printer,
  CheckCircle2,
  Circle,
  ShieldAlert,
  ChevronDown,
  AlertTriangle,
} from "lucide-react";
import Card from "../Card";
import ConfirmModal from "../ui/ConfirmModal";
import Button from "../ui/Button";
import {
  selectedRxPatient,
  clinicalFlags,
  rxLineItems as initialRxLineItems,
  thermalLabel,
  type RxLineItem,
} from "@/lib/pharmacy-data";
import { actionToast } from "@/lib/actions";

export default function PrescriptionDetail() {
  const [items, setItems] = useState<RxLineItem[]>(initialRxLineItems);
  const [flagReason, setFlagReason] = useState<string | null>(null);
  const [showFlagModal, setShowFlagModal] = useState(false);
  const [showDispenseModal, setShowDispenseModal] = useState(false);
  const [dispensed, setDispensed] = useState(false);

  const verifiedCount = items.filter((i) => i.verified).length;
  const total = items.length;
  const allVerified = verifiedCount === total;
  const canDispense = allVerified && !flagReason && !dispensed;

  function toggleVerify(id: string) {
    if (dispensed) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, verified: !i.verified } : i)));
  }

  function clearFlag() {
    setFlagReason(null);
    actionToast("Flag cleared", `${selectedRxPatient.rxId} is back in the dispensing queue`, "info");
  }

  return (
    <Card
      icon={ClipboardCheck}
      iconClassName="bg-teal-50 text-brand-teal"
      title={selectedRxPatient.rxId}
      subtitle={`${selectedRxPatient.name} · ${selectedRxPatient.nhis}`}
      headerClassName="px-4 py-3"
      bodyClassName="p-4"
      action={
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
            allVerified ? "bg-status-green-bg text-status-green" : "bg-status-amber-bg text-status-amber"
          }`}
        >
          {verifiedCount}/{total} Items Verified
        </span>
      }
    >
      <div className="grid grid-cols-2 gap-2 rounded-lg border border-surface-border bg-slate-50 p-2.5 text-[11px] sm:grid-cols-4">
        <Info label="Date of Birth" value={selectedRxPatient.dob} />
        <Info label="Sex" value={selectedRxPatient.sex} />
        <Info label="Blood Group" value={selectedRxPatient.blood} />
        <Info label="Weight" value={selectedRxPatient.weight} />
      </div>

      <div className="mt-2 grid grid-cols-1 gap-1.5 sm:grid-cols-3">
        {clinicalFlags.map((flag) => (
          <div key={flag.id} className="flex items-center gap-1.5 rounded-lg border border-surface-border bg-white px-2.5 py-1.5">
            <ShieldAlert className="h-3.5 w-3.5 shrink-0 text-status-green" />
            <div className="leading-tight">
              <p className="text-[11px] font-bold text-slate-700">{flag.title}</p>
              <p className="text-[10px] text-slate-400">{flag.lines.join(" · ")}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-1.5">
        {items.map((item) => (
          <div key={item.id} className="rounded-lg border border-surface-border bg-white px-3 py-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div>
                <p className="text-[12px] font-bold text-slate-800">{item.name}</p>
                <p className="text-[10px] text-slate-500">
                  {item.qty} · Copay: {item.copay} · {item.sig}
                </p>
              </div>
              <button
                type="button"
                onClick={() => toggleVerify(item.id)}
                disabled={dispensed}
                className={`flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold transition-colors disabled:cursor-not-allowed ${
                  item.verified
                    ? "bg-status-green-bg text-status-green hover:bg-status-green/20"
                    : "bg-slate-100 text-slate-400 hover:bg-slate-200"
                }`}
              >
                {item.verified ? <CheckCircle2 className="h-3 w-3" /> : <Circle className="h-3 w-3" />}
                {item.verified ? "Verified" : "Unverified"}
              </button>
            </div>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 border-t border-surface-border pt-1 text-[10px] text-slate-400">
              <span>Batch: {item.batch}</span>
              <span>Exp: {item.exp}</span>
              <span>{item.location}</span>
              <span>{item.gtin}</span>
              <span>Stock: {item.stock}</span>
            </div>
          </div>
        ))}
      </div>

      <details className="mt-3 group rounded-lg border border-dashed border-surface-border bg-red-50 p-2.5">
        <summary className="flex cursor-pointer list-none items-center justify-between text-[11px] font-semibold text-slate-500">
          <span className="flex items-center gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            Thermal Label Preview · {thermalLabel.device}
          </span>
          <ChevronDown className="h-3.5 w-3.5 transition-transform group-open:rotate-180" />
        </summary>
        <div className="mt-2 rounded-md border border-slate-300 bg-white p-2.5 font-mono text-[10px] leading-snug text-slate-700">
          <p className="text-center font-bold">{thermalLabel.hospitalName}</p>
          <p className="text-center">{thermalLabel.phone}</p>
          <p className="mt-1">{thermalLabel.patientLine}</p>
          <p className="mt-1">{thermalLabel.instructions}</p>
          <p className="mt-1">{thermalLabel.dispensed}</p>
          <p>{thermalLabel.dispenser}</p>
        </div>
      </details>

      {flagReason && (
        <div className="mt-3 flex items-center justify-between gap-2 rounded-lg border border-status-amber-bg bg-status-amber-bg/40 px-3 py-2 text-[11px] text-status-amber">
          <span className="flex items-center gap-1.5 font-semibold">
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Flagged for pharmacist review: {flagReason}
          </span>
          <Button variant="ghost" className="!rounded-md !px-2 !py-1 !text-[10px]" onClick={clearFlag}>
            Clear
          </Button>
        </div>
      )}

      {dispensed && (
        <div className="mt-3 flex items-center gap-1.5 rounded-lg border border-status-green-bg bg-status-green-bg/40 px-3 py-2 text-[11px] font-semibold text-status-green">
          <CheckCircle2 className="h-3.5 w-3.5" />
          Label printed & dispensed to {selectedRxPatient.name}
        </div>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        {!dispensed && (
          <Button variant="secondary" onClick={() => setShowFlagModal(true)} disabled={!!flagReason}>
            <AlertTriangle className="h-3.5 w-3.5" />
            {flagReason ? "Flagged" : "Flag for Pharmacist Review"}
          </Button>
        )}
        <Button
          variant="primary"
          disabled={!canDispense}
          title={!allVerified ? "Verify all items before dispensing" : flagReason ? "Clear the flag before dispensing" : undefined}
          onClick={() => setShowDispenseModal(true)}
        >
          <Printer className="h-3.5 w-3.5" />
          {dispensed ? "Dispensed" : "Print Label & Dispense"}
        </Button>
      </div>

      <ConfirmModal
        open={showFlagModal}
        onClose={() => setShowFlagModal(false)}
        onConfirm={(reason) => {
          setFlagReason(reason || "Needs pharmacist review");
          actionToast("Flagged for pharmacist review", reason, "warning");
          setShowFlagModal(false);
        }}
        variant="warning"
        title="Flag for Pharmacist Review"
        description="This pauses dispensing on this order until a senior pharmacist reviews and clears it."
        confirmLabel="Flag Order"
        requireReason
        reasonLabel="Reason for flag"
        reasonPlaceholder="e.g. Unusual dosage, drug interaction concern…"
      />

      <ConfirmModal
        open={showDispenseModal}
        onClose={() => setShowDispenseModal(false)}
        onConfirm={() => {
          setDispensed(true);
          actionToast("Label printed & dispensed", `${selectedRxPatient.name} · ${selectedRxPatient.rxId}`);
          setShowDispenseModal(false);
        }}
        variant="approve"
        title="Dispense & Print Label"
        description={`Confirm dispensing all ${total} verified items for ${selectedRxPatient.name} and print the thermal label.`}
        confirmLabel="Dispense & Print"
      />
    </Card>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-semibold text-slate-700">{value}</p>
    </div>
  );
}
