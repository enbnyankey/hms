"use client";

import { useState } from "react";
import { MessageSquareText, Plus } from "lucide-react";
import Card from "@/components/Card";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import type { HandoverNote } from "@/lib/nursing-emar-data";

export default function HandoverPanel({
  notes,
  onAddNote,
}: {
  notes: HandoverNote[];
  /** Resolve true when saved (closes the dialog). */
  onAddNote: (text: string) => Promise<boolean>;
}) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const isValid = text.trim().length > 0;

  function handleClose() {
    if (submitting) return;
    setText("");
    setOpen(false);
  }

  async function handleSubmit() {
    if (!isValid) return;
    setSubmitting(true);
    try {
      if (await onAddNote(text.trim())) {
        setText("");
        setOpen(false);
      }
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <Card
      icon={MessageSquareText}
      iconClassName="bg-teal-50 text-brand-teal"
      title="Shift Handover Notes"
      subtitle="Key updates for the next shift"
      headerClassName="px-4 py-3"
      bodyClassName="p-4"
      action={
        <Button variant="secondary" className="!rounded-md !px-2.5 !py-1.5 !text-[11px]" onClick={() => setOpen(true)}>
          <Plus className="h-3 w-3" /> Add Note
        </Button>
      }
    >
      <div className="space-y-2.5">
        {notes.map((n) => (
          <div key={n.id} className="rounded-lg border border-surface-border p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-slate-800">{n.nurse}</p>
              <p className="text-[11px] text-slate-400">{n.time}</p>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-600">{n.note}</p>
          </div>
        ))}
        {notes.length === 0 && <p className="text-xs text-slate-400">No handover notes yet this shift.</p>}
      </div>

      <Modal
        open={open}
        onClose={handleClose}
        title="New Handover Note"
        description="Add a note for the incoming shift."
        icon={MessageSquareText}
        size="sm"
        footer={
          <>
            <Button variant="secondary" onClick={handleClose} disabled={submitting}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleSubmit} loading={submitting} disabled={!isValid}>
              Add Note
            </Button>
          </>
        }
      >
        <div>
          <label className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Note</label>
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={4}
            placeholder="e.g. Bed 07 due for repeat obs at 14:00, family updated on plan of care…"
            className="mt-1 w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          {!isValid && <p className="mt-1 text-[11px] text-status-red">Note text is required.</p>}
        </div>
      </Modal>
    </Card>
  );
}
