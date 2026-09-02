"use client";
// src/components/public/ScrollToTopProgress.tsx
// Premium Apple-style scroll-to-top button with circular scroll progress ring

import { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopProgress() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const scrollHeight =
        document.documentElement.scrollHeight -
        document.documentElement.clientHeight;

      if (scrollHeight > 0) {
        const progress = Math.min(100, Math.max(0, (scrollTop / scrollHeight) * 100));
        setScrollProgress(progress);
      }

      // Show button after scrolling down 180px
      setIsVisible(scrollTop > 180);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // SVG circular metrics
  const size = 44;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (scrollProgress / 100) * circumference;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label="Scroll to top"
      title={`Scroll to top (${Math.round(scrollProgress)}% scrolled)`}
      className={`scroll-to-top-btn ${isVisible ? "visible" : ""}`}
      style={{
        position: "fixed",
        bottom: "max(24px, env(safe-area-inset-bottom, 24px))",
        right: "20px",
        zIndex: 45,
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: "50%",
        border: "none",
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.12), 0 1px 4px rgba(0, 0, 0, 0.06)",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-text-primary)",
        padding: 0,
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "scale(1) translateY(0)" : "scale(0.8) translateY(12px)",
        pointerEvents: isVisible ? "auto" : "none",
        transition: "opacity 240ms cubic-bezier(0.16, 1, 0.3, 1), transform 240ms cubic-bezier(0.16, 1, 0.3, 1), box-shadow 200ms ease",
        userSelect: "none",
      }}
    >
      {/* SVG Progress Ring */}
      <svg
        width={size}
        height={size}
        style={{
          position: "absolute",
          inset: 0,
          transform: "rotate(-90deg)",
        }}
      >
        {/* Background track circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(0, 0, 0, 0.07)"
          strokeWidth={strokeWidth}
        />
        {/* Dynamic progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="var(--color-accent)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 80ms linear",
          }}
        />
      </svg>

      {/* Up Arrow Icon */}
      <ArrowUp
        size={17}
        strokeWidth={2.4}
        color="var(--color-accent)"
        style={{
          position: "relative",
          zIndex: 2,
          transition: "transform 150ms cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        className="scroll-arrow-icon"
      />

      <style>{`
        .scroll-to-top-btn:hover {
          box-shadow: 0 6px 24px rgba(0, 113, 227, 0.22), 0 2px 6px rgba(0, 0, 0, 0.08) !important;
          transform: scale(1.06) !important;
        }

        .scroll-to-top-btn:hover .scroll-arrow-icon {
          transform: translateY(-2px);
        }

        .scroll-to-top-btn:active {
          transform: scale(0.92) !important;
        }
      `}</style>
    </button>
  );
}
