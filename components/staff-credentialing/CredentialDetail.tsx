"use client";

import { useState } from "react";
import {
  BadgeCheck,
  FileText,
  Eye,
  CheckCircle2,
  ShieldAlert,
  MessageSquareWarning,
  Fingerprint,
  Inbox,
} from "lucide-react";
import type { StaffCredential } from "@/lib/staff-credentialing-data";
import Modal from "@/components/ui/Modal";
import ConfirmModal from "@/components/ui/ConfirmModal";
import Button from "@/components/ui/Button";
import { actionToast } from "@/lib/actions";

const toneClass: Record<StaffCredential["statusTone"], string> = {
  danger: "bg-status-red-bg text-status-red",
  warning: "bg-status-amber-bg text-status-amber",
  info: "bg-status-blue-bg text-status-blue",
  success: "bg-status-green-bg text-status-green",
};

export default function CredentialDetail({
  staff,
  onTogglePrivilege,
  onAuthorize,
  onFlagSanctions,
  onRequestInfo,
  onReverify,
}: {
  staff: StaffCredential | null;
  onTogglePrivilege: (staffId: string, privId: string) => void;
  onAuthorize: (staffId: string) => void;
  onFlagSanctions: (staffId: string, reason: string) => void;
  onRequestInfo: (staffId: string, message: string) => void;
  onReverify: (staffId: string) => void;
}) {
  const [authorizeOpen, setAuthorizeOpen] = useState(false);
  const [flagOpen, setFlagOpen] = useState(false);
  const [infoOpen, setInfoOpen] = useState(false);
  const [pdfOpen, setPdfOpen] = useState(false);
  const [infoMessage, setInfoMessage] = useState("");

  if (!staff) {
    return (
      <div className="flex h-full min-h-[400px] flex-col items-center justify-center rounded-xl border border-dashed border-surface-border bg-white p-10 text-center">
        <Inbox className="h-6 w-6 text-slate-300" />
        <p className="mt-2 text-sm font-semibold text-slate-500">Select a credentialing request</p>
        <p className="text-xs text-slate-400">Choose a staff member from the list to review their dossier.</p>
      </div>
    );
  }

  const initials = staff.name
    .replace(/^(Dr\.|Mr\.|Mrs\.|Ms\.|Sister|Principal|Matron)\s+/, "")
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-slate-800 text-lg font-bold text-white">
              {initials}
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                {staff.name}
                {staff.suffix ? `, ${staff.suffix}` : ""}
              </h2>
              <p className="text-sm font-semibold text-slate-600">{staff.roleTitle}</p>
              <p className="text-xs text-slate-400">{staff.department}</p>
            </div>
          </div>
          <span className="rounded-md bg-slate-800 px-2.5 py-1 text-[10px] font-bold text-white">
            Tier-{staff.tier} {staff.tier === 1 ? "Clinical & Prescriptive" : staff.tier === 2 ? "Clinical" : "Support"}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-2 border-t border-surface-border pt-4 text-xs sm:grid-cols-2">
          <p className="text-slate-500">
            EMP: <span className="font-mono font-semibold text-slate-700">{staff.employeeId}</span>
          </p>
          <p className="text-slate-500">
            <span className="font-semibold text-slate-700">{staff.email}</span>
          </p>
          <p className="text-slate-500">
            <span className="font-semibold text-slate-700">{staff.phone}</span>
          </p>
          <p className="text-slate-500">
            Status:{" "}
            <span className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${toneClass[staff.statusTone]}`}>
              {staff.lifecycle === "active" ? "Active & Provisioned" : staff.lifecycle === "sanctioned" ? "Sanctions Flagged" : staff.statusLabel}
            </span>
          </p>
        </div>
        <div className="mt-3 flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-2 text-xs">
          <span className="text-slate-500">
            Allocated Campus: <span className="font-semibold text-slate-700">{staff.campus}</span>
          </span>
          <span className="shrink-0 rounded bg-status-green-bg px-1.5 py-0.5 text-[10px] font-bold text-status-green">
            Primary Node Active
          </span>
        </div>
      </div>

      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <BadgeCheck className="h-4 w-4 text-brand-teal" />
            MDCG Live Telemetry &amp; License Validation
          </h3>
          <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
            Synced: Today, {new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })} GMT
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded-md border border-surface-border bg-slate-50 px-3 py-2.5 text-xs">
          <div>
            <p className="font-semibold text-slate-700">{staff.councilRegistry}</p>
            <p className="mt-0.5 font-mono text-slate-500">
              {staff.registryNo} ·{" "}
              <span
                className={`font-bold ${
                  staff.councilStatus === "Active & Good Standing"
                    ? "text-status-green"
                    : staff.councilStatus === "Expired"
                    ? "text-status-red"
                    : "text-status-amber"
                }`}
              >
                {staff.councilStatus.toUpperCase()}
              </span>
            </p>
          </div>
          <div className="text-right">
            <p className="text-slate-400">Valid Thru</p>
            <p className="font-semibold text-slate-700">{staff.validThru}</p>
          </div>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-2 rounded-md border border-surface-border px-3 py-2.5 text-xs">
          <div className="flex items-center gap-2">
            <FileText className="h-4 w-4 text-slate-400" />
            <div>
              <p className="font-semibold text-slate-700">{staff.certificateFile}</p>
              <p className="text-[11px] text-slate-400">SHA-256: {staff.certificateHash} · Verified against MDCG Authority Keystore</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              onClick={() => setPdfOpen(true)}
              className="flex items-center gap-1 rounded-md border border-surface-border px-2.5 py-1.5 text-[11px] font-semibold text-slate-600 hover:bg-slate-50"
            >
              <Eye className="h-3.5 w-3.5" />
              View PDF
            </button>
            <button
              onClick={() => onReverify(staff.id)}
              title="Re-verify against council registry"
              className="flex h-7 w-7 items-center justify-center rounded-md border border-surface-border text-status-green hover:bg-status-green-bg"
            >
              <CheckCircle2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-slate-400">Master Keystore Token:</span>
          <span className="rounded bg-slate-800 px-2 py-1 font-mono text-[11px] font-semibold text-white">{staff.keystoreToken}</span>
        </div>
      </div>

      <div className="rounded-xl border border-surface-border bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <Fingerprint className="h-4 w-4 text-brand-teal" />
            Configured Clinical &amp; System Privileges
          </h3>
          <span className="rounded bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
            Role Profile: Tier-{staff.tier} {staff.tier === 1 ? "Attending Lead" : staff.tier === 2 ? "Clinical Staff" : "Support Staff"}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-2.5 sm:grid-cols-2">
          {staff.privileges.map((p) => (
            <label
              key={p.id}
              className="flex cursor-pointer items-start gap-2.5 rounded-md border border-surface-border px-3 py-2.5 hover:bg-slate-50"
            >
              <input
                type="checkbox"
                checked={p.checked}
                onChange={() => onTogglePrivilege(staff.id, p.id)}
                className="mt-0.5 h-3.5 w-3.5 rounded border-surface-border text-brand-teal focus:ring-brand-teal"
              />
              <span>
                <span className="block text-xs font-semibold text-slate-800">{p.label}</span>
                <span className="text-[11px] text-slate-400">{p.description}</span>
              </span>
            </label>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2 rounded-md bg-slate-50 px-3 py-2 text-[11px] text-slate-500">
          <span className="font-semibold text-slate-600">Designated Physical Workstations:</span>
          {staff.workstations}
        </div>
      </div>

      <div className="rounded-xl border border-surface-border bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button variant="secondary" onClick={() => setInfoOpen(true)}>
            <MessageSquareWarning className="h-3.5 w-3.5" />
            Request Info
          </Button>
          <Button variant="danger" onClick={() => setFlagOpen(true)} disabled={staff.lifecycle === "sanctioned"}>
            <ShieldAlert className="h-3.5 w-3.5" />
            Flag Sanctions
          </Button>
          <Button variant="primary" onClick={() => setAuthorizeOpen(true)} disabled={staff.lifecycle !== "pending"}>
            <BadgeCheck className="h-3.5 w-3.5" />
            {staff.lifecycle === "active" ? "Smart Badge Issued" : "Authorize & Issue Smart Badge"}
          </Button>
        </div>
        <p className="mt-2 text-right text-[11px] text-slate-400">
          Approval is cryptographically sealed into <span className="font-mono">ACC-AUDIT-2026-LEDGER</span> using the reviewing administrator&apos;s
          Super-Admin private key.
        </p>
      </div>

      <ConfirmModal
        open={authorizeOpen}
        onClose={() => setAuthorizeOpen(false)}
        onConfirm={() => {
          onAuthorize(staff.id);
          setAuthorizeOpen(false);
        }}
        variant="approve"
        title="Authorize & Issue Smart Badge"
        description={`This grants ${staff.name} the configured privileges above, issues a hardware-bound smart badge, and permanently seals the approval into the audit ledger. This cannot be silently reversed.`}
        confirmLabel="Authorize & Issue"
      />

      <ConfirmModal
        open={flagOpen}
        onClose={() => setFlagOpen(false)}
        onConfirm={(reason) => {
          onFlagSanctions(staff.id, reason || "No reason provided");
          setFlagOpen(false);
        }}
        variant="reject"
        title="Flag for Sanctions Review"
        description={`This suspends ${staff.name}'s pending credentialing request and routes it to the Compliance & Sanctions committee.`}
        confirmLabel="Flag Account"
        requireReason
        reasonLabel="Reason for flagging"
        reasonPlaceholder="e.g. Discrepancy found against MDCG registry record"
      />

      <Modal
        open={infoOpen}
        onClose={() => setInfoOpen(false)}
        title="Request Additional Information"
        description={`Send a clarification request to ${staff.name}`}
        icon={MessageSquareWarning}
        footer={
          <>
            <Button variant="secondary" onClick={() => setInfoOpen(false)}>Cancel</Button>
            <Button
              variant="primary"
              disabled={!infoMessage.trim()}
              onClick={() => {
                onRequestInfo(staff.id, infoMessage.trim());
                actionToast("Information requested", `${staff.name} will be notified to provide clarification.`, "info");
                setInfoMessage("");
                setInfoOpen(false);
              }}
            >
              Send Request
            </Button>
          </>
        }
      >
        <textarea
          value={infoMessage}
          onChange={(e) => setInfoMessage(e.target.value)}
          rows={4}
          placeholder="e.g. Please upload your renewed NMC/MDC license certificate — the version on file expires this quarter."
          className="w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
        />
      </Modal>

      <Modal
        open={pdfOpen}
        onClose={() => setPdfOpen(false)}
        title={staff.certificateFile}
        description="Council-issued license certificate"
        icon={FileText}
        size="md"
        footer={<Button variant="secondary" onClick={() => setPdfOpen(false)}>Close</Button>}
      >
        <div className="space-y-2 text-xs">
          <Row label="Registry" value={staff.councilRegistry} />
          <Row label="Registry number" value={staff.registryNo} />
          <Row label="Status" value={staff.councilStatus} />
          <Row label="Valid through" value={staff.validThru} />
          <Row label="File hash (SHA-256)" value={staff.certificateHash} mono />
          <div className="flex h-40 items-center justify-center rounded-md border border-dashed border-surface-border bg-slate-50 text-slate-300">
            <FileText className="h-8 w-8" />
          </div>
        </div>
      </Modal>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-surface-border pb-1.5 last:border-0">
      <span className="text-slate-400">{label}</span>
      <span className={`font-semibold text-slate-700 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}
