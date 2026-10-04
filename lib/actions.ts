"use client";

import { toast } from "sonner";

type ActionTone = "success" | "info" | "warning" | "error";

/**
 * Fires a toast notification standing in for a real backend action.
 * Every actionable button in the app (outside of nav links, tabs, and
 * filters) routes through this so feedback stays consistent everywhere.
 */
export function actionToast(title: string, description?: string, tone: ActionTone = "success") {
  toast[tone](title, description ? { description } : undefined);
}
