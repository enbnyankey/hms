import { ShieldCheck, Lock, ClipboardList, Landmark } from "lucide-react";

const badges = [
  { icon: ShieldCheck, label: "Role-Based Access Control" },
  { icon: ClipboardList, label: "Full Audit Trail on Every Record" },
  { icon: Landmark, label: "Built for NHIS Claims" },
  { icon: Lock, label: "Encryption in Transit (TLS)" },
];

export default function ComplianceFooter() {
  return (
    <footer className="border-t border-surface-border bg-white">
      <div className="mx-auto max-w-6xl px-6 py-8">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {badges.map((b) => (
            <div key={b.label} className="flex items-center gap-2 text-[11px] font-semibold text-slate-500">
              <b.icon className="h-4 w-4 shrink-0 text-brand-teal" />
              {b.label}
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-3xl text-[11px] leading-relaxed text-slate-400">
          <strong className="text-slate-500">Prototype notice:</strong> AuraHealth HMS is a design and
          workflow prototype. It is not yet certified, connected to a production database, or storing real
          patient information. Access shown here is scoped locally for demonstration; a production
          deployment enforces every role check server-side and undergoes independent security review before
          handling protected health information.
        </p>
        <p className="mt-3 text-[11px] text-slate-400">© 2026 AuraHealth Systems — prototype build.</p>
      </div>
    </footer>
  );
}
