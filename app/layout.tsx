import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth";
import { SettingsProvider } from "@/lib/settings";

export const metadata: Metadata = {
  title: "AuraHealth HMS",
  description: "Enterprise Clinical Cloud — Hospital Management System",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <SettingsProvider>
          <AuthProvider>{children}</AuthProvider>
        </SettingsProvider>
        <Toaster
          position="top-right"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast: "rounded-xl border border-surface-border shadow-card font-sans",
              title: "text-sm font-bold",
              description: "text-xs",
            },
          }}
        />
      </body>
    </html>
  );
}
