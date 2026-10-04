"use client";

import { useState } from "react";
import { Stethoscope, Users } from "lucide-react";
import Card from "./Card";
import { outpatientRooms as initialRooms, type OutpatientRoom } from "@/lib/mock-data";
import { actionToast } from "@/lib/actions";
import Modal from "./ui/Modal";
import Button from "./ui/Button";

export default function OutpatientSuite() {
  const [rooms, setRooms] = useState<OutpatientRoom[]>(initialRooms);
  const [viewingId, setViewingId] = useState<string | null>(null);
  const activeCount = rooms.length;
  const viewing = rooms.find((r) => r.id === viewingId) ?? null;

  function handleCallNext(roomId: string) {
    setRooms((prev) =>
      prev.map((r) => (r.id === roomId && r.waiting > 0 ? { ...r, waiting: r.waiting - 1 } : r))
    );
    const room = rooms.find((r) => r.id === roomId);
    if (room) actionToast("Next patient called", `${room.room} · ${room.clinician}`, "info");
  }

  return (
    <Card
      icon={Stethoscope}
      iconClassName="bg-teal-50 text-brand-teal"
      title="Specialist Outpatient Consulting Suite"
      subtitle="Real-time room occupancy, waiting patient counts & session flow"
      action={
        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
          Rooms Active: {activeCount} / 6
        </span>
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {rooms.map((room) => (
          <div key={room.id} className="rounded-lg border border-surface-border p-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <span className="h-1.5 w-1.5 rounded-full bg-status-green" />
                {room.room}
              </span>
              <span className="text-[11px] font-medium text-slate-400">{room.avgWait}</span>
            </div>
            <p className="mt-1.5 text-xs font-semibold text-slate-600">{room.clinician}</p>
            <p className="text-[11px] text-slate-400">{room.session}</p>
            <div className="mt-2.5 flex items-center justify-between border-t border-surface-border pt-2">
              <span className="text-[11px] text-slate-500">Queue: {room.waiting} patients waiting</span>
              <button
                onClick={() => setViewingId(room.id)}
                className="text-[11px] font-semibold text-brand-cyan hover:underline"
              >
                View Queue
              </button>
            </div>
          </div>
        ))}
      </div>

      <Modal
        open={!!viewing}
        onClose={() => setViewingId(null)}
        title={viewing ? `${viewing.room} Queue` : ""}
        description={viewing ? viewing.clinician : undefined}
        icon={Users}
        footer={<Button variant="secondary" onClick={() => setViewingId(null)}>Close</Button>}
      >
        {viewing && (
          <div className="space-y-3">
            <div className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">{viewing.session}</div>
            <div className="flex items-center justify-between">
              <p className="text-sm">
                <span className="font-extrabold text-slate-900">{viewing.waiting}</span>{" "}
                <span className="text-slate-500">patients waiting · avg {viewing.avgWait.replace("Avg ", "")} wait</span>
              </p>
              <Button
                variant="primary"
                disabled={viewing.waiting === 0}
                onClick={() => handleCallNext(viewing.id)}
              >
                Call Next Patient
              </Button>
            </div>
            {viewing.waiting === 0 && (
              <p className="rounded-md border border-dashed border-surface-border py-4 text-center text-xs text-slate-400">
                No patients waiting for this room.
              </p>
            )}
          </div>
        )}
      </Modal>
    </Card>
  );
}
