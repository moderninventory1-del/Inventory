"use client";
// src/app/(admin)/admin/error.tsx
// Polished error boundary for Admin dashboard & inventory

import { useEffect } from "react";
import { AlertCircle, RotateCcw } from "lucide-react";

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Admin dashboard error caught by boundary:", error);
  }, [error]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "50vh",
        padding: "32px 16px",
        textAlign: "center",
      }}
    >
      <div
        className="card"
        style={{
          maxWidth: "400px",
          width: "100%",
          padding: "32px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.06)",
        }}
      >
        <div
          style={{
            width: "52px",
            height: "52px",
            borderRadius: "50%",
            background: "rgba(255, 59, 48, 0.1)",
            border: "1px solid rgba(255, 59, 48, 0.2)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "var(--color-danger)",
          }}
        >
          <AlertCircle size={26} strokeWidth={2.2} />
        </div>

        <div>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 800,
              letterSpacing: "-0.02em",
              color: "var(--color-text-primary)",
              margin: 0,
            }}
          >
            Unable to load dashboard
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "var(--color-text-muted)",
              marginTop: "6px",
              lineHeight: 1.5,
            }}
          >
            The database connection is momentarily busy. Please try again.
          </p>
        </div>

        <button
          type="button"
          onClick={() => reset()}
          className="btn-primary"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            padding: "10px 22px",
            fontSize: "13px",
            fontWeight: 700,
            borderRadius: "100px",
            cursor: "pointer",
            marginTop: "8px",
          }}
        >
          <RotateCcw size={14} />
          <span>Try Again</span>
        </button>
      </div>
    </div>
  );
}
