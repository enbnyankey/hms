// Hospital Profile calls to the backend (/api/v1/hospital). GET is readable
// by any signed-in staff member; PUT (editing) is enforced admin-only by the
// backend regardless of what the UI shows.

import { apiFetch } from "@/lib/api";

export type HospitalProfile = {
  id: string;
  name: string;
  registrationNumber: string | null;
  facilityType: string | null;
  phone: string | null;
  email: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  departments: string | null;
  updatedAt: string | null;
};

export type HospitalProfileFormValues = {
  name: string;
  registrationNumber: string;
  facilityType: string;
  phone: string;
  email: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  region: string;
  country: string;
  departments: string;
};

export function fetchHospitalProfile(): Promise<HospitalProfile> {
  return apiFetch<HospitalProfile>("/hospital");
}

export function updateHospitalProfile(values: HospitalProfileFormValues): Promise<HospitalProfile> {
  return apiFetch<HospitalProfile>("/hospital", {
    method: "PUT",
    body: {
      name: values.name.trim(),
      registrationNumber: values.registrationNumber.trim() || null,
      facilityType: values.facilityType.trim() || null,
      phone: values.phone.trim() || null,
      email: values.email.trim() || null,
      website: values.website.trim() || null,
      addressLine1: values.addressLine1.trim() || null,
      addressLine2: values.addressLine2.trim() || null,
      city: values.city.trim() || null,
      region: values.region.trim() || null,
      country: values.country.trim() || null,
      departments: values.departments.trim() || null,
    },
  });
}

export function toFormValues(p: HospitalProfile): HospitalProfileFormValues {
  return {
    name: p.name ?? "",
    registrationNumber: p.registrationNumber ?? "",
    facilityType: p.facilityType ?? "",
    phone: p.phone ?? "",
    email: p.email ?? "",
    website: p.website ?? "",
    addressLine1: p.addressLine1 ?? "",
    addressLine2: p.addressLine2 ?? "",
    city: p.city ?? "",
    region: p.region ?? "",
    country: p.country ?? "",
    departments: p.departments ?? "",
  };
}
