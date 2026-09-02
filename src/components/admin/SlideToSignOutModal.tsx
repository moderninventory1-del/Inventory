"use client";
// src/components/admin/SlideToSignOutModal.tsx
// Premium Apple-style "Slide to Sign Out" bottom sheet popup for mobile

import { useState, useRef, useEffect, useCallback } from "react";
import { signOut } from "next-auth/react";
import { LogOut, ChevronRight, Loader2 } from "lucide-react";

interface SlideToSignOutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SlideToSignOutModal({
  isOpen,
  onClose,
}: SlideToSignOutModalProps) {
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [maxDrag, setMaxDrag] = useState(240);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef(0);
  const isDraggingRef = useRef(false);

  // Measure track width
  useEffect(() => {
    if (isOpen && trackRef.current) {
      const trackWidth = trackRef.current.clientWidth;
      const thumbWidth = 48; // thumb width
      const padding = 10; // total horizontal padding
      setMaxDrag(Math.max(100, trackWidth - thumbWidth - padding));
      setDragX(0);
      setIsSigningOut(false);
    }
  }, [isOpen]);

  const triggerSignOut = useCallback(() => {
    setIsSigningOut(true);
    setIsDragging(false);
    isDraggingRef.current = false;
    setDragX(maxDrag);
    setTimeout(() => {
      signOut({ callbackUrl: "/login" });
    }, 400);
  }, [maxDrag]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    if (isSigningOut) return;
    setIsDragging(true);
    isDraggingRef.current = true;
    startXRef.current = e.touches[0].clientX - dragX;
  };

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isDraggingRef.current || isSigningOut) return;
      const clientX = e.touches[0].clientX;
      const newX = Math.max(0, Math.min(clientX - startXRef.current, maxDrag));
      setDragX(newX);

      if (newX >= maxDrag * 0.88) {
        triggerSignOut();
      }
    },
    [maxDrag, isSigningOut, triggerSignOut]
  );

  const handleTouchEnd = useCallback(() => {
    if (isSigningOut) return;
    setIsDragging(false);
    isDraggingRef.current = false;
    setDragX(0); // Snap back to start
  }, [isSigningOut]);

  // Mouse handlers (for testing on desktop/emulator)
  const handleMouseDown = (e: React.MouseEvent) => {
    if (isSigningOut) return;
    setIsDragging(true);
    isDraggingRef.current = true;
    startXRef.current = e.clientX - dragX;
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isDraggingRef.current || isSigningOut) return;
      const newX = Math.max(0, Math.min(e.clientX - startXRef.current, maxDrag));
      setDragX(newX);

      if (newX >= maxDrag * 0.88) {
        triggerSignOut();
      }
    },
    [maxDrag, isSigningOut, triggerSignOut]
  );

  const handleMouseUp = useCallback(() => {
    if (isSigningOut) return;
    setIsDragging(false);
    isDraggingRef.current = false;
    setDragX(0);
  }, [isSigningOut]);

  // Global event listeners for smooth drag continuation
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

  if (!isOpen) return null;

  const dragPercent = Math.min(1, dragX / (maxDrag || 1));
  const textOpacity = Math.max(0, 1 - dragPercent * 1.6);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 100,
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        animation: "slide-backdrop 200ms ease-out forwards",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSigningOut) onClose();
      }}
    >
      {/* Bottom Sheet Container */}
      <div
        className="slide-sheet-content"
        style={{
          width: "100%",
          maxWidth: "460px",
          margin: "0 auto",
          background: "#ffffff",
          borderTopLeftRadius: "28px",
          borderTopRightRadius: "28px",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          borderBottom: "none",
          padding: "16px 20px calc(24px + env(safe-area-inset-bottom, 16px))",
          boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.12)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "18px",
          animation: "slide-up 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* iOS Grabber Pill */}
        <div
          style={{
            width: "36px",
            height: "4px",
            borderRadius: "2px",
            background: "rgba(0, 0, 0, 0.18)",
            marginBottom: "2px",
          }}
        />

        {/* Icon & Title */}
        <div style={{ textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "8px" }}>
          <div
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "50%",
              background: "rgba(255, 59, 48, 0.08)",
              border: "1.5px solid rgba(255, 59, 48, 0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#ff3b30",
              boxShadow: "0 2px 10px rgba(255, 59, 48, 0.1)",
            }}
          >
            <LogOut size={22} strokeWidth={2.2} />
          </div>

          <div>
            <h3
              style={{
                fontSize: "18px",
                fontWeight: 700,
                letterSpacing: "-0.02em",
                color: "var(--color-text-primary)",
              }}
            >
              Sign Out of Admin
            </h3>
            <p
              style={{
                fontSize: "13px",
                color: "var(--color-text-muted)",
                marginTop: "2px",
              }}
            >
              Slide the slider to end your admin session
            </p>
          </div>
        </div>

        {/* Interactive Slider Track */}
        <div
          ref={trackRef}
          style={{
            position: "relative",
            width: "100%",
            height: "58px",
            borderRadius: "100px",
            background: "rgba(0, 0, 0, 0.04)",
            border: "1.5px solid rgba(0, 0, 0, 0.07)",
            display: "flex",
            alignItems: "center",
            overflow: "hidden",
            userSelect: "none",
            touchAction: "none",
            boxShadow: "inset 0 1px 3px rgba(0, 0, 0, 0.04)",
          }}
        >
          {/* Progress fill behind thumb */}
          <div
            style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              left: 0,
              width: `${dragX + 50}px`,
              background: "linear-gradient(90deg, rgba(255, 59, 48, 0.08), rgba(255, 59, 48, 0.22))",
              transition: isDragging ? "none" : "width 240ms cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          />

          {/* Shimmer Track Label */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pointerEvents: "none",
              opacity: textOpacity,
              transition: isDragging ? "none" : "opacity 200ms ease",
            }}
          >
            <span
              className="slider-shimmer-text"
              style={{
                fontSize: "13px",
                fontWeight: 600,
                letterSpacing: "0.02em",
                color: "var(--color-text-secondary)",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
              }}
            >
              <span>slide to sign out</span>
              <ChevronRight size={14} strokeWidth={2.5} style={{ opacity: 0.6 }} />
              <ChevronRight size={14} strokeWidth={2.5} style={{ opacity: 0.9, marginLeft: -6 }} />
            </span>
          </div>

          {/* Slider Thumb */}
          <div
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            style={{
              position: "absolute",
              left: "5px",
              top: "5px",
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: isSigningOut ? "#ff3b30" : "#ffffff",
              color: isSigningOut ? "#ffffff" : "#ff3b30",
              boxShadow: "0 3px 12px rgba(0, 0, 0, 0.16), 0 1px 4px rgba(0, 0, 0, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: isSigningOut ? "wait" : "grab",
              transform: `translateX(${dragX}px)`,
              transition: isDragging ? "none" : "transform 240ms cubic-bezier(0.16, 1, 0.3, 1), background-color 200ms ease",
              zIndex: 2,
            }}
          >
            {isSigningOut ? (
              <Loader2 size={20} className="animate-spin" color="#ffffff" />
            ) : (
              <LogOut size={20} strokeWidth={2.2} style={{ marginLeft: "2px" }} />
            )}
          </div>
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSigningOut}
          className="btn-secondary"
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "100px",
            fontSize: "14px",
            fontWeight: 600,
          }}
        >
          Cancel
        </button>
      </div>

      <style>{`
        @keyframes slide-backdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slide-up {
          from {
            transform: translateY(100%);
            opacity: 0.8;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes text-shimmer {
          0% { opacity: 0.45; }
          50% { opacity: 0.95; }
          100% { opacity: 0.45; }
        }

        .slider-shimmer-text {
          animation: text-shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
