"use client";
// src/components/admin/SlideToRestoreModal.tsx
// Premium Apple-inspired "Slide to Restore" modal confirmation with physics-based slider

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { RotateCcw, ChevronRight, Loader2, Package, CheckCircle2 } from "lucide-react";
import { restoreInventoryItem } from "@/app/actions/inventory";
import { clearAllInventoryCaches } from "@/lib/scroll-cache";
import toast from "react-hot-toast";

interface SlideToRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: {
    id: string;
    modelNumber: string;
    brand: { name: string };
    category?: string;
    boxLocation?: string | null;
    frontImage?: string;
  };
}

export default function SlideToRestoreModal({
  isOpen,
  onClose,
  item,
}: SlideToRestoreModalProps) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const startXRef = useRef(0);
  const currentDragRef = useRef(0);
  const isDraggingRef = useRef(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll
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
      if (e.key === "Escape" && !isRestoring && !isCompleted) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isRestoring, isCompleted, onClose]);

  const getMaxDrag = useCallback(() => {
    if (!trackRef.current) return 0;
    const trackWidth = trackRef.current.clientWidth;
    const thumbWidth = 50; // thumb size
    return Math.max(0, trackWidth - thumbWidth - 8); // 8px padding (4px each side)
  }, []);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setDragX(0);
      currentDragRef.current = 0;
      setIsDragging(false);
      isDraggingRef.current = false;
      setIsRestoring(false);
      setIsCompleted(false);
    }
  }, [isOpen]);

  const triggerRestore = useCallback(async () => {
    const maxDrag = getMaxDrag();
    setIsRestoring(true);
    setIsCompleted(true);
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
      const result = await restoreInventoryItem(item.id);
      if (result.success) {
        clearAllInventoryCaches();
        toast.success(`Restored ${item.brand.name} ${item.modelNumber}! Opening edit page…`, {
          icon: "✅",
          duration: 3500,
        });
        setTimeout(() => {
          onClose();
          try {
            router.refresh();
          } catch {}
          window.location.href = `/admin/inventory/${item.id}/edit`;
        }, 350);
      } else {
        toast.error(result.error || "Failed to restore item");
        setDragX(0);
        currentDragRef.current = 0;
        setIsRestoring(false);
        setIsCompleted(false);
      }
    } catch {
      toast.error("Failed to restore item. Please try again.");
      setDragX(0);
      currentDragRef.current = 0;
      setIsRestoring(false);
      setIsCompleted(false);
    }
  }, [getMaxDrag, item.id, item.brand.name, item.modelNumber, onClose, router]);

  const handleStart = (clientX: number) => {
    if (isRestoring || isCompleted) return;
    setIsDragging(true);
    isDraggingRef.current = true;
    startXRef.current = clientX - currentDragRef.current;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  const handleMove = useCallback(
    (clientX: number) => {
      if (!isDraggingRef.current || isRestoring || isCompleted) return;
      const maxDrag = getMaxDrag();
      if (maxDrag <= 0) return;

      const rawX = clientX - startXRef.current;
      const clampedX = Math.max(0, Math.min(rawX, maxDrag));
      currentDragRef.current = clampedX;
      setDragX(clampedX);

      // Check if threshold reached (86% of track)
      if (clampedX >= maxDrag * 0.86) {
        triggerRestore();
      }
    },
    [isRestoring, isCompleted, getMaxDrag, triggerRestore]
  );

  const handleEnd = useCallback(() => {
    if (!isDraggingRef.current || isRestoring || isCompleted) return;
    setIsDragging(false);
    isDraggingRef.current = false;
    const maxDrag = getMaxDrag();

    if (currentDragRef.current < maxDrag * 0.86) {
      // Spring back
      currentDragRef.current = 0;
      setDragX(0);
    }
  }, [isRestoring, isCompleted, getMaxDrag]);

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
  const textOpacity = Math.max(0, 1 - progress * 1.8);

  return createPortal(
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        animation: "restore-fade-in 200ms ease-out forwards",
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !isRestoring && !isCompleted) {
          onClose();
        }
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
          padding: "16px 20px calc(24px + env(safe-area-inset-bottom, 16px))",
          boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.12)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "16px",
          animation: "restore-slide-up 280ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
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

        {/* Action Icon Pill */}
        <div
          style={{
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            background: "rgba(34, 197, 94, 0.1)",
            border: "1px solid rgba(34, 197, 94, 0.2)",
            color: "#16a34a",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <RotateCcw size={22} strokeWidth={2.4} />
        </div>

        {/* Title & Description */}
        <div style={{ textAlign: "center" }}>
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 800,
              color: "var(--color-text-primary)",
              letterSpacing: "-0.02em",
              margin: 0,
            }}
          >
            Restore to Active Inventory
          </h2>
          <p
            style={{
              fontSize: "13px",
              color: "var(--color-text-muted)",
              margin: "4px 0 0 0",
              lineHeight: 1.4,
            }}
          >
            Slide below to restore and open edit page
          </p>
        </div>

        {/* Item Preview Card */}
        <div
          style={{
            width: "100%",
            background: "rgba(0, 0, 0, 0.025)",
            border: "1px solid rgba(0, 0, 0, 0.06)",
            borderRadius: "14px",
            padding: "10px 14px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          {item.frontImage ? (
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "10px",
                overflow: "hidden",
                background: "#f1f3f5",
                position: "relative",
                flexShrink: 0,
                border: "1px solid rgba(0, 0, 0, 0.06)",
              }}
            >
              <Image
                src={item.frontImage}
                alt={item.modelNumber}
                fill
                sizes="48px"
                style={{ objectFit: "contain", padding: "2px" }}
              />
            </div>
          ) : (
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "10px",
                background: "rgba(0, 113, 227, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-accent)",
                flexShrink: 0,
              }}
            >
              <Package size={20} />
            </div>
          )}

          <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <span
                style={{
                  fontSize: "11px",
                  fontWeight: 800,
                  textTransform: "uppercase",
                  color: "var(--color-accent)",
                }}
              >
                {item.brand.name}
              </span>
              {item.category && (
                <span
                  style={{
                    fontSize: "10px",
                    fontWeight: 700,
                    padding: "1px 5px",
                    borderRadius: "4px",
                    background: "rgba(0,0,0,0.05)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {item.category}
                </span>
              )}
            </div>
            <div
              style={{
                fontSize: "14.5px",
                fontWeight: 700,
                color: "var(--color-text-primary)",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
                marginTop: "1px",
              }}
            >
              {item.modelNumber}
            </div>
            {item.boxLocation && (
              <div
                style={{
                  fontSize: "11.5px",
                  color: "var(--color-text-muted)",
                  marginTop: "2px",
                }}
              >
                Box: <strong style={{ color: "var(--color-text-secondary)" }}>{item.boxLocation}</strong>
              </div>
            )}
          </div>
        </div>

        {/* ── Slide to Restore Track ── */}
        <div style={{ width: "100%", marginTop: "2px" }}>
          <div
            ref={trackRef}
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
            {/* Progress Capsule Fill */}
            <div
              style={{
                position: "absolute",
                top: "4px",
                bottom: "4px",
                left: "4px",
                width: dragX > 0 ? `${dragX + 50}px` : "0px",
                opacity: dragX > 0 ? 1 : 0,
                borderRadius: "100px",
                background: "linear-gradient(90deg, rgba(34, 197, 94, 0.14) 0%, rgba(34, 197, 94, 0.85) 100%)",
                boxShadow: "0 0 12px rgba(34, 197, 94, 0.25)",
                transition: isDragging ? "none" : "width 260ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 150ms ease",
                pointerEvents: "none",
                willChange: "width, opacity",
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
                paddingLeft: "36px",
                pointerEvents: "none",
                fontSize: "13px",
                fontWeight: 700,
                letterSpacing: "0.02em",
                color: progress > 0.45 ? "#ffffff" : "#16a34a",
                transition: "color 150ms ease, opacity 150ms ease",
                opacity: textOpacity,
              }}
            >
              {isRestoring || isCompleted ? (
                <span>Restoring Item…</span>
              ) : (
                <span
                  className="restore-shimmer-text"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                  }}
                >
                  <span>slide to restore</span>
                  <ChevronRight size={14} strokeWidth={2.5} style={{ opacity: 0.6 }} />
                  <ChevronRight size={14} strokeWidth={2.5} style={{ opacity: 0.9, marginLeft: -6 }} />
                </span>
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
                background: isRestoring || isCompleted ? "#16a34a" : "#ffffff",
                border: "0.5px solid rgba(0, 0, 0, 0.04)",
                boxShadow: isDragging
                  ? "0 8px 24px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.12)"
                  : "0 3px 12px rgba(0, 0, 0, 0.14), 0 1px 3px rgba(0, 0, 0, 0.08)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: isRestoring || isCompleted ? "wait" : isDragging ? "grabbing" : "grab",
                color: isRestoring || isCompleted ? "#ffffff" : "#16a34a",
                zIndex: 2,
                willChange: "transform",
                touchAction: "none",
              }}
            >
              {isRestoring || isCompleted ? (
                <Loader2 size={20} className="animate-spin" color="#ffffff" />
              ) : (
                <RotateCcw size={20} strokeWidth={2.4} />
              )}
            </div>
          </div>
        </div>

        {/* Cancel Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isRestoring || isCompleted}
          className="btn-secondary"
          style={{
            width: "100%",
            padding: "12px",
            fontSize: "14px",
            fontWeight: 600,
            borderRadius: "100px",
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-card)",
            color: "var(--color-text-secondary)",
            cursor: isRestoring ? "not-allowed" : "pointer",
            marginTop: "2px",
          }}
        >
          Cancel
        </button>
      </div>

      <style jsx global>{`
        @keyframes restore-fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes restore-slide-up {
          from { transform: translateY(100%); }
          to { transform: translateY(0); }
        }
        @keyframes restore-text-shimmer {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .restore-shimmer-text {
          animation: restore-text-shimmer 2s ease-in-out infinite;
        }
      `}</style>
    </div>,
    document.body
  );
}
