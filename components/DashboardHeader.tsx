"use client";

import { useState } from "react";
import { CalendarDays, Printer, Download, RefreshCw, Loader2 } from "lucide-react";
import { facility } from "@/lib/mock-data";
import { actionToast } from "@/lib/actions";
import Button from "./ui/Button";

export default function DashboardHeader() {
  const [printing, setPrinting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [syncTime, setSyncTime] = useState(facility.syncTime);

  function handlePrint() {
    setPrinting(true);
    setTimeout(() => {
      setPrinting(false);
      actionToast("Census sent to printer", "Hospital-wide bed census is printing.");
    }, 700);
  }

  function handleExport() {
    setExporting(true);
    setTimeout(() => {
      setExporting(false);
      actionToast("Analytics export ready", "Operations report has been generated for download.");
    }, 900);
  }

  function handleRefresh() {
    setRefreshing(true);
    setTimeout(() => {
      const now = new Date();
      setSyncTime(
        `${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} GMT`
      );
      setRefreshing(false);
      actionToast("Dashboard refreshed", "All live panels are showing the latest sync.");
    }, 600);
  }

  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
      <div>
        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-500">
          {facility.tier}
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Executive Hospital Operations
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-500">{facility.region}</p>
      </div>

      <div className="flex w-full flex-nowrap items-center gap-2 overflow-x-auto pb-1 lg:w-auto">
        <div
          title={`${facility.date} · ${facility.shiftLabel} · Synced ${syncTime}`}
          className="flex shrink-0 items-center gap-1.5 rounded-md border border-surface-border bg-white px-3 py-2 text-xs font-medium text-slate-600"
        >
          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
          <span>24 Oct · Day Shift A</span>
          <span className="hidden text-slate-300 2xl:inline">·</span>
          <span className="hidden text-slate-400 2xl:inline">Synced {syncTime}</span>
        </div>
        <Button variant="secondary" loading={refreshing} onClick={handleRefresh} className="shrink-0" title="Refresh dashboard">
          <RefreshCw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Refresh</span>
        </Button>
        <Button variant="secondary" loading={printing} onClick={handlePrint} className="shrink-0" title="Print hospital-wide census">
          <Printer className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Print</span>
        </Button>
        <button
          type="button"
          onClick={handleExport}
          disabled={exporting}
          title="Export analytics report"
          className="flex shrink-0 items-center gap-1.5 rounded-md bg-brand-cyan px-3 py-2 text-xs font-semibold text-white hover:bg-cyan-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {exporting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Download className="h-3.5 w-3.5" />}
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>
    </div>
  );
}
