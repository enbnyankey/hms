export type EventCategory = "security" | "privilege" | "phi" | "narcotics";
export type EventRange = "1h" | "24h" | "7d";
export type SeverityTone = "danger" | "warning" | "info" | "purple";

export type LedgerEvent = {
  id: string;
  timestamp: string; // "14:31:02.812"
  dateLabel: string; // "Today"
  severityLabel: string; // "Security / Ingress"
  tone: SeverityTone;
  categories: EventCategory[];
  range: EventRange;
  actorName: string;
  actorId: string;
  actorRole: string;
  actorInitials: string;
  actionTitle: string;
  actionDetail: string;
  targetResource: string;
  originWorkstation: string;
  merkleHash: string;
  prevHash: string;
  ledgerIndex: string;
  consensusStatus: string;
  originBeacon: string;
  authChannel: string;
  rawJson: string;
};

export type SecurityAlert = {
  id: string;
  tone: "danger" | "warning" | "info";
  tagLabel: string;
  time: string;
  title: string;
  detail: string;
  badgeLabel: string;
  reviewed: boolean;
};

export const initialSecurityAlerts: SecurityAlert[] = [
  {
    id: "alert-1",
    tone: "danger",
    tagLabel: "Flagged Anomaly",
    time: "14:31:02 GMT",
    title: "Concurrent Ingress Assertion",
    detail:
      "Dr. Evelyn Addo-Yobo session opened from Trauma Terminal GH-ACC-TRM-04 while concurrently active on CCU Mobile Pad.",
    badgeLabel: "Biometric Re-Auth Enforced",
    reviewed: false,
  },
  {
    id: "alert-2",
    tone: "warning",
    tagLabel: "Schedule II Vault",
    time: "14:18:44 GMT",
    title: "Narcotics Vault Schedule II Override",
    detail:
      "Pharmacist Emmanuel Boateng executed Fentanyl emergency protocol dispensation with Attending Co-signature #CO-8821.",
    badgeLabel: "Dual MD & Pharm Key Verified",
    reviewed: false,
  },
  {
    id: "alert-3",
    tone: "info",
    tagLabel: "Policy Guard Block",
    time: "13:52:10 GMT",
    title: "Mass PHI Export Blocked",
    detail:
      "Research intern account attempted bulk export of 1,200 oncology records without Institutional Review Board cryptographic key token.",
    badgeLabel: "Revoked & Escalated",
    reviewed: false,
  },
];

export const initialLedgerEvents: LedgerEvent[] = [
  {
    id: "evt-1",
    timestamp: "14:31:02.812",
    dateLabel: "Today",
    severityLabel: "Security / Ingress",
    tone: "danger",
    categories: ["security"],
    range: "1h",
    actorName: "Dr. Evelyn Addo-Yobo",
    actorId: "AH-EMP-4421",
    actorRole: "ICU Attending",
    actorInitials: "EA",
    actionTitle: "Concurrent Ingress Alert",
    actionDetail: "Biometric Challenge Enforced · Dual Hardware Binding",
    targetResource: "SESSION: T-04-AUTH",
    originWorkstation: "10.4.2.19 · GH-ACC-TRM-04",
    merkleHash: "7f2a89c19e34b92c810d7a04918e90ff45217bc",
    prevHash: "a011ff23089d892019 48ba5efb93478901cc49",
    ledgerIndex: "#1,849,204",
    consensusStatus: "Merkle Root Sealed",
    originBeacon: "BCN-ACC-TRAUMA-Z4",
    authChannel: "TLS 1.3 / FIDO2 Level-3",
    rawJson: `{
  "eventId": "AH-EVT-90412",
  "timestamp": "2026-09-25T14:31:02.812Z",
  "actor": {
    "staffId": "AH-EMP-4421",
    "name": "Dr. Evelyn Addo-Yobo",
    "credentialLevel": "TIER-2_ATTENDING_ICU",
    "fidoTokenId": "FT-GH-998412-B2"
  },
  "event": "concurrent_ingress_assertion",
  "resolution": "biometric_reauth_enforced"
}`,
  },
  {
    id: "evt-2",
    timestamp: "14:18:44.204",
    dateLabel: "Today",
    severityLabel: "Narcotics / Sched II",
    tone: "warning",
    categories: ["narcotics", "privilege"],
    range: "1h",
    actorName: "Pharm. Emmanuel Boateng",
    actorId: "AH-EMP-8819",
    actorRole: "Lead Pharmacist",
    actorInitials: "EB",
    actionTitle: "Fentanyl 100mcg Override",
    actionDetail: "Co-Sig: Dr. Mensah #CO-8821",
    targetResource: "VAULT-BAY-02B · Patient #AH-PAT-004928",
    originWorkstation: "10.4.5.12 · Pharmacy Vault Terminal 1",
    merkleHash: "a114cd8871ff92c30b71029dd8871a04918e77f2",
    prevHash: "7f2a89c19e34b92c810d7a04918e90ff45217bc",
    ledgerIndex: "#1,849,203",
    consensusStatus: "Merkle Root Sealed",
    originBeacon: "BCN-ACC-PHARM-VAULT-1",
    authChannel: "TLS 1.3 / FIDO2 Level-3",
    rawJson: `{
  "eventId": "AH-EVT-90411",
  "timestamp": "2026-09-25T14:18:44.204Z",
  "actor": {
    "staffId": "AH-EMP-8819",
    "name": "Emmanuel Boateng",
    "credentialLevel": "TIER-2_PHARMACIST"
  },
  "event": "schedule_ii_vault_override",
  "coSignature": "AH-EMP-9942",
  "resolution": "dual_key_verified"
}`,
  },
  {
    id: "evt-3",
    timestamp: "13:52:10.019",
    dateLabel: "Today",
    severityLabel: "Policy Breach [Blocked]",
    tone: "danger",
    categories: ["phi", "security"],
    range: "24h",
    actorName: "Kofi Owusu (Intern)",
    actorId: "AH-RES-1049",
    actorRole: "Oncology Resident",
    actionTitle: "Bulk PHI Export (1.2k)",
    actionDetail: "Access Policy Guard Violation",
    targetResource: "QUERY: ONC-BULK-24 · 1,200 Patient Records",
    originWorkstation: "10.4.9.31 · Oncology Research Station",
    actorInitials: "KO",
    merkleHash: "3bd881a04918e90ff45217bc7f2a89c19e34b92c",
    prevHash: "a114cd8871ff92c30b71029dd8871a04918e77f2",
    ledgerIndex: "#1,849,202",
    consensusStatus: "Merkle Root Sealed",
    originBeacon: "BCN-ACC-RESEARCH-9",
    authChannel: "TLS 1.3 / FIDO2 Level-2",
    rawJson: `{
  "eventId": "AH-EVT-90410",
  "timestamp": "2026-09-25T13:52:10.019Z",
  "actor": {
    "staffId": "AH-RES-1049",
    "name": "Kofi Owusu",
    "credentialLevel": "TIER-3_RESIDENT"
  },
  "event": "bulk_phi_export_attempt",
  "recordCount": 1200,
  "resolution": "revoked_and_escalated"
}`,
  },
  {
    id: "evt-4",
    timestamp: "13:45:00.672",
    dateLabel: "Today",
    severityLabel: "PHI Access & EHR",
    tone: "info",
    categories: ["phi"],
    range: "24h",
    actorName: "Dr. Kwame Mensah-Arthur",
    actorId: "AH-EMP-9942",
    actorRole: "Cardiologist",
    actorInitials: "KM",
    actionTitle: "SOAP Note Signed & Closed",
    actionDetail: "Cardiac Post-Op Day 1",
    targetResource: "#AH-PAT-004928 · ICU Bed 04 · Folio #9948",
    originWorkstation: "10.4.2.05 · CCU Station 2",
    merkleHash: "e8b941a04918e90ff45217bc7f2a89c19e34b92c",
    prevHash: "3bd881a04918e90ff45217bc7f2a89c19e34b92c",
    ledgerIndex: "#1,849,201",
    consensusStatus: "Merkle Root Sealed",
    originBeacon: "BCN-ACC-CCU-2",
    authChannel: "TLS 1.3 / FIDO2 Level-3",
    rawJson: `{
  "eventId": "AH-EVT-90409",
  "timestamp": "2026-09-25T13:45:00.672Z",
  "actor": {
    "staffId": "AH-EMP-9942",
    "name": "Dr. Kwame Mensah-Arthur",
    "credentialLevel": "TIER-1_ATTENDING_LEAD"
  },
  "event": "clinical_note_signed",
  "resolution": "closed"
}`,
  },
  {
    id: "evt-5",
    timestamp: "13:12:33.155",
    dateLabel: "Today",
    severityLabel: "RBAC Policy Change",
    tone: "purple",
    categories: ["privilege"],
    range: "24h",
    actorName: "Dr. Kwame Boateng (You)",
    actorId: "AH-ADM-0001",
    actorRole: "Chief Admin",
    actorInitials: "KB",
    actionTitle: "Tier-3 Temporary Escalation",
    actionDetail: "Granted to Surgery Fellow #491",
    targetResource: "POLICY: SURG-T3-GRANT · Expires 23:59 GMT",
    originWorkstation: "10.4.0.01 · Admin Console",
    merkleHash: "9f21bda04918e90ff45217bc7f2a89c19e34b92c",
    prevHash: "e8b941a04918e90ff45217bc7f2a89c19e34b92c",
    ledgerIndex: "#1,849,200",
    consensusStatus: "Merkle Root Sealed",
    originBeacon: "BCN-ACC-ADMIN-0",
    authChannel: "TLS 1.3 / FIDO2 Level-3",
    rawJson: `{
  "eventId": "AH-EVT-90408",
  "timestamp": "2026-09-25T13:12:33.155Z",
  "actor": {
    "staffId": "AH-ADM-0001",
    "name": "Dr. Kwame Boateng",
    "credentialLevel": "SUPER_ADMIN"
  },
  "event": "rbac_temporary_grant",
  "targetStaffId": "AH-RES-0491",
  "expiresAt": "2026-09-25T23:59:00Z"
}`,
  },
  {
    id: "evt-6",
    timestamp: "12:59:18.901",
    dateLabel: "Today",
    severityLabel: "eMAR Dispense",
    tone: "info",
    categories: ["narcotics"],
    range: "24h",
    actorName: "Staff Nurse Abena Antwi",
    actorId: "AH-NUR-3091",
    actorRole: "Ward Charge",
    actorInitials: "AA",
    actionTitle: "IV Ceftriaxone 1g Scan",
    actionDetail: "Barcode Patient Wristband Match",
    targetResource: "#AH-PAT-003882 · Maternity Ward B02",
    originWorkstation: "10.4.6.22 · Maternity Med Cart 2",
    merkleHash: "12ac90a04918e90ff45217bc7f2a89c19e34b92c",
    prevHash: "9f21bda04918e90ff45217bc7f2a89c19e34b92c",
    ledgerIndex: "#1,849,199",
    consensusStatus: "Merkle Root Sealed",
    originBeacon: "BCN-ACC-MATERNITY-2",
    authChannel: "TLS 1.3 / FIDO2 Level-2",
    rawJson: `{
  "eventId": "AH-EVT-90407",
  "timestamp": "2026-09-25T12:59:18.901Z",
  "actor": {
    "staffId": "AH-NUR-3091",
    "name": "Abena Antwi",
    "credentialLevel": "TIER-2_NURSING"
  },
  "event": "emar_dispense",
  "medication": "Ceftriaxone 1g IV"
}`,
  },
  {
    id: "evt-7",
    timestamp: "10:22:07.401",
    dateLabel: "Today",
    severityLabel: "PHI Access & EHR",
    tone: "info",
    categories: ["phi"],
    range: "24h",
    actorName: "Kwadwo Asante",
    actorId: "AH-EMP-9012",
    actorRole: "Lab Scientist",
    actorInitials: "KA",
    actionTitle: "Specimen Result Validated",
    actionDetail: "Chemistry Analyzer 2 · Sign-off",
    targetResource: "#SP-2026-9412-CHM",
    originWorkstation: "10.4.7.02 · Central Pathology Lab",
    merkleHash: "5501fda04918e90ff45217bc7f2a89c19e34b92c",
    prevHash: "12ac90a04918e90ff45217bc7f2a89c19e34b92c",
    ledgerIndex: "#1,849,198",
    consensusStatus: "Merkle Root Sealed",
    originBeacon: "BCN-ACC-LAB-2",
    authChannel: "TLS 1.3 / FIDO2 Level-2",
    rawJson: `{
  "eventId": "AH-EVT-90406",
  "timestamp": "2026-09-25T10:22:07.401Z",
  "actor": {
    "staffId": "AH-EMP-9012",
    "name": "Kwadwo Asante",
    "credentialLevel": "TIER-2_LAB_SCIENTIST"
  },
  "event": "result_validated"
}`,
  },
  {
    id: "evt-8",
    timestamp: "22:04:51.230",
    dateLabel: "Yesterday",
    severityLabel: "Security / Ingress",
    tone: "warning",
    categories: ["security"],
    range: "7d",
    actorName: "Front Desk Terminal 3",
    actorId: "AH-EMP-2291",
    actorRole: "Registrar",
    actorInitials: "FD",
    actionTitle: "Failed MFA Attempt (2x)",
    actionDetail: "Auto-locked after 2nd failure",
    targetResource: "SESSION: FD-T3-LOGIN",
    originWorkstation: "10.4.1.03 · Front Desk Counter 3",
    merkleHash: "88f1a2c04918e90ff45217bc7f2a89c19e34b92c",
    prevHash: "5501fda04918e90ff45217bc7f2a89c19e34b92c",
    ledgerIndex: "#1,847,880",
    consensusStatus: "Merkle Root Sealed",
    originBeacon: "BCN-ACC-FRONTDESK-3",
    authChannel: "TLS 1.3 / Password + OTP",
    rawJson: `{
  "eventId": "AH-EVT-89311",
  "timestamp": "2026-09-24T22:04:51.230Z",
  "actor": {
    "staffId": "AH-EMP-2291",
    "name": "Ama Serwaa Frimpong",
    "credentialLevel": "TIER-3_ADMIN"
  },
  "event": "mfa_failure",
  "attempts": 2,
  "resolution": "account_locked"
}`,
  },
  {
    id: "evt-9",
    timestamp: "16:40:12.910",
    dateLabel: "3 days ago",
    severityLabel: "RBAC Policy Change",
    tone: "purple",
    categories: ["privilege"],
    range: "7d",
    actorName: "Dr. Kwame Boateng (You)",
    actorId: "AH-ADM-0001",
    actorRole: "Chief Admin",
    actorInitials: "KB",
    actionTitle: "Pharmacist Vault Access Revoked",
    actionDetail: "Contract ended — offboarding",
    targetResource: "POLICY: PHARM-VAULT-REVOKE",
    originWorkstation: "10.4.0.01 · Admin Console",
    merkleHash: "2210ffa04918e90ff45217bc7f2a89c19e34b92c",
    prevHash: "88f1a2c04918e90ff45217bc7f2a89c19e34b92c",
    ledgerIndex: "#1,845,102",
    consensusStatus: "Merkle Root Sealed",
    originBeacon: "BCN-ACC-ADMIN-0",
    authChannel: "TLS 1.3 / FIDO2 Level-3",
    rawJson: `{
  "eventId": "AH-EVT-87004",
  "timestamp": "2026-09-22T16:40:12.910Z",
  "actor": {
    "staffId": "AH-ADM-0001",
    "name": "Dr. Kwame Boateng"
  },
  "event": "rbac_revocation",
  "reason": "offboarding"
}`,
  },
  {
    id: "evt-10",
    timestamp: "09:15:44.500",
    dateLabel: "5 days ago",
    severityLabel: "Narcotics / Sched II",
    tone: "warning",
    categories: ["narcotics"],
    range: "7d",
    actorName: "Pharm. Emmanuel Boateng",
    actorId: "AH-EMP-8819",
    actorRole: "Lead Pharmacist",
    actorInitials: "EB",
    actionTitle: "Vault Reconciliation Completed",
    actionDetail: "Weekly controlled-substance count",
    targetResource: "VAULT-BAY-02B",
    originWorkstation: "10.4.5.12 · Pharmacy Vault Terminal 1",
    merkleHash: "660bcfa04918e90ff45217bc7f2a89c19e34b92c",
    prevHash: "2210ffa04918e90ff45217bc7f2a89c19e34b92c",
    ledgerIndex: "#1,841,553",
    consensusStatus: "Merkle Root Sealed",
    originBeacon: "BCN-ACC-PHARM-VAULT-1",
    authChannel: "TLS 1.3 / FIDO2 Level-3",
    rawJson: `{
  "eventId": "AH-EVT-83291",
  "timestamp": "2026-09-20T09:15:44.500Z",
  "actor": {
    "staffId": "AH-EMP-8819",
    "name": "Emmanuel Boateng"
  },
  "event": "narcotics_reconciliation",
  "discrepancy": 0
}`,
  },
];

export const telemetryScopes: { id: "all" | EventCategory; label: string; dotClass: string }[] = [
  { id: "all", label: "All Events", dotClass: "bg-slate-400" },
  { id: "security", label: "Critical Security Flags", dotClass: "bg-status-red" },
  { id: "privilege", label: "Privilege Escalation", dotClass: "bg-purple-500" },
  { id: "phi", label: "PHI & eMAR Access", dotClass: "bg-status-blue" },
  { id: "narcotics", label: "Dispensation & Narcotics", dotClass: "bg-status-amber" },
];
