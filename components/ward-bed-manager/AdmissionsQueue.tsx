"use client";

import { useEffect, useState } from "react";
import { UserPlus2, Inbox } from "lucide-react";
import type { AdmissionRequest, QueueUrgency } from "@/lib/ward-data";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import ConfirmModal from "@/components/ui/ConfirmModal";
import type { TransferTarget } from "./TransferModal";

const urgencyStyle: Record<QueueUrgency, { border: string; bg: string; text: string; button: string }> = {
  critical: {
    border: "border-red-200",
    bg: "bg-status-red-bg",
    text: "text-status-red",
    button: "bg-status-red hover:bg-red-700",
  },
  warning: {
    border: "border-amber-200",
    bg: "bg-status-amber-bg",
    text: "text-status-amber",
    button: "bg-brand-cyan hover:bg-cyan-800",
  },
  neutral: {
    border: "border-surface-border",
    bg: "bg-slate-50",
    text: "text-slate-500",
    button: "bg-brand-cyan hover:bg-cyan-800",
  },
};

function AssignModal({
  open,
  onClose,
  onConfirm,
  request,
  availableTargets,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (target: TransferTarget) => void;
  request: AdmissionRequest | null;
  availableTargets: TransferTarget[];
}) {
  const [targetKey, setTargetKey] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open && request) {
      const preferred = availableTargets.find((t) => t.bedId === request.suggestedBed);
      setTargetKey(preferred ? `${preferred.ward}:${preferred.bedId}` : "");
    }
  }, [open, request, availableTargets]);

  function handleClose() {
    if (submitting) return;
    onClose();
  }

  function handleConfirm() {
    const target = availableTargets.find((t) => `${t.ward}:${t.bedId}` === targetKey);
    if (!target) return;
    setSubmitting(true);
    setTimeout(() => {
      onConfirm(target);
      setSubmitting(false);
    }, 400);
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={`Assign Bed — ${request?.patient ?? ""}`}
      description={request?.dx}
      icon={UserPlus2}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirm} loading={submitting} disabled={!targetKey}>
            Assign Bed
          </Button>
        </>
      }
    >
      <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Bed</label>
      {availableTargets.length === 0 ? (
        <p className="mt-1 rounded-md border border-dashed border-surface-border px-3 py-2 text-xs text-slate-400">
          No ready-to-admit beds available right now.
        </p>
      ) : (
        <select
          value={targetKey}
          onChange={(e) => setTargetKey(e.target.value)}
          className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
        >
          <option value="">Select a bed…</option>
          {availableTargets.map((t) => (
            <option key={`${t.ward}:${t.bedId}`} value={`${t.ward}:${t.bedId}`}>
              {t.label}
            </option>
          ))}
        </select>
      )}
    </Modal>
  );
}

export default function AdmissionsQueue({
  queue,
  availableTargets,
  onAssign,
  onDecline,
}: {
  queue: AdmissionRequest[];
  availableTargets: TransferTarget[];
  onAssign: (requestId: string, target: TransferTarget) => void;
  onDecline: (requestId: string, reason: string) => void;
}) {
  const [assignRequest, setAssignRequest] = useState<AdmissionRequest | null>(null);
  const [declineRequest, setDeclineRequest] = useState<AdmissionRequest | null>(null);

  const urgentCount = queue.filter((r) => r.urgency === "critical").length;

  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex items-center justify-between gap-2 border-b border-surface-border px-5 py-4">
        <div className="flex items-center gap-2">
          <UserPlus2 className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Admissions Queue</h2>
        </div>
        <span className="rounded-full bg-status-red-bg px-2.5 py-1 text-[10px] font-bold text-status-red">
          {urgentCount} Urgent Holds
        </span>
      </div>

      <div className="p-5 pt-3">
        <p className="text-[11px] leading-snug text-slate-400">
          Patients triaged in Emergency Department and Recovery waiting for designated ward bed allocation.
        </p>

        {queue.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-8 text-center">
            <Inbox className="h-5 w-5 text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">Admissions queue is empty</p>
          </div>
        ) : (
          <div className="mt-3 space-y-3">
            {queue.map((req) => {
              const style = urgencyStyle[req.urgency];
              return (
                <div key={req.id} className={`rounded-lg border p-3.5 ${style.border} ${style.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-[11px] font-bold uppercase tracking-wide ${style.text}`}>{req.source}</span>
                    <span className="text-[10px] font-semibold text-slate-400">{req.wait}</span>
                  </div>
                  <p className="mt-1.5 text-xs font-bold text-slate-800">
                    {req.patient} <span className="font-normal text-slate-400">{req.demo} · {req.location}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">Dx: {req.dx}</p>
                  <p className="mt-1 text-[11px] text-slate-400">{req.note}</p>
                  <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-2">
                    <span className="text-[11px] font-semibold text-slate-500">Suggested Bed: {req.suggestedBed}</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setDeclineRequest(req)}
                        className="rounded-md border border-surface-border px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => setAssignRequest(req)}
                        className={`rounded-md px-2.5 py-1 text-[11px] font-semibold text-white ${style.button}`}
                      >
                        {req.actionLabel}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <AssignModal
        open={!!assignRequest}
        onClose={() => setAssignRequest(null)}
        request={assignRequest}
        availableTargets={availableTargets}
        onConfirm={(target) => {
          if (assignRequest) onAssign(assignRequest.id, target);
          setAssignRequest(null);
        }}
      />

      <ConfirmModal
        open={!!declineRequest}
        onClose={() => setDeclineRequest(null)}
        onConfirm={(reason) => {
          if (declineRequest) onDecline(declineRequest.id, reason ?? "");
          setDeclineRequest(null);
        }}
        variant="reject"
        title={`Decline Admission — ${declineRequest?.patient ?? ""}`}
        description="This removes the request from the admissions queue. Provide a reason for the record."
        confirmLabel="Decline Request"
        requireReason
        reasonLabel="Reason for declining"
      />
    </div>
  );
}
