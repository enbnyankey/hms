"use client";

import { useState } from "react";
import { CalendarClock, Pencil } from "lucide-react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { Ward } from "@/lib/ward-api";

// A ward is flagged as understaffed when one nurse has more than 5 patients
// (only shown when the "Staffing Ratio 1:5" toggle in the filter bar is on).
function ratio(inpatients: number, nurses: number): number | null {
  return nurses > 0 ? inpatients / nurses : null;
}

function ratioLabel(r: number | null, inpatients: number): string {
  if (r === null) return inpatients > 0 ? "No nurses" : "—";
  return `1:${r.toFixed(1)}`;
}

function shiftLabel(): string {
  const h = new Date().getHours();
  if (h >= 7 && h < 15) return "Day Shift 07:00 – 15:00";
  if (h >= 15 && h < 23) return "Evening Shift 15:00 – 23:00";
  return "Night Shift 23:00 – 07:00";
}

export default function NursingRotaTable({
  wards,
  highlightUnderstaffed,
  canEditStaffing,
  onUpdateStaffing,
}: {
  wards: Ward[];
  highlightUnderstaffed: boolean;
  canEditStaffing: boolean;
  onUpdateStaffing: (ward: Ward, nursesOnDuty: number) => Promise<void>;
}) {
  const [editing, setEditing] = useState<Ward | null>(null);
  const [value, setValue] = useState("");
  const [saving, setSaving] = useState(false);

  const totals = wards.reduce(
    (t, w) => ({
      capacity: t.capacity + w.beds.total,
      inpatients: t.inpatients + w.beds.occupied,
      discharges: t.discharges + w.dischargeReady,
      admits: t.admits + w.expectedAdmissions,
      nurses: t.nurses + w.nursesOnDuty,
    }),
    { capacity: 0, inpatients: 0, discharges: 0, admits: 0, nurses: 0 }
  );

  async function save() {
    if (!editing) return;
    const n = Number(value);
    if (!Number.isInteger(n) || n < 0) return;
    setSaving(true);
    try {
      await onUpdateStaffing(editing, n);
      setEditing(null);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border px-5 py-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Shift Nursing Rota & Capacity Summary</h2>
        </div>
        <span className="text-[11px] text-slate-400">{shiftLabel()}</span>
      </div>

      <div className="overflow-x-auto p-5">
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead>
            <tr className="text-[10px] uppercase tracking-wide text-slate-400">
              <th className="pb-2 font-semibold">Ward Code & Pavilion</th>
              <th className="pb-2 font-semibold">Charge Nurse</th>
              <th className="pb-2 font-semibold text-right">Bed Capacity</th>
              <th className="pb-2 font-semibold text-right">Inpatients</th>
              <th className="pb-2 font-semibold text-right">Planned Discharges</th>
              <th className="pb-2 font-semibold text-right">Expected Admits</th>
              <th className="pb-2 font-semibold text-right">Nurses on Duty</th>
              <th className="pb-2 font-semibold text-right">Nurse:Patient</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {wards.map((w) => {
              const r = ratio(w.beds.occupied, w.nursesOnDuty);
              const flagged = highlightUnderstaffed && (r === null ? w.beds.occupied > 0 : r > 5);
              return (
                <tr key={w.id} className={flagged ? "bg-status-amber-bg" : undefined}>
                  <td className="py-2.5 pr-3 font-semibold text-slate-800">{w.name}</td>
                  <td className="py-2.5 pr-3 text-slate-500">{w.chargeNurse ?? "—"}</td>
                  <td className="py-2.5 pr-3 text-right font-medium text-slate-700">{w.beds.total}</td>
                  <td className="py-2.5 pr-3 text-right font-bold text-brand-cyan">{w.beds.occupied}</td>
                  <td className="py-2.5 pr-3 text-right text-slate-500">{w.dischargeReady}</td>
                  <td className="py-2.5 pr-3 text-right text-slate-500">{w.expectedAdmissions}</td>
                  <td className="py-2.5 pr-3 text-right text-slate-700">
                    <span className="inline-flex items-center gap-1.5">
                      {w.nursesOnDuty}
                      {canEditStaffing && (
                        <button
                          onClick={() => {
                            setEditing(w);
                            setValue(String(w.nursesOnDuty));
                          }}
                          aria-label={`Update nurses on duty for ${w.name}`}
                          className="rounded p-0.5 text-slate-300 hover:bg-slate-100 hover:text-slate-500"
                        >
                          <Pencil className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  </td>
                  <td className={`py-2.5 text-right font-semibold ${flagged ? "text-status-amber" : "text-slate-700"}`}>
                    {ratioLabel(r, w.beds.occupied)}
                    {flagged && <span className="ml-1 text-[10px] font-bold uppercase">Understaffed</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-surface-border bg-slate-50 font-bold text-slate-800">
              <td className="py-2.5 pr-3">Pavilion Total Census</td>
              <td className="py-2.5 pr-3" />
              <td className="py-2.5 pr-3 text-right">{totals.capacity}</td>
              <td className="py-2.5 pr-3 text-right text-brand-cyan">{totals.inpatients}</td>
              <td className="py-2.5 pr-3 text-right">{totals.discharges}</td>
              <td className="py-2.5 pr-3 text-right">{totals.admits}</td>
              <td className="py-2.5 pr-3 text-right">{totals.nurses}</td>
              <td className="py-2.5 text-right">{ratioLabel(ratio(totals.inpatients, totals.nurses), totals.inpatients)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <Modal
        open={!!editing}
        onClose={() => !saving && setEditing(null)}
        title="Nurses on Duty"
        description={editing?.name}
        icon={CalendarClock}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditing(null)} disabled={saving}>
              Cancel
            </Button>
            <Button variant="primary" onClick={save} loading={saving}>
              Save
            </Button>
          </>
        }
      >
        <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Nurses on this shift</label>
        <input
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
        />
      </Modal>
    </div>
  );
}
