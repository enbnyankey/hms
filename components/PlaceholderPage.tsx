import type { LucideIcon } from "lucide-react";
import { Construction } from "lucide-react";

type PlaceholderPageProps = {
  title: string;
  description: string;
  icon: LucideIcon;
};

export default function PlaceholderPage({ title, description, icon: Icon }: PlaceholderPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-white p-10 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-teal-50 text-brand-teal">
        <Icon className="h-6 w-6" />
      </div>
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-slate-500">{description}</p>
      <div className="mt-5 flex items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
        <Construction className="h-3.5 w-3.5" />
        Module scaffolded — ready for build-out
      </div>
    </div>
  );
}
