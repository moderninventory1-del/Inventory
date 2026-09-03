// src/app/(admin)/layout.tsx
// Admin layout — desktop sidebar + mobile bottom navigation bar

import type { Metadata } from "next";
import AdminSidebar from "@/components/admin/AdminSidebar";
import AdminBottomNav from "@/components/admin/AdminBottomNav";
import { MobileMenuProvider } from "@/components/admin/MobileMenuContext";
import ScrollToTopProgress from "@/components/public/ScrollToTopProgress";

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
        {/* Desktop Sidebar (visible on md+) */}
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
          <main className="admin-main-content">
            {children}
          </main>
        </div>

        {/* Circular Scroll To Top Progress Indicator */}
        <ScrollToTopProgress isAdmin />

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
    </MobileMenuProvider>
  );
}
