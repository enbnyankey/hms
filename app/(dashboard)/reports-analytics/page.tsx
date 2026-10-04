"use client";

import { useState } from "react";
import ReportsHeader from "@/components/reports-analytics/ReportsHeader";
import ReportsKpis from "@/components/reports-analytics/ReportsKpis";
import PatientVolumeTrend from "@/components/reports-analytics/PatientVolumeTrend";
import DepartmentRevenue from "@/components/reports-analytics/DepartmentRevenue";
import ReportLibrary from "@/components/reports-analytics/ReportLibrary";
import {
  initialSavedReports,
  reportTemplates,
  dateRanges,
  nextReportId,
  type DateRangeId,
  type ReportFormat,
  type SavedReport,
} from "@/lib/reports-analytics-data";
import { currentUser } from "@/lib/mock-data";

export default function ReportsAnalyticsPage() {
  const [range, setRange] = useState<DateRangeId>("30d");
  const [reports, setReports] = useState<SavedReport[]>(initialSavedReports);

  function handleGenerate(templateId: string, format: ReportFormat) {
    const tpl = reportTemplates.find((t) => t.id === templateId);
    if (!tpl) return;
    const rangeLabel = dateRanges.find((r) => r.id === range)?.label ?? "Last 30 Days";
    const newReport: SavedReport = {
      id: nextReportId(),
      title: tpl.title,
      category: tpl.category,
      range: rangeLabel,
      generatedBy: currentUser.name,
      generatedOn: "25 Sep 2026",
      format,
      sizeKb: Math.round(200 + Math.random() * 1600),
    };
    setReports((prev) => [newReport, ...prev]);
  }

  function handleDelete(id: string) {
    setReports((prev) => prev.filter((r) => r.id !== id));
  }

  return (
    <div>
      <ReportsHeader range={range} onRangeChange={setRange} />
      <ReportsKpis range={range} />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PatientVolumeTrend />
        </div>
        <DepartmentRevenue />
      </div>

      <div className="mt-5">
        <ReportLibrary reports={reports} onGenerate={handleGenerate} onDelete={handleDelete} />
      </div>
    </div>
  );
}
