"use client";
// src/components/admin/AdminWhatsAppShare.tsx
// Ultra-premium single WhatsApp Share button with Apple-style prompt:
// Asks whether to include the storage box number or share clean public details.
// Always shares the user panel view URL.
// Uses React Portal directly onto document.body to ensure backdrop click cleanly closes popup without opening photo viewer.

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Package, EyeOff, X } from "lucide-react";

interface AdminWhatsAppShareProps {
  id: string;
  brand: string;
  modelNumber: string;
  category: string;
  boxLocation: string | null;
  description?: string | null;
}

export default function AdminWhatsAppShare({
  id,
  brand,
  modelNumber,
  category,
  boxLocation,
  description,
}: AdminWhatsAppShareProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [publicUrl, setPublicUrl] = useState("");

  useEffect(() => {
    setMounted(true);
    // Generate public user panel item URL on client
    setPublicUrl(`${window.location.origin}/item/${id}`);
  }, [id]);

  // Lock body scroll and listen for Escape key when popup is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen]);

  // Clean formatted box string
  const cleanBox = boxLocation?.trim() || "";
  const displayBox = cleanBox ? cleanBox.toUpperCase() : "NOT ASSIGNED";

  const triggerShare = (includeBox: boolean) => {
    if (!publicUrl) return;

    let message = "";
    if (includeBox) {
      // With Storage Box in bold
      message = `📦 *STORAGE BOX: ${displayBox}*
────────────────────────
🏷️ *Part:* ${brand} ${modelNumber}
📁 *Category:* ${category}
${description?.trim() ? `📝 *Notes:* ${description.trim()}\n` : ""}
🔗 *Store Item Link:*
${publicUrl}`;
    } else {
      // Without Box (clean customer format)
      message = `🏷️ *TV Spare Part:* ${brand} ${modelNumber}
📁 *Category:* ${category}
${description?.trim() ? `📝 *Notes:* ${description.trim()}\n` : ""}
🔗 *View Item & Photos:*
${publicUrl}`;
    }

    const encoded = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/?text=${encoded}`;
    window.open(whatsappUrl, "_blank");
    setIsOpen(false);
  };

  const modalContent = isOpen ? (
    <div
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsOpen(false);
      }}
      onMouseDown={(e) => {
        e.stopPropagation();
      }}
      onTouchStart={(e) => {
        e.stopPropagation();
      }}
      onTouchEnd={(e) => {
        if (e.target === e.currentTarget) {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen(false);
        }
      }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999, // Supercedes all page elements, viewer modals, and navbars
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
        onTouchEnd={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "380px",
          backgroundColor: "#ffffff",
          borderRadius: "20px",
          padding: "24px 20px 20px",
          boxShadow: "0 25px 60px rgba(0, 0, 0, 0.25), 0 6px 20px rgba(0, 0, 0, 0.08)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
        }}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          aria-label="Close"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            width: "30px",
            height: "30px",
            borderRadius: "50%",
            background: "var(--color-bg-surface)",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--color-text-muted)",
          }}
        >
          <X size={16} />
        </button>

        {/* Header with WhatsApp badge */}
        <div style={{ textAlign: "center", marginBottom: "20px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "14px",
              background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ffffff",
              marginBottom: "12px",
              boxShadow: "0 4px 14px rgba(37, 211, 102, 0.35)",
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
          </div>

          <h2
            style={{
              fontSize: "17px",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
              margin: 0,
              lineHeight: 1.3,
            }}
          >
            Share on WhatsApp
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "var(--color-text-muted)",
              margin: "6px 0 0 0",
              lineHeight: 1.4,
            }}
          >
            Do you want to include the storage box number in the message?
          </p>
        </div>

        {/* Options List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {/* Option 1: Yes — Include Box Number */}
          <button
            type="button"
            onClick={() => triggerShare(true)}
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: "14px",
              border: "1.5px solid rgba(37, 99, 235, 0.3)",
              background: "rgba(37, 99, 235, 0.05)",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 140ms ease",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "var(--color-accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#ffffff",
                flexShrink: 0,
              }}
            >
              <Package size={19} strokeWidth={2.4} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--color-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "6px",
                }}
              >
                <span>Yes, Include Box</span>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    fontFamily: "var(--font-mono)",
                    fontVariantNumeric: "tabular-nums",
                    background: "rgba(37, 99, 235, 0.14)",
                    color: "var(--color-accent)",
                    padding: "2px 8px",
                    borderRadius: "100px",
                    maxWidth: "130px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {displayBox}
                </span>
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-secondary)",
                  margin: "3px 0 0 0",
                  lineHeight: 1.3,
                }}
              >
                Includes bold box number for staff dispatch
              </p>
            </div>
          </button>

          {/* Option 2: No — Without Box Number */}
          <button
            type="button"
            onClick={() => triggerShare(false)}
            style={{
              width: "100%",
              padding: "13px 16px",
              borderRadius: "14px",
              border: "1.5px solid var(--color-border)",
              background: "#ffffff",
              display: "flex",
              alignItems: "center",
              gap: "12px",
              cursor: "pointer",
              textAlign: "left",
              transition: "all 140ms ease",
            }}
          >
            <div
              style={{
                width: "36px",
                height: "36px",
                borderRadius: "10px",
                background: "var(--color-bg-surface)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-text-secondary)",
                flexShrink: 0,
              }}
            >
              <EyeOff size={18} />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontSize: "14px",
                  fontWeight: 700,
                  color: "var(--color-text-primary)",
                }}
              >
                No, Don&apos;t Include Box
              </div>
              <p
                style={{
                  fontSize: "12px",
                  color: "var(--color-text-muted)",
                  margin: "3px 0 0 0",
                  lineHeight: 1.3,
                }}
              >
                Clean part details & public link only
              </p>
            </div>
          </button>
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(false);
          }}
          style={{
            marginTop: "14px",
            width: "100%",
            padding: "10px",
            borderRadius: "10px",
            border: "none",
            background: "transparent",
            color: "var(--color-text-muted)",
            fontSize: "13px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  ) : null;

  return (
    <div style={{ marginTop: "16px", width: "100%" }}>
      {/* ── Single Premium WhatsApp Share Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        style={{
          width: "100%",
          minHeight: "42px",
          padding: "10px 18px",
          borderRadius: "12px",
          background: "linear-gradient(135deg, #25D366 0%, #128C7E 100%)",
          color: "#ffffff",
          border: "none",
          fontSize: "14px",
          fontWeight: 700,
          letterSpacing: "-0.01em",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "9px",
          cursor: "pointer",
          boxShadow: "0 3px 12px rgba(37, 211, 102, 0.28)",
          transition: "transform 160ms ease, box-shadow 160ms ease",
          userSelect: "none",
        }}
        title="Share on WhatsApp"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="19"
          height="19"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ flexShrink: 0 }}
        >
          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
        </svg>
        <span>Share on WhatsApp</span>
      </button>

      {/* ── Render directly to document.body via Portal ── */}
      {mounted && typeof document !== "undefined" && modalContent
        ? createPortal(modalContent, document.body)
        : null}
    </div>
  );
}
