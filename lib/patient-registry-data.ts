// Types, filters and form shapes for the Patient Registry module.
// Patient data itself comes from the backend: see lib/patients-api.ts.

export const registryHeader = {
  title: "Patient Registry",
  wing: "Front Desk · Counter 2",
  subtitle: "Korle-Bu Central Hospital · Master Patient Index & NHIS Enrollment Desk",
};

export type NhisStatus = "Verified" | "Pending" | "Expired" | "Not Enrolled";

export type PatientCategory = "Walk-in" | "Inpatient" | "Outpatient" | "Referral";

export type PatientRecordStatus = "Active" | "Inactive";

export type PatientRecord = {
  id: string;
  mrn: string;
  name: string;
  age: number;
  sex: "Male" | "Female";
  phone: string;
  address: string;
  dob: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nhisNumber: string;
  nhisStatus: NhisStatus;
  bloodGroup: string;
  allergies: string;
  category: PatientCategory;
  lastVisit: string;
  registeredBy: string;
  registeredOn: string;
  status: PatientRecordStatus;
  duplicateFlag: boolean;
};

export type RegistryFilterId = "all" | "pending-nhis" | "walk-in" | "inpatient" | "duplicates";

export const registryFilters: { id: RegistryFilterId; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending-nhis", label: "Pending NHIS" },
  { id: "walk-in", label: "Walk-in" },
  { id: "inpatient", label: "Inpatient" },
  { id: "duplicates", label: "Duplicate Flags" },
];

export function matchesRegistryFilter(p: PatientRecord, filter: RegistryFilterId): boolean {
  switch (filter) {
    case "all":
      return true;
    case "pending-nhis":
      return p.nhisStatus === "Pending";
    case "walk-in":
      return p.category === "Walk-in";
    case "inpatient":
      return p.category === "Inpatient";
    case "duplicates":
      return p.duplicateFlag;
  }
}

export type PatientFormValues = {
  name: string;
  dob: string;
  age: string;
  sex: "Male" | "Female" | "";
  phone: string;
  address: string;
  nextOfKinName: string;
  nextOfKinPhone: string;
  nhisNumber: string;
  walkIn: boolean;
  bloodGroup: string;
  allergies: string;
};

export const emptyPatientForm: PatientFormValues = {
  name: "",
  dob: "",
  age: "",
  sex: "",
  phone: "",
  address: "",
  nextOfKinName: "",
  nextOfKinPhone: "",
  nhisNumber: "",
  walkIn: true,
  bloodGroup: "",
  allergies: "",
};
