"use client";

import { Activity } from "lucide-react";
import { workspaceTabs, type WorkspaceTabId } from "@/lib/doctor-data";

export default function WorkspaceTabs({
  activeTab,
  onTabChange,
  counts,
}: {
  activeTab: WorkspaceTabId;
  onTabChange: (id: WorkspaceTabId) => void;
  counts?: Partial<Record<WorkspaceTabId, number>>;
}) {
  return (
    <div className="mt-4 flex items-center gap-1 overflow-x-auto rounded-xl border border-surface-border bg-white p-1.5 shadow-card">
      {workspaceTabs.map((tab) => {
        const isActive = tab.id === activeTab;
        const count = counts?.[tab.id] ?? tab.count;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            aria-current={isActive ? "true" : undefined}
            className={`flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-semibold transition-colors ${
              isActive
                ? "bg-status-blue-bg text-brand-cyan"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            {tab.label}
            {isActive && <span className="h-1.5 w-1.5 rounded-full bg-brand-cyan" />}
            {typeof count === "number" && (
              <span
                className={`flex h-4 w-4 items-center justify-center rounded-full text-[10px] font-bold text-white ${
                  isActive ? "bg-brand-cyan" : "bg-slate-300"
                }`}
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
      <span className="ml-auto flex shrink-0 items-center px-3 text-slate-300">
        <Activity className="h-4 w-4" />
      </span>
    </div>
  );
}
