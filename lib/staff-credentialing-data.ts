export type CredentialCategory = "attending" | "nursing" | "pharm_lis" | "admin";

export type PrivilegeItem = {
  id: string;
  label: string;
  description: string;
  checked: boolean;
};

export type CouncilStatus = "Active & Good Standing" | "Pending Verification" | "Expired";

export type StaffCredential = {
  id: string;
  name: string;
  suffix?: string; // "MD, FWACS"
  roleTitle: string; // "Chief Medical Officer & Attending Consultant"
  department: string; // "Cardiology & Interventional"
  registryNo: string; // "MDC/G/77209-A"
  category: CredentialCategory;
  tier: 1 | 2 | 3;
  statusLabel: string; // "Awaiting Final Board Approval"
  statusTone: "danger" | "warning" | "info" | "success";
  stage?: string; // "Stage 2/3"
  submittedAgo: string;
  highPriority: boolean;
  employeeId: string;
  email: string;
  phone: string;
  campus: string;
  councilRegistry: string; // "MEDICAL & DENTAL COUNCIL GHANA REGISTRY"
  councilStatus: CouncilStatus;
  validThru: string;
  certificateFile: string;
  certificateHash: string;
  keystoreToken: string;
  fido2Issued: boolean;
  councilSynced: boolean;
  privileges: PrivilegeItem[];
  workstations: string;
  requestedInfo?: string;
  lifecycle: "pending" | "active" | "sanctioned";
};

let seq = 100;
export function nextCredentialId() {
  seq += 1;
  return `cred-${seq}`;
}

export const initialStaffCredentials: StaffCredential[] = [
  {
    id: "cred-1",
    name: "Dr. Kwame Mensah-Arthur",
    suffix: "MD, FWACS",
    roleTitle: "Chief Medical Officer & Attending Consultant",
    department: "Cardiology & Interventional",
    registryNo: "MDC/G/77209-A",
    category: "attending",
    tier: 1,
    statusLabel: "Awaiting Final Board Approval",
    statusTone: "info",
    submittedAgo: "14m ago",
    highPriority: true,
    employeeId: "AH-EMP-9942",
    email: "k.mensah@aurahealth.org",
    phone: "+233 24 990 1822",
    campus: "Accra Central Teaching Hospital (Cardiac Pavilion)",
    councilRegistry: "Medical & Dental Council Ghana Registry",
    councilStatus: "Active & Good Standing",
    validThru: "31 Dec 2026",
    certificateFile: "MDCG_Renewal_Cert_2026_Kwame.pdf",
    certificateHash: "e8b941...c4a10",
    keystoreToken: "AUTH-KEY-T1-256-ACCRA-9844-F92B",
    fido2Issued: true,
    councilSynced: true,
    workstations: "Cardiac Pavilion (Stations #01, #04, #12) & CCU #02",
    lifecycle: "pending",
    privileges: [
      { id: "p1", label: "Full Clinical Inpatient CPOE Authoring", description: "Diagnostic admission, patient transfer, ICU discharge authorization.", checked: true },
      { id: "p2", label: "Schedule II Narcotics & Controlled Rx", description: "Full biometric signing rights for high-risk pharmaceutical vault orders.", checked: true },
      { id: "p3", label: "Cath Lab & Surgical Suite Booking", description: "Interventional cardiology suite reservation and bypass surgery order entry.", checked: true },
      { id: "p4", label: "M&M Committee Clinical Audit Access", description: "Unrestricted retrospective chart access for morbidity reviews and mortality reporting.", checked: true },
      { id: "p5", label: "Attending Sign-Off for Residents", description: "Co-signature authority over Tier 2 & Tier 3 Junior House Officers.", checked: true },
      { id: "p6", label: "Hardware FIDO2 YubiKey Auth", description: "Assigned token: YB-99824-GH for zero-trust terminal login.", checked: true },
    ],
  },
  {
    id: "cred-2",
    name: "Dr. Evelyn Addo-Yobo",
    roleTitle: "Resident Doctor / Medical Officer",
    department: "Pediatric Emergency",
    registryNo: "MDC/G/88104-B",
    category: "attending",
    tier: 2,
    statusLabel: "Pending Dept Head Sign-off",
    statusTone: "warning",
    stage: "Stage 2/3",
    submittedAgo: "1h ago",
    highPriority: true,
    employeeId: "AH-EMP-4421",
    email: "e.addoyobo@aurahealth.org",
    phone: "+233 24 118 4402",
    campus: "Accra Central Teaching Hospital (Pediatric Emergency)",
    councilRegistry: "Medical & Dental Council Ghana Registry",
    councilStatus: "Pending Verification",
    validThru: "18 Mar 2027",
    certificateFile: "MDCG_ProvisionalLicense_2026_Evelyn.pdf",
    certificateHash: "a114cd...77f2",
    keystoreToken: "AUTH-KEY-T2-256-ACCRA-1103-BB4C",
    fido2Issued: false,
    councilSynced: false,
    workstations: "Pediatric Emergency (Stations #02, #06)",
    lifecycle: "pending",
    privileges: [
      { id: "p1", label: "Inpatient CPOE Authoring (Tier 2)", description: "Standard admission and order entry under attending co-signature.", checked: true },
      { id: "p2", label: "Schedule II Narcotics & Controlled Rx", description: "Requires dual co-signature from an attending physician.", checked: false },
      { id: "p3", label: "Emergency Triage Escalation", description: "Manchester Triage override and resuscitation bay assignment.", checked: true },
      { id: "p4", label: "Attending Sign-Off Required", description: "All orders require Tier 1 co-signature before execution.", checked: true },
      { id: "p5", label: "Hardware FIDO2 YubiKey Auth", description: "Token issuance pending IT provisioning.", checked: false },
    ],
  },
  {
    id: "cred-3",
    name: "Mr. Emmanuel Kofi Boateng",
    roleTitle: "Chief Pharmacist / Dispensing Chemist",
    department: "Formulary & Narcotics Vault",
    registryNo: "PCG-PH-4921",
    category: "pharm_lis",
    tier: 2,
    statusLabel: "Narcotics Clearance Required",
    statusTone: "danger",
    submittedAgo: "2h ago",
    highPriority: true,
    employeeId: "AH-EMP-8819",
    email: "e.boateng@aurahealth.org",
    phone: "+233 24 553 0091",
    campus: "Accra Central Teaching Hospital (Pharmacy Block)",
    councilRegistry: "Pharmacy Council of Ghana Registry",
    councilStatus: "Active & Good Standing",
    validThru: "09 Aug 2027",
    certificateFile: "PCG_License_2026_Emmanuel.pdf",
    certificateHash: "70c2aa...19de",
    keystoreToken: "AUTH-KEY-T2-256-ACCRA-8819-EE10",
    fido2Issued: true,
    councilSynced: true,
    workstations: "Pharmacy Block (Vault Terminal #1, Dispensary #3)",
    lifecycle: "pending",
    privileges: [
      { id: "p1", label: "Formulary Dispensing Authority", description: "Standard ward and outpatient dispensing across all formulary tiers.", checked: true },
      { id: "p2", label: "Schedule II Narcotics Vault Access", description: "Requires DEA-equivalent clearance and dual-key vault override.", checked: false },
      { id: "p3", label: "Cold-Chain & Controlled Substance Sign-off", description: "Temperature-log attestation and controlled substance reconciliation.", checked: true },
      { id: "p4", label: "Hardware FIDO2 YubiKey Auth", description: "Assigned token: YB-88192-GH for vault terminal login.", checked: true },
    ],
  },
  {
    id: "cred-4",
    name: "Sister Beatrice Osei",
    roleTitle: "Head of Nursing / Charge Nurse",
    department: "Trauma Ward 4A",
    registryNo: "NMC-PIN-38821",
    category: "nursing",
    tier: 2,
    statusLabel: "Ready for Provisioning",
    statusTone: "success",
    stage: "Stage 3/3",
    submittedAgo: "3h ago",
    highPriority: false,
    employeeId: "AH-EMP-3301",
    email: "b.osei@aurahealth.org",
    phone: "+233 20 441 7723",
    campus: "Accra Central Teaching Hospital (Trauma Ward 4A)",
    councilRegistry: "Nursing & Midwifery Council Registry",
    councilStatus: "Active & Good Standing",
    validThru: "22 Feb 2028",
    certificateFile: "NMC_License_2026_Beatrice.pdf",
    certificateHash: "9f21bd...5601",
    keystoreToken: "AUTH-KEY-T2-256-ACCRA-3301-77A9",
    fido2Issued: true,
    councilSynced: true,
    workstations: "Trauma Ward 4A (Nurse Station, Med Room)",
    lifecycle: "pending",
    privileges: [
      { id: "p1", label: "eMAR Administration & Charting", description: "Medication administration record entry and vitals charting.", checked: true },
      { id: "p2", label: "Charge Nurse Bed Assignment", description: "Ward bed allocation and shift handover authority.", checked: true },
      { id: "p3", label: "Controlled Substance Co-signature", description: "Second-signature witness for Schedule II administration.", checked: true },
      { id: "p4", label: "Hardware FIDO2 YubiKey Auth", description: "Assigned token: YB-33019-GH for nurse station login.", checked: true },
    ],
  },
  {
    id: "cred-5",
    name: "Kwadwo Asante, MSc",
    roleTitle: "Senior Pathology / Lab Scientist",
    department: "Microbiology & Blood Bank",
    registryNo: "AHPC-LS-9012",
    category: "pharm_lis",
    tier: 2,
    statusLabel: "Background Check Clear",
    statusTone: "info",
    stage: "Stage 2/3",
    submittedAgo: "Yesterday",
    highPriority: false,
    employeeId: "AH-EMP-9012",
    email: "k.asante@aurahealth.org",
    phone: "+233 26 771 2245",
    campus: "Accra Central Teaching Hospital (Central Pathology Lab)",
    councilRegistry: "Allied Health Professions Council Registry",
    councilStatus: "Active & Good Standing",
    validThru: "05 May 2027",
    certificateFile: "AHPC_License_2026_Kwadwo.pdf",
    certificateHash: "3bd881...402f",
    keystoreToken: "AUTH-KEY-T2-256-ACCRA-9012-1CDA",
    fido2Issued: false,
    councilSynced: true,
    workstations: "Central Pathology Lab (Analyzer Bay 2, Blood Bank)",
    lifecycle: "pending",
    privileges: [
      { id: "p1", label: "LIS Result Entry & Validation", description: "Specimen accessioning, analyte entry, and result sign-off.", checked: true },
      { id: "p2", label: "Blood Bank Crossmatch Authority", description: "Type & crossmatch release for transfusion under supervision.", checked: false },
      { id: "p3", label: "Hardware FIDO2 YubiKey Auth", description: "Token issuance pending IT provisioning.", checked: false },
    ],
  },
  {
    id: "cred-6",
    name: "Ama Serwaa Frimpong",
    roleTitle: "Front Desk Registrar",
    department: "Patient Registry & Admissions",
    registryNo: "AH-ADM-2291",
    category: "admin",
    tier: 3,
    statusLabel: "Pending Dept Head Sign-off",
    statusTone: "warning",
    stage: "Stage 1/3",
    submittedAgo: "Yesterday",
    highPriority: false,
    employeeId: "AH-EMP-2291",
    email: "a.frimpong@aurahealth.org",
    phone: "+233 27 663 0021",
    campus: "Accra Central Teaching Hospital (Front Desk, Block A)",
    councilRegistry: "Internal HR Verification",
    councilStatus: "Pending Verification",
    validThru: "—",
    certificateFile: "HR_BackgroundCheck_2026_Ama.pdf",
    certificateHash: "12ac90...bb31",
    keystoreToken: "AUTH-KEY-T3-256-ACCRA-2291-04D8",
    fido2Issued: false,
    councilSynced: false,
    workstations: "Front Desk (Counter 1, Counter 2)",
    lifecycle: "pending",
    privileges: [
      { id: "p1", label: "Master Patient Index Registration", description: "New patient registration and demographic edits.", checked: true },
      { id: "p2", label: "NHIS Verification Lookup", description: "Read-only NHIS coverage verification lookups.", checked: true },
      { id: "p3", label: "Hardware FIDO2 YubiKey Auth", description: "Token issuance pending IT provisioning.", checked: false },
    ],
  },
];
