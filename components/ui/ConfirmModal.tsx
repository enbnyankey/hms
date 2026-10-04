"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, XCircle, type LucideIcon } from "lucide-react";
import Modal, { type ModalTone } from "./Modal";
import Button from "./Button";

type ConfirmVariant = "delete" | "approve" | "reject" | "warning";

const variantConfig: Record<ConfirmVariant, { icon: LucideIcon; tone: ModalTone; confirmClass: string }> = {
  delete: { icon: AlertTriangle, tone: "danger", confirmClass: "danger" as never },
  approve: { icon: CheckCircle2, tone: "success", confirmClass: "success" as never },
  reject: { icon: XCircle, tone: "danger", confirmClass: "danger" as never },
  warning: { icon: AlertTriangle, tone: "warning", confirmClass: "warning" as never },
};

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  variant,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  requireReason = false,
  reasonLabel = "Reason",
  reasonPlaceholder = "Explain why…",
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => void;
  variant: ConfirmVariant;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel?: string;
  requireReason?: boolean;
  reasonLabel?: string;
  reasonPlaceholder?: string;
}) {
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const cfg = variantConfig[variant];
  const disabled = requireReason && !reason.trim();

  function handleConfirm() {
    if (disabled) return;
    setSubmitting(true);
    setTimeout(() => {
      onConfirm(requireReason ? reason.trim() : undefined);
      setSubmitting(false);
      setReason("");
    }, 400);
  }

  function handleClose() {
    if (submitting) return;
    setReason("");
    onClose();
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={title}
      icon={cfg.icon}
      tone={cfg.tone}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={handleClose} disabled={submitting}>
            {cancelLabel}
          </Button>
          <Button
            variant={variant === "approve" ? "success" : "danger"}
            onClick={handleConfirm}
            loading={submitting}
            disabled={disabled}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-relaxed text-slate-600">{description}</p>
      {requireReason && (
        <div className="mt-3">
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {reasonLabel}
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={reasonPlaceholder}
            rows={3}
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
        </div>
      )}
    </Modal>
  );
}
