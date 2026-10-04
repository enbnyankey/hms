import Link from "next/link";
import { HeartPulse } from "lucide-react";

export default function MarketingHeader({ active }: { active?: "login" | "signup" }) {
  return (
    <header className="border-b border-surface-border bg-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-teal/10 text-brand-teal">
            <HeartPulse className="h-5 w-5" strokeWidth={2.25} />
          </div>
          <div className="leading-tight">
            <p className="text-sm font-bold text-slate-900">AuraHealth HMS</p>
            <p className="text-[11px] text-slate-400">Clinical Operating Console</p>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className={`rounded-md px-3.5 py-2 text-xs font-semibold ${
              active === "login"
                ? "bg-slate-900 text-white"
                : "border border-surface-border text-slate-600 hover:bg-slate-50"
            }`}
          >
            Staff Ingress / Sign in
          </Link>
          <Link
            href="/signup"
            className={`rounded-md px-3.5 py-2 text-xs font-semibold ${
              active === "signup"
                ? "bg-slate-900 text-white"
                : "bg-brand-teal text-white hover:bg-teal-700"
            }`}
          >
            Staff Credentialing
          </Link>
        </div>
      </div>
    </header>
  );
}
