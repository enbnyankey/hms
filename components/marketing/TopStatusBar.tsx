import { ShieldCheck } from "lucide-react";

export default function TopStatusBar() {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-950 px-4 py-2 font-mono text-[10px] text-slate-400 sm:px-6">
      <div className="flex items-center gap-2">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
        </span>
        <span className="font-semibold tracking-wide text-emerald-400">PROTOTYPE BUILD</span>
        <span className="hidden text-slate-600 sm:inline">·</span>
        <span className="hidden sm:inline">LOCAL DEMO AUTH · NO REAL PHI STORED</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="hidden items-center gap-1 md:flex">
          <ShieldCheck className="h-3 w-3 text-brand-teal" />
          DESIGN TARGET: GHANA DATA PROTECTION ACT 843
        </span>
        <span className="hidden text-slate-600 md:inline">·</span>
        <span>BUILD: AuraHealth HMS v0.1</span>
      </div>
    </div>
  );
}
