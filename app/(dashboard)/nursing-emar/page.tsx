"use client";

import { useMemo, useState } from "react";
import EmarHeader from "@/components/nursing-emar/EmarHeader";
import EmarKpis from "@/components/nursing-emar/EmarKpis";
import MarQueue from "@/components/nursing-emar/MarQueue";
import VitalsPanel from "@/components/nursing-emar/VitalsPanel";
import HandoverPanel from "@/components/nursing-emar/HandoverPanel";
import { actionToast } from "@/lib/actions";
import {
  buildEmarKpis,
  initialMarDoses,
  initialVitalsReadings,
  initialHandoverNotes,
  patientRoster,
  type MarDose,
  type VitalsReading,
  type HandoverNote,
} from "@/lib/nursing-emar-data";

export default function NursingEmarPage() {
  const [doses, setDoses] = useState<MarDose[]>(initialMarDoses);
  const [vitals, setVitals] = useState<VitalsReading[]>(initialVitalsReadings);
  const [notes, setNotes] = useState<HandoverNote[]>(initialHandoverNotes);

  function updateDose(updated: MarDose) {
    setDoses((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  }

  function saveVitals(
    patientLabel: string,
    values: { bp: string; pulse: string; temp: string; spo2: string; resp: string }
  ) {
    const [patientName, bed] = patientLabel.split(" · ");
    const now = new Date();
    const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    setVitals((prev) => {
      const existingIndex = prev.findIndex((v) => v.patientName === patientName && v.bed === bed);
      const reading: VitalsReading = {
        patientName,
        bed: bed ?? "",
        time,
        bp: values.bp,
        pulse: values.pulse,
        temp: values.temp,
        spo2: values.spo2,
        resp: values.resp,
        overdue: false,
      };
      if (existingIndex === -1) return [reading, ...prev];
      const next = [...prev];
      next[existingIndex] = reading;
      return next;
    });

    actionToast("Vitals recorded", `${patientName} · BP ${values.bp} mmHg logged at ${time}.`, "success");
  }

  function addHandoverNote(note: HandoverNote) {
    setNotes((prev) => [note, ...prev]);
  }

  const kpis = useMemo(() => {
    const dueThisHour = doses.filter((d) => d.status === "Due Now").length;
    const overdue = doses.filter((d) => d.status === "Overdue").length;
    const vitalsOverdue = vitals.filter((v) => v.overdue).length;
    const onRoster = patientRoster.length;
    const witnessPending = doses.filter((d) => d.controlled && d.status !== "Given" && d.status !== "Held").length;
    const givenToday = doses.filter((d) => d.status === "Given").length;

    return buildEmarKpis({ dueThisHour, overdue, vitalsOverdue, onRoster, witnessPending, givenToday });
  }, [doses, vitals]);

  return (
    <div>
      <EmarHeader onSaveVitals={saveVitals} />

      <div className="mt-5">
        <EmarKpis kpis={kpis} />
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1fr_320px]">
        <MarQueue doses={doses} onUpdateDose={updateDose} />
        <div className="space-y-5">
          <VitalsPanel readings={vitals} />
          <HandoverPanel notes={notes} onAddNote={addHandoverNote} />
        </div>
      </div>
    </div>
  );
}
