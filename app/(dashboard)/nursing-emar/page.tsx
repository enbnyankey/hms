"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import EmarHeader, { type WardOption } from "@/components/nursing-emar/EmarHeader";
import EmarKpis from "@/components/nursing-emar/EmarKpis";
import MarQueue from "@/components/nursing-emar/MarQueue";
import VitalsPanel from "@/components/nursing-emar/VitalsPanel";
import HandoverPanel from "@/components/nursing-emar/HandoverPanel";
import { actionToast } from "@/lib/actions";
import { ApiError } from "@/lib/api";
import { fetchWards } from "@/lib/ward-api";
import {
  addHandoverNote,
  fetchHandover,
  fetchMar,
  fetchVitals,
  giveDose,
  holdDose,
  recordVitals,
} from "@/lib/nursing-api";
import { buildEmarKpis, type HandoverNote, type MarDose, type VitalsReading } from "@/lib/nursing-emar-data";

const WARD_KEY = "aurahealth_emar_ward";

type WardData = { doses: MarDose[]; vitals: VitalsReading[]; notes: HandoverNote[] };

function errorMessage(err: unknown): string {
  return err instanceof ApiError || err instanceof Error ? err.message : "Something went wrong.";
}

async function loadWard(wardId: string): Promise<WardData> {
  const [doses, vitals, notes] = await Promise.all([fetchMar(wardId), fetchVitals(wardId), fetchHandover(wardId)]);
  return { doses, vitals, notes };
}

export default function NursingEmarPage() {
  const [wards, setWards] = useState<WardOption[]>([]);
  const [wardId, setWardId] = useState("");
  const [data, setData] = useState<WardData | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Wards list; reopen the ward the nurse last used.
  useEffect(() => {
    let cancelled = false;
    fetchWards()
      .then((list) => {
        if (cancelled) return;
        setWards(list.map((w) => ({ id: w.id, name: w.name, chargeNurse: w.chargeNurse })));
        let saved: string | null = null;
        try {
          saved = window.localStorage.getItem(WARD_KEY);
        } catch {
          // ignore
        }
        const busiest = [...list].sort((a, b) => b.beds.occupied - a.beds.occupied)[0];
        setWardId(list.some((w) => w.id === saved) ? saved! : busiest?.id ?? "");
      })
      .catch((err) => !cancelled && setLoadError(errorMessage(err)));
    return () => {
      cancelled = true;
    };
  }, []);

  // Ward data, refreshed every minute so "due" doses turn "overdue" on time.
  useEffect(() => {
    if (!wardId) return;
    let cancelled = false;
    const load = () =>
      loadWard(wardId)
        .then((d) => {
          if (!cancelled) {
            setData(d);
            setLoadError(null);
          }
        })
        .catch((err) => !cancelled && setLoadError(errorMessage(err)));
    load();
    const timer = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [wardId]);

  const refresh = useCallback(async () => {
    if (!wardId) return;
    try {
      setData(await loadWard(wardId));
    } catch (err) {
      actionToast("Couldn't refresh the ward", errorMessage(err), "error");
    }
  }, [wardId]);

  function changeWard(id: string) {
    if (id === wardId) return;
    setData(null);
    setWardId(id);
    try {
      window.localStorage.setItem(WARD_KEY, id);
    } catch {
      // ignore
    }
  }

  /** Run a backend action, toast, reload. Resolves true on success. */
  async function run(action: () => Promise<unknown>, success: [string, string?], failTitle: string, tone: "success" | "warning" = "success") {
    try {
      await action();
      actionToast(success[0], success[1], tone);
      await refresh();
      return true;
    } catch (err) {
      actionToast(failTitle, errorMessage(err), "error");
      return false;
    }
  }

  const kpis = useMemo(() => {
    const doses = data?.doses ?? [];
    const vitals = data?.vitals ?? [];
    return buildEmarKpis({
      dueThisHour: doses.filter((d) => d.status === "Due Now").length,
      overdue: doses.filter((d) => d.status === "Overdue").length,
      vitalsOverdue: vitals.filter((v) => v.overdue).length,
      onRoster: vitals.length,
      witnessPending: doses.filter((d) => d.controlled && (d.status === "Due Now" || d.status === "Overdue")).length,
      givenToday: doses.filter((d) => d.status === "Given").length,
    });
  }, [data]);

  const roster = useMemo(
    () => (data?.vitals ?? []).map((v) => ({ value: v.admissionId, label: `${v.patientName} · ${v.bed}` })),
    [data]
  );

  return (
    <div>
      <EmarHeader
        wards={wards}
        wardId={wardId}
        onWardChange={changeWard}
        roster={roster}
        onSaveVitals={(admissionId, v) => {
          const who = roster.find((r) => r.value === admissionId)?.label ?? "Patient";
          return run(() => recordVitals(admissionId, v), ["Vitals recorded", `${who} · BP ${v.systolic}/${v.diastolic} mmHg`], "Couldn't save vitals");
        }}
      />

      {loadError && !data ? (
        <div className="mt-6 rounded-xl border border-red-200 bg-status-red-bg p-5 text-sm text-status-red">
          <p className="font-semibold">Couldn&apos;t load the eMAR.</p>
          <p className="mt-1">{loadError}</p>
        </div>
      ) : !data ? (
        <div className="mt-10 flex items-center justify-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading ward…
        </div>
      ) : (
        <>
          <div className="mt-5">
            <EmarKpis kpis={kpis} />
          </div>

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_300px]">
            <MarQueue
              doses={data.doses}
              onGive={(dose, v) =>
                run(
                  () => giveDose(dose, v),
                  [
                    "Dose administered",
                    `${dose.drug} ${dose.dose} given to ${dose.patientName} at ${v.givenAt}${v.witnessedBy ? ` · Witnessed by ${v.witnessedBy}` : ""}`,
                  ],
                  "Couldn't record dose"
                )
              }
              onHold={(dose, reason) =>
                run(() => holdDose(dose, reason), ["Dose held", `${dose.drug} ${dose.dose} for ${dose.patientName} · ${reason}`], "Couldn't hold dose", "warning")
              }
            />
            <div className="space-y-5">
              <VitalsPanel readings={data.vitals} />
              <HandoverPanel
                notes={data.notes}
                onAddNote={(text) => run(() => addHandoverNote(wardId, text), ["Handover note added", "Visible to the incoming shift."], "Couldn't save note")}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
