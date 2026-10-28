"use client";
// src/components/shared/BackButton.tsx
// Native browser history back button to guarantee exact scroll and state restoration identical to mobile navigation

import { ArrowLeft } from "lucide-react";

interface BackButtonProps {
  fallbackHref: string;
  label: string;
  className?: string;
  title?: string;
  style?: React.CSSProperties;
}

export default function BackButton({
  fallbackHref,
  label,
  className,
  title,
  style,
}: BackButtonProps) {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      // Trigger native browser history traversal (identical to mobile hardware/swipe back button)
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      // Fallback if accessed via direct URL
      window.location.href = fallbackHref;
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      title={title || label}
      style={{
        cursor: "pointer",
        font: "inherit",
        ...style,
      }}
    >
      <ArrowLeft size={16} strokeWidth={2.4} />
      <span>{label}</span>
    </button>
  );
}
