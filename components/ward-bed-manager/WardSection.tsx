"use client";

import { BedDouble, Clock, ShieldAlert, Sparkles, Wrench, Inbox } from "lucide-react";
import { ageSex, timeAgo, type Bed, type Ward } from "@/lib/ward-api";

export type BedAction =
  | "view"
  | "edit"
  | "transfer"
  | "discharge-ready"
  | "discharge"
  | "admit"
  | "release"
  | "mark-clean"
  | "return-to-service"
  | "manage";

const tileStyle = {
  occupied: { border: "border-surface-border", bg: "bg-white", badge: "bg-slate-100 text-slate-500", label: "Occupied" },
  ready: { border: "border-amber-200", bg: "bg-status-amber-bg", badge: "bg-status-amber text-white", label: "Discharge Ready" },
  reserved: { border: "border-amber-200", bg: "bg-status-amber-bg", badge: "bg-status-amber text-white", label: "Reserved" },
  cleaning: { border: "border-blue-200", bg: "bg-status-blue-bg", badge: "bg-status-blue text-white", label: "Cleaning" },
  maintenance: { border: "border-slate-300", bg: "bg-slate-50", badge: "bg-slate-500 text-white", label: "Out of Service" },
} as const;

function tileKind(bed: Bed): keyof typeof tileStyle | null {
  switch (bed.status) {
    case "OCCUPIED":
      return bed.occupant?.admissionStatus === "DISCHARGE_READY" ? "ready" : "occupied";
    case "RESERVED":
      return "reserved";
    case "CLEANING":
      return "cleaning";
    case "MAINTENANCE":
      return "maintenance";
    default:
      return null; // AVAILABLE beds are shown as compact chips
  }
}

const btn = "rounded-md border border-surface-border px-2.5 py-1 text-[11px] font-semibold text-slate-500 hover:bg-slate-50";
const btnPrimary = "rounded-md bg-brand-cyan px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-cyan-800";
const btnDanger = "rounded-md bg-status-red px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-red-700";
const btnAmber = "rounded-md bg-status-amber px-2.5 py-1 text-[11px] font-semibold text-white hover:bg-amber-600";

function BedTile({
  bed,
  canManageBeds,
  onAction,
}: {
  bed: Bed;
  canManageBeds: boolean;
  onAction: (bed: Bed, action: BedAction) => void;
}) {
  const kind = tileKind(bed)!;
  const style = tileStyle[kind];
  const o = bed.occupant;

  return (
    <div className={`rounded-lg border p-3.5 ${style.border} ${style.bg}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex items-center gap-1.5 text-xs font-extrabold text-slate-800">
          {bed.code}
          {bed.isolation && (
            <span className="flex items-center gap-0.5 rounded bg-status-red-bg px-1.5 py-0.5 text-[9px] font-bold uppercase text-status-red">
              <ShieldAlert className="h-2.5 w-2.5" /> Isolation
            </span>
          )}
        </span>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${style.badge}`}>{style.label}</span>
      </div>

      {o && (
        <>
          <p className="mt-2 text-xs font-bold text-slate-800">
            {o.patientName}
            <span className="ml-1 font-normal text-slate-400">
              {ageSex(o.age, o.sex)} · {o.mrn}
            </span>
          </p>
          <p className="text-[11px] text-slate-500">Dx: {o.diagnosis}</p>
          {o.attending && <p className="text-[11px] text-slate-400">Attending: {o.attending}</p>}
          {o.notes && <p className="text-[11px] text-slate-400">{o.notes}</p>}
        </>
      )}

      {!o && bed.statusNote && (
        <div className="mt-2 flex items-start gap-1.5 text-[11px] text-slate-500">
          {kind === "cleaning" ? (
            <Sparkles className="mt-0.5 h-3 w-3 shrink-0 text-status-blue" />
          ) : kind === "maintenance" ? (
            <Wrench className="mt-0.5 h-3 w-3 shrink-0 text-slate-400" />
          ) : null}
          <span>{bed.statusNote}</span>
        </div>
      )}

      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-black/5 pt-2">
        <span className="flex items-center gap-1 text-[11px] text-slate-400">
          <Clock className="h-3 w-3" />
          {o ? `Day ${o.dayOfStay} · admitted ${timeAgo(o.admittedAt)}` : `Since ${timeAgo(bed.statusChangedAt)}`}
        </span>

        <div className="flex flex-wrap items-center gap-1.5">
          {o && (
            <>
              <button onClick={() => onAction(bed, "view")} className={btn}>View</button>
              <button onClick={() => onAction(bed, "edit")} className={btn}>Edit</button>
              <button onClick={() => onAction(bed, "transfer")} className={btn}>Transfer</button>
              {o.admissionStatus === "ACTIVE" ? (
                <button onClick={() => onAction(bed, "discharge-ready")} className={btnAmber}>Ready to Go</button>
              ) : null}
              <button onClick={() => onAction(bed, "discharge")} className={btnDanger}>Discharge</button>
            </>
          )}
          {kind === "reserved" && (
            <>
              <button onClick={() => onAction(bed, "admit")} className={btnPrimary}>Admit</button>
              {canManageBeds && <button onClick={() => onAction(bed, "release")} className={btnAmber}>Free Bed</button>}
            </>
          )}
          {kind === "cleaning" && canManageBeds && (
            <button onClick={() => onAction(bed, "mark-clean")} className={btnPrimary}>Mark Clean</button>
          )}
          {kind === "maintenance" && canManageBeds && (
            <button onClick={() => onAction(bed, "return-to-service")} className={btnPrimary}>Return to Service</button>
          )}
          {!o && <button onClick={() => onAction(bed, "manage")} className={btn}>More</button>}
        </div>
      </div>
    </div>
  );
}

/** One ward's section of the bed board. `beds` is already filtered by the page. */
export default function WardSection({
  ward,
  beds,
  showAvailable,
  canManageBeds,
  onAction,
}: {
  ward: Ward;
  beds: Bed[];
  showAvailable: boolean;
  canManageBeds: boolean;
  onAction: (bed: Bed, action: BedAction) => void;
}) {
  const tiles = beds.filter((b) => b.status !== "AVAILABLE");
  const available = showAvailable ? beds.filter((b) => b.status === "AVAILABLE") : [];
  const ratio = ward.nursesOnDuty > 0 ? (ward.beds.occupied / ward.nursesOnDuty).toFixed(1) : null;

  // Group tiles by room when the ward has rooms (e.g. Ward A cubicles).
  const groups = new Map<string, Bed[]>();
  tiles.forEach((b) => {
    const key = b.room ?? "";
    groups.set(key, [...(groups.get(key) ?? []), b]);
  });

  return (
    <section className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-surface-border px-5 py-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-status-blue">
            <BedDouble className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">{ward.name}</h2>
            <p className="text-[11px] text-slate-400">
              {[ward.location, ward.chargeNurse && `Charge Nurse: ${ward.chargeNurse}`].filter(Boolean).join(" · ")}
            </p>
            <p className="text-[11px] font-semibold text-slate-500">
              {ward.beds.occupied}/{ward.beds.total} Beds Occupied ({ward.beds.occupancyPct}%) · {ward.beds.available} available
            </p>
          </div>
        </div>
        <div className="text-right text-[11px] text-slate-400">
          <p className="font-semibold text-slate-600">{ward.nursesOnDuty} nurses on duty</p>
          <p>Ratio {ratio ? `1:${ratio}` : "—"}</p>
        </div>
      </div>

      {tiles.length === 0 && available.length === 0 ? (
        <div className="flex flex-col items-center gap-2 p-10 text-center">
          <Inbox className="h-6 w-6 text-slate-300" />
          <p className="text-xs font-semibold text-slate-500">No beds in this ward match the current filters</p>
        </div>
      ) : (
        <div className="space-y-4 p-5">
          {[...groups.entries()].map(([room, roomBeds]) => (
            <div key={room || "beds"}>
              {room && <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-slate-400">{room}</p>}
              <div className="grid gap-3 sm:grid-cols-2 2xl:grid-cols-3">
                {roomBeds.map((bed) => (
                  <BedTile key={bed.id} bed={bed} canManageBeds={canManageBeds} onAction={onAction} />
                ))}
              </div>
            </div>
          ))}

          {available.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wide text-status-green">
                Available · Admit Ready ({available.length})
              </p>
              <div className="flex flex-wrap gap-1.5">
                {available.map((bed) => (
                  <button
                    key={bed.id}
                    onClick={() => onAction(bed, "manage")}
                    title={bed.statusNote ?? "Clean and ready to admit"}
                    className="flex items-center gap-1 rounded-md border border-green-200 bg-status-green-bg px-2 py-1 text-[11px] font-semibold text-status-green hover:bg-green-100"
                  >
                    {bed.isolation && <ShieldAlert className="h-3 w-3 text-status-red" />}
                    {bed.code}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
