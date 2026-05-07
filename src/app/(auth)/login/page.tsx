// src/app/(auth)/login/page.tsx
// Admin login page — credential-based authentication

import type { Metadata } from "next";
import LoginForm from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Admin Login",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div
      style={{
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--color-bg-primary)",
        padding: "24px 16px",
      }}
    >
      {/* Background glow */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "400px",
          background:
            "radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.15) 0%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      <div style={{ width: "100%", maxWidth: "400px", position: "relative" }}>
        {/* Logo / Brand */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: "56px",
              height: "56px",
              borderRadius: "var(--radius-md)",
              background: "var(--gradient-accent)",
              marginBottom: "16px",
              fontSize: "24px",
            }}
          >
            📺
          </div>
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 700,
              color: "var(--color-text-primary)",
              marginBottom: "6px",
            }}
          >
            Admin Portal
          </h1>
          <p style={{ fontSize: "14px", color: "var(--color-text-muted)" }}>
            TV Inventory Management
          </p>
        </div>

        {/* Login card */}
        <div
          className="card"
          style={{ padding: "32px" }}
        >
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
