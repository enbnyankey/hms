"use client";

import { useState } from "react";
import PatientHeader from "@/components/doctor-workspace/PatientHeader";
import AlertsRow from "@/components/doctor-workspace/AlertsRow";
import WorkspaceTabs from "@/components/doctor-workspace/WorkspaceTabs";
import TriageVitals from "@/components/doctor-workspace/TriageVitals";
import ProblemList from "@/components/doctor-workspace/ProblemList";
import ConsultationPanel from "@/components/doctor-workspace/ConsultationPanel";
import DiagnosisFormulation from "@/components/doctor-workspace/DiagnosisFormulation";
import PrescriptionPanel from "@/components/doctor-workspace/PrescriptionPanel";
import DiagnosticOrders from "@/components/doctor-workspace/DiagnosticOrders";
import ImagingTracings from "@/components/doctor-workspace/ImagingTracings";
import DispositionEducation from "@/components/doctor-workspace/DispositionEducation";
import {
  diagnoses as initialDiagnoses,
  prescriptions as initialPrescriptions,
  diagnosticOrders as initialDiagnosticOrders,
  imagingOrders as initialImagingOrders,
  type WorkspaceTabId,
} from "@/lib/doctor-data";

export default function DoctorWorkspacePage() {
  const [activeTab, setActiveTab] = useState<WorkspaceTabId>("overview");

  const [diagnoses, setDiagnoses] = useState(initialDiagnoses);
  const [prescriptions, setPrescriptions] = useState(initialPrescriptions);
  const [diagnosticOrders, setDiagnosticOrders] = useState(initialDiagnosticOrders);
  const [imagingOrders, setImagingOrders] = useState(initialImagingOrders);

  return (
    <div>
      <PatientHeader />
      <AlertsRow />
      <WorkspaceTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        counts={{
          diagnoses: diagnoses.length,
          prescriptions: prescriptions.length,
          labs: diagnosticOrders.length + imagingOrders.length,
        }}
      />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[280px_1fr_280px]">
        <div className="space-y-5">
          <TriageVitals />
          <ProblemList />
        </div>

        {activeTab === "overview" && (
          <>
            <div className="space-y-5">
              <ConsultationPanel mode="overview" />
            </div>
            <div className="space-y-5">
              <DispositionEducation />
            </div>
          </>
        )}

        {activeTab === "exam" && (
          <div className="space-y-5 lg:col-span-2">
            <ConsultationPanel mode="exam" />
          </div>
        )}

        {activeTab === "diagnoses" && (
          <div className="space-y-5 lg:col-span-2">
            <DiagnosisFormulation diagnoses={diagnoses} onChange={setDiagnoses} />
          </div>
        )}

        {activeTab === "prescriptions" && (
          <div className="space-y-5 lg:col-span-2">
            <PrescriptionPanel prescriptions={prescriptions} onChange={setPrescriptions} />
          </div>
        )}

        {activeTab === "labs" && (
          <>
            <div className="space-y-5">
              <DiagnosticOrders orders={diagnosticOrders} onChange={setDiagnosticOrders} />
            </div>
            <div className="space-y-5">
              <ImagingTracings orders={imagingOrders} onChange={setImagingOrders} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
