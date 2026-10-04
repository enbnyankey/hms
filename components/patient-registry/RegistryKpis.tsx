"use client";

import { useMemo } from "react";
import { UserPlus, Users, ShieldAlert, Database, Copy, ShieldCheck } from "lucide-react";
import { type PatientRecord } from "@/lib/patient-registry-data";

export default function RegistryKpis({ patients }: { patients: PatientRecord[] }) {
  const kpis = useMemo(() => {
    const active = patients.filter((p) => p.status === "Active");
    const registeredToday = patients.filter((p) => p.registeredOn === "25 Sep 2026").length;
    const walkIns = patients.filter((p) => p.category === "Walk-in" && p.status === "Active").length;
    const pendingNhis = patients.filter((p) => p.nhisStatus === "Pending").length;
    const verifiedNhis = patients.filter((p) => p.nhisStatus === "Verified").length;
    const duplicates = patients.filter((p) => p.duplicateFlag).length;

    return [
      {
        id: "registered-today",
        label: "Registered Today",
        value: String(registeredToday),
        note: "New MPI entries · Counter 2",
        icon: UserPlus,
      },
      {
        id: "active-mpi",
        label: "Active MPI Records",
        value: String(active.length),
        note: "Master Patient Index",
        icon: Database,
      },
      {
        id: "walk-in",
        label: "Walk-ins Waiting",
        value: String(walkIns),
        note: "Awaiting triage / consult",
        icon: Users,
      },
      {
        id: "pending-nhis",
        label: "Pending NHIS Verification",
        value: String(pendingNhis),
        note: "Awaiting NHIA lookup",
        icon: ShieldAlert,
        tone: pendingNhis > 0 ? ("danger" as const) : undefined,
      },
      {
        id: "verified-nhis",
        label: "NHIS Verified",
        value: String(verifiedNhis),
        note: "Active coverage on file",
        icon: ShieldCheck,
      },
      {
        id: "duplicates",
        label: "Duplicate Flags",
        value: String(duplicates),
        note: "Possible MPI duplicates",
        icon: Copy,
        tone: duplicates > 0 ? ("danger" as const) : undefined,
      },
    ];
  }, [patients]);

  return (
    <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      {kpis.map((kpi) => {
        const Icon = kpi.icon;
        const danger = kpi.tone === "danger";
        return (
          <div
            key={kpi.id}
            className={`rounded-xl border p-4 shadow-card ${
              danger ? "border-red-200 bg-status-red-bg" : "border-surface-border bg-white"
            }`}
          >
            <div className="flex items-center justify-between">
              <p
                className={`text-[10px] font-semibold uppercase tracking-wide ${
                  danger ? "text-status-red" : "text-slate-400"
                }`}
              >
                {kpi.label}
              </p>
              <Icon className={`h-3.5 w-3.5 ${danger ? "text-status-red" : "text-slate-300"}`} />
            </div>
            <p className={`mt-1 text-xl font-extrabold ${danger ? "text-status-red" : "text-slate-900"}`}>
              {kpi.value}
            </p>
            <p className={`mt-0.5 text-[11px] ${danger ? "text-status-red/80" : "text-slate-400"}`}>{kpi.note}</p>
          </div>
        );
      })}
    </div>
  );
}
