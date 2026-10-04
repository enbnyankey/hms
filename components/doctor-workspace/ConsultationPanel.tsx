"use client";

import { useState } from "react";
import { NotebookText, Mic, Square, Pencil, Stethoscope, Plus } from "lucide-react";
import { chiefComplaint, hpiAuthor, hpiNotes as initialHpiNotes, objectiveExam as initialExam, type ExamFinding } from "@/lib/doctor-data";
import { actionToast } from "@/lib/actions";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function ConsultationPanel({ mode }: { mode: "overview" | "exam" }) {
  const [listening, setListening] = useState(false);
  const [hpiNotes, setHpiNotes] = useState(initialHpiNotes);
  const [hpiDraft, setHpiDraft] = useState(initialHpiNotes);
  const [editOpen, setEditOpen] = useState(false);

  const [objectiveExam, setObjectiveExam] = useState<ExamFinding[]>(initialExam);
  const [examOpen, setExamOpen] = useState(false);
  const [examForm, setExamForm] = useState({ system: "", findings: "" });

  function toggleDictation() {
    if (listening) {
      setListening(false);
      actionToast("Dictation stopped", "Voice capture has ended for this consultation.", "info");
    } else {
      setListening(true);
      actionToast("Listening…", "Voice dictation is now capturing this consultation.", "info");
    }
  }

  function openHpiEdit() {
    setHpiDraft(hpiNotes);
    setEditOpen(true);
  }

  function saveHpi() {
    if (!hpiDraft.trim()) return;
    setHpiNotes(hpiDraft.trim());
    actionToast("HPI notes updated", "Consultation notes saved to the encounter.");
    setEditOpen(false);
  }

  const examValid = examForm.system.trim().length > 0 && examForm.findings.trim().length > 0;

  function addFinding() {
    if (!examValid) return;
    setObjectiveExam((prev) => [
      ...prev,
      { id: crypto.randomUUID(), system: examForm.system.trim(), findings: examForm.findings.trim() },
    ]);
    actionToast("Exam finding added", examForm.system.trim());
    setExamForm({ system: "", findings: "" });
    setExamOpen(false);
  }

  return (
    <div className="rounded-xl border border-surface-border bg-white shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border px-5 py-4">
        <div className="flex items-center gap-2">
          <NotebookText className="h-4 w-4 text-slate-500" />
          <h2 className="text-sm font-bold text-slate-900">
            {mode === "overview" ? "Active Consultation & Subjective HPI" : "Objective Physical Examination"}
          </h2>
        </div>
        {mode === "overview" ? (
          <button
            type="button"
            onClick={toggleDictation}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
              listening
                ? "border-status-red bg-status-red-bg text-status-red"
                : "border-surface-border text-brand-cyan hover:bg-slate-50"
            }`}
          >
            {listening ? <Square className="h-3.5 w-3.5" /> : <Mic className="h-3.5 w-3.5" />}
            {listening ? "Stop Dictation" : "Voice Dictation Ready"}
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setExamOpen(true)}
            className="flex items-center gap-1 text-[11px] font-semibold text-brand-cyan hover:underline"
          >
            <Plus className="h-3.5 w-3.5" />
            Add Finding
          </button>
        )}
      </div>

      <div className="p-5">
        {mode === "overview" && (
          <>
            <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
              Chief Complaint (Patient&apos;s Own Words)
            </p>
            <blockquote className="mt-2 rounded-lg border border-surface-border bg-slate-50 p-3.5 text-sm italic leading-relaxed text-slate-700">
              &ldquo;{chiefComplaint}&rdquo;
            </blockquote>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                History of Presenting Illness (HPI) Notes
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-brand-cyan">{hpiAuthor}</span>
                <button
                  type="button"
                  onClick={openHpiEdit}
                  aria-label="Edit HPI notes"
                  className="text-slate-300 hover:text-brand-cyan"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{hpiNotes}</p>
          </>
        )}

        {mode === "exam" && (
          <>
            {objectiveExam.length === 0 ? (
              <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-surface-border py-8 text-center">
                <Stethoscope className="h-5 w-5 text-slate-300" />
                <p className="text-xs font-semibold text-slate-500">No examination findings recorded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 2xl:grid-cols-3">
                {objectiveExam.map((exam) => (
                  <div key={exam.id} className="min-w-0 rounded-lg border border-surface-border p-2.5">
                    <p className="text-xs font-bold text-slate-800">{exam.system}</p>
                    <p className="mt-1 text-[11px] leading-snug text-slate-500 break-words">{exam.findings}</p>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        title="Edit HPI Notes"
        description="Update the history of presenting illness for this encounter."
        icon={Pencil}
        size="lg"
        footer={
          <>
            <Button variant="secondary" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={saveHpi} disabled={!hpiDraft.trim()}>
              Save Notes
            </Button>
          </>
        }
      >
        <textarea
          value={hpiDraft}
          onChange={(e) => setHpiDraft(e.target.value)}
          rows={6}
          className="w-full rounded-md border border-surface-border px-3 py-2 text-sm leading-relaxed text-slate-800 outline-none focus:border-brand-teal"
        />
        {!hpiDraft.trim() && <p className="mt-1 text-[11px] text-status-red">HPI notes cannot be empty.</p>}
      </Modal>

      <Modal
        open={examOpen}
        onClose={() => setExamOpen(false)}
        title="Add Examination Finding"
        description="Record a new system finding from the physical examination."
        icon={Stethoscope}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setExamOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={addFinding} disabled={!examValid}>
              Add Finding
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">System</label>
            <input
              value={examForm.system}
              onChange={(e) => setExamForm((f) => ({ ...f, system: e.target.value }))}
              placeholder="e.g. Musculoskeletal"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Findings</label>
            <textarea
              value={examForm.findings}
              onChange={(e) => setExamForm((f) => ({ ...f, findings: e.target.value }))}
              rows={3}
              placeholder="Describe the examination findings…"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
            {!examForm.findings.trim() && examForm.system.trim() && (
              <p className="mt-1 text-[11px] text-status-red">Findings are required.</p>
            )}
          </div>
        </div>
      </Modal>
    </div>
  );
}
