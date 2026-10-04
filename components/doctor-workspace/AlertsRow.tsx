import { AlertTriangle, HeartPulse, Users, ShieldCheck } from "lucide-react";
import { alertCards, type AlertCard } from "@/lib/doctor-data";

const iconMap = {
  allergy: AlertTriangle,
  risk: HeartPulse,
  contact: Users,
  coverage: ShieldCheck,
};

const toneStyles: Record<AlertCard["tone"], { bg: string; border: string; icon: string; title: string }> = {
  danger: { bg: "bg-status-red-bg", border: "border-red-100", icon: "text-status-red", title: "text-status-red" },
  info: { bg: "bg-status-blue-bg", border: "border-blue-100", icon: "text-status-blue", title: "text-status-blue" },
  neutral: { bg: "bg-slate-50", border: "border-surface-border", icon: "text-slate-500", title: "text-slate-600" },
  success: { bg: "bg-status-green-bg", border: "border-green-100", icon: "text-status-green", title: "text-status-green" },
};

export default function AlertsRow() {
  return (
    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {alertCards.map((card) => {
        const Icon = iconMap[card.icon];
        const style = toneStyles[card.tone];
        return (
          <div key={card.id} className={`rounded-xl border p-3.5 ${style.bg} ${style.border}`}>
            <div className="flex items-center gap-2">
              <Icon className={`h-4 w-4 shrink-0 ${style.icon}`} />
              <p className={`text-[11px] font-bold uppercase tracking-wide ${style.title}`}>{card.label}</p>
            </div>
            <div className="mt-2 space-y-0.5">
              {card.lines.map((line, i) => (
                <p
                  key={i}
                  className={line.emphasis ? "text-xs font-semibold text-slate-800" : "text-[11px] text-slate-500"}
                >
                  {line.text}
                </p>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
