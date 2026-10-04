"use client";

// Real, working workspace preferences — dark mode actually re-themes the app,
// desktop notifications go through the browser Notification API (with a real
// permission prompt), and sound alerts play an actual tone via Web Audio.
// Everything here is persisted to localStorage and re-applied on load.

import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from "react";

type NotificationPermissionState = "default" | "granted" | "denied" | "unsupported";

type StoredSettings = {
  darkMode: boolean;
  desktopNotifications: boolean;
  soundAlerts: boolean;
};

const STORAGE_KEY = "aurahealth_hms_settings";

type SettingsContextValue = {
  darkMode: boolean;
  desktopNotifications: boolean;
  soundAlerts: boolean;
  notificationPermission: NotificationPermissionState;
  setDarkMode: (value: boolean) => void;
  setDesktopNotifications: (value: boolean) => Promise<boolean>;
  setSoundAlerts: (value: boolean) => void;
  notify: (title: string, body?: string) => void;
  playAlertTone: () => void;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [darkMode, setDarkModeState] = useState(false);
  const [desktopNotifications, setDesktopNotificationsState] = useState(false);
  const [soundAlerts, setSoundAlertsState] = useState(true);
  const [notificationPermission, setNotificationPermission] = useState<NotificationPermissionState>("default");
  const [hydrated, setHydrated] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Load persisted prefs once on mount, and read the browser's actual current
  // notification permission (the user may have granted/blocked it outside the app).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<StoredSettings>;
        if (typeof parsed.darkMode === "boolean") setDarkModeState(parsed.darkMode);
        if (typeof parsed.desktopNotifications === "boolean") setDesktopNotificationsState(parsed.desktopNotifications);
        if (typeof parsed.soundAlerts === "boolean") setSoundAlertsState(parsed.soundAlerts);
      }
    } catch {
      // ignore — fall back to defaults
    }
    if (typeof window !== "undefined" && "Notification" in window) {
      setNotificationPermission(Notification.permission as NotificationPermissionState);
    } else {
      setNotificationPermission("unsupported");
    }
    setHydrated(true);
  }, []);

  // Apply <html class="dark"> and persist whenever a preference changes.
  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.classList.toggle("dark", darkMode);
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ darkMode, desktopNotifications, soundAlerts } satisfies StoredSettings)
      );
    } catch {
      // best-effort only
    }
  }, [darkMode, desktopNotifications, soundAlerts, hydrated]);

  const setDarkMode = useCallback((value: boolean) => setDarkModeState(value), []);

  const setDesktopNotifications = useCallback(async (value: boolean) => {
    if (!value) {
      setDesktopNotificationsState(false);
      return true;
    }
    if (typeof window === "undefined" || !("Notification" in window)) {
      setNotificationPermission("unsupported");
      setDesktopNotificationsState(false);
      return false;
    }
    if (Notification.permission === "granted") {
      setNotificationPermission("granted");
      setDesktopNotificationsState(true);
      return true;
    }
    const result = await Notification.requestPermission();
    setNotificationPermission(result as NotificationPermissionState);
    const granted = result === "granted";
    setDesktopNotificationsState(granted);
    return granted;
  }, []);

  const setSoundAlerts = useCallback((value: boolean) => setSoundAlertsState(value), []);

  const notify = useCallback(
    (title: string, body?: string) => {
      if (!desktopNotifications) return;
      if (typeof window === "undefined" || !("Notification" in window)) return;
      if (Notification.permission !== "granted") return;
      try {
        new Notification(title, { body, icon: "/icon.svg", tag: title });
      } catch {
        // Some browser contexts (e.g. no service worker on certain mobile
        // browsers) restrict `new Notification(...)`; failing silently is fine.
      }
    },
    [desktopNotifications]
  );

  const playAlertTone = useCallback(() => {
    if (!soundAlerts) return;
    if (typeof window === "undefined") return;
    try {
      const AudioCtxCtor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxCtor) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtxCtor();
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") void ctx.resume();
      const now = ctx.currentTime;
      [880, 660].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = freq;
        const start = now + i * 0.18;
        gain.gain.setValueAtTime(0.0001, start);
        gain.gain.exponentialRampToValueAtTime(0.22, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(start);
        osc.stop(start + 0.22);
      });
    } catch {
      // Audio isn't critical to any workflow — fail silently.
    }
  }, [soundAlerts]);

  return (
    <SettingsContext.Provider
      value={{
        darkMode,
        desktopNotifications,
        soundAlerts,
        notificationPermission,
        setDarkMode,
        setDesktopNotifications,
        setSoundAlerts,
        notify,
        playAlertTone,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within a SettingsProvider");
  return ctx;
}
