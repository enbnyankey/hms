import { HeartPulse } from "lucide-react";

export default function SystemLoader({
  title = "Loading AuraHealth HMS",
  subtitle = "Preparing clinical workflows…",
  className = "",
}: {
  title?: string;
  subtitle?: string;
  className?: string;
}) {
  return (
    <div className={`flex min-h-[220px] items-center justify-center ${className}`}>
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-brand-teal/20 blur-xl" />
          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border-4 border-slate-200 bg-white shadow-lg shadow-slate-200/60">
            <div className="absolute inset-1.5 rounded-full border-2 border-slate-200 border-t-brand-teal border-r-teal-300 animate-spin" />
            <div className="absolute inset-4 rounded-full bg-gradient-to-br from-brand-teal/10 to-brand-cyan/10" />
            <HeartPulse className="relative h-6 w-6 text-brand-teal" />
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-bold tracking-[0.12em] text-slate-900 uppercase">{title}</p>
          <p className="text-xs text-slate-500">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
