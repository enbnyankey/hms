"use client";

import { useState } from "react";
import { CalendarClock, CheckCircle2, AlertTriangle, Pencil, Plus, Trash2, Stamp } from "lucide-react";
import {
  disposition as initialDisposition,
  patientDirectives as initialDirectives,
  type PatientDirective,
} from "@/lib/doctor-data";
import { actionToast } from "@/lib/actions";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Button from "@/components/ui/Button";

export default function DispositionEducation() {
  const [disposition, setDisposition] = useState(initialDisposition);
  const [directives, setDirectives] = useState<PatientDirective[]>(initialDirectives);
  const [finalized, setFinalized] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [reviewDraft, setReviewDraft] = useState({ reviewWhen: disposition.reviewWhen, reviewDetail: disposition.reviewDetail });

  const [directiveOpen, setDirectiveOpen] = useState(false);
  const [directiveText, setDirectiveText] = useState("");
  const [directiveTone, setDirectiveTone] = useState<PatientDirective["tone"]>("ok");
  const [removeTarget, setRemoveTarget] = useState<PatientDirective | null>(null);
  const [signOffOpen, setSignOffOpen] = useState(false);

  function openEdit() {
    setReviewDraft({ reviewWhen: disposition.reviewWhen, reviewDetail: disposition.reviewDetail });
    setEditOpen(true);
  }

  function saveReview() {
    if (!reviewDraft.reviewWhen.trim()) return;
    setDisposition((d) => ({ ...d, reviewWhen: reviewDraft.reviewWhen.trim(), reviewDetail: reviewDraft.reviewDetail.trim() }));
    actionToast("Review appointment updated", reviewDraft.reviewWhen.trim());
    setEditOpen(false);
  }

  function addDirective() {
    if (!directiveText.trim()) return;
    setDirectives((prev) => [...prev, { id: crypto.randomUUID(), text: directiveText.trim(), tone: directiveTone }]);
    actionToast("Directive added", directiveText.trim());
    setDirectiveText("");
    setDirectiveTone("ok");
    setDirectiveOpen(false);
  }

  function removeDirective() {
    if (!removeTarget) return;
    setDirectives((prev) => prev.filter((d) => d.id !== removeTarget.id));
    actionToast("Directive removed", removeTarget.text, "warning");
    setRemoveTarget(null);
  }

  function finalizeDisposition() {
    setFinalized(true);
    actionToast("Disposition finalized", "Encounter disposition and education have been signed off.", "success");
  }

  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border px-5 py-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">Disposition & Education</h2>
        </div>
        {finalized ? (
          <span className="flex items-center gap-1.5 rounded-full bg-status-green-bg px-2.5 py-1 text-[11px] font-semibold text-status-green">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Finalized
          </span>
        ) : (
          <button
            type="button"
            onClick={() => setSignOffOpen(true)}
            className="flex items-center gap-1.5 rounded-md bg-brand-teal px-2.5 py-1.5 text-[11px] font-semibold text-white hover:bg-teal-700"
          >
            <Stamp className="h-3.5 w-3.5" />
            Finalize Disposition
          </button>
        )}
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{disposition.reviewLabel}</p>
          {!finalized && (
            <button type="button" onClick={openEdit} aria-label="Edit review appointment" className="text-slate-300 hover:text-brand-cyan">
              <Pencil className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="mt-1 text-sm font-bold text-slate-800">{disposition.reviewWhen}</p>
        <p className="text-[11px] text-slate-400">{disposition.reviewDetail}</p>

        <div className="mt-4 flex items-center justify-between gap-2">
          <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Patient Directives:</p>
          {!finalized && (
            <button
              type="button"
              onClick={() => setDirectiveOpen(true)}
              className="flex items-center gap-1 text-[11px] font-semibold text-brand-cyan hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
          )}
        </div>
        {directives.length === 0 ? (
          <p className="mt-2 text-[11px] text-slate-400">No patient directives recorded.</p>
        ) : (
          <ul className="mt-2 space-y-2">
            {directives.map((d) => (
              <li key={d.id} className="flex items-start gap-2 text-[11px] leading-snug">
                {d.tone === "ok" ? (
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-green" />
                ) : (
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-status-red" />
                )}
                <span className={`flex-1 ${d.tone === "warning" ? "font-semibold text-status-red" : "text-slate-600"}`}>
                  {d.text}
                </span>
                {!finalized && (
                  <button
                    type="button"
                    onClick={() => setRemoveTarget(d)}
                    aria-label="Remove directive"
                    className="shrink-0 text-slate-300 hover:text-status-red"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit Review Appointment"
        icon={Pencil}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveReview} disabled={!reviewDraft.reviewWhen.trim()}>
              Save
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">When</label>
            <input
              value={reviewDraft.reviewWhen}
              onChange={(e) => setReviewDraft((d) => ({ ...d, reviewWhen: e.target.value }))}
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Detail</label>
            <input
              value={reviewDraft.reviewDetail}
              onChange={(e) => setReviewDraft((d) => ({ ...d, reviewDetail: e.target.value }))}
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none focus:border-brand-teal"
            />
          </div>
        </div>
      </Modal>

      <Modal
        open={directiveOpen}
        onClose={() => setDirectiveOpen(false)}
        title="Add Patient Directive"
        icon={Plus}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setDirectiveOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={addDirective} disabled={!directiveText.trim()}>
              Add Directive
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Instruction</label>
            <textarea
              value={directiveText}
              onChange={(e) => setDirectiveText(e.target.value)}
              rows={2}
              placeholder="e.g. Avoid strenuous activity for 1 week."
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
          <div className="flex gap-2">
            {(["ok", "warning"] as const).map((tone) => (
              <button
                key={tone}
                type="button"
                onClick={() => setDirectiveTone(tone)}
                className={`flex-1 rounded-md border px-3 py-2 text-[11px] font-bold transition-colors ${
                  directiveTone === tone
                    ? "border-brand-teal bg-teal-50 text-brand-teal"
                    : "border-surface-border text-slate-500 hover:bg-slate-50"
                }`}
              >
                {tone === "ok" ? "Routine" : "Safety-Critical"}
              </button>
            ))}
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!removeTarget}
        onClose={() => setRemoveTarget(null)}
        onConfirm={removeDirective}
        variant="delete"
        title="Remove Directive"
        description={`Remove this directive: "${removeTarget?.text ?? ""}"?`}
        confirmLabel="Remove"
      />

      <ConfirmModal
        open={signOffOpen}
        onClose={() => setSignOffOpen(false)}
        onConfirm={() => {
          finalizeDisposition();
          setSignOffOpen(false);
        }}
        variant="approve"
        title="Finalize Disposition"
        description="Sign off on the disposition and patient education for this encounter. Once finalized, these items can no longer be edited."
        confirmLabel="Finalize"
      />
    </div>
  );
}
