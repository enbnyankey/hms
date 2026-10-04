"use client";

import { useState } from "react";
import { ListChecks, Plus, Trash2, ClipboardX } from "lucide-react";
import Card from "@/components/Card";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Button from "@/components/ui/Button";
import { problemList as initialProblemList, type ProblemListItem } from "@/lib/doctor-data";
import { actionToast } from "@/lib/actions";

const toneBadge: Record<ProblemListItem["statusTone"], string> = {
  danger: "bg-status-red-bg text-status-red",
  warning: "bg-status-amber-bg text-status-amber",
  info: "bg-status-blue-bg text-status-blue",
};

const statusOptions: { status: string; statusTone: ProblemListItem["statusTone"] }[] = [
  { status: "Uncontrolled", statusTone: "danger" },
  { status: "Active", statusTone: "warning" },
  { status: "Monitoring", statusTone: "info" },
];

type FormState = { title: string; detail: string; status: string };
const emptyForm: FormState = { title: "", detail: "", status: "Active" };

export default function ProblemList() {
  const [problems, setProblems] = useState<ProblemListItem[]>(initialProblemList);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [deleteTarget, setDeleteTarget] = useState<ProblemListItem | null>(null);

  const isValid = form.title.trim().length > 0;

  function handleSubmit() {
    if (!isValid) return;
    const tone = statusOptions.find((s) => s.status === form.status)?.statusTone ?? "info";
    const newProblem: ProblemListItem = {
      id: crypto.randomUUID(),
      title: form.title.trim(),
      detail: form.detail.trim() || "Newly added · Pending review",
      status: form.status,
      statusTone: tone,
    };
    setProblems((prev) => [...prev, newProblem]);
    actionToast("Problem added", newProblem.title);
    setFormOpen(false);
    setForm(emptyForm);
  }

  function handleDelete() {
    if (!deleteTarget) return;
    setProblems((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    actionToast("Problem removed", deleteTarget.title, "warning");
    setDeleteTarget(null);
  }

  return (
    <Card
      icon={ListChecks}
      iconClassName="bg-slate-100 text-slate-500"
      title="Active Problem List"
      action={
        <button
          type="button"
          onClick={() => setFormOpen(true)}
          className="flex items-center gap-1 text-[11px] font-semibold text-brand-cyan hover:underline"
        >
          <Plus className="h-3.5 w-3.5" />
          Add Problem
        </button>
      }
    >
      <div className="space-y-3">
        {problems.length === 0 && (
          <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-surface-border py-8 text-center">
            <ClipboardX className="h-5 w-5 text-slate-300" />
            <p className="text-xs font-semibold text-slate-500">No active problems</p>
          </div>
        )}
        {problems.map((item) => (
          <div key={item.id} className="rounded-lg border border-surface-border p-3">
            <div className="flex items-start justify-between gap-2">
              <p className="text-xs font-bold text-slate-800">{item.title}</p>
              <div className="flex shrink-0 items-center gap-2">
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${toneBadge[item.statusTone]}`}>
                  {item.status}
                </span>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(item)}
                  aria-label={`Remove ${item.title}`}
                  className="text-slate-300 hover:text-status-red"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
            <p className="mt-1 text-[11px] text-slate-400">{item.detail}</p>
          </div>
        ))}
      </div>

      <Modal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add Problem"
        description="Add an item to the active problem list."
        icon={ListChecks}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} disabled={!isValid}>
              Add Problem
            </Button>
          </>
        }
      >
        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Title</label>
            <input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Type 2 Diabetes Mellitus"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
            {!form.title.trim() && form.detail.trim() && (
              <p className="mt-1 text-[11px] text-status-red">Title is required.</p>
            )}
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Detail</label>
            <input
              value={form.detail}
              onChange={(e) => setForm((f) => ({ ...f, detail: e.target.value }))}
              placeholder="Onset, follow-up context…"
              className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
            />
          </div>
          <div>
            <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Status</label>
            <div className="mt-1 flex gap-2">
              {statusOptions.map((opt) => (
                <button
                  key={opt.status}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, status: opt.status }))}
                  className={`flex-1 rounded-md border px-3 py-2 text-[11px] font-bold transition-colors ${
                    form.status === opt.status
                      ? "border-brand-teal bg-teal-50 text-brand-teal"
                      : "border-surface-border text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {opt.status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        variant="delete"
        title="Remove Problem"
        description={`Remove "${deleteTarget?.title ?? ""}" from the active problem list?`}
        confirmLabel="Remove"
      />
    </Card>
  );
}
