"use client";

import { useEffect, useState } from "react";
import { Building2, Loader2, Save } from "lucide-react";
import Card from "@/components/Card";
import { useAuth } from "@/lib/auth";
import { ApiError } from "@/lib/api";
import {
  fetchHospitalProfile,
  updateHospitalProfile,
  toFormValues,
  type HospitalProfileFormValues,
} from "@/lib/hospital-api";

const emptyForm: HospitalProfileFormValues = {
  name: "",
  registrationNumber: "",
  facilityType: "",
  phone: "",
  email: "",
  website: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  region: "",
  country: "",
  departments: "",
};

function Field({
  label,
  value,
  onChange,
  required,
  disabled,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  disabled?: boolean;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-semibold text-slate-600">
        {label}
        {required && <span className="text-rose-500"> *</span>}
      </span>
      <input
        type={type}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full rounded-lg border border-surface-border px-3 py-2 text-sm text-slate-800 disabled:bg-slate-50 disabled:text-slate-400"
      />
    </label>
  );
}

export default function HospitalProfilePage() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [form, setForm] = useState<HospitalProfileFormValues>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetchHospitalProfile()
      .then((profile) => {
        if (!active) return;
        setForm(toFormValues(profile));
        setSavedAt(profile.updatedAt);
      })
      .catch((e) => {
        if (!active) return;
        setError(e instanceof ApiError ? e.message : "Couldn't load the hospital profile.");
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  function set<K extends keyof HospitalProfileFormValues>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isAdmin) return;
    setError("");
    setSaving(true);
    try {
      const updated = await updateHospitalProfile(form);
      setForm(toFormValues(updated));
      setSavedAt(updated.updatedAt);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Couldn't save the hospital profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="mb-5 flex items-start gap-3">
        <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-800 text-white">
          <Building2 className="h-4 w-4" />
        </span>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">Settings</p>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Hospital Profile</h1>
          <p className="text-xs text-slate-500">
            This hospital&apos;s own registered details — name, license/accreditation number, address and contact
            info shown across the system.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading hospital profile…
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-600">{error}</div>
          )}

          {!isAdmin && (
            <div className="rounded-lg border border-status-blue-bg bg-status-blue-bg px-3 py-2 text-xs text-status-blue">
              Viewing only — only an administrator can edit the hospital profile.
            </div>
          )}

          <Card icon={Building2} title="Identity & registration" subtitle="How the hospital is officially registered">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Hospital name" value={form.name} onChange={(v) => set("name", v)} required disabled={!isAdmin} />
              <Field label="Facility type" value={form.facilityType} onChange={(v) => set("facilityType", v)} disabled={!isAdmin} />
              <Field label="Registration / license number" value={form.registrationNumber} onChange={(v) => set("registrationNumber", v)} disabled={!isAdmin} />
              <Field label="Website" value={form.website} onChange={(v) => set("website", v)} disabled={!isAdmin} />
            </div>
          </Card>

          <Card icon={Building2} title="Contact" subtitle="How patients and partners reach this hospital">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Phone" value={form.phone} onChange={(v) => set("phone", v)} disabled={!isAdmin} />
              <Field label="Email" type="email" value={form.email} onChange={(v) => set("email", v)} disabled={!isAdmin} />
            </div>
          </Card>

          <Card icon={Building2} title="Address" subtitle="Where the hospital is located">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Address line 1" value={form.addressLine1} onChange={(v) => set("addressLine1", v)} disabled={!isAdmin} />
              <Field label="Address line 2" value={form.addressLine2} onChange={(v) => set("addressLine2", v)} disabled={!isAdmin} />
              <Field label="City" value={form.city} onChange={(v) => set("city", v)} disabled={!isAdmin} />
              <Field label="Region / state" value={form.region} onChange={(v) => set("region", v)} disabled={!isAdmin} />
              <Field label="Country" value={form.country} onChange={(v) => set("country", v)} disabled={!isAdmin} />
            </div>
          </Card>

          <Card icon={Building2} title="Departments" subtitle="Comma-separated list shown on reports and the public profile">
            <Field label="Departments" value={form.departments} onChange={(v) => set("departments", v)} disabled={!isAdmin} />
          </Card>

          {isAdmin && (
            <div className="flex items-center gap-3">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-brand-teal px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save changes
              </button>
              {savedAt && <span className="text-xs text-slate-400">Last updated {savedAt}</span>}
            </div>
          )}
        </form>
      )}
    </div>
  );
}
