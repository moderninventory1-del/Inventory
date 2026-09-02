"use client";
// src/components/public/ItemPhotoGallery.tsx
// Pure plain black background photo viewer with native side-by-side seek-through carousel swiping,
// swipe-down to dismiss, and all-directional zoom with strict boundary edge grasping (prevents photo moving out of screen).

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { createPortal } from "react-dom";

interface ItemPhotoGalleryProps {
  frontImage: string;
  backImage?: string | null;
  altText: string;
  brandName: string;
  modelNumber: string;
  category: string;
}

export default function ItemPhotoGallery({
  frontImage,
  backImage,
  altText,
  category,
}: ItemPhotoGalleryProps) {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Gesture and transform states
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [swipeX, setSwipeX] = useState(0);
  const [dismissY, setDismissY] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Active image element reference for precise edge calculations
  const activeImgRef = useRef<HTMLImageElement | null>(null);

  // Gesture tracking refs
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pinchStartDistRef = useRef<number | null>(null);
  const startScaleRef = useRef(1);
  const startPanRef = useRef({ x: 0, y: 0 });
  const gestureModeRef = useRef<"idle" | "pan" | "dismiss" | "swipe" | "pinch">("idle");
  const lastTapRef = useRef<number>(0);
  const isMouseDownRef = useRef(false);
  const mouseStartRef = useRef({ x: 0, y: 0 });

  const images = [
    { url: frontImage, label: "Front" },
    ...(backImage ? [{ url: backImage, label: "Back" }] : []),
  ];

  useEffect(() => {
    setMounted(true);
  }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [isOpen]);

  // ── Precise Edge Grasping & Boundary Clamping Math ──
  const getPanBounds = useCallback((targetScale: number) => {
    if (typeof window === "undefined") {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    let baseW = vpW;
    let baseH = vpH;

    if (activeImgRef.current) {
      baseW = activeImgRef.current.clientWidth || vpW;
      baseH = activeImgRef.current.clientHeight || vpH;
    }

    const scaledW = baseW * targetScale;
    const scaledH = baseH * targetScale;

    // The maximum distance the photo center can travel before an edge separates from the screen edge
    const maxX = Math.max(0, (scaledW - vpW) / 2);
    const minX = -maxX;

    const maxY = Math.max(0, (scaledH - vpH) / 2);
    const minY = -maxY;

    return { minX, maxX, minY, maxY };
  }, []);

  const clampPan = useCallback(
    (targetPan: { x: number; y: number }, targetScale: number) => {
      const { minX, maxX, minY, maxY } = getPanBounds(targetScale);
      return {
        x: Math.max(minX, Math.min(maxX, targetPan.x)),
        y: Math.max(minY, Math.min(maxY, targetPan.y)),
      };
    },
    [getPanBounds]
  );

  // Soft rubber-band resistance when dragging past edges
  const applyRubberBand = useCallback(
    (rawPan: { x: number; y: number }, targetScale: number) => {
      const { minX, maxX, minY, maxY } = getPanBounds(targetScale);
      let x = rawPan.x;
      let y = rawPan.y;

      if (x > maxX) {
        x = maxX + (x - maxX) * 0.25;
      } else if (x < minX) {
        x = minX + (x - minX) * 0.25;
      }

      if (y > maxY) {
        y = maxY + (y - maxY) * 0.25;
      } else if (y < minY) {
        y = minY + (y - minY) * 0.25;
      }

      return { x, y };
    },
    [getPanBounds]
  );

  const openViewer = (index: number) => {
    setCurrentIndex(index);
    setScale(1);
    setPan({ x: 0, y: 0 });
    setSwipeX(0);
    setDismissY(0);
    setIsTransitioning(false);
    setIsOpen(true);
  };

  const closeViewer = useCallback(() => {
    setIsTransitioning(true);
    setDismissY(typeof window !== "undefined" ? window.innerHeight * 0.7 : 400);
    setTimeout(() => {
      setIsOpen(false);
      setScale(1);
      setPan({ x: 0, y: 0 });
      setSwipeX(0);
      setDismissY(0);
      setIsTransitioning(false);
    }, 180);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeViewer();
      else if (e.key === "ArrowRight") {
        if (currentIndex < images.length - 1 && scale === 1) {
          setIsTransitioning(true);
          setCurrentIndex((prev) => prev + 1);
          setScale(1);
          setPan({ x: 0, y: 0 });
          setTimeout(() => setIsTransitioning(false), 240);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentIndex > 0 && scale === 1) {
          setIsTransitioning(true);
          setCurrentIndex((prev) => prev - 1);
          setScale(1);
          setPan({ x: 0, y: 0 });
          setTimeout(() => setIsTransitioning(false), 240);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeViewer, currentIndex, images.length, scale]);

  // Double tap to toggle zoom with edge clamping
  const handleDoubleTap = (clientX: number, clientY: number) => {
    setIsTransitioning(true);
    if (scale > 1) {
      setScale(1);
      setPan({ x: 0, y: 0 });
    } else {
      const nextScale = 2.5;
      setScale(nextScale);
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const rawPanX = (centerX - clientX) * 1.5;
      const rawPanY = (centerY - clientY) * 1.5;
      // Clamps immediately to screen edges
      setPan(clampPan({ x: rawPanX, y: rawPanY }, nextScale));
    }
    setTimeout(() => setIsTransitioning(false), 220);
  };

  // Desktop Mouse Wheel Zoom
  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.003;
    const nextScale = Math.min(Math.max(1, scale + delta), 4.5);
    setScale(nextScale);
    if (nextScale === 1) {
      setPan({ x: 0, y: 0 });
    } else {
      // Keep clamped to edges while zooming
      setPan((prev) => clampPan(prev, nextScale));
    }
  };

  // Desktop Mouse Drag / Swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    isMouseDownRef.current = true;
    mouseStartRef.current = { x: e.clientX, y: e.clientY };
    startPanRef.current = { ...pan };
    gestureModeRef.current = scale > 1 ? "pan" : "idle";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const dx = e.clientX - mouseStartRef.current.x;
    const dy = e.clientY - mouseStartRef.current.y;

    if (scale > 1) {
      // Rubber-band resistance at edges during pan
      const targetPan = {
        x: startPanRef.current.x + dx,
        y: startPanRef.current.y + dy,
      };
      setPan(applyRubberBand(targetPan, scale));
    } else {
      if (gestureModeRef.current === "idle") {
        if (Math.abs(dy) > Math.abs(dx) && dy > 5) {
          gestureModeRef.current = "dismiss";
        } else if (Math.abs(dx) > Math.abs(dy)) {
          gestureModeRef.current = "swipe";
        }
      }

      if (gestureModeRef.current === "dismiss") {
        setDismissY(Math.max(0, dy));
      } else if (gestureModeRef.current === "swipe") {
        setSwipeX(dx);
      }
    }
  };

  const handleMouseUp = () => {
    if (!isMouseDownRef.current) return;
    isMouseDownRef.current = false;

    if (scale > 1) {
      // Snap flush back to edges if dragged past rubber-band limit
      setIsTransitioning(true);
      setPan((prev) => clampPan(prev, scale));
      setTimeout(() => setIsTransitioning(false), 180);
      return;
    }

    if (gestureModeRef.current === "dismiss") {
      if (dismissY > 90) {
        closeViewer();
        return;
      }
    } else if (gestureModeRef.current === "swipe") {
      const threshold = window.innerWidth * 0.18;
      if (swipeX < -threshold && currentIndex < images.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else if (swipeX > threshold && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      }
    }

    setIsTransitioning(true);
    setSwipeX(0);
    setDismissY(0);
    gestureModeRef.current = "idle";
    setTimeout(() => setIsTransitioning(false), 220);
  };

  // ── Touch Events (Mobile Pinch, Real Side-by-Side Swipe, Pull Down) ──
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      gestureModeRef.current = "pinch";
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      pinchStartDistRef.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      startScaleRef.current = scale;
      startPanRef.current = { ...pan };
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const now = Date.now();

      // Double tap to zoom
      if (now - lastTapRef.current < 260) {
        handleDoubleTap(touch.clientX, touch.clientY);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: now };
      startPanRef.current = { ...pan };
      gestureModeRef.current = scale > 1 ? "pan" : "idle";
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && pinchStartDistRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const factor = currentDist / pinchStartDistRef.current;
      const nextScale = Math.min(Math.max(1, startScaleRef.current * factor), 4.5);
      setScale(nextScale);
      if (nextScale <= 1) {
        setPan({ x: 0, y: 0 });
      } else {
        // Clamp edges continuously as you pinch
        setPan((prev) => clampPan(prev, nextScale));
      }
      return;
    }

    if (e.touches.length === 1 && touchStartRef.current) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;

      if (scale > 1) {
        // Panning when zoomed with soft edge resistance
        const targetPan = {
          x: startPanRef.current.x + dx,
          y: startPanRef.current.y + dy,
        };
        setPan(applyRubberBand(targetPan, scale));
        return;
      }

      if (gestureModeRef.current === "idle") {
        if (Math.abs(dy) > Math.abs(dx) && dy > 8) {
          gestureModeRef.current = "dismiss";
        } else if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
          gestureModeRef.current = "swipe";
        }
      }

      if (gestureModeRef.current === "dismiss") {
        setDismissY(Math.max(0, dy));
      } else if (gestureModeRef.current === "swipe") {
        // Real-time horizontal track dragging (moves next photo onto the screen simultaneously!)
        if ((currentIndex === 0 && dx > 0) || (currentIndex === images.length - 1 && dx < 0)) {
          setSwipeX(dx * 0.35);
        } else {
          setSwipeX(dx);
        }
      }
    }
  };

  const handleTouchEnd = () => {
    if (scale <= 1.05 && scale !== 1) {
      setScale(1);
      setPan({ x: 0, y: 0 });
    } else if (scale > 1) {
      // Snap flush back to screen edges on release
      setIsTransitioning(true);
      setPan((prev) => clampPan(prev, scale));
      setTimeout(() => setIsTransitioning(false), 180);
      touchStartRef.current = null;
      pinchStartDistRef.current = null;
      return;
    }

    if (gestureModeRef.current === "dismiss") {
      if (dismissY > 80) {
        closeViewer();
        return;
      }
    } else if (gestureModeRef.current === "swipe") {
      const threshold = typeof window !== "undefined" ? window.innerWidth * 0.18 : 60;
      if (swipeX < -threshold && currentIndex < images.length - 1) {
        setCurrentIndex((i) => i + 1);
      } else if (swipeX > threshold && currentIndex > 0) {
        setCurrentIndex((i) => i - 1);
      }
    }

    setIsTransitioning(true);
    setSwipeX(0);
    setDismissY(0);
    gestureModeRef.current = "idle";
    touchStartRef.current = null;
    pinchStartDistRef.current = null;
    setTimeout(() => setIsTransitioning(false), 220);
  };

  // Background opacity fades as user drags down to dismiss
  const bgOpacity = Math.max(0, 1 - dismissY / 280);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      {/* ── Front Image Card ── */}
      <div
        className="card photo-card-plain"
        onClick={() => openViewer(0)}
        style={{
          overflow: "hidden",
          position: "relative",
          aspectRatio: "16/10",
          background: "var(--color-bg-surface)",
          cursor: "pointer",
          borderRadius: "16px",
          transition: "transform 180ms ease, box-shadow 180ms ease",
        }}
      >
        <Image
          src={frontImage}
          alt={`${altText} — front`}
          fill
          sizes="(max-width: 768px) 100vw, 55vw"
          style={{ objectFit: "contain", padding: "16px" }}
          priority
        />
        <div style={{ position: "absolute", top: "12px", left: "12px" }}>
          <span className="badge badge-accent">{category}</span>
        </div>
      </div>

      {/* ── Back Image Card (if available) ── */}
      {backImage && (
        <div
          className="card photo-card-plain"
          onClick={() => openViewer(1)}
          style={{
            overflow: "hidden",
            position: "relative",
            aspectRatio: "16/10",
            background: "var(--color-bg-surface)",
            cursor: "pointer",
            borderRadius: "16px",
            transition: "transform 180ms ease, box-shadow 180ms ease",
          }}
        >
          <Image
            src={backImage}
            alt={`${altText} — back`}
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            style={{ objectFit: "contain", padding: "16px" }}
            loading="lazy"
          />
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "12px",
              background: "rgba(0, 0, 0, 0.65)",
              backdropFilter: "blur(8px)",
              WebkitBackdropFilter: "blur(8px)",
              borderRadius: "6px",
              padding: "4px 10px",
              fontSize: "12px",
              fontWeight: 600,
              color: "#fff",
            }}
          >
            Back view
          </div>
        </div>
      )}

      {/* ── Plain Pure Black Photo Viewer (Zero Clutter) ── */}
      {isOpen &&
        mounted &&
        createPortal(
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 99999999,
              backgroundColor: `rgba(0, 0, 0, ${bgOpacity})`,
              transition: isTransitioning ? "background-color 200ms ease" : "none",
              touchAction: "none",
              userSelect: "none",
              WebkitUserSelect: "none",
              overflow: "hidden",
            }}
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* ── Continuous Horizontal Carousel Track ── */}
            <div
              style={{
                display: "flex",
                width: `${images.length * 100}vw`,
                height: "100vh",
                transform: `translate3d(calc(${-currentIndex * 100}vw + ${swipeX}px), ${dismissY}px, 0)`,
                transition: isTransitioning
                  ? "transform 240ms cubic-bezier(0.16, 1, 0.3, 1)"
                  : "none",
              }}
            >
              {images.map((img, idx) => {
                const isActive = idx === currentIndex;
                const imgScale = isActive ? scale : 1;
                const imgPanX = isActive ? pan.x : 0;
                const imgPanY = isActive ? pan.y : 0;

                return (
                  <div
                    key={img.url}
                    style={{
                      width: "100vw",
                      height: "100vh",
                      flexShrink: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onClick={(e) => {
                      // Click on the empty black area outside image closes the viewer
                      if (e.target === e.currentTarget && scale === 1) {
                        closeViewer();
                      }
                    }}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      ref={isActive ? activeImgRef : undefined}
                      src={img.url}
                      alt={altText}
                      draggable={false}
                      style={{
                        maxWidth: "100vw",
                        maxHeight: "100vh",
                        objectFit: "contain",
                        // Screen-pixel translate first, then scale so pan is 1:1 and clamped precisely to screen edges
                        transform: `translate3d(${imgPanX}px, ${imgPanY}px, 0) scale(${imgScale})`,
                        transformOrigin: "center center",
                        transition: isTransitioning
                          ? "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)"
                          : "none",
                        pointerEvents: "none",
                      }}
                    />
                  </div>
                );
              })}
            </div>

            <style>{`
              .photo-card-plain:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 24px rgba(0, 0, 0, 0.08);
              }
            `}</style>
          </div>,
          document.body
        )}
    </div>
  );
}
