"use client";

import { ScanBarcode, Search, X, Inbox } from "lucide-react";
import Card from "../Card";
import { queueTabs, type QueueTabId, type SpecimenItem, type StatusTone } from "@/lib/lab-data";

const statusStyle: Record<StatusTone, string> = {
  blue: "bg-status-blue-bg text-status-blue",
  red: "bg-status-red-bg text-status-red",
  amber: "bg-status-amber-bg text-status-amber",
  slate: "bg-slate-100 text-slate-500",
  green: "bg-status-green-bg text-status-green",
};

function matchesTab(item: SpecimenItem, tab: QueueTabId): boolean {
  if (tab === "all") return true;
  if (tab === "receive") return item.backendStatus === "ORDERED";
  if (tab === "stat") return item.category === "stat" || item.urgent === true;
  if (tab === "chem") return item.category === "chem";
  return true;
}

function matchesSearch(item: SpecimenItem, query: string): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  return (
    item.specId.toLowerCase().includes(q) ||
    item.patient.toLowerCase().includes(q) ||
    item.mrn.toLowerCase().includes(q) ||
    item.testOrder.toLowerCase().includes(q)
  );
}

export default function AccessioningQueue({
  specimens,
  activeTab,
  onTabChange,
  search,
  onSearchChange,
  selectedId,
  onSelect,
}: {
  specimens: SpecimenItem[];
  activeTab: QueueTabId;
  onTabChange: (id: QueueTabId) => void;
  search: string;
  onSearchChange: (value: string) => void;
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  const visible = specimens.filter((item) => matchesTab(item, activeTab) && matchesSearch(item, search));

  return (
    <Card
      icon={ScanBarcode}
      iconClassName="bg-teal-50 text-brand-teal"
      title="Lab Worklist"
      headerClassName="px-4 py-3"
      bodyClassName="p-3"
      action={<span className="text-sm font-bold text-slate-800">{specimens.length} Total</span>}
    >
      <div className="flex items-center gap-1.5">
        {queueTabs.map((t) => {
          const count = specimens.filter((item) => matchesTab(item, t.id)).length;
          const active = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
              aria-pressed={active}
              className={`flex items-center gap-1 rounded-md px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                active ? "bg-brand-teal text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {t.id === "stat" && <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-white" : "bg-status-red"}`} />}
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center gap-2 rounded-lg border border-surface-border bg-slate-50 px-2.5 py-1 text-[11px] text-slate-500">
        <Search className="h-3.5 w-3.5 shrink-0 text-slate-400" />
        <input
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search specimen ID, patient, MRN…"
          className="w-full bg-transparent text-[11px] text-slate-700 outline-none placeholder:text-slate-400"
        />
        {search && (
          <button
            onClick={() => onSearchChange("")}
            aria-label="Clear search"
            className="shrink-0 text-slate-400 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mt-2 space-y-1.5">
        {visible.length === 0 ? (
          <div className="flex flex-col items-center gap-1.5 rounded-lg border border-dashed border-surface-border bg-slate-50 px-3 py-6 text-center">
            <Inbox className="h-5 w-5 text-slate-300" />
            <p className="text-[11px] font-semibold text-slate-500">No specimens match this view</p>
            <p className="text-[10px] text-slate-400">Try a different tab or clear your search.</p>
          </div>
        ) : (
          visible.map((item) => {
            const isSelected = item.id === selectedId;
            return (
              <button
                key={item.id}
                onClick={() => onSelect(item.id)}
                className={`block w-full rounded-lg border px-2.5 py-1.5 text-left transition-colors ${
                  isSelected
                    ? "border-brand-teal bg-teal-50/40 ring-1 ring-brand-teal"
                    : "border-surface-border bg-white hover:bg-slate-50"
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-1 font-mono text-[10px] font-semibold text-slate-400">
                    {item.urgent && <span className="text-status-red">!</span>}
                    {item.specId}
                  </span>
                  <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${statusStyle[item.statusTone]}`}>
                    {item.status}
                  </span>
                </div>
                <p className="mt-0.5 text-[12px] font-bold text-slate-800">{item.patient}</p>
                <p className="text-[10px] text-slate-500">{item.detail}</p>
                <p className="mt-0.5 flex items-center gap-1.5 text-[10px] text-slate-500">
                  <span className={`h-1.5 w-1.5 rounded-full ${item.containerDot}`} />
                  <span className="font-medium text-slate-600">{item.container}</span>
                  {item.testOrder}
                </p>
              </button>
            );
          })
        )}
      </div>
    </Card>
  );
}
