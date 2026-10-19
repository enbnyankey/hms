"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Topbar from "@/components/Topbar";
import NoticeBanner from "@/components/NoticeBanner";
import SystemLoader from "@/components/ui/SystemLoader";
import { useAuth, canAccess, ROLE_HOME } from "@/lib/auth";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
      return;
    }
    if (!canAccess(user.role, pathname)) {
      router.replace(ROLE_HOME[user.role]);
    }
  }, [loading, user, pathname, router]);

  if (loading || !user || !canAccess(user.role, pathname)) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <SystemLoader
          title="Loading AuraHealth HMS"
          subtitle="Verifying access and loading clinical modules…"
          className="w-full"
        />
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <NoticeBanner />
        <main className="flex-1 overflow-y-auto px-4 py-6 lg:px-6">{children}</main>
      </div>
    </div>
  );
}
