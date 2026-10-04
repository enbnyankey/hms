"use client";

import { useMemo, useState } from "react";
import LabHeader from "@/components/lab/LabHeader";
import LabKpis from "@/components/lab/LabKpis";
import AccessioningQueue from "@/components/lab/AccessioningQueue";
import SpecimenDetail from "@/components/lab/SpecimenDetail";
import LabSidebar from "@/components/lab/LabSidebar";
import {
  specimenItems as initialSpecimenItems,
  STATUS_TONE,
  type SpecimenItem,
  type QueueTabId,
} from "@/lib/lab-data";
import { actionToast } from "@/lib/actions";

export default function LaboratoryDiagnosticsPage() {
  const [specimens, setSpecimens] = useState<SpecimenItem[]>(initialSpecimenItems);
  const [activeTab, setActiveTab] = useState<QueueTabId>("all");
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(initialSpecimenItems[0]?.id ?? null);

  const selectedSpecimen = useMemo(
    () => specimens.find((s) => s.id === selectedId) ?? null,
    [specimens, selectedId]
  );

  function updateSpecimen(id: string, patch: Partial<SpecimenItem>) {
    setSpecimens((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function handleAccession(newSpecimen: SpecimenItem) {
    setSpecimens((prev) => [newSpecimen, ...prev]);
    setSelectedId(newSpecimen.id);
    setActiveTab("all");
  }

  function handleValidate(id: string) {
    const timestamp = new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " GMT";
    updateSpecimen(id, {
      status: "Validated",
      statusTone: STATUS_TONE["Validated"],
      signoff: {
        timestamp,
        note: "Reviewed and validated by Dr. Kwabena Frimpong. Results correlate with clinical presentation and delta-check acceptable against prior admission values.",
      },
    });
  }

  function handleReject(id: string, reason: string) {
    updateSpecimen(id, {
      status: "Rejected",
      statusTone: STATUS_TONE["Rejected"],
      rejectReason: reason,
    });
  }

  function handleRetest(id: string) {
    updateSpecimen(id, { status: "Repeat Ordered", statusTone: STATUS_TONE["Repeat Ordered"] });
  }

  function handleEscalate(id: string) {
    updateSpecimen(id, { status: "Escalated", statusTone: STATUS_TONE["Escalated"] });
  }

  return (
    <div>
      <LabHeader onAccession={handleAccession} />

      <div className="mt-4">
        <LabKpis />
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr_280px]">
        <AccessioningQueue
          specimens={specimens}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          search={search}
          onSearchChange={setSearch}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            actionToast("Specimen loaded", `${specimens.find((s) => s.id === id)?.specId ?? ""} opened for review.`, "info");
          }}
        />
        <SpecimenDetail
          specimen={selectedSpecimen}
          onValidate={handleValidate}
          onReject={handleReject}
          onRetest={handleRetest}
          onEscalate={handleEscalate}
        />
        <LabSidebar />
      </div>
    </div>
  );
}
