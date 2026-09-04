"use client";
// src/components/admin/AdminNotSureModal.tsx
// Ultra-premium Apple iOS "Stock Verification" bottom sheet modal:
// - SINGLE-VIEW: Everything (uncropped image, model, box, notes, slider) fits in one view without scrolling.
// - SLIDE TO CONFIRM: Instant physical slider to confirm keeping or deleting (no annoying 1-2 text prompts).
// - SWIPE UP TO NEXT: Swipe up to flip smoothly to the next item.
// - Tap photo to view item directly in admin panel.

import { useState, useEffect, useCallback, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  ShieldAlert,
  Package,
  CheckCircle2,
  Trash2,
  Clock,
  ExternalLink,
  Loader2,
  Bell,
  X,
  FileText,
  ChevronUp,
  ChevronDown,
  ChevronRight,
  MessageSquareText,
} from "lucide-react";
import { resolveNotSureItem } from "@/app/actions/inventory";
import { formatDateTime } from "@/lib/utils";
import toast from "react-hot-toast";

interface NotSureItem {
  id: string;
  modelNumber: string;
  category: string;
  boxLocation: string | null;
  description?: string | null;
  frontImage: string;
  notSureAt: string | null;
  notSureRemarks?: string | null;
  createdAt: string;
  brand: {
    id: string;
    name: string;
  };
}

export default function AdminNotSureModal() {
  const router = useRouter();
  const [items, setItems] = useState<NotSureItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Single-view current item index
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"up" | "down" | "none">("none");

  // Slider mode: null (shows two choice buttons) | "keep" | "delete"
  const [sliderMode, setSliderMode] = useState<"keep" | "delete" | null>(null);
  const [dragX, setDragX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [maxDrag, setMaxDrag] = useState(200);

  const sliderTrackRef = useRef<HTMLDivElement | null>(null);
  const sliderStartXRef = useRef(0);
  const isSliderDraggingRef = useRef(false);

  // Vertical card swipe coordinates
  const cardTouchStartYRef = useRef<number | null>(null);
  const cardTouchEndYRef = useRef<number | null>(null);

  const fetchNotSureItems = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/not-sure", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        const pendingItems: NotSureItem[] = data.items || [];
        setItems(pendingItems);
        setCurrentIndex(0);
        setSliderMode(null);

        if (pendingItems.length > 0) {
          setIsOpen(true);
        }
      }
    } catch (err) {
      console.error("Failed to check not sure items:", err);
    }
  }, []);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("snooze_not_sure");
    }
    fetchNotSureItems();
  }, [fetchNotSureItems]);

  // Lock body scroll and handle Escape key
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape" && !isSubmitting) handleSnooze();
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, isSubmitting]);

  const handleSnooze = () => {
    setIsOpen(false);
    toast("Notification snoozed. Reopen anytime via the bottom bell badge or by refreshing.", {
      icon: "⏰",
      duration: 3500,
    });
  };

  const handleOpenItemPage = (itemId: string) => {
    setIsOpen(false);
    router.push(`/admin/inventory/${itemId}`);
  };

  // ─── Measure Slider Track Width when Slider Opens ────────────────────────
  useEffect(() => {
    if (sliderMode && sliderTrackRef.current) {
      const trackWidth = sliderTrackRef.current.clientWidth;
      const thumbWidth = 42;
      const padding = 8; // 4px left + 4px right
      setMaxDrag(Math.max(80, trackWidth - thumbWidth - padding));
      setDragX(0);
      setIsSubmitting(false);
    }
  }, [sliderMode]);

  // ─── Swipe Up / Down Card Navigation ─────────────────────────────────────
  const goToNext = useCallback(() => {
    if (currentIndex < items.length - 1) {
      setSlideDirection("up");
      setCurrentIndex((prev) => prev + 1);
      setSliderMode(null);
      setDragX(0);
    }
  }, [currentIndex, items.length]);

  const goToPrev = useCallback(() => {
    if (currentIndex > 0) {
      setSlideDirection("down");
      setCurrentIndex((prev) => prev - 1);
      setSliderMode(null);
      setDragX(0);
    }
  }, [currentIndex]);

  const handleCardTouchStart = (e: React.TouchEvent) => {
    // Only handle card swipe if not currently dragging the slider
    if (isSliderDraggingRef.current || sliderMode) return;
    cardTouchStartYRef.current = e.touches[0].clientY;
    cardTouchEndYRef.current = e.touches[0].clientY;
  };

  const handleCardTouchMove = (e: React.TouchEvent) => {
    if (isSliderDraggingRef.current || sliderMode || cardTouchStartYRef.current === null) return;
    cardTouchEndYRef.current = e.touches[0].clientY;
  };

  const handleCardTouchEnd = () => {
    if (isSliderDraggingRef.current || sliderMode || cardTouchStartYRef.current === null || cardTouchEndYRef.current === null) return;
    const deltaY = cardTouchStartYRef.current - cardTouchEndYRef.current;
    const minDistance = 35;

    if (deltaY > minDistance) {
      goToNext();
    } else if (deltaY < -minDistance) {
      goToPrev();
    }

    cardTouchStartYRef.current = null;
    cardTouchEndYRef.current = null;
  };

  const handleCardWheel = (e: React.WheelEvent) => {
    if (sliderMode) return;
    if (Math.abs(e.deltaY) > 30) {
      if (e.deltaY > 0) goToNext();
      else goToPrev();
    }
  };

  // ─── Slide to Confirm Resolution ─────────────────────────────────────────
  const triggerConfirm = useCallback(async () => {
    const currentItem = items[currentIndex];
    if (!currentItem || !sliderMode || isSubmitting) return;

    setIsSubmitting(true);
    setIsDragging(false);
    isSliderDraggingRef.current = false;
    setDragX(maxDrag);

    // Haptic vibration feedback
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(35);
      } catch {}
    }

    try {
      const resolution = sliderMode === "keep" ? "not_sold" : "sold";
      const res = await resolveNotSureItem(currentItem.id, resolution);

      if (res.success) {
        if (sliderMode === "keep") {
          toast.success(`Kept ${currentItem.brand.name} ${currentItem.modelNumber} in stock! "Not Sure" removed.`);
        } else {
          toast.success(`Marked ${currentItem.brand.name} ${currentItem.modelNumber} as Sold Out & deleted.`);
        }

        setItems((prev) => {
          const updated = prev.filter((i) => i.id !== currentItem.id);
          if (updated.length === 0) {
            setIsOpen(false);
          } else {
            setCurrentIndex((curr) => Math.min(curr, updated.length - 1));
          }
          return updated;
        });
        setSliderMode(null);
        setDragX(0);
      } else {
        toast.error(res.error || "Failed to update item");
        setDragX(0);
      }
    } catch {
      toast.error("An error occurred while updating status");
      setDragX(0);
    } finally {
      setIsSubmitting(false);
    }
  }, [sliderMode, isSubmitting, items, currentIndex, maxDrag]);

  // ─── Slider Touch & Mouse Handlers ───────────────────────────────────────
  const handleSliderTouchStart = (e: React.TouchEvent) => {
    if (isSubmitting) return;
    e.stopPropagation();
    setIsDragging(true);
    isSliderDraggingRef.current = true;
    sliderStartXRef.current = e.touches[0].clientX - dragX;
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(15);
      } catch {}
    }
  };

  const handleSliderMouseDown = (e: React.MouseEvent) => {
    if (isSubmitting) return;
    e.stopPropagation();
    setIsDragging(true);
    isSliderDraggingRef.current = true;
    sliderStartXRef.current = e.clientX - dragX;
  };

  const handleGlobalTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isSliderDraggingRef.current || isSubmitting) return;
      if (e.cancelable) e.preventDefault();
      const clientX = e.touches[0].clientX;
      const newX = Math.max(0, Math.min(clientX - sliderStartXRef.current, maxDrag));
      setDragX(newX);

      if (newX >= maxDrag * 0.86) {
        triggerConfirm();
      }
    },
    [maxDrag, isSubmitting, triggerConfirm]
  );

  const handleGlobalMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!isSliderDraggingRef.current || isSubmitting) return;
      const newX = Math.max(0, Math.min(e.clientX - sliderStartXRef.current, maxDrag));
      setDragX(newX);

      if (newX >= maxDrag * 0.86) {
        triggerConfirm();
      }
    },
    [maxDrag, isSubmitting, triggerConfirm]
  );

  const handleGlobalDragEnd = useCallback(() => {
    if (isSubmitting) return;
    setIsDragging(false);
    isSliderDraggingRef.current = false;
    setDragX(0);
  }, [isSubmitting]);

  useEffect(() => {
    if (!sliderMode) return;
    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalDragEnd);
    window.addEventListener("touchmove", handleGlobalTouchMove, { passive: false });
    window.addEventListener("touchend", handleGlobalDragEnd);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalDragEnd);
      window.removeEventListener("touchmove", handleGlobalTouchMove);
      window.removeEventListener("touchend", handleGlobalDragEnd);
    };
  }, [sliderMode, handleGlobalMouseMove, handleGlobalMouseMove, handleGlobalTouchMove, handleGlobalDragEnd]);

  const renderEmbeddedTrigger = () => {
    if (!mounted || items.length === 0) return null;

    return (
      <button
        type="button"
        onClick={() => {
          setCurrentIndex(0);
          setSliderMode(null);
          setIsOpen(true);
        }}
        className="not-sure-dashboard-btn"
        title={`${items.length} item${items.length === 1 ? "" : "s"} waiting for stock verification`}
        aria-label="Stock Verification Alert"
      >
        <span style={{ position: "relative", display: "inline-flex", alignItems: "center" }}>
          <Bell size={17} color="#d97706" />
          <span
            style={{
              position: "absolute",
              top: "-2px",
              right: "-2px",
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#ef4444",
              boxShadow: "0 0 6px #ef4444",
            }}
            className="animate-pulse"
          />
        </span>
        <span className="not-sure-btn-text">Verify Stock</span>
        <span
          style={{
            background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
            color: "#ffffff",
            fontSize: "11px",
            fontWeight: 800,
            padding: "1.5px 7px",
            borderRadius: "100px",
            boxShadow: "0 1px 4px rgba(217, 119, 6, 0.4)",
            lineHeight: 1.2,
          }}
        >
          {items.length}
        </span>
      </button>
    );
  };

  // Embedded dashboard top bell button when snoozed or closed
  if (!isOpen || items.length === 0 || !mounted) {
    return (
      <>
        {renderEmbeddedTrigger()}
        <style>{`
          .not-sure-dashboard-btn {
            height: 42px;
            padding: 0 13px 0 11px;
            border-radius: 12px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            background: rgba(245, 158, 11, 0.09);
            border: 1.5px solid rgba(245, 158, 11, 0.35);
            color: #92400e;
            cursor: pointer;
            position: relative;
            transition: all 180ms cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 2px 8px rgba(245, 158, 11, 0.12), inset 0 1px 0 rgba(255, 255, 255, 0.7);
            user-select: none;
            white-space: nowrap;
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
          }
          .not-sure-dashboard-btn:hover {
            background: rgba(245, 158, 11, 0.16);
            border-color: rgba(245, 158, 11, 0.55);
            transform: translateY(-1px);
            box-shadow: 0 4px 14px rgba(245, 158, 11, 0.22);
          }
          .not-sure-dashboard-btn:active {
            transform: scale(0.96);
            background: rgba(245, 158, 11, 0.2);
          }
          .not-sure-btn-text {
            font-size: 13px;
            font-weight: 700;
            letter-spacing: -0.015em;
            color: #92400e;
          }
          @media (max-width: 520px) {
            .not-sure-dashboard-btn {
              padding: 0 10px;
              gap: 6px;
            }
            .not-sure-btn-text {
              display: none;
            }
          }
        `}</style>
      </>
    );
  }

  const currentItem = items[currentIndex] || items[0];
  const cleanBox = currentItem?.boxLocation?.trim() || "";

  // Meaningful description filter (suppress "Unknown", "N/A", empty)
  const rawDesc = currentItem?.description?.trim() || "";
  const hasValidDescription =
    Boolean(rawDesc) &&
    !["unknown", "n/a", "none", "null", "undefined", "-"].includes(rawDesc.toLowerCase());

  const dragPercent = Math.min(1, dragX / (maxDrag || 1));
  const textOpacity = Math.max(0, 1 - dragPercent * 1.6);

  const modalBody = (
    <div
      role="dialog"
      aria-modal="true"
      onClick={handleSnooze}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 999999, // Above all navigation, headers, and dialogs
        backgroundColor: "rgba(0, 0, 0, 0.55)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end", // iOS bottom sheet
        animation: "ios-sheet-backdrop 220ms ease-out forwards",
      }}
    >
      {/* iOS Bottom Sheet Container */}
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: "100%",
          maxWidth: "440px",
          maxHeight: "94vh",
          margin: "0 auto",
          backgroundColor: "#ffffff",
          borderTopLeftRadius: "28px",
          borderTopRightRadius: "28px",
          border: "1px solid rgba(0, 0, 0, 0.08)",
          borderBottom: "none",
          padding: "10px 16px calc(14px + env(safe-area-inset-bottom, 14px))",
          boxShadow: "0 -16px 48px rgba(0, 0, 0, 0.22)",
          display: "flex",
          flexDirection: "column",
          position: "relative",
          animation: "ios-sheet-slide-up 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        }}
      >
        {/* iOS Grabber Pill */}
        <div
          style={{
            width: "36px",
            height: "4px",
            borderRadius: "2px",
            backgroundColor: "rgba(0, 0, 0, 0.18)",
            margin: "0 auto 8px",
            flexShrink: 0,
          }}
        />

        {/* Top Header Bar */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            marginBottom: "8px",
            paddingBottom: "8px",
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
            flexShrink: 0,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "10px",
                background: "rgba(245, 158, 11, 0.14)",
                border: "1.5px solid rgba(245, 158, 11, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#d97706",
                flexShrink: 0,
              }}
            >
              <ShieldAlert size={18} strokeWidth={2.2} />
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <h2
                  style={{
                    fontSize: "15px",
                    fontWeight: 800,
                    letterSpacing: "-0.02em",
                    color: "var(--color-text-primary)",
                    margin: 0,
                  }}
                >
                  Stock Verification
                </h2>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 800,
                    background: "#fef3c7",
                    color: "#92400e",
                    padding: "1px 6.5px",
                    borderRadius: "100px",
                    border: "1px solid rgba(245, 158, 11, 0.3)",
                  }}
                >
                  {currentIndex + 1} of {items.length}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation arrows & Close button */}
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            {items.length > 1 && (
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  background: "rgba(0, 0, 0, 0.04)",
                  borderRadius: "100px",
                  padding: "2px",
                }}
              >
                <button
                  type="button"
                  onClick={goToPrev}
                  disabled={currentIndex === 0}
                  aria-label="Previous item"
                  style={{
                    width: "25px",
                    height: "25px",
                    borderRadius: "50%",
                    background: "none",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: currentIndex === 0 ? "rgba(0, 0, 0, 0.2)" : "var(--color-text-primary)",
                    cursor: currentIndex === 0 ? "default" : "pointer",
                  }}
                  title="Previous item"
                >
                  <ChevronDown size={15} />
                </button>
                <button
                  type="button"
                  onClick={goToNext}
                  disabled={currentIndex === items.length - 1}
                  aria-label="Next item"
                  style={{
                    width: "25px",
                    height: "25px",
                    borderRadius: "50%",
                    background: "none",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: currentIndex === items.length - 1 ? "rgba(0, 0, 0, 0.2)" : "var(--color-text-primary)",
                    cursor: currentIndex === items.length - 1 ? "default" : "pointer",
                  }}
                  title="Next item (or swipe up)"
                >
                  <ChevronUp size={15} />
                </button>
              </div>
            )}

            <button
              type="button"
              onClick={handleSnooze}
              aria-label="Close modal"
              style={{
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                background: "rgba(0, 0, 0, 0.05)",
                border: "none",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "var(--color-text-muted)",
                cursor: "pointer",
              }}
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* ── SINGLE VIEW ITEM CARD (SWIPE-ENABLED) ── */}
        <div
          onTouchStart={handleCardTouchStart}
          onTouchMove={handleCardTouchMove}
          onTouchEnd={handleCardTouchEnd}
          onWheel={handleCardWheel}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            userSelect: "none",
          }}
        >
          <div
            key={currentItem.id}
            className={`single-card-view ${slideDirection}`}
            style={{
              borderRadius: "18px",
              border: "1.5px solid rgba(245, 158, 11, 0.28)",
              background: "#ffffff",
              padding: "12px",
              display: "flex",
              flexDirection: "column",
              gap: "10px",
              boxShadow: "0 4px 16px rgba(0, 0, 0, 0.04)",
            }}
          >
            {/* Full Front Image (Proportionally fitted for single screen view) */}
            <div
              onClick={() => handleOpenItemPage(currentItem.id)}
              style={{
                position: "relative",
                width: "100%",
                height: "clamp(120px, 18vh, 155px)",
                borderRadius: "14px",
                overflow: "hidden",
                backgroundColor: "#f8f9fa",
                border: "1px solid rgba(0, 0, 0, 0.07)",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              title="Click photo to open item in admin panel"
            >
              <Image
                src={currentItem.frontImage}
                alt={currentItem.modelNumber}
                fill
                sizes="(max-width: 500px) 100vw, 420px"
                style={{ objectFit: "contain" }}
                priority
              />

              {/* Floating Glass Action Pill */}
              <div
                style={{
                  position: "absolute",
                  bottom: "8px",
                  right: "8px",
                  background: "rgba(0, 0, 0, 0.72)",
                  backdropFilter: "blur(6px)",
                  color: "#ffffff",
                  fontSize: "10.5px",
                  fontWeight: 700,
                  padding: "3.5px 8px",
                  borderRadius: "100px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                  pointerEvents: "none",
                }}
              >
                <span>Open in Admin</span>
                <ExternalLink size={11} strokeWidth={2.4} />
              </div>
            </div>

            {/* Item Meta: Brand, Category, Model & Storage Box */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "6px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  <span
                    style={{
                      fontSize: "10.5px",
                      fontWeight: 800,
                      textTransform: "uppercase",
                      letterSpacing: "0.03em",
                      padding: "1.5px 6px",
                      borderRadius: "5px",
                      background: "rgba(0, 113, 227, 0.08)",
                      color: "var(--color-accent)",
                      border: "1px solid rgba(0, 113, 227, 0.2)",
                    }}
                  >
                    {currentItem.category}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-secondary)" }}>
                    {currentItem.brand.name}
                  </span>
                </div>

                {/* Storage Box Pill */}
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    padding: "2px 8px",
                    borderRadius: "6px",
                    background: cleanBox ? "rgba(37, 99, 235, 0.1)" : "rgba(0,0,0,0.05)",
                    border: cleanBox ? "1.5px solid rgba(37, 99, 235, 0.35)" : "1px dashed #cbd5e1",
                  }}
                >
                  <Package size={13} color={cleanBox ? "var(--color-accent)" : "#64748b"} />
                  <span
                    style={{
                      fontSize: "11.5px",
                      fontWeight: 800,
                      color: cleanBox ? "var(--color-accent)" : "#64748b",
                    }}
                  >
                    {cleanBox ? `BOX: ${cleanBox.toUpperCase()}` : "NO BOX"}
                  </span>
                </div>
              </div>

              {/* Full Model Number */}
              <h3
                onClick={() => handleOpenItemPage(currentItem.id)}
                style={{
                  fontSize: "18px",
                  fontWeight: 800,
                  letterSpacing: "-0.025em",
                  color: "var(--color-text-primary)",
                  margin: "1px 0 0 0",
                  cursor: "pointer",
                  lineHeight: 1.25,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title="Click to open item page"
              >
                {currentItem.modelNumber}
              </h3>

              {/* Meaningful Description Snippet (Only rendered if actual note exists) */}
              {hasValidDescription && (
                <div
                  style={{
                    marginTop: "2px",
                    padding: "6px 8px",
                    borderRadius: "8px",
                    background: "rgba(0, 0, 0, 0.03)",
                    borderLeft: "2.5px solid var(--color-accent)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "5px",
                  }}
                >
                  <FileText size={12} color="var(--color-text-muted)" style={{ marginTop: "2px", flexShrink: 0 }} />
                  <p
                    style={{
                      fontSize: "11.5px",
                      color: "var(--color-text-secondary)",
                      lineHeight: 1.35,
                      margin: 0,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {rawDesc}
                  </p>
                </div>
              )}

              {/* Not Sure Timestamp & Staff Reason Card */}
              {(currentItem.notSureAt || currentItem.notSureRemarks?.trim()) && (
                <div
                  style={{
                    marginTop: "3px",
                    padding: "7px 10px",
                    borderRadius: "9px",
                    background: "rgba(245, 158, 11, 0.08)",
                    border: "1px solid rgba(245, 158, 11, 0.22)",
                    borderLeft: "3px solid #d97706",
                    display: "flex",
                    flexDirection: "column",
                    gap: "4px",
                  }}
                >
                  {/* Timestamp: Date & Time when marked as not sure */}
                  {currentItem.notSureAt && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#b45309",
                      }}
                    >
                      <Clock size={12} strokeWidth={2.4} style={{ flexShrink: 0 }} />
                      <span>
                        Marked:{" "}
                        <strong style={{ color: "#92400e", fontWeight: 800 }}>
                          {formatDateTime(currentItem.notSureAt)}
                        </strong>
                      </span>
                    </div>
                  )}

                  {/* Staff Reason Snippet */}
                  {currentItem?.notSureRemarks?.trim() && (
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "6px" }}>
                      <MessageSquareText
                        size={12}
                        color="#b45309"
                        style={{ marginTop: "2px", flexShrink: 0 }}
                      />
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <span
                          style={{
                            fontSize: "10.5px",
                            fontWeight: 800,
                            color: "#b45309",
                            display: "inline-block",
                            marginRight: "4px",
                          }}
                        >
                          Reason:
                        </span>
                        <span
                          style={{
                            fontSize: "11.5px",
                            fontWeight: 600,
                            color: "#92400e",
                            lineHeight: 1.35,
                          }}
                        >
                          &ldquo;{currentItem.notSureRemarks.trim()}&rdquo;
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* ── ACTION ZONE: TWO CHOICE BUTTONS OR SLIDE TO CONFIRM SLIDER ── */}
            {sliderMode === null ? (
              // Default view: Two clean iOS Action Buttons
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginTop: "2px" }}>
                {/* Not Sold (Still in Box) Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSliderMode("keep");
                    setDragX(0);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 10px",
                    borderRadius: "11px",
                    background: "#ffffff",
                    border: "1.5px solid #22c55e",
                    color: "#15803d",
                    fontSize: "13px",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    cursor: "pointer",
                    boxShadow: "0 1px 4px rgba(34, 197, 94, 0.12)",
                    transition: "all 140ms ease",
                  }}
                  title="Slide to confirm item is still in stock"
                >
                  <CheckCircle2 size={15} color="#16a34a" />
                  <span>Not Sold (Keep)</span>
                </button>

                {/* Sold Out Button */}
                <button
                  type="button"
                  onClick={() => {
                    setSliderMode("delete");
                    setDragX(0);
                  }}
                  style={{
                    flex: 1,
                    padding: "10px 10px",
                    borderRadius: "11px",
                    background: "rgba(255, 59, 48, 0.08)",
                    border: "1.5px solid rgba(255, 59, 48, 0.3)",
                    color: "var(--color-danger)",
                    fontSize: "13px",
                    fontWeight: 700,
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "6px",
                    cursor: "pointer",
                    transition: "all 140ms ease",
                  }}
                  title="Slide to confirm item was sold and delete"
                >
                  <Trash2 size={15} />
                  <span>Sold Out (Delete)</span>
                </button>
              </div>
            ) : (
              // ── SLIDE TO CONFIRM TRACK (iOS Inspired) ──
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "2px" }}>
                <div
                  ref={sliderTrackRef}
                  style={{
                    position: "relative",
                    flex: 1,
                    height: "50px",
                    borderRadius: "100px",
                    background: sliderMode === "keep" ? "rgba(34, 197, 94, 0.06)" : "rgba(255, 59, 48, 0.06)",
                    border:
                      sliderMode === "keep"
                        ? "1.5px solid rgba(34, 197, 94, 0.3)"
                        : "1.5px solid rgba(255, 59, 48, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    overflow: "hidden",
                    userSelect: "none",
                    WebkitUserSelect: "none",
                    touchAction: "none",
                    boxShadow: "inset 0 1.5px 3px rgba(0, 0, 0, 0.04)",
                  }}
                >
                  {/* Progress Capsule Fill (Inset pill perfectly hugging the circular thumb) */}
                  <div
                    style={{
                      position: "absolute",
                      top: "4px",
                      bottom: "4px",
                      left: "4px",
                      width: dragX > 0 ? `${dragX + 42}px` : "0px",
                      opacity: dragX > 0 ? 1 : 0,
                      borderRadius: "100px",
                      background:
                        sliderMode === "keep"
                          ? "linear-gradient(90deg, rgba(34, 197, 94, 0.16) 0%, rgba(34, 197, 94, 0.85) 100%)"
                          : "linear-gradient(90deg, rgba(255, 59, 48, 0.16) 0%, rgba(255, 59, 48, 0.85) 100%)",
                      boxShadow:
                        sliderMode === "keep"
                          ? "0 0 10px rgba(34, 197, 94, 0.25)"
                          : "0 0 10px rgba(255, 59, 48, 0.25)",
                      transition: isDragging ? "none" : "width 240ms cubic-bezier(0.2, 0.9, 0.3, 1), opacity 150ms ease",
                      pointerEvents: "none",
                      willChange: "width, opacity",
                    }}
                  />

                  {/* Shimmer Track Prompt */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      paddingLeft: "32px",
                      pointerEvents: "none",
                      opacity: textOpacity,
                      transition: isDragging ? "none" : "opacity 180ms ease",
                    }}
                  >
                    <span
                      className="slider-shimmer-text"
                      style={{
                        fontSize: "12.5px",
                        fontWeight: 700,
                        letterSpacing: "0.01em",
                        color: sliderMode === "keep" ? "#15803d" : "#d32f2f",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>
                        {sliderMode === "keep" ? "slide to keep in stock" : "slide to confirm & delete"}
                      </span>
                      <ChevronRight size={13} strokeWidth={2.5} style={{ opacity: 0.6 }} />
                      <ChevronRight size={13} strokeWidth={2.5} style={{ opacity: 0.9, marginLeft: -5 }} />
                    </span>
                  </div>

                  {/* Slider Thumb */}
                  <div
                    onMouseDown={handleSliderMouseDown}
                    onTouchStart={handleSliderTouchStart}
                    style={{
                      position: "absolute",
                      left: "4px",
                      top: "4px",
                      width: "42px",
                      height: "42px",
                      borderRadius: "50%",
                      background: isSubmitting
                        ? sliderMode === "keep"
                          ? "#16a34a"
                          : "#ff3b30"
                        : "#ffffff",
                      color: isSubmitting
                        ? "#ffffff"
                        : sliderMode === "keep"
                        ? "#16a34a"
                        : "#ff3b30",
                      border: "0.5px solid rgba(0, 0, 0, 0.04)",
                      boxShadow: isDragging
                        ? "0 6px 18px rgba(0, 0, 0, 0.2), 0 2px 4px rgba(0, 0, 0, 0.1)"
                        : "0 2px 8px rgba(0, 0, 0, 0.14), 0 1px 3px rgba(0, 0, 0, 0.08)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: isSubmitting ? "wait" : isDragging ? "grabbing" : "grab",
                      transform: `translateX(${dragX}px) scale(${isDragging ? 1.04 : 1})`,
                      transition: isDragging
                        ? "none"
                        : "transform 240ms cubic-bezier(0.2, 0.9, 0.3, 1), background-color 180ms ease, box-shadow 180ms ease",
                      zIndex: 2,
                      willChange: "transform",
                      touchAction: "none",
                    }}
                  >
                    {isSubmitting ? (
                      <Loader2 size={18} className="animate-spin" color="#ffffff" />
                    ) : sliderMode === "keep" ? (
                      <CheckCircle2 size={18} strokeWidth={2.4} />
                    ) : (
                      <Trash2 size={18} strokeWidth={2.2} />
                    )}
                  </div>
                </div>

                {/* Cancel Button (Snaps back to buttons) */}
                <button
                  type="button"
                  onClick={() => {
                    setSliderMode(null);
                    setDragX(0);
                  }}
                  disabled={isSubmitting}
                  aria-label="Cancel slide"
                  style={{
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(0, 0, 0, 0.05)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "var(--color-text-muted)",
                    cursor: isSubmitting ? "not-allowed" : "pointer",
                    flexShrink: 0,
                  }}
                  title="Cancel"
                >
                  <X size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Swipe Up Cue if multiple items exist */}
          {items.length > 1 && (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "5px",
                fontSize: "11px",
                fontWeight: 700,
                color: "var(--color-text-muted)",
                padding: "2px 0",
              }}
            >
              <ChevronUp size={13} className="animate-bounce" />
              <span>
                {currentIndex < items.length - 1
                  ? "Swipe up for next item"
                  : "Swipe down for previous"}
              </span>
            </div>
          )}
        </div>

        {/* Sheet Footer: Snooze Pill */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            paddingTop: "8px",
            borderTop: "1px solid rgba(0, 0, 0, 0.06)",
            marginTop: "6px",
            flexShrink: 0,
          }}
        >
          <button
            type="button"
            onClick={handleSnooze}
            style={{
              width: "100%",
              padding: "10px 14px",
              borderRadius: "100px",
              background: "rgba(0, 0, 0, 0.04)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              color: "var(--color-text-secondary)",
              fontSize: "13px",
              fontWeight: 600,
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "7px",
              cursor: "pointer",
              transition: "background 140ms ease",
            }}
            title="Snooze reminder for current session. Will alert you again on refresh or reopen."
          >
            <Clock size={15} />
            <span>Snooze for This Session</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes ios-sheet-backdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes ios-sheet-slide-up {
          from {
            transform: translateY(100%);
            opacity: 0.9;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .single-card-view.up {
          animation: card-swipe-up 240ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .single-card-view.down {
          animation: card-swipe-down 240ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes card-swipe-up {
          from {
            transform: translateY(24px);
            opacity: 0.3;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        @keyframes card-swipe-down {
          from {
            transform: translateY(-24px);
            opacity: 0.3;
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

  return mounted ? (
    <>
      {renderEmbeddedTrigger()}
      {createPortal(modalBody, document.body)}
    </>
  ) : null;
}
