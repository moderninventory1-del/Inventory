"use client";
// src/components/shared/PreventZoom.tsx
// Native app feel: restricts pinch-to-zoom, double-tap zoom, gesture zoom, and ctrl+wheel zoom

import { useEffect } from "react";

export default function PreventZoom() {
  useEffect(() => {
    // 1. Prevent iOS gesture zooming (gesturestart, gesturechange, gestureend)
    const handleGesture = (e: Event) => {
      e.preventDefault();
    };

    // 2. Prevent multi-touch pinch to zoom
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // 3. Prevent rapid double-tap to zoom
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        // If the tap was inside an interactive control or input, allow normal tap
        const target = e.target as HTMLElement | null;
        const isInteractive = target?.closest("button, a, input, select, textarea");
        if (!isInteractive) {
          e.preventDefault();
        }
      }
      lastTouchEnd = now;
    };

    // 4. Prevent Ctrl + Scroll / Wheel zoom on desktop/trackpads
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey) {
        e.preventDefault();
      }
    };

    // 5. Prevent Ctrl + '+' / Ctrl + '-' keyboard zoom shortcuts
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key === "+" || e.key === "-" || e.key === "=" || e.key === "0")
      ) {
        e.preventDefault();
      }
    };

    // Attach listeners
    document.addEventListener("gesturestart", handleGesture as any, { passive: false });
    document.addEventListener("gesturechange", handleGesture as any, { passive: false });
    document.addEventListener("gestureend", handleGesture as any, { passive: false });
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd, { passive: false });
    document.addEventListener("wheel", handleWheel, { passive: false });
    document.addEventListener("keydown", handleKeyDown, { passive: false });

    return () => {
      document.removeEventListener("gesturestart", handleGesture as any);
      document.removeEventListener("gesturechange", handleGesture as any);
      document.removeEventListener("gestureend", handleGesture as any);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
      document.removeEventListener("wheel", handleWheel);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return null;
}
