"use client";

import { useMemo, useState } from "react";
import CredentialHeader from "@/components/staff-credentialing/CredentialHeader";
import CredentialKpis from "@/components/staff-credentialing/CredentialKpis";
import CredentialList from "@/components/staff-credentialing/CredentialList";
import CredentialDetail from "@/components/staff-credentialing/CredentialDetail";
import AddLocumModal, { type LocumFormValues } from "@/components/staff-credentialing/AddLocumModal";
import { actionToast } from "@/lib/actions";
import {
  initialStaffCredentials,
  nextCredentialId,
  type StaffCredential,
} from "@/lib/staff-credentialing-data";

const ACTIVE_ROSTER_BASE = 141;

export default function StaffCredentialingPage() {
  const [staff, setStaff] = useState<StaffCredential[]>(initialStaffCredentials);
  const [selectedId, setSelectedId] = useState<string | null>(initialStaffCredentials[0]?.id ?? null);
  const [addOpen, setAddOpen] = useState(false);
  const [authorizedCount, setAuthorizedCount] = useState(0);

  const pending = useMemo(() => staff.filter((s) => s.lifecycle === "pending"), [staff]);
  const selected = useMemo(() => staff.find((s) => s.id === selectedId) ?? null, [staff, selectedId]);

  function selectNextAfterRemoval(removedId: string) {
    const remainingPending = pending.filter((s) => s.id !== removedId);
    setSelectedId(remainingPending[0]?.id ?? null);
  }

  function handleTogglePrivilege(staffId: string, privId: string) {
    setStaff((prev) =>
      prev.map((s) =>
        s.id === staffId
          ? { ...s, privileges: s.privileges.map((p) => (p.id === privId ? { ...p, checked: !p.checked } : p)) }
          : s
      )
    );
  }

  function handleAuthorize(staffId: string) {
    const person = staff.find((s) => s.id === staffId);
    setStaff((prev) => prev.map((s) => (s.id === staffId ? { ...s, lifecycle: "active" } : s)));
    setAuthorizedCount((c) => c + 1);
    actionToast(
      "Smart badge authorized & issued",
      person ? `${person.name} is now active with a hardware-bound credential.` : undefined,
      "success"
    );
    if (staffId === selectedId) selectNextAfterRemoval(staffId);
  }

  function handleFlagSanctions(staffId: string, reason: string) {
    const person = staff.find((s) => s.id === staffId);
    setStaff((prev) => prev.map((s) => (s.id === staffId ? { ...s, lifecycle: "sanctioned" } : s)));
    actionToast(
      "Account flagged for sanctions review",
      person ? `${person.name} — ${reason}` : reason,
      "warning"
    );
    if (staffId === selectedId) selectNextAfterRemoval(staffId);
  }

  function handleRequestInfo(staffId: string, message: string) {
    setStaff((prev) => prev.map((s) => (s.id === staffId ? { ...s, requestedInfo: message } : s)));
  }

  function handleReverify(staffId: string) {
    const person = staff.find((s) => s.id === staffId);
    setStaff((prev) => prev.map((s) => (s.id === staffId ? { ...s, councilSynced: true, councilStatus: "Active & Good Standing" } : s)));
    actionToast("Re-verified against MDCG registry", person ? `${person.name}'s license is confirmed active.` : undefined, "success");
  }

  function handleAddLocum(values: LocumFormValues) {
    const id = nextCredentialId();
    const newStaff: StaffCredential = {
      id,
      name: values.name.trim(),
      roleTitle: values.roleTitle.trim(),
      department: values.department.trim() || "Unassigned Department",
      registryNo: values.registryNo.trim(),
      category: values.category,
      tier: values.tier,
      statusLabel: "Awaiting Final Board Approval",
      statusTone: "info",
      submittedAgo: "Just now",
      highPriority: true,
      employeeId: `AH-LOC-${id.split("-")[1]}`,
      email: values.email.trim() || "—",
      phone: values.phone.trim() || "—",
      campus: "Accra Central Teaching Hospital (Locum Pool)",
      councilRegistry: "Pending Council Lookup",
      councilStatus: "Pending Verification",
      validThru: "—",
      certificateFile: "Awaiting document upload",
      certificateHash: "—",
      keystoreToken: "PENDING ISSUANCE",
      fido2Issued: false,
      councilSynced: false,
      workstations: "Not yet assigned",
      lifecycle: "pending",
      privileges: [
        { id: "p1", label: "Standard Clinical Order Entry", description: "Base-level order entry pending full tier review.", checked: false },
        { id: "p2", label: "Hardware FIDO2 YubiKey Auth", description: "Token issuance pending IT provisioning.", checked: false },
      ],
    };
    setStaff((prev) => [newStaff, ...prev]);
    setSelectedId(id);
    setAddOpen(false);
    actionToast("Locum submitted for fast-track review", `${newStaff.name} added to the pending verification queue.`, "success");
  }

  return (
    <div>
      <CredentialHeader onFastTrack={() => setAddOpen(true)} />
      <CredentialKpis pending={pending} activeRoster={ACTIVE_ROSTER_BASE + authorizedCount} />

      <div className="mt-5 grid grid-cols-1 gap-5 lg:grid-cols-[380px_1fr]">
        <CredentialList items={pending} selectedId={selectedId} onSelect={setSelectedId} />
        <CredentialDetail
          staff={selected}
          onTogglePrivilege={handleTogglePrivilege}
          onAuthorize={handleAuthorize}
          onFlagSanctions={handleFlagSanctions}
          onRequestInfo={handleRequestInfo}
          onReverify={handleReverify}
        />
      </div>

      <AddLocumModal open={addOpen} onClose={() => setAddOpen(false)} onSubmit={handleAddLocum} />
    </div>
  );
}
