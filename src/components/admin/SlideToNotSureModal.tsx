"use client";
// src/components/admin/SlideToNotSureModal.tsx
// Premium Apple/iOS-inspired "Slide to Confirm" bottom sheet popup
// Opens when marking an item as "Not Sure".
// Requires typing remarks/reason before the slider is unlocked.

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, ChevronRight, Loader2, Package, MessageSquareText } from "lucide-react";

interface SlideToNotSureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (remarks: string) => Promise<boolean | void>;
  modelNumber: string;
  brand?: string;
  boxLocation?: string | null;
}

export default function SlideToNotSureModal({
  isOpen,
  onClose,
  onConfirm,
  modelNumber,
  brand,
  boxLocation,
}: SlideToNotSureModalProps) {
  const [remarks, setRemarks] = useState("");
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [maxDrag, setMaxDrag] = useState(240);
  const [mounted, setMounted] = useState(false);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Slider is only enabled when remarks are provided (at least 2 characters)
  const isSliderEnabled = remarks.trim().length >= 2;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset fields when opened
  useEffect(() => {
    if (isOpen) {
      setRemarks("");
      setDragX(0);
      setIsSubmitting(false);

      if (trackRef.current) {
        const trackWidth = trackRef.current.clientWidth;
        const thumbWidth = 46;
        const padding = 8; // 4px left + 4px right
        setMaxDrag(Math.max(100, trackWidth - thumbWidth - padding));
      }
    }
  }, [isOpen]);

  // Lock body scroll and listen for Escape key
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !isSubmitting) {
          onClose();
        }
      };

      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, isSubmitting, onClose]);

  const triggerConfirm = useCallback(async () => {
    if (!isSliderEnabled || isSubmitting) return;

    setIsSubmitting(true);
    setIsDragging(false);
    isDraggingRef.current = false;
    setDragX(maxDrag);

    // Haptic vibration feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(40);
      } catch {}
    }

    try {
      const success = await onConfirm(remarks.trim());
      if (success === false) {
        setDragX(0);
        setIsSubmitting(false);
      }
    } catch {
      setDragX(0);
      setIsSubmitting(false);
    }
  }, [isSliderEnabled, isSubmitting, maxDrag, onConfirm, remarks]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isSubmitting || !isSliderEnabled) return;
    setIsDragging(true);
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].clientX - dragX;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDraggingRef.current || isSubmitting || !isSliderEnabled) return;
      if (e.cancelable) e.preventDefault();
      const clientX = e.touches[0].clientX;
      const newX = Math.max(0, Math.min(clientX - startXRef.current, maxDrag));
      setDragX(newX);

      if (newX >= maxDrag * 0.86) {
        triggerConfirm();
      }
    },
    [isSliderEnabled, maxDrag, isSubmitting, triggerConfirm]
  );

  const handleTouchEnd = useCallback(() => {
    if (isSubmitting) return;
    setIsDragging(false);
    isDraggingRef.current = false;
    setDragX(0);
  }, [isSubmitting]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSubmitting || !isSliderEnabled) return;
    setIsDragging(true);
    isDraggingRef.current = true;
    startXRef.current = e.clientX - dragX;
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || isSubmitting || !isSliderEnabled) return;
      const newX = Math.max(0, Math.min(e.clientX - startXRef.current, maxDrag));
      setDragX(newX);

      if (newX >= maxDrag * 0.86) {
        triggerConfirm();
      }
    },
    [isSliderEnabled, maxDrag, isSubmitting, triggerConfirm]
  );

  const handleMouseUp = useCallback(() => {
    if (isSubmitting) return;
    setIsDragging(false);
    isDraggingRef.current = false;
    setDragX(0);
  }, [isSubmitting]);

  // Global listeners for smooth dragging outside track
  useEffect(() => {
    if (!isOpen) return;

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove, { passive: false });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  }, [isOpen, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd]);

  if (!isOpen || !mounted) return null;

  const dragPercent = Math.min(1, dragX / (maxDrag || 1));
  const textOpacity = Math.max(0, 1 - dragPercent * 1.6);
  const cleanBox = boxLocation?.trim() || "";

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999, // Above all navigation, headers, and dialogs
        background: "rgba(0, 0, 0, 0.52)",
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end", // iOS bottom sheet
        animation: "not-sure-backdrop 200ms ease-out forwards",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
    >
      {/* Bottom Sheet Container */}
      <div
        style={{
          width: "100%",
          maxWidth: "460px",
          margin: "0 auto",
          background: "#ffffff",
          borderTopLeftRadius: "28px",
          borderTopRightRadius: "28px",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          borderBottom: "none",
          padding: "14px 20px calc(24px + env(safe-area-inset-bottom, 16px))",
          boxShadow: "0 -10px 40px rgba(0, 0, 0, 0.16)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "14px",
          animation: "not-sure-slide-up 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* iOS Grabber Handle */}
        <div
          style={{
            width: "38px",
            height: "4px",
            borderRadius: "2px",
            background: "rgba(0, 0, 0, 0.2)",
            marginBottom: "2px",
          }}
        />

        {/* Amber Icon Badge & Header */}
        <div
          style={{
            textAlign: "center",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "6px",
            width: "100%",
          }}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "rgba(245, 158, 11, 0.12)",
              border: "1.5px solid rgba(245, 158, 11, 0.28)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#d97706",
              boxShadow: "0 2px 12px rgba(245, 158, 11, 0.18)",
            }}
          >
            <AlertTriangle size={22} strokeWidth={2.2} />
          </div>

          <div>
            <h3
              style={{
                fontSize: "17.5px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--color-text-primary)",
                margin: 0,
              }}
            >
              Mark as &quot;Not Sure&quot;
            </h3>
            <p
              style={{
                fontSize: "12.5px",
                color: "var(--color-text-secondary)",
                marginTop: "3px",
                marginBottom: 0,
              }}
            >
              Enter remarks to unlock the confirmation slider
            </p>
          </div>
        </div>

        {/* Item Summary Card */}
        <div
          style={{
            width: "100%",
            borderRadius: "14px",
            background: "rgba(245, 158, 11, 0.07)",
            border: "1px solid rgba(245, 158, 11, 0.22)",
            padding: "10px 12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
          }}
        >
          <div style={{ minWidth: 0, flex: 1 }}>
            <span
              style={{
                fontSize: "10.5px",
                fontWeight: 700,
                color: "#b45309",
                textTransform: "uppercase",
                letterSpacing: "0.04em",
                display: "block",
              }}
            >
              Spare Part
            </span>
            <span
              style={{
                fontSize: "14px",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                display: "block",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {brand ? `${brand} ` : ""}
              {modelNumber}
            </span>
          </div>

          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "5px",
              padding: "4px 8px",
              borderRadius: "7px",
              background: cleanBox ? "#fef3c7" : "rgba(0, 0, 0, 0.05)",
              border: cleanBox ? "1.5px solid #f59e0b" : "1px dashed #cbd5e1",
              flexShrink: 0,
            }}
          >
            <Package size={13} color={cleanBox ? "#b45309" : "#64748b"} />
            <span
              style={{
                fontSize: "12px",
                fontWeight: 800,
                color: cleanBox ? "#92400e" : "#64748b",
              }}
            >
              {cleanBox ? `BOX: ${cleanBox.toUpperCase()}` : "NO BOX"}
            </span>
          </div>
        </div>

        {/* ── REQUIRED REMARKS INPUT ── */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "5px" }}>
          <label
            htmlFor="not-sure-remarks"
            style={{
              fontSize: "12px",
              fontWeight: 700,
              color: "var(--color-text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: "5px",
            }}
          >
            <MessageSquareText size={14} color="#d97706" />
            <span>Staff Remarks / Reason (Required)</span>
          </label>
          <textarea
            id="not-sure-remarks"
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            disabled={isSubmitting}
            placeholder="e.g. Staff Rahul took it to test customer TV..."
            style={{
              width: "100%",
              padding: "9px 12px",
              borderRadius: "12px",
              background: "#f8f9fa",
              border: isSliderEnabled
                ? "1.5px solid #f59e0b"
                : "1.5px solid rgba(0, 0, 0, 0.12)",
              outline: "none",
              fontSize: "13px",
              color: "var(--color-text-primary)",
              resize: "none",
              fontFamily: "inherit",
              boxShadow: isSliderEnabled
                ? "0 0 0 3px rgba(245, 158, 11, 0.15)"
                : "none",
              transition: "border-color 150ms ease, box-shadow 150ms ease",
            }}
          />

          {/* Helper feedback text */}
          <span
            style={{
              fontSize: "11px",
              fontWeight: 600,
              color: isSliderEnabled ? "#15803d" : "#b45309",
              display: "flex",
              alignItems: "center",
              gap: "4px",
            }}
          >
            {isSliderEnabled
              ? "✅ Remarks entered! Slide below to confirm."
              : "⚠️ Type who took it or reason above to unlock slider."}
          </span>
        </div>

        {/* ── INTERACTIVE SLIDER TRACK (UNLOCKS WHEN REMARKS TYPED) ── */}
        <div
          ref={trackRef}
          style={{
            position: "relative",
            width: "100%",
            height: "54px",
            borderRadius: "100px",
            background: isSliderEnabled ? "rgba(245, 158, 11, 0.08)" : "rgba(0, 0, 0, 0.04)",
            border: isSliderEnabled
              ? "1.5px solid rgba(245, 158, 11, 0.45)"
              : "1.5px dashed rgba(0, 0, 0, 0.15)",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            userSelect: "none",
            WebkitUserSelect: "none",
            touchAction: "none",
            opacity: isSliderEnabled ? 1 : 0.48,
            cursor: isSliderEnabled ? (isDragging ? "grabbing" : "grab") : "not-allowed",
            boxShadow: isSliderEnabled ? "inset 0 1.5px 3px rgba(245, 158, 11, 0.1)" : "none",
            transition: "all 200ms ease",
          }}
        >
          {/* Progress Capsule Fill (Inset pill perfectly hugging the circular thumb) */}
          {isSliderEnabled && (
            <div
              style={{
                position: "absolute",
                top: "4px",
                bottom: "4px",
                left: "4px",
                width: dragX > 0 ? `${dragX + 46}px` : "0px",
                opacity: dragX > 0 ? 1 : 0,
                borderRadius: "100px",
                background:
                  "linear-gradient(90deg, rgba(245, 158, 11, 0.16) 0%, rgba(245, 158, 11, 0.85) 100%)",
                boxShadow: "0 0 12px rgba(245, 158, 11, 0.28)",
                transition: isDragging
                  ? "none"
                  : "width 260ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 150ms ease",
                pointerEvents: "none",
                willChange: "width, opacity",
              }}
            />
          )}

          {/* Track Label */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              paddingLeft: "34px",
              pointerEvents: "none",
              opacity: isSliderEnabled ? textOpacity : 0.8,
              transition: isDragging ? "none" : "opacity 200ms ease",
            }}
          >
            <span
              className={isSliderEnabled ? "slider-shimmer-text" : ""}
              style={{
                fontSize: "12.5px",
                fontWeight: 700,
                letterSpacing: "0.01em",
                color: isSliderEnabled ? "#b45309" : "var(--color-text-muted)",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>
                {isSliderEnabled ? "slide to mark not sure" : "enter remarks to unlock"}
              </span>
              {isSliderEnabled && (
                <>
                  <ChevronRight size={13} strokeWidth={2.5} style={{ opacity: 0.6 }} />
                  <ChevronRight
                    size={13}
                    strokeWidth={2.5}
                    style={{ opacity: 0.9, marginLeft: -5 }}
                  />
                </>
              )}
            </span>
          </div>

          {/* Slider Thumb */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
              position: "absolute",
              left: "4px",
              top: "4px",
              width: "46px",
              height: "46px",
              borderRadius: "50%",
              background: isSubmitting
                ? "#f59e0b"
                : isSliderEnabled
                ? "#ffffff"
                : "rgba(0, 0, 0, 0.08)",
              color: isSubmitting
                ? "#ffffff"
                : isSliderEnabled
                ? "#d97706"
                : "#94a3b8",
              border: isSliderEnabled ? "0.5px solid rgba(0, 0, 0, 0.04)" : "none",
              boxShadow: isSliderEnabled
                ? isDragging
                  ? "0 8px 24px rgba(245, 158, 11, 0.35), 0 2px 6px rgba(0, 0, 0, 0.12)"
                  : "0 3px 12px rgba(245, 158, 11, 0.25), 0 1px 3px rgba(0, 0, 0, 0.08)"
                : "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isSubmitting
                ? "wait"
                : isSliderEnabled
                ? (isDragging ? "grabbing" : "grab")
                : "not-allowed",
              transform: `translateX(${dragX}px) scale(${isDragging ? 1.04 : 1})`,
              transition: isDragging
                ? "none"
                : "transform 260ms cubic-bezier(0.2, 0.9, 0.3, 1), background-color 200ms ease, box-shadow 200ms ease",
              zIndex: 2,
              willChange: "transform",
              touchAction: "none",
            }}
          >
            {isSubmitting ? (
              <Loader2 size={18} className="animate-spin" color="#ffffff" />
            ) : (
              <AlertTriangle size={18} strokeWidth={2.4} />
            )}
          </div>
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="btn-secondary"
          style={{
            width: "100%",
            padding: "11px",
            borderRadius: "100px",
            fontSize: "13.5px",
            fontWeight: 600,
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes not-sure-backdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes not-sure-slide-up {
          from {
            transform: translateY(100%);
            opacity: 0.8;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes not-sure-shimmer {
          0% { opacity: 0.45; }
          50% { opacity: 0.95; }
          100% { opacity: 0.45; }
        }

        .slider-shimmer-text {
          animation: not-sure-shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );

  return createPortal(modalContent, document.body);
}
