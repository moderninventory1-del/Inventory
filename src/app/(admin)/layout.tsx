// src/app/(admin)/layout.tsx
<<<<<<< HEAD
// Admin layout — desktop sidebar + mobile bottom navigation bar

import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminBottomNav from "@/components/admin/AdminBottomNav";
=======
// Admin layout — wraps everything in MobileMenuProvider

import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
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
<<<<<<< HEAD
        {/* Desktop Sidebar (visible on md+) */}
=======
        {/* Sidebar */}
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
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
<<<<<<< HEAD
          <main className="admin-main-content">
            {children}
          </main>
        </div>

        {/* Mobile Bottom Navigation (visible on < md) */}
        <AdminBottomNav />
      </div>

      <style>{`
        .admin-main-content {
          flex: 1;
          padding: 20px 16px 96px;
          max-width: 1200px;
          width: 100%;
        }

        @media (min-width: 768px) {
          .admin-main-content {
            padding: 28px 24px 40px;
          }
        }
      `}</style>
=======
          <main style={{ flex: 1, padding: "24px 20px", maxWidth: "1200px" }}>
            {children}
          </main>
        </div>
      </div>
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
    </MobileMenuProvider>
  );
}
