"use client";

import { useState } from "react";
import { Cpu, PhoneCall, BellRing, ShieldCheck, CheckCircle2 } from "lucide-react";
import Card from "../Card";
import { analyzers, analyzersOnlineCount, panicCalls as initialPanicCalls, accreditation, type PanicCall } from "@/lib/lab-data";
import { actionToast } from "@/lib/actions";

export default function LabSidebar() {
  const [panicCalls, setPanicCalls] = useState<PanicCall[]>(initialPanicCalls);
  const [connectingId, setConnectingId] = useState<string | null>(null);

  function handleConnect(call: PanicCall) {
    setConnectingId(call.id);
    setTimeout(() => {
      setPanicCalls((prev) =>
        prev.map((c) =>
          c.id === call.id ? { ...c, state: "Verified", note: "Duty physician connected; read-back pending.", actionLabel: undefined } : c
        )
      );
      actionToast(`${call.actionLabel} confirmed`, `${call.ward} · ${call.detail}`, "success");
      setConnectingId(null);
    }, 500);
  }

  return (
    <div className="space-y-3">
      <Card
        icon={Cpu}
        iconClassName="bg-slate-100 text-slate-600"
        title="Interfaced Analyzers"
        headerClassName="px-4 py-2.5"
        bodyClassName="p-3"
        action={
          <span className="rounded-full bg-status-green-bg px-2.5 py-1 text-[11px] font-semibold text-status-green">
            {analyzersOnlineCount} Online
          </span>
        }
      >
        <div className="space-y-2">
          {analyzers.map((a) => (
            <div key={a.id} className="rounded-lg border border-surface-border bg-white p-2">
              <div className="flex items-center justify-between">
                <p className="flex items-center gap-1.5 text-[12px] font-bold text-slate-800">
                  <span className="h-1.5 w-1.5 rounded-full bg-status-green" />
                  {a.name}
                </p>
              </div>
              <p className="text-[11px] text-slate-400">{a.desc}</p>
              {a.progressLabel ? (
                <div className="mt-1.5">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span>{a.progressLabel}</span>
                    <span className="font-semibold text-slate-600">{a.status}</span>
                  </div>
                  <div className="mt-1 h-1 w-full overflow-hidden rounded-full bg-slate-100">
                    <div className="h-full rounded-full bg-brand-teal" style={{ width: `${a.progressPct}%` }} />
                  </div>
                </div>
              ) : (
                <div className="mt-1.5 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500">{a.note}</span>
                  {a.alert ? (
                    <span className="flex items-center gap-1 font-semibold text-status-red">
                      <BellRing className="h-3 w-3" />
                      {a.alert}
                    </span>
                  ) : (
                    <span className="font-semibold text-status-green">{a.status}</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card
        icon={PhoneCall}
        iconClassName="bg-status-red-bg text-status-red"
        title="Panic Call Dispatch"
        headerClassName="px-4 py-2.5"
        bodyClassName="p-3"
        action={
          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">Live Log</span>
        }
      >
        <div className="space-y-2">
          {panicCalls.map((call) => (
            <div
              key={call.id}
              className={`rounded-lg border p-2 ${
                call.state === "Dialing" ? "border-status-red-bg bg-status-red-bg/50" : "border-surface-border bg-white"
              }`}
            >
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-semibold text-slate-500">{call.time}</span>
                <span
                  className={`flex items-center gap-1 font-bold ${
                    call.state === "Verified" ? "text-status-green" : "text-status-red"
                  }`}
                >
                  {call.state === "Verified" && <CheckCircle2 className="h-3 w-3" />}
                  {call.state}
                </span>
              </div>
              <p className="mt-1 text-[11px] font-semibold text-slate-700">{call.ward}</p>
              <p className="text-[11px] text-slate-500">{call.detail}</p>
              {call.note && <p className="mt-1 text-[10px] text-slate-400">{call.note}</p>}
              {call.actionLabel && (
                <button
                  onClick={() => handleConnect(call)}
                  disabled={connectingId === call.id}
                  className="mt-2 w-full rounded-md bg-status-red py-1.5 text-[11px] font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {connectingId === call.id ? "Connecting…" : call.actionLabel}
                </button>
              )}
            </div>
          ))}
        </div>
      </Card>

      <Card
        icon={ShieldCheck}
        iconClassName="bg-teal-50 text-brand-teal"
        title="Pathology Accreditation"
        headerClassName="px-4 py-2.5"
        bodyClassName="p-3"
      >
        <p className="text-[11px] leading-snug text-slate-500">{accreditation.note}</p>
      </Card>
    </div>
  );
}
