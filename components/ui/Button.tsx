"use client";

import { Loader2 } from "lucide-react";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger" | "success" | "ghost";

const variantClass: Record<Variant, string> = {
  primary: "bg-brand-teal text-white hover:bg-teal-700",
  secondary: "border border-surface-border bg-white text-slate-600 hover:bg-slate-50",
  danger: "bg-status-red text-white hover:bg-red-700",
  success: "bg-status-green text-white hover:bg-green-700",
  ghost: "text-slate-500 hover:bg-slate-100",
};

export default function Button({
  variant = "primary",
  loading = false,
  disabled,
  className = "",
  children,
  ...rest
}: {
  variant?: Variant;
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type="button"
      disabled={disabled || loading}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md px-3.5 py-2 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${variantClass[variant]} ${className}`}
      {...rest}
    >
      {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </button>
  );
}
