"use client";

import { useEffect } from "react";
import { X, type LucideIcon } from "lucide-react";

export type ModalTone = "default" | "danger" | "warning" | "success";

const toneIconClass: Record<ModalTone, string> = {
  default: "bg-teal-50 text-brand-teal",
  danger: "bg-status-red-bg text-status-red",
  warning: "bg-status-amber-bg text-status-amber",
  success: "bg-status-green-bg text-status-green",
};

export default function Modal({
  open,
  onClose,
  title,
  description,
  icon: Icon,
  tone = "default",
  size = "md",
  children,
  footer,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  icon?: LucideIcon;
  tone?: ModalTone;
  size?: "sm" | "md" | "lg";
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass = size === "sm" ? "max-w-sm" : size === "lg" ? "max-w-2xl" : "max-w-lg";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/55 backdrop-blur-[1px] animate-[modal-overlay-in_0.15s_ease-out]"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={`relative flex max-h-[85vh] w-full flex-col rounded-lg border border-surface-border bg-white shadow-xl animate-[modal-panel-in_0.18s_ease-out] ${sizeClass}`}
      >
        <div className="flex items-start justify-between gap-3 border-b border-surface-border px-5 py-4">
          <div className="flex items-start gap-3">
            {Icon && (
              <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${toneIconClass[tone]}`}>
                <Icon className="h-4.5 w-4.5" />
              </div>
            )}
            <div>
              <h2 className="text-[15px] font-bold text-slate-900">{title}</h2>
              {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {children && <div className="overflow-y-auto px-5 py-4">{children}</div>}

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-surface-border px-5 py-3.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
