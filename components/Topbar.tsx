"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Bell, ChevronDown, RadioTower, PlusCircle, MapPin, Check, User, FlaskConical, Pill, Receipt } from "lucide-react";
import { facility } from "@/lib/mock-data";
import { actionToast } from "@/lib/actions";
import { useAuth, ROLE_LABELS } from "@/lib/auth";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const facilities = [
  { name: facility.name, location: facility.location },
  { name: "AuraHealth North Satellite Clinic", location: "Tamale, Northern Region" },
  { name: "AuraHealth Community Health Post", location: "Kumasi, Ashanti Region" },
];

const quickLinks = [
  { label: "Patient Registry", href: "/patient-registry", icon: User },
  { label: "Laboratory Diagnostics", href: "/laboratory-diagnostics", icon: FlaskConical },
  { label: "Pharmacy & Inventory", href: "/pharmacy-inventory", icon: Pill },
  { label: "Billing & Claims", href: "/billing-claims", icon: Receipt },
];

type NotificationItem = {
  id: string;
  title: string;
  detail: string;
  time: string;
  read: boolean;
};

const initialNotifications: NotificationItem[] = [
  { id: "n1", title: "Critical lab result", detail: "Potassium 6.3 mmol/L flagged for Bed ICU-04.", time: "4 min ago", read: false },
  { id: "n2", title: "Bed hold expiring", detail: "PACU reservation on Bed F-12 expires in 15 minutes.", time: "18 min ago", read: false },
  { id: "n3", title: "NHIS batch update", detail: "Batch #NHIS-2024-0912 was accepted by the clearinghouse.", time: "1 hour ago", read: false },
];

export default function Topbar() {
  const { user } = useAuth();
  const router = useRouter();
  const [facilityOpen, setFacilityOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const filteredLinks = quickLinks.filter((l) => l.label.toLowerCase().includes(query.toLowerCase()));
  const initials = user
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "";

  return (
    <header className="flex flex-wrap items-center gap-3 border-b border-surface-border bg-white px-4 py-3 lg:px-6">
      <button
        onClick={() => setFacilityOpen(true)}
        className="flex items-center gap-2 rounded-md border border-surface-border px-3 py-2 text-left hover:bg-slate-50"
      >
        <div className="text-xs leading-tight">
          <p className="font-semibold text-slate-800">{facility.name}</p>
          <p className="text-slate-400">{facility.location}</p>
        </div>
        <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
      </button>

      <button
        onClick={() => setSearchOpen(true)}
        className="hidden md:flex flex-1 items-center gap-2 rounded-md border border-surface-border px-3 py-2 text-sm text-slate-400 max-w-xs hover:bg-slate-50"
      >
        <Search className="h-4 w-4" />
        <span>Search</span>
        <kbd className="ml-auto rounded bg-slate-100 px-1.5 py-0.5 text-[10px] text-slate-500">⌘K</kbd>
      </button>

      <div className="hidden md:flex items-center gap-2 rounded-md border border-surface-border px-3 py-2 text-xs text-slate-500">
        <RadioTower className="h-3.5 w-3.5 text-brand-teal" />
        <span>DHIMS-2</span>
        <span className="text-slate-400">Synced</span>
      </div>

      <button
        onClick={() => router.push("/patient-registry?openAdd=1")}
        className="ml-auto flex items-center gap-1.5 rounded-md bg-brand-teal px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700"
      >
        <PlusCircle className="h-3.5 w-3.5" />
        New Registration / Triage
      </button>

      <button
        onClick={() => setNotifOpen(true)}
        className="relative flex h-9 w-9 items-center justify-center rounded-md border border-surface-border text-slate-500 hover:bg-slate-50"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-status-red" />
        )}
      </button>

      {user && (
        <div className="flex items-center gap-2 pl-1">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-800 text-xs font-semibold text-white">
            {initials}
          </div>
          <div className="hidden sm:block text-xs leading-tight">
            <p className="font-semibold text-slate-800">{user.name}</p>
            <p className="text-slate-400">{ROLE_LABELS[user.role]}</p>
          </div>
        </div>
      )}

      <Modal
        open={facilityOpen}
        onClose={() => setFacilityOpen(false)}
        title="Switch Facility"
        description="Facilities assigned to your account"
        icon={MapPin}
        footer={<Button variant="secondary" onClick={() => setFacilityOpen(false)}>Close</Button>}
      >
        <div className="space-y-2">
          {facilities.map((f) => {
            const active = f.name === facility.name;
            return (
              <button
                key={f.name}
                onClick={() => {
                  if (!active) {
                    actionToast("Facility unavailable", `${f.name} is not yet provisioned for your account.`, "info");
                  }
                  setFacilityOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-md border px-3 py-2.5 text-left ${
                  active ? "border-brand-teal bg-teal-50" : "border-surface-border hover:bg-slate-50"
                }`}
              >
                <div>
                  <p className="text-xs font-semibold text-slate-800">{f.name}</p>
                  <p className="text-[11px] text-slate-400">{f.location}</p>
                </div>
                {active && <Check className="h-4 w-4 shrink-0 text-brand-teal" />}
              </button>
            );
          })}
        </div>
      </Modal>

      <Modal
        open={searchOpen}
        onClose={() => {
          setSearchOpen(false);
          setQuery("");
        }}
        title="Search AuraHealth HMS"
        description="Jump to a module or clinical workspace"
        icon={Search}
        footer={<Button variant="secondary" onClick={() => setSearchOpen(false)}>Close</Button>}
      >
        <div className="space-y-3">
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search patients, wards, modules..."
            className="w-full rounded-md border border-surface-border px-3 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-300 focus:border-brand-teal"
          />
          <div className="space-y-1">
            {filteredLinks.length === 0 ? (
              <p className="py-6 text-center text-xs text-slate-400">No modules match &quot;{query}&quot;.</p>
            ) : (
              filteredLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => {
                    router.push(link.href);
                    setSearchOpen(false);
                    setQuery("");
                  }}
                  className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-left text-sm text-slate-700 hover:bg-slate-50"
                >
                  <link.icon className="h-4 w-4 text-slate-400" />
                  {link.label}
                </button>
              ))
            )}
          </div>
        </div>
      </Modal>

      <Modal
        open={notifOpen}
        onClose={() => setNotifOpen(false)}
        title="Notifications"
        description={`${unreadCount} unread`}
        icon={Bell}
        footer={
          <>
            <Button variant="secondary" onClick={() => setNotifOpen(false)}>Close</Button>
            <Button
              variant="primary"
              disabled={unreadCount === 0}
              onClick={() => {
                setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
                actionToast("All notifications marked as read", undefined, "success");
              }}
            >
              Mark all as read
            </Button>
          </>
        }
      >
        <div className="space-y-2">
          {notifications.map((n) => (
            <button
              key={n.id}
              onClick={() => setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, read: true } : x)))}
              className={`flex w-full items-start justify-between gap-3 rounded-md border px-3 py-2.5 text-left ${
                n.read ? "border-surface-border bg-white" : "border-teal-200 bg-teal-50/60"
              }`}
            >
              <div>
                <p className="text-xs font-semibold text-slate-800">{n.title}</p>
                <p className="mt-0.5 text-[11px] text-slate-500">{n.detail}</p>
                <p className="mt-1 text-[10px] text-slate-400">{n.time}</p>
              </div>
              {!n.read && <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-status-red" />}
            </button>
          ))}
        </div>
      </Modal>
    </header>
  );
}
