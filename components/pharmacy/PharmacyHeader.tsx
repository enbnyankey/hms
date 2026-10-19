"use client";

import { useState } from "react";
import { Pill, ShieldCheck, PackageCheck } from "lucide-react";
import Button from "../ui/Button";
import ReceiveStockModal from "./ReceiveStockModal";
import type { DrugStock, ReceiveValues } from "@/lib/pharmacy-api";
import { timeLabel } from "@/lib/pharmacy-data";

export default function PharmacyHeader({
  userName,
  roleLabel,
  refreshedAt,
  drugs,
  canWork,
  onReceive,
}: {
  userName?: string;
  roleLabel?: string;
  refreshedAt: string;
  drugs: DrugStock[];
  canWork: boolean;
  onReceive: (v: ReceiveValues) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-brand-teal">
          <Pill className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-900">Pharmacy &amp; Dispensary</h1>
          <p className="text-xs text-slate-400">
            {drugs.length} formulary items · Signed in: {userName ?? "—"}
            {roleLabel ? ` (${roleLabel})` : ""}
            {!canWork && " · read-only"}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <span className="flex items-center gap-1.5 rounded-full bg-status-green-bg px-3 py-1.5 text-[11px] font-semibold text-status-green">
          <ShieldCheck className="h-3.5 w-3.5" />
          Live · updated {timeLabel(refreshedAt)}
        </span>
        {canWork && (
          <Button variant="primary" onClick={() => setOpen(true)}>
            <PackageCheck className="h-3.5 w-3.5" /> Receive Stock
          </Button>
        )}
      </div>
      <ReceiveStockModal open={open} onClose={() => setOpen(false)} drugs={drugs} onSubmit={onReceive} />
    </div>
  );
}
