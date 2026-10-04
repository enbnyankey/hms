import {
  LayoutGrid,
  Stethoscope,
  BedDouble,
  UserPlus,
  ClipboardList,
  Pill,
  FlaskConical,
  CreditCard,
  BarChart3,
  ShieldCheck,
  BadgeCheck,
  type LucideIcon,
} from "lucide-react";
import type { Role } from "./auth";
import { ROUTE_ACCESS } from "./auth";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
};

export const navSectionLabel = "Clinical Operations";

export const navItems: NavItem[] = [
  { label: "Executive Dashboard", href: "/dashboard", icon: LayoutGrid },
  { label: "Staff Credentialing & RBAC", href: "/staff-credentialing", icon: BadgeCheck },
  { label: "Doctor Workspace", href: "/doctor-workspace", icon: Stethoscope },
  { label: "Ward & Bed Manager", href: "/ward-bed-manager", icon: BedDouble },
  { label: "Patient Registry", href: "/patient-registry", icon: UserPlus },
  { label: "Nursing & eMAR", href: "/nursing-emar", icon: ClipboardList },
  { label: "Pharmacy & Inventory", href: "/pharmacy-inventory", icon: Pill },
  { label: "Laboratory & Diagnostics", href: "/laboratory-diagnostics", icon: FlaskConical },
  { label: "Billing & NHIS Claims", href: "/billing-claims", icon: CreditCard },
  { label: "Reports & Analytics", href: "/reports-analytics", icon: BarChart3 },
  { label: "Audit Trail & Logs", href: "/audit-trail", icon: ShieldCheck },
];

export function navItemsForRole(role: Role): NavItem[] {
  if (role === "admin") return navItems;
  return navItems.filter((item) => {
    const allowed = ROUTE_ACCESS[item.href];
    return !allowed || allowed.includes(role);
  });
}
