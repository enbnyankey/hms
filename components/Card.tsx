import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type CardProps = {
  icon?: LucideIcon;
  iconClassName?: string;
  title: string;
  subtitle?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  headerClassName?: string;
  bodyClassName?: string;
};

export default function Card({
  icon: Icon,
  iconClassName = "bg-slate-100 text-slate-500",
  title,
  subtitle,
  action,
  children,
  className = "",
  headerClassName = "px-5 py-4",
  bodyClassName = "p-5",
}: CardProps) {
  return (
    <section className={`rounded-xl border border-surface-border bg-white shadow-card ${className}`}>
      <div className={`flex flex-wrap items-start justify-between gap-2 border-b border-surface-border ${headerClassName}`}>
        <div className="flex items-start gap-3">
          {Icon && (
            <span className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${iconClassName}`}>
              <Icon className="h-4 w-4" />
            </span>
          )}
          <div>
            <h2 className="text-sm font-bold text-slate-900">{title}</h2>
            {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
          </div>
        </div>
        {action}
      </div>
      <div className={bodyClassName}>{children}</div>
    </section>
  );
}
