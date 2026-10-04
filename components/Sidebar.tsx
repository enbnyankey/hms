"use client";

import { useState, type ComponentType, type ReactNode } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { HeartPulse, PhoneCall, Settings, LogOut, Bell, Moon, Volume2, BellRing } from "lucide-react";
import { navItemsForRole, navSectionLabel } from "@/lib/nav";
import { facility } from "@/lib/mock-data";
import { actionToast } from "@/lib/actions";
import { useAuth, ROLE_LABELS } from "@/lib/auth";
import { useSettings } from "@/lib/settings";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

const hotlines = [
  { label: "Security / Code Silver", number: "0800-100-119" },
  { label: "Code Blue (Cardiac Arrest)", number: "Ext. 2222" },
  { label: "Fire & Evacuation", number: "Ext. 3333" },
  { label: "Blood Bank (Massive Transfusion)", number: "Ext. 4141" },
  { label: "Poison Control", number: "0800-100-911" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();
  const navItems = navItemsForRole(user?.role ?? "front_desk");
  const [hotlinesOpen, setHotlinesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const {
    darkMode,
    desktopNotifications,
    soundAlerts,
    notificationPermission,
    setDarkMode,
    setDesktopNotifications,
    setSoundAlerts,
    notify,
    playAlertTone,
  } = useSettings();
  const [requestingPermission, setRequestingPermission] = useState(false);

  return (
    <aside className="hidden lg:flex w-64 shrink-0 flex-col bg-sidebar text-slate-200">
      <div className="flex items-center gap-2 px-5 py-5 border-b border-sidebar-border">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-teal/20 text-brand-teal">
          <HeartPulse className="h-5 w-5" strokeWidth={2.25} />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-bold text-white">AuraHealth HMS</p>
          <p className="text-[11px] text-slate-400">Enterprise Clinical Cloud</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <p className="px-3 pb-2 text-[11px] font-semibold tracking-wider text-slate-500">
          {navSectionLabel.toUpperCase()}
        </p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                    active
                      ? "bg-sidebar-active text-white"
                      : "text-slate-300 hover:bg-sidebar-hover hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" strokeWidth={2} />
                  <span className="truncate">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-sidebar-border px-4 py-4 space-y-3">
        <div className="flex items-center gap-2 rounded-md bg-sidebar-hover px-3 py-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <div className="text-[11px] leading-tight">
            <p className="font-semibold text-white">Day Shift Active</p>
            <p className="text-slate-400">{facility.shiftLabel.replace("Day Shift A ", "")}</p>
          </div>
        </div>
        <div className="flex items-center justify-between px-1 text-[11px] text-slate-400">
          <button
            onClick={() => setHotlinesOpen(true)}
            className="flex items-center gap-1.5 text-status-red hover:text-red-400"
          >
            <PhoneCall className="h-3.5 w-3.5" />
            Emergency Hotlines
          </button>
          <button
            onClick={() => setSettingsOpen(true)}
            className="flex items-center gap-1.5 hover:text-white"
          >
            <Settings className="h-3.5 w-3.5" />
            Settings
          </button>
        </div>
        {user && (
          <div className="flex items-center justify-between gap-2 border-t border-sidebar-border px-1 pt-3">
            <div className="min-w-0 text-[11px] leading-tight">
              <p className="truncate font-semibold text-white">{user.name}</p>
              <p className="truncate text-slate-400">{ROLE_LABELS[user.role]}</p>
            </div>
            <button
              onClick={() => {
                logout();
                router.replace("/login");
              }}
              className="flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-400 hover:bg-sidebar-hover hover:text-white"
            >
              <LogOut className="h-3.5 w-3.5" />
              Log out
            </button>
          </div>
        )}
      </div>

      <Modal
        open={hotlinesOpen}
        onClose={() => setHotlinesOpen(false)}
        title="Emergency Hotlines"
        description="Security, Code Blue and Fire lines are on speed-dial"
        icon={PhoneCall}
        tone="danger"
        footer={<Button variant="secondary" onClick={() => setHotlinesOpen(false)}>Close</Button>}
      >
        <div className="space-y-2">
          {hotlines.map((h) => (
            <div key={h.label} className="flex items-center justify-between rounded-md border border-surface-border px-3 py-2">
              <span className="text-xs font-medium text-slate-700">{h.label}</span>
              <span className="rounded bg-status-red-bg px-2 py-0.5 text-[11px] font-bold text-status-red">{h.number}</span>
            </div>
          ))}
        </div>
      </Modal>

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Settings"
        description="Account and workspace preferences"
        icon={Settings}
        footer={<Button variant="secondary" onClick={() => setSettingsOpen(false)}>Done</Button>}
      >
        <div className="space-y-3 text-sm">
          {user && (
            <div className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
              Signed in as <span className="font-semibold text-slate-800">{user.name}</span> · {ROLE_LABELS[user.role]}
            </div>
          )}

          <ToggleRow
            icon={Bell}
            label="Desktop notifications"
            description={
              notificationPermission === "unsupported"
                ? "Not supported in this browser"
                : notificationPermission === "denied"
                ? "Blocked in your browser's site settings — enable it there first"
                : "Show alerts for critical labs and bed holds"
            }
            checked={desktopNotifications}
            disabled={requestingPermission || notificationPermission === "unsupported"}
            onChange={async (val) => {
              setRequestingPermission(true);
              const granted = await setDesktopNotifications(val);
              setRequestingPermission(false);
              if (val && !granted) {
                actionToast(
                  "Notifications blocked",
                  "Your browser didn't grant permission — check the site settings for this page.",
                  "warning"
                );
              } else if (val && granted) {
                notify("AuraHealth HMS", "Desktop notifications are now on.");
                actionToast("Notifications enabled", "You'll get desktop alerts for critical events.", "success");
              }
            }}
            action={
              desktopNotifications ? (
                <button
                  onClick={() => notify("Test alert", "This is what a critical alert notification looks like.")}
                  className="flex items-center gap-1 text-[11px] font-semibold text-brand-cyan hover:underline"
                >
                  <BellRing className="h-3 w-3" />
                  Test
                </button>
              ) : undefined
            }
          />

          <ToggleRow
            icon={Volume2}
            label="Sound alerts"
            description="Play a tone for panic values and STAT dispatches"
            checked={soundAlerts}
            onChange={setSoundAlerts}
            action={
              soundAlerts ? (
                <button
                  onClick={() => playAlertTone()}
                  className="text-[11px] font-semibold text-brand-cyan hover:underline"
                >
                  Test
                </button>
              ) : undefined
            }
          />

          <ToggleRow
            icon={Moon}
            label="Dark mode"
            description="Switch the workspace to a low-light theme"
            checked={darkMode}
            onChange={setDarkMode}
          />
        </div>
      </Modal>
    </aside>
  );
}

function ToggleRow({
  icon: Icon,
  label,
  description,
  checked,
  onChange,
  disabled,
  action,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  description: string;
  checked: boolean;
  onChange: (val: boolean) => void | Promise<void>;
  disabled?: boolean;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-surface-border px-3 py-2.5">
      <div className="flex items-start gap-2.5">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        <div>
          <p className="text-xs font-semibold text-slate-800">{label}</p>
          <p className="text-[11px] text-slate-400">{description}</p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2.5">
        {action}
        <button
          type="button"
          disabled={disabled}
          onClick={() => onChange(!checked)}
          className={`relative h-5 w-9 shrink-0 rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            checked ? "bg-brand-teal" : "bg-slate-200"
          }`}
        >
          <span
            className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-transform ${
              checked ? "translate-x-4" : "translate-x-0.5"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
