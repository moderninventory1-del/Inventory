"use client";
// src/components/admin/SlideToDeleteModal.tsx
// Premium Apple-inspired "Slide to Delete" modal confirmation with physics-based slider

import { useEffect, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { Trash2, ChevronRight, Loader2, X, AlertTriangle } from "lucide-react";
import type { InventoryItem } from "@/types";

interface SlideToDeleteModalProps {
  isOpen: boolean;
  item: {
    id: string;
    modelNumber: string;
    brand: { name: string };
    category?: string;
    boxLocation?: string | null;
    frontImage?: string;
  };
  isDeleting: boolean;
  onConfirm: () => Promise<void> | void;
  onClose: () => void;
}

export default function SlideToDeleteModal({
  isOpen,
  item,
  isDeleting,
  onConfirm,
  onClose,
}: SlideToDeleteModalProps) {
  const [mounted, setMounted] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const startXRef = useRef(0);
  const currentDragRef = useRef(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset slider position when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setDragX(0);
      setIsDragging(false);
      setIsCompleted(false);
      currentDragRef.current = 0;
    }
  }, [isOpen]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  // Handle keyboard Escape
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isDeleting && !isCompleted) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isDeleting, isCompleted, onClose]);

  const getMaxDrag = useCallback(() => {
    if (!trackRef.current) return 0;
    const trackWidth = trackRef.current.clientWidth;
    const thumbWidth = 50; // thumb size
    return Math.max(0, trackWidth - thumbWidth - 8); // 8px total padding (4px each side)
  }, []);

  const handleStart = (clientX: number) => {
    if (isDeleting || isCompleted) return;
    setIsDragging(true);
    startXRef.current = clientX - currentDragRef.current;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDragging || isDeleting || isCompleted) return;
      const maxDrag = getMaxDrag();
      if (maxDrag <= 0) return;

      const rawX = clientX - startXRef.current;
      const clampedX = Math.max(0, Math.min(rawX, maxDrag));
      currentDragRef.current = clampedX;
      setDragX(clampedX);

      // Check if threshold reached (86% of track)
      if (clampedX >= maxDrag * 0.86) {
        setIsDragging(false);
        setIsCompleted(true);
        setDragX(maxDrag);
        if (typeof navigator !== "undefined" && navigator.vibrate) {
          try {
            navigator.vibrate(40);
          } catch {}
        }
        onConfirm();
      }
    },
    [isDragging, isDeleting, isCompleted, getMaxDrag, onConfirm]
  );

  const handleEnd = useCallback(() => {
    if (!isDragging || isDeleting || isCompleted) return;
    setIsDragging(false);
    const maxDrag = getMaxDrag();

    if (currentDragRef.current < maxDrag * 0.86) {
      // Spring back
      currentDragRef.current = 0;
      setDragX(0);
    }
  }, [isDragging, isDeleting, isCompleted, getMaxDrag]);

  // Touch event listeners
  const onTouchStart = (e: React.TouchEvent) => {
    handleStart(e.touches[0].clientX);
  };

  // Mouse event listeners for desktop drag
  const onMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    handleStart(e.clientX);
  };

  useEffect(() => {
    if (!isDragging) return;

    const onWindowMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX);
    };
    const onWindowMouseUp = () => {
      handleEnd();
    };
    const onWindowTouchMove = (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      handleMove(e.touches[0].clientX);
    };
    const onWindowTouchEnd = () => {
      handleEnd();
    };

    window.addEventListener("mousemove", onWindowMouseMove);
    window.addEventListener("mouseup", onWindowMouseUp);
    window.addEventListener("touchmove", onWindowTouchMove, { passive: false });
    window.addEventListener("touchend", onWindowTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onWindowMouseMove);
      window.removeEventListener("mouseup", onWindowMouseUp);
      window.removeEventListener("touchmove", onWindowTouchMove);
      window.removeEventListener("touchend", onWindowTouchEnd);
    };
  }, [isDragging, handleMove, handleEnd]);

  if (!isOpen || !mounted) return null;

  const maxDrag = getMaxDrag();
  const progress = maxDrag > 0 ? Math.min(1, dragX / maxDrag) : 0;

  return createPortal(
    <div
      className="slide-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isDeleting && !isCompleted) {
          onClose();
        }
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 99999,
        background: "rgba(0, 0, 0, 0.48)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
        animation: "fadeIn 200ms cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      <div
        className="slide-modal-card"
        style={{
          width: "100%",
          maxWidth: "420px",
          background: "#ffffff",
          borderRadius: "24px",
          padding: "24px",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.22), 0 2px 10px rgba(0, 0, 0, 0.04)",
          border: "1px solid rgba(255, 59, 48, 0.16)",
          display: "flex",
          flexDirection: "column",
          gap: "18px",
          position: "relative",
          animation: "scaleIn 220ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
      >
        {/* Close icon in corner */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting || isCompleted}
          aria-label="Close dialog"
          style={{
            position: "absolute",
            top: "16px",
            right: "16px",
            background: "rgba(0, 0, 0, 0.05)",
            border: "none",
            borderRadius: "50%",
            width: "30px",
            height: "30px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "#64748b",
            transition: "all 150ms ease",
          }}
        >
          <X size={15} />
        </button>

        {/* Danger Header Icon & Title */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "10px", marginTop: "4px" }}>
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              background: "rgba(255, 59, 48, 0.1)",
              border: "1px solid rgba(255, 59, 48, 0.25)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ff3b30",
              boxShadow: "0 4px 16px rgba(255, 59, 48, 0.15)",
            }}
          >
            <Trash2 size={26} strokeWidth={2.2} />
          </div>

          <div>
            <h2
              style={{
                fontSize: "20px",
                fontWeight: 800,
                color: "#1d1d1f",
                letterSpacing: "-0.03em",
                margin: 0,
              }}
            >
              Delete Inventory Item?
            </h2>
            <p
              style={{
                fontSize: "13px",
                color: "#64748b",
                margin: "4px 0 0",
                lineHeight: 1.45,
              }}
            >
              This item will be moved to trash and removed from public view.
            </p>
          </div>
        </div>

        {/* Item Summary Card */}
        <div
          style={{
            background: "rgba(0, 0, 0, 0.03)",
            borderRadius: "14px",
            padding: "12px 14px",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            display: "flex",
            flexDirection: "column",
            gap: "5px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--color-accent)", letterSpacing: "0.03em" }}>
              {item.brand.name}
            </span>
            <span style={{ fontSize: "11px", color: "#64748b", background: "#ffffff", padding: "2px 7px", borderRadius: "100px", border: "1px solid rgba(0,0,0,0.06)" }}>
              {item.category}
            </span>
          </div>

          <div style={{ fontSize: "15px", fontWeight: 700, color: "#1d1d1f", wordBreak: "break-word" }}>
            {item.modelNumber}
          </div>

          {item.boxLocation && (
            <div style={{ fontSize: "12px", color: "#64748b", display: "flex", alignItems: "center", gap: "4px", marginTop: "2px" }}>
              <span>📍 Location:</span>
              <strong style={{ color: "#1d1d1f" }}>{item.boxLocation}</strong>
            </div>
          )}
        </div>

        {/* ── Slide To Delete Track ── */}
        <div style={{ marginTop: "4px" }}>
          <div
            ref={trackRef}
            className="slide-track"
            style={{
              position: "relative",
              height: "58px",
              borderRadius: "100px",
              background: "rgba(0, 0, 0, 0.04)",
              boxShadow: "inset 0 1.5px 4px rgba(0, 0, 0, 0.06)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              overflow: "hidden",
              userSelect: "none",
              WebkitUserSelect: "none",
              touchAction: "none",
            }}
          >
            {/* Progress Capsule Fill (Inset pill perfectly hugging the circular thumb) */}
            <div
              style={{
                position: "absolute",
                top: "4px",
                bottom: "4px",
                left: "4px",
                width: dragX > 0 ? `${dragX + 50}px` : "0px",
                opacity: dragX > 0 ? 1 : 0,
                borderRadius: "100px",
                background: "linear-gradient(90deg, rgba(255, 59, 48, 0.14) 0%, rgba(255, 59, 48, 0.85) 100%)",
                boxShadow: "0 0 12px rgba(255, 59, 48, 0.25)",
                transition: isDragging ? "none" : "width 260ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 150ms ease",
                pointerEvents: "none",
                willChange: "width, opacity",
              }}
            />

            {/* Shimmer Label Text */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                paddingLeft: "36px",
                pointerEvents: "none",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: progress > 0.45 ? "#ffffff" : "#64748b",
                transition: "color 150ms ease, opacity 150ms ease",
                opacity: progress > 0.8 ? 0.3 : 1,
              }}
            >
              {isDeleting || isCompleted ? (
                <span>Deleting Item…</span>
              ) : (
                <span className="shimmer-text">Slide to Delete ❯❯❯</span>
              )}
            </div>

            {/* Draggable Slider Thumb / Knob */}
            <div
              onTouchStart={onTouchStart}
              onMouseDown={onMouseDown}
              style={{
                position: "absolute",
                top: "4px",
                left: "4px",
                transform: `translateX(${dragX}px) scale(${isDragging ? 1.04 : 1})`,
                transition: isDragging ? "none" : "transform 260ms cubic-bezier(0.2, 0.9, 0.3, 1), background-color 200ms ease, box-shadow 200ms ease",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                background: isDeleting || isCompleted ? "#ff3b30" : "#ffffff",
                border: "0.5px solid rgba(0, 0, 0, 0.04)",
                boxShadow: isDragging
                  ? "0 8px 24px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.12)"
                  : "0 3px 12px rgba(0, 0, 0, 0.14), 0 1px 3px rgba(0, 0, 0, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: isDeleting || isCompleted ? "default" : isDragging ? "grabbing" : "grab",
                color: isDeleting || isCompleted ? "#ffffff" : "#ff3b30",
                zIndex: 2,
                willChange: "transform",
                touchAction: "none",
              }}
            >
              {isDeleting || isCompleted ? (
                <Loader2 size={20} className="animate-spin" color="#ffffff" />
              ) : (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Trash2 size={20} strokeWidth={2.4} />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isDeleting || isCompleted}
          style={{
            background: "transparent",
            border: "none",
            color: "#64748b",
            fontSize: "13.5px",
            fontWeight: 600,
            cursor: "pointer",
            padding: "8px",
            textAlign: "center",
            borderRadius: "10px",
            transition: "all 150ms ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#1d1d1f")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92) translateY(10px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .shimmer-text {
          background: linear-gradient(90deg, #64748b 0%, #1d1d1f 50%, #64748b 100%);
          background-size: 200% 100%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmer 2.2s infinite linear;
        }
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>,
    document.body
  );
}
