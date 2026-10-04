// Mock data for the Patient Registry module (Master Patient Index / Front Desk registration).

export const registryHeader = {
  title: "Patient Registry",
  wing: "Front Desk · Counter 2",
  subtitle: "Korle-Bu Central Hospital · Master Patient Index & NHIS Enrollment Desk",
  dateLabel: "Wed, 25 Sep 2026",
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

export const patientRecords: PatientRecord[] = [
  {
    id: "p1",
    mrn: "GH-2024-8841",
    name: "Kwame Boateng",
    age: 54,
    sex: "Male",
    phone: "+233 24 412 8990",
    address: "12 Liberation Rd, Osu, Accra",
    dob: "12 Mar 1970",
    nextOfKinName: "Abena Boateng",
    nextOfKinPhone: "+233 24 771 2093",
    nhisNumber: "89401923",
    nhisStatus: "Verified",
    bloodGroup: "O+",
    allergies: "Penicillin",
    category: "Outpatient",
    lastVisit: "24 Sep 2026",
    registeredBy: "Efua Mensah",
    registeredOn: "18 Jan 2020",
    status: "Active",
    duplicateFlag: false,
  },
  {
    id: "p2",
    mrn: "GH-2024-7712",
    name: "Abena Osei",
    age: 31,
    sex: "Female",
    phone: "+233 20 552 8871",
    address: "Ring Road Central, Accra",
    dob: "02 Jul 1995",
    nextOfKinName: "Kojo Osei",
    nextOfKinPhone: "+233 20 991 4432",
    nhisNumber: "77120943",
    nhisStatus: "Verified",
    bloodGroup: "A+",
    allergies: "None recorded",
    category: "Inpatient",
    lastVisit: "23 Sep 2026",
    registeredBy: "Kojo Antwi",
    registeredOn: "04 Mar 2022",
    status: "Active",
    duplicateFlag: false,
  },
  {
    id: "p3",
    mrn: "GH-2024-9043",
    name: "Samuel Tetteh",
    age: 42,
    sex: "Male",
    phone: "+233 26 340 1187",
    address: "Teshie-Nungua, Accra",
    dob: "19 Sep 1983",
    nextOfKinName: "Grace Tetteh",
    nextOfKinPhone: "+233 26 900 2210",
    nhisNumber: "",
    nhisStatus: "Not Enrolled",
    bloodGroup: "B+",
    allergies: "None recorded",
    category: "Walk-in",
    lastVisit: "25 Sep 2026",
    registeredBy: "Nadine Yankey",
    registeredOn: "25 Sep 2026",
    status: "Active",
    duplicateFlag: false,
  },
  {
    id: "p4",
    mrn: "GH-2024-6520",
    name: "Efua Mensah",
    age: 29,
    sex: "Female",
    phone: "+233 24 118 6650",
    address: "Dansoman, Accra",
    dob: "30 Nov 1996",
    nextOfKinName: "Yaw Mensah",
    nextOfKinPhone: "+233 24 118 6699",
    nhisNumber: "65201187",
    nhisStatus: "Verified",
    bloodGroup: "AB-",
    allergies: "Sulfa drugs",
    category: "Inpatient",
    lastVisit: "22 Sep 2026",
    registeredBy: "Efua Mensah",
    registeredOn: "11 Jun 2019",
    status: "Active",
    duplicateFlag: false,
  },
  {
    id: "p5",
    mrn: "GH-2024-8119",
    name: "Kojo Antwi",
    age: 8,
    sex: "Male",
    phone: "+233 20 774 9021",
    address: "Achimota, Accra",
    dob: "14 Feb 2018",
    nextOfKinName: "Adjoa Antwi",
    nextOfKinPhone: "+233 20 774 9021",
    nhisNumber: "81190022",
    nhisStatus: "Verified",
    bloodGroup: "O-",
    allergies: "None recorded",
    category: "Outpatient",
    lastVisit: "20 Sep 2026",
    registeredBy: "Kojo Antwi",
    registeredOn: "01 Sep 2024",
    status: "Active",
    duplicateFlag: false,
  },
  {
    id: "p6",
    mrn: "GH-2024-5504",
    name: "Adwoa Serwaa",
    age: 67,
    sex: "Female",
    phone: "+233 27 663 0021",
    address: "Madina, Accra",
    dob: "05 May 1959",
    nextOfKinName: "Kwabena Serwaa",
    nextOfKinPhone: "+233 27 663 0099",
    nhisNumber: "55049912",
    nhisStatus: "Pending",
    bloodGroup: "A-",
    allergies: "Latex",
    category: "Walk-in",
    lastVisit: "25 Sep 2026",
    registeredBy: "Nadine Yankey",
    registeredOn: "25 Sep 2026",
    status: "Active",
    duplicateFlag: false,
  },
  {
    id: "p7",
    mrn: "GH-2024-3390",
    name: "Yaw Darko",
    age: 36,
    sex: "Male",
    phone: "+233 55 210 8843",
    address: "Kaneshie, Accra",
    dob: "21 Oct 1989",
    nextOfKinName: "Akosua Darko",
    nextOfKinPhone: "+233 55 210 8890",
    nhisNumber: "33901987",
    nhisStatus: "Expired",
    bloodGroup: "B-",
    allergies: "None recorded",
    category: "Referral",
    lastVisit: "15 Sep 2026",
    registeredBy: "Efua Mensah",
    registeredOn: "09 Aug 2021",
    status: "Active",
    duplicateFlag: false,
  },
  {
    id: "p8",
    mrn: "GH-2024-1287",
    name: "Akosua Ampofo",
    age: 24,
    sex: "Female",
    phone: "+233 24 887 3312",
    address: "East Legon, Accra",
    dob: "17 Apr 2002",
    nextOfKinName: "Comfort Ampofo",
    nextOfKinPhone: "+233 24 887 3300",
    nhisNumber: "",
    nhisStatus: "Pending",
    bloodGroup: "O+",
    allergies: "None recorded",
    category: "Walk-in",
    lastVisit: "25 Sep 2026",
    registeredBy: "Nadine Yankey",
    registeredOn: "25 Sep 2026",
    status: "Active",
    duplicateFlag: true,
  },
  {
    id: "p9",
    mrn: "GH-2024-4471",
    name: "Nana Kwaku Adjei",
    age: 71,
    sex: "Male",
    phone: "+233 24 902 1187",
    address: "Tema Community 4",
    dob: "03 Jan 1955",
    nextOfKinName: "Esi Adjei",
    nextOfKinPhone: "+233 24 902 1190",
    nhisNumber: "44718820",
    nhisStatus: "Verified",
    bloodGroup: "A+",
    allergies: "Aspirin",
    category: "Inpatient",
    lastVisit: "21 Sep 2026",
    registeredBy: "Kojo Antwi",
    registeredOn: "14 Feb 2018",
    status: "Active",
    duplicateFlag: false,
  },
  {
    id: "p10",
    mrn: "GH-2024-2963",
    name: "Grace Owusu",
    age: 45,
    sex: "Female",
    phone: "+233 20 114 7723",
    address: "Adenta, Accra",
    dob: "27 Aug 1980",
    nextOfKinName: "Michael Owusu",
    nextOfKinPhone: "+233 20 114 7799",
    nhisNumber: "29638810",
    nhisStatus: "Pending",
    bloodGroup: "B+",
    allergies: "None recorded",
    category: "Outpatient",
    lastVisit: "24 Sep 2026",
    registeredBy: "Efua Mensah",
    registeredOn: "25 Sep 2026",
    status: "Active",
    duplicateFlag: false,
  },
];

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

let mrnCounter = 3011;
export function nextMrn(): string {
  mrnCounter += 1;
  return `GH-2024-${mrnCounter}`;
}
