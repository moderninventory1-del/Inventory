"use client";
// src/components/admin/AdminRestoreBanner.tsx
// Apple-styled banner displayed on deleted item detail pages with one-click restore

import { useState } from "react";
import { RotateCcw, AlertTriangle } from "lucide-react";
import SlideToRestoreModal from "@/components/admin/SlideToRestoreModal";

interface AdminRestoreBannerProps {
  id: string;
  modelNumber: string;
  brandName: string;
  category?: string;
  boxLocation?: string | null;
  frontImage?: string;
}

export default function AdminRestoreBanner({
  id,
  modelNumber,
  brandName,
  category,
  boxLocation,
  frontImage,
}: AdminRestoreBannerProps) {
  const [isRestoreModalOpen, setIsRestoreModalOpen] = useState(false);

  return (
    <>
      <div
        style={{
        background: "rgba(255, 59, 48, 0.05)",
        border: "1.5px solid rgba(255, 59, 48, 0.22)",
        borderRadius: "16px",
        padding: "16px 20px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "14px",
        boxShadow: "0 4px 16px rgba(255, 59, 48, 0.04)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "12px", minWidth: "260px", flex: 1 }}>
        <div
          style={{
            width: "40px",
            height: "40px",
            borderRadius: "12px",
            background: "rgba(255, 59, 48, 0.12)",
            color: "#ff3b30",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <AlertTriangle size={20} strokeWidth={2.4} />
        </div>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                fontSize: "14.5px",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                letterSpacing: "-0.01em",
              }}
            >
              This Item is Currently Deleted
            </span>
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 800,
                textTransform: "uppercase",
                padding: "2px 7px",
                borderRadius: "100px",
                background: "rgba(255, 59, 48, 0.12)",
                color: "#ff3b30",
                letterSpacing: "0.03em",
              }}
            >
              Deleted
            </span>
          </div>
          <p
            style={{
              fontSize: "12.5px",
              color: "var(--color-text-secondary)",
              margin: "2px 0 0 0",
              lineHeight: 1.4,
            }}
          >
            Hidden from public storefront. All photos, specifications, and storage box details are preserved.
          </p>
        </div>
      </div>

        <button
          onClick={() => setIsRestoreModalOpen(true)}
          className="btn-primary"
          style={{
            background: "linear-gradient(135deg, #16a34a 0%, #15803d 100%)",
            color: "#ffffff",
            border: "none",
            padding: "9px 18px",
            fontSize: "13.5px",
            fontWeight: 700,
            borderRadius: "100px",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            boxShadow: "0 3px 12px rgba(22, 163, 74, 0.28)",
            cursor: "pointer",
            flexShrink: 0,
          }}
          title="Restore this item to active inventory"
        >
          <RotateCcw size={15} strokeWidth={2.4} />
          <span>Restore to Inventory</span>
        </button>
      </div>

      <SlideToRestoreModal
        isOpen={isRestoreModalOpen}
        onClose={() => setIsRestoreModalOpen(false)}
        item={{
          id,
          modelNumber,
          brand: { name: brandName },
          category,
          boxLocation,
          frontImage,
        }}
      />
    </>
  );
}
