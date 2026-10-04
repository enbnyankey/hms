import { Pill, ShieldCheck } from "lucide-react";
import { pharmacyHeader } from "@/lib/pharmacy-data";

export default function PharmacyHeader() {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-brand-teal">
          <Pill className="h-5 w-5" />
        </span>
        <div>
          <h1 className="text-lg font-bold text-slate-900">{pharmacyHeader.title}</h1>
          <p className="text-xs text-slate-400">
            {pharmacyHeader.location} · {pharmacyHeader.fdaReg} · Chief Pharmacist: {pharmacyHeader.chiefPharmacist}
          </p>
        </div>
      </div>
      <span className="flex items-center gap-1.5 rounded-full bg-status-green-bg px-3 py-1.5 text-[11px] font-semibold text-status-green">
        <ShieldCheck className="h-3.5 w-3.5" />
        {pharmacyHeader.liveStatus}
      </span>
    </div>
  );
}
