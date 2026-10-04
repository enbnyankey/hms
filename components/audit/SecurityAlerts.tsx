"use client";

import { useState } from "react";
import { AlertTriangle, ShieldAlert, CheckCircle2 } from "lucide-react";
import type { SecurityAlert } from "@/lib/audit-log-data";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const toneClass: Record<SecurityAlert["tone"], { border: string; bg: string; text: string }> = {
  danger: { border: "border-red-200", bg: "bg-status-red-bg", text: "text-status-red" },
  warning: { border: "border-amber-200", bg: "bg-status-amber-bg", text: "text-status-amber" },
  info: { border: "border-blue-200", bg: "bg-status-blue-bg", text: "text-status-blue" },
};

export default function SecurityAlerts({
  alerts,
  onReview,
}: {
  alerts: SecurityAlert[];
  onReview: (id: string) => void;
}) {
  const [openAlert, setOpenAlert] = useState<SecurityAlert | null>(null);
  const needsAttention = alerts.filter((a) => !a.reviewed).length;

  return (
    <div className="rounded-xl border border-surface-border bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-status-red-bg text-status-red">
            <AlertTriangle className="h-4 w-4" />
          </span>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Live Security Alerts &amp; SIEM Anomaly Feed</h2>
            <p className="text-xs text-slate-400">
              Autonomous behavioral heuristic analysis and access control boundary triggers ({needsAttention} events require administrative notice)
            </p>
          </div>
        </div>
        <span className="rounded-full bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-white">SIEM Engine v4.2 [Armed]</span>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {alerts.map((alert) => {
          const style = toneClass[alert.tone];
          return (
            <div key={alert.id} className={`rounded-lg border p-3 ${style.border} ${style.bg}`}>
              <div className="flex items-center justify-between">
                <span className={`text-[11px] font-bold uppercase tracking-wide ${style.text}`}>{alert.tagLabel}</span>
                <span className="text-[10px] text-slate-400">{alert.time}</span>
              </div>
              <p className="mt-1.5 text-xs font-bold text-slate-800">{alert.title}</p>
              <p className="mt-1 text-[11px] leading-snug text-slate-600">{alert.detail}</p>
              <div className="mt-2.5 flex items-center justify-between gap-2 border-t border-black/5 pt-2">
                <span
                  className={`flex items-center gap-1 text-[10px] font-semibold ${
                    alert.reviewed ? "text-status-green" : "text-slate-400"
                  }`}
                >
                  {alert.reviewed && <CheckCircle2 className="h-3 w-3" />}
                  {alert.reviewed ? "Reviewed" : alert.badgeLabel}
                </span>
                <button
                  onClick={() => setOpenAlert(alert)}
                  className="text-[11px] font-semibold text-brand-cyan hover:underline"
                >
                  Forensic Log →
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={!!openAlert}
        onClose={() => setOpenAlert(null)}
        title={openAlert?.title ?? ""}
        description={openAlert?.tagLabel}
        icon={ShieldAlert}
        tone={openAlert?.tone === "danger" ? "danger" : openAlert?.tone === "warning" ? "warning" : "default"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setOpenAlert(null)}>Close</Button>
            {openAlert && !openAlert.reviewed && (
              <Button
                variant="success"
                onClick={() => {
                  onReview(openAlert.id);
                  setOpenAlert(null);
                }}
              >
                Mark Reviewed
              </Button>
            )}
          </>
        }
      >
        {openAlert && (
          <div className="space-y-2 text-sm text-slate-600">
            <p className="leading-relaxed">{openAlert.detail}</p>
            <p className="text-xs text-slate-400">Detected {openAlert.time} · Resolution: {openAlert.badgeLabel}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
