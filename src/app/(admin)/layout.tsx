// src/app/(admin)/layout.tsx
// Admin layout — wraps everything in MobileMenuProvider

import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { MobileMenuProvider } from "@/components/admin/MobileMenuContext";

export const metadata: Metadata = {
  title: {
    default: "Admin | TV Inventory",
    template: "%s | Admin",
  },
  robots: { index: false, follow: false },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MobileMenuProvider>
      <div style={{ display: "flex", minHeight: "100dvh", background: "var(--color-bg-primary)" }}>
        {/* Sidebar */}
        <AdminSidebar />

        {/* Main content */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <main style={{ flex: 1, padding: "24px 20px", maxWidth: "1200px" }}>
            {children}
          </main>
        </div>
      </div>
    </MobileMenuProvider>
  );
}
