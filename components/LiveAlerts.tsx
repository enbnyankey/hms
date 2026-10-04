"use client";

import { useState } from "react";
import { Radio, BellOff, Bell, Truck, FileText } from "lucide-react";
import Card from "./Card";
import { liveAlerts as initialAlerts, type AlertSeverity, type LiveAlert } from "@/lib/mock-data";
import { actionToast } from "@/lib/actions";
import Modal from "./ui/Modal";
import ConfirmModal from "./ui/ConfirmModal";
import Button from "./ui/Button";

const severityStyles: Record<AlertSeverity, { border: string; bg: string; text: string; button: string }> = {
  critical: {
    border: "border-red-200",
    bg: "bg-status-red-bg",
    text: "text-status-red",
    button: "bg-status-red text-white hover:bg-red-700",
  },
  warning: {
    border: "border-orange-200",
    bg: "bg-status-orange-bg",
    text: "text-status-orange",
    button: "bg-status-orange text-white hover:bg-orange-700",
  },
  info: {
    border: "border-blue-200",
    bg: "bg-status-blue-bg",
    text: "text-status-blue",
    button: "border border-surface-border bg-white text-slate-600 hover:bg-slate-50",
  },
};

export default function LiveAlerts() {
  const [alerts, setAlerts] = useState<LiveAlert[]>(initialAlerts);
  const [acknowledging, setAcknowledging] = useState<LiveAlert | null>(null);
  const [viewing, setViewing] = useState<LiveAlert | null>(null);
  const [muted, setMuted] = useState(false);

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;

  function handleAlertAction(alert: LiveAlert) {
    if (alert.actionLabel === "Acknowledge") {
      setAcknowledging(alert);
    } else {
      setViewing(alert);
    }
  }

  function handleAcknowledge() {
    if (!acknowledging) return;
    setAlerts((prev) => prev.filter((a) => a.id !== acknowledging.id));
    actionToast("Panic value acknowledged", acknowledging.title, "error");
    setAcknowledging(null);
  }

  function toggleMute() {
    setMuted((m) => !m);
    actionToast(
      muted ? "Telemetry tone restored" : "Telemetry tone silenced",
      muted ? "Audible alerts re-enabled for this station." : "Audible alerts muted for this station for 15 minutes.",
      "info"
    );
  }

  return (
    <Card
      icon={Radio}
      iconClassName="bg-status-red-bg text-status-red"
      title="Live Clinical Dispatch & Panic Alerts"
      subtitle="Real-time telemetry, panic lab notifications, and pharmacy critical approvals"
      action={
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-status-red-bg px-2.5 py-1 text-[11px] font-semibold text-status-red">
            <span className="h-1.5 w-1.5 rounded-full bg-status-red" />
            {criticalCount} Panic Values Detected
          </span>
          <button
            onClick={toggleMute}
            className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
              muted
                ? "border-brand-teal bg-teal-50 text-brand-teal"
                : "border-surface-border text-slate-500 hover:bg-slate-50"
            }`}
          >
            {muted ? <BellOff className="h-3 w-3" /> : <Bell className="h-3 w-3" />}
            {muted ? "Telemetry Muted" : "Silence Telemetry Tone"}
          </button>
        </div>
      }
    >
      {alerts.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-surface-border py-10 text-center">
          <Radio className="h-6 w-6 text-slate-300" />
          <p className="mt-2 text-sm font-semibold text-slate-500">No active dispatch or panic alerts</p>
          <p className="text-xs text-slate-400">New telemetry and lab panic values will appear here.</p>
        </div>
      ) : (
        <div className="grid gap-3 lg:grid-cols-3">
          {alerts.map((alert) => {
            const style = severityStyles[alert.severity];
            return (
              <div key={alert.id} className={`rounded-lg border p-3 ${style.border} ${style.bg}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] font-bold uppercase tracking-wide ${style.text}`}>
                    {alert.title}
                  </span>
                  <span className="text-[10px] text-slate-400">{alert.time}</span>
                </div>
                <p className="mt-1.5 text-xs leading-snug text-slate-700">{alert.detail}</p>
                <p className="mt-1.5 text-[11px] text-slate-500">{alert.meta}</p>
                <button
                  onClick={() => handleAlertAction(alert)}
                  className={`mt-3 w-full rounded-md py-1.5 text-[11px] font-semibold ${style.button}`}
                >
                  {alert.actionLabel}
                </button>
              </div>
            );
          })}
        </div>
      )}

      <ConfirmModal
        open={!!acknowledging}
        onClose={() => setAcknowledging(null)}
        onConfirm={handleAcknowledge}
        variant="approve"
        title="Acknowledge Panic Value"
        description={
          acknowledging
            ? `${acknowledging.detail} Acknowledging confirms the responsible clinician has been notified and clears this from the active panic queue.`
            : ""
        }
        confirmLabel="Acknowledge"
      />

      <Modal
        open={!!viewing}
        onClose={() => setViewing(null)}
        title={viewing?.title ?? ""}
        description={viewing?.time}
        icon={viewing?.actionLabel === "Track Dispatch" ? Truck : FileText}
        tone={viewing?.severity === "warning" ? "warning" : "default"}
        footer={<Button variant="secondary" onClick={() => setViewing(null)}>Close</Button>}
      >
        {viewing && (
          <div className="space-y-2 text-sm text-slate-600">
            <p className="leading-relaxed">{viewing.detail}</p>
            <p className="text-xs text-slate-400">{viewing.meta}</p>
          </div>
        )}
      </Modal>
    </Card>
  );
}
