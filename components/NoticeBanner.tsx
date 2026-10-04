"use client";

import { useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import { clinicalNotice, facility, reviewProtocol } from "@/lib/mock-data";
import Modal from "./ui/Modal";
import Button from "./ui/Button";

export default function NoticeBanner() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 border-b border-red-100 bg-status-red-bg px-4 py-2 text-xs lg:px-6">
        <span className="flex items-center gap-1.5 rounded bg-status-red px-2 py-1 font-bold uppercase tracking-wide text-white">
          <AlertTriangle className="h-3.5 w-3.5" />
          Clinical Notice
        </span>
        <p className="flex-1 min-w-[240px] text-slate-700">{clinicalNotice}</p>
        <span className="text-slate-400">Sync {facility.syncTime}</span>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="font-semibold text-brand-cyan hover:underline"
        >
          Review Protocol
        </button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title={reviewProtocol.title}
        description={reviewProtocol.updated}
        icon={ShieldCheck}
        tone="warning"
        footer={<Button variant="secondary" onClick={() => setOpen(false)}>Close</Button>}
      >
        <ol className="list-decimal space-y-2 pl-4 text-sm leading-relaxed text-slate-600">
          {reviewProtocol.steps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </Modal>
    </>
  );
}
