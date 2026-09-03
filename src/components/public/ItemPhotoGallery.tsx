"use client";
// src/components/public/ItemPhotoGallery.tsx
// Pure plain black background photo viewer with native side-by-side seek-through carousel swiping,
// swipe-down to dismiss, and all-directional zoom with smooth movement and boundary edge grasping.

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

  // Image loaded state for skeleton loading shimmer
  const [isFrontLoaded, setIsFrontLoaded] = useState(false);
  const [isBackLoaded, setIsBackLoaded] = useState(false);

  // Gesture and transform states
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [swipeX, setSwipeX] = useState(0);
  const [dismissY, setDismissY] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Active image element reference for precise edge calculations
  const activeImgRef = useRef<HTMLImageElement | null>(null);

  // Real-time synced refs to prevent stale closure blocks during high-frequency gestures
  const currentScaleRef = useRef(1);
  const currentPanRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    currentScaleRef.current = scale;
  }, [scale]);

  useEffect(() => {
    currentPanRef.current = pan;
  }, [pan]);

  // Gesture tracking refs
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const pinchStartDistRef = useRef<number | null>(null);
  const pinchStartMidRef = useRef<{ x: number; y: number } | null>(null);
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

  // ── Precise Edge Grasping & Free Movement Math ──
  const getPanBounds = useCallback((targetScale: number) => {
    if (typeof window === "undefined" || targetScale <= 1.01) {
      return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
    }

    const vpW = window.innerWidth;
    const vpH = window.innerHeight;

    let baseW = vpW;
    let baseH = vpH;

    if (activeImgRef.current) {
      const nw = activeImgRef.current.naturalWidth;
      const nh = activeImgRef.current.naturalHeight;
      if (nw > 0 && nh > 0) {
        const imgAspect = nw / nh;
        const vpAspect = vpW / vpH;
        if (imgAspect > vpAspect) {
          baseW = vpW;
          baseH = vpW / imgAspect;
        } else {
          baseH = vpH;
          baseW = vpH * imgAspect;
        }
      } else {
        baseW = activeImgRef.current.clientWidth || vpW;
        baseH = activeImgRef.current.clientHeight || vpH;
      }
    }

    const scaledW = baseW * targetScale;
    const scaledH = baseH * targetScale;

    // When scaled dimension > viewport: clamp so edges grasp the screen boundaries (no empty space).
    // When scaled dimension <= viewport: allow free movement across the screen without going out of screen!
    const maxX = scaledW > vpW ? (scaledW - vpW) / 2 : (vpW - scaledW) / 2;
    const maxY = scaledH > vpH ? (scaledH - vpH) / 2 : (vpH - scaledH) / 2;

    return {
      minX: -maxX,
      maxX: maxX,
      minY: -maxY,
      maxY: maxY,
    };
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
        x = maxX + (x - maxX) * 0.3;
      } else if (x < minX) {
        x = minX + (x - minX) * 0.3;
      }

      if (y > maxY) {
        y = maxY + (y - maxY) * 0.3;
      } else if (y < minY) {
        y = minY + (y - minY) * 0.3;
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
        if (currentIndex < images.length - 1 && scale <= 1.01) {
          setIsTransitioning(true);
          setCurrentIndex((prev) => prev + 1);
          setScale(1);
          setPan({ x: 0, y: 0 });
          setTimeout(() => setIsTransitioning(false), 240);
        }
      } else if (e.key === "ArrowLeft") {
        if (currentIndex > 0 && scale <= 1.01) {
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
    if (scale > 1.01) {
      setScale(1);
      setPan({ x: 0, y: 0 });
    } else {
      const nextScale = 2.5;
      setScale(nextScale);
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const rawPanX = (centerX - clientX) * 1.5;
      const rawPanY = (centerY - clientY) * 1.5;
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
    if (nextScale <= 1.01) {
      setPan({ x: 0, y: 0 });
    } else {
      setPan((prev) => clampPan(prev, nextScale));
    }
  };

  // Desktop Mouse Drag / Swipe
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return;
    setIsTransitioning(false);
    isMouseDownRef.current = true;
    mouseStartRef.current = { x: e.clientX, y: e.clientY };
    startPanRef.current = { ...currentPanRef.current };
    gestureModeRef.current = currentScaleRef.current > 1.01 ? "pan" : "idle";
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return;
    const dx = e.clientX - mouseStartRef.current.x;
    const dy = e.clientY - mouseStartRef.current.y;
    const activeScale = currentScaleRef.current;

    if (activeScale > 1.01) {
      const targetPan = {
        x: startPanRef.current.x + dx,
        y: startPanRef.current.y + dy,
      };
      setPan(applyRubberBand(targetPan, activeScale));
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
    const activeScale = currentScaleRef.current;

    if (activeScale > 1.01) {
      setIsTransitioning(true);
      setPan((prev) => clampPan(prev, activeScale));
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

  // ── Mobile Touch Events (Pinch-to-zoom + Pan simultaneously, 1-Finger move, Swipe seek) ──
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsTransitioning(false);

    if (e.touches.length === 2) {
      gestureModeRef.current = "pinch";
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      pinchStartDistRef.current = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      pinchStartMidRef.current = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
      startScaleRef.current = currentScaleRef.current;
      startPanRef.current = { ...currentPanRef.current };
      touchStartRef.current = null;
      return;
    }

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const now = Date.now();

      // Double tap to toggle zoom
      if (now - lastTapRef.current < 260) {
        handleDoubleTap(touch.clientX, touch.clientY);
        lastTapRef.current = 0;
        return;
      }
      lastTapRef.current = now;

      touchStartRef.current = { x: touch.clientX, y: touch.clientY, time: now };
      startPanRef.current = { ...currentPanRef.current };
      gestureModeRef.current = currentScaleRef.current > 1.01 ? "pan" : "idle";
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    // 2-Finger Pinch Zoom + Simultaneous Midpoint Pan
    if (e.touches.length === 2 && pinchStartDistRef.current && pinchStartMidRef.current) {
      const t1 = e.touches[0];
      const t2 = e.touches[1];
      const currentDist = Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY);
      const factor = currentDist / pinchStartDistRef.current;
      const nextScale = Math.min(Math.max(1, startScaleRef.current * factor), 5);
      setScale(nextScale);

      // Midpoint pan during pinch
      const currentMid = {
        x: (t1.clientX + t2.clientX) / 2,
        y: (t1.clientY + t2.clientY) / 2,
      };
      const midDx = currentMid.x - pinchStartMidRef.current.x;
      const midDy = currentMid.y - pinchStartMidRef.current.y;

      if (nextScale <= 1.01) {
        setPan({ x: 0, y: 0 });
      } else {
        const rawPan = {
          x: startPanRef.current.x + midDx,
          y: startPanRef.current.y + midDy,
        };
        setPan(applyRubberBand(rawPan, nextScale));
      }
      return;
    }

    // 1-Finger Pan / Swipe
    if (e.touches.length === 1 && touchStartRef.current) {
      const touch = e.touches[0];
      const dx = touch.clientX - touchStartRef.current.x;
      const dy = touch.clientY - touchStartRef.current.y;
      const activeScale = currentScaleRef.current;

      if (activeScale > 1.01) {
        // Panning when zoomed: move freely in all directions with edge resistance
        const targetPan = {
          x: startPanRef.current.x + dx,
          y: startPanRef.current.y + dy,
        };
        setPan(applyRubberBand(targetPan, activeScale));
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
        if ((currentIndex === 0 && dx > 0) || (currentIndex === images.length - 1 && dx < 0)) {
          setSwipeX(dx * 0.35);
        } else {
          setSwipeX(dx);
        }
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    // If one finger is still on screen after 2-finger pinch, seamlessly continue with 1-finger pan!
    if (e.touches.length === 1) {
      const remainingTouch = e.touches[0];
      touchStartRef.current = {
        x: remainingTouch.clientX,
        y: remainingTouch.clientY,
        time: Date.now(),
      };
      startPanRef.current = { ...currentPanRef.current };
      gestureModeRef.current = currentScaleRef.current > 1.01 ? "pan" : "idle";
      pinchStartDistRef.current = null;
      pinchStartMidRef.current = null;
      return;
    }

    // All fingers lifted
    const activeScale = currentScaleRef.current;

    if (activeScale <= 1.05) {
      setIsTransitioning(true);
      setScale(1);
      setPan({ x: 0, y: 0 });
      setTimeout(() => setIsTransitioning(false), 200);
    } else {
      setIsTransitioning(true);
      setPan((prev) => clampPan(prev, activeScale));
      setTimeout(() => setIsTransitioning(false), 200);
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
    pinchStartMidRef.current = null;
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
        {/* Skeleton Shimmer Loading Placeholder */}
        {!isFrontLoaded && (
          <div
            className="skeleton"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              borderRadius: "16px",
            }}
          />
        )}
        <Image
          src={frontImage}
          alt={`${altText} — front`}
          fill
          sizes="(max-width: 768px) 100vw, 55vw"
          style={{
            objectFit: "contain",
            padding: "16px",
            opacity: isFrontLoaded ? 1 : 0,
            transition: "opacity 280ms ease-out",
          }}
          priority
          onLoad={() => setIsFrontLoaded(true)}
        />
        <div style={{ position: "absolute", top: "12px", left: "12px", zIndex: 2 }}>
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
          {/* Skeleton Shimmer Loading Placeholder */}
          {!isBackLoaded && (
            <div
              className="skeleton"
              style={{
                position: "absolute",
                inset: 0,
                zIndex: 1,
                borderRadius: "16px",
              }}
            />
          )}
          <Image
            src={backImage}
            alt={`${altText} — back`}
            fill
            sizes="(max-width: 768px) 100vw, 55vw"
            style={{
              objectFit: "contain",
              padding: "16px",
              opacity: isBackLoaded ? 1 : 0,
              transition: "opacity 280ms ease-out",
            }}
            loading="lazy"
            onLoad={() => setIsBackLoaded(true)}
          />
          <div
            style={{
              position: "absolute",
              bottom: "12px",
              left: "12px",
              zIndex: 2,
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
                      if (e.target === e.currentTarget && scale <= 1.01) {
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
