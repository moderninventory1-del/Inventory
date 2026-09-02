"use client";
// src/components/shared/IOSDropdown.tsx
// Premium iOS-inspired filter dropdown — bottom sheet on mobile, popover menu on desktop

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, Search, X } from "lucide-react";

export interface IOSDropdownOption {
  value: string;
  label: string;
}

interface IOSDropdownProps {
  label: string; // e.g. "Category" or "Brand" or "Status"
  allLabel?: string; // e.g. "All Categories" or "All Brands"
  options: IOSDropdownOption[];
  selectedValue: string;
  onChange: (value: string) => void;
  icon?: React.ReactNode;
}

export default function IOSDropdown({
  label,
  allLabel,
  options,
  selectedValue,
  onChange,
  icon,
}: IOSDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  // Detect mobile screen (< 768px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Close desktop popover on outside click or Escape
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsOpen(false);
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 80);
    } else {
      setSearchFilter("");
    }
  }, [isOpen]);

  const defaultAll = allLabel ?? `All ${label}s`;
  const selectedOption = options.find((o) => o.value === selectedValue);
  const isSelected = Boolean(selectedValue);
  const displayLabel = selectedOption ? selectedOption.label : defaultAll;

  // Filter options based on local search inside dropdown
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  const handleSelect = (val: string) => {
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      {/* ── Trigger Pill Button ── */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="ios-dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          padding: "7px 14px",
          borderRadius: "100px",
          fontSize: "12px",
          fontWeight: 600,
          cursor: "pointer",
          border: isSelected
            ? "1.5px solid var(--color-accent)"
            : "1px solid var(--color-border)",
          background: isSelected
            ? "rgba(0, 113, 227, 0.08)"
            : "var(--color-bg-card)",
          color: isSelected
            ? "var(--color-accent)"
            : "var(--color-text-secondary)",
          boxShadow: isSelected
            ? "0 2px 8px rgba(0, 113, 227, 0.15)"
            : "0 1px 2px rgba(0, 0, 0, 0.03)",
          transition: "all 150ms cubic-bezier(0.16, 1, 0.3, 1)",
          userSelect: "none",
          whiteSpace: "nowrap",
        }}
      >
        {icon && (
          <span style={{ display: "flex", alignItems: "center", opacity: isSelected ? 1 : 0.7 }}>
            {icon}
          </span>
        )}
        <span style={{ letterSpacing: "0.01em" }}>{displayLabel}</span>
        <ChevronDown
          size={13}
          style={{
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 200ms cubic-bezier(0.16, 1, 0.3, 1)",
            color: isSelected ? "var(--color-accent)" : "var(--color-text-muted)",
          }}
        />
      </button>

      {/* ── Desktop Floating Popover Menu (>= 768px) ── */}
      {isOpen && !isMobile && (
        <div
          className="ios-desktop-popover card"
          style={{
            position: "absolute",
            top: "calc(100% + 8px)",
            left: 0,
            zIndex: 60,
            minWidth: "220px",
            maxWidth: "320px",
            background: "#ffffff",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.1), 0 2px 6px rgba(0, 0, 0, 0.04)",
            padding: "6px",
            animation: "ios-popover-in 160ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
          role="listbox"
        >
          {/* Quick search if > 6 options */}
          {options.length > 6 && (
            <div style={{ padding: "4px 6px 8px", borderBottom: "1px solid var(--color-border)" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Search size={14} style={{ position: "absolute", left: "10px", color: "var(--color-text-muted)" }} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={`Filter ${label.toLowerCase()}s…`}
                  style={{
                    width: "100%",
                    padding: "6px 10px 6px 30px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    fontSize: "12px",
                    background: "var(--color-bg-surface)",
                    outline: "none",
                  }}
                />
              </div>
            </div>
          )}

          {/* Options scroll list */}
          <div style={{ maxHeight: "260px", overflowY: "auto", padding: "4px 0" }}>
            {/* Default "All" option */}
            <button
              type="button"
              onClick={() => handleSelect("")}
              className="ios-option-item"
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "8px 12px",
                border: "none",
                background: !selectedValue ? "rgba(0, 113, 227, 0.08)" : "transparent",
                color: !selectedValue ? "var(--color-accent)" : "var(--color-text-primary)",
                borderRadius: "8px",
                fontSize: "13px",
                fontWeight: !selectedValue ? 600 : 400,
                cursor: "pointer",
                textAlign: "left",
                transition: "background 100ms ease",
              }}
            >
              <span>{defaultAll}</span>
              {!selectedValue && <Check size={15} color="var(--color-accent)" />}
            </button>

            {filteredOptions.map((opt) => {
              const isItemActive = selectedValue === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelect(opt.value)}
                  className="ios-option-item"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    border: "none",
                    background: isItemActive ? "rgba(0, 113, 227, 0.08)" : "transparent",
                    color: isItemActive ? "var(--color-accent)" : "var(--color-text-primary)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: isItemActive ? 600 : 400,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "background 100ms ease",
                  }}
                >
                  <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {opt.label}
                  </span>
                  {isItemActive && <Check size={15} color="var(--color-accent)" />}
                </button>
              );
            })}

            {filteredOptions.length === 0 && (
              <p style={{ padding: "12px", fontSize: "12px", color: "var(--color-text-muted)", textAlign: "center" }}>
                No {label.toLowerCase()} found
              </p>
            )}
          </div>
        </div>
      )}

      {/* ── Mobile iOS Bottom Sheet Popup (< 768px) ── */}
      {isOpen && isMobile && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 150,
            background: "rgba(0, 0, 0, 0.45)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-end",
            animation: "ios-sheet-backdrop 200ms ease-out forwards",
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setIsOpen(false);
          }}
        >
          <div
            className="ios-mobile-sheet"
            style={{
              width: "100%",
              maxWidth: "500px",
              margin: "0 auto",
              background: "#ffffff",
              borderTopLeftRadius: "24px",
              borderTopRightRadius: "24px",
              padding: "16px 20px calc(24px + env(safe-area-inset-bottom, 16px))",
              boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.12)",
              display: "flex",
              flexDirection: "column",
              gap: "14px",
              maxHeight: "82vh",
              animation: "ios-sheet-up 260ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            }}
            role="dialog"
            aria-label={`Select ${label}`}
          >
            {/* Grabber Bar */}
            <div
              style={{
                width: "36px",
                height: "4px",
                borderRadius: "2px",
                background: "rgba(0, 0, 0, 0.18)",
                alignSelf: "center",
              }}
            />

            {/* Header */}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                paddingBottom: "8px",
                borderBottom: "1px solid var(--color-border)",
              }}
            >
              <div>
                <h3 style={{ fontSize: "17px", fontWeight: 700, letterSpacing: "-0.02em" }}>
                  Select {label}
                </h3>
                <p style={{ fontSize: "12px", color: "var(--color-text-muted)" }}>
                  Choose a {label.toLowerCase()} to filter inventory
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                style={{
                  background: "rgba(0,0,0,0.05)",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "var(--color-text-secondary)",
                }}
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            {/* Search filter input inside sheet if > 5 options */}
            {options.length > 5 && (
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Search
                  size={16}
                  style={{
                    position: "absolute",
                    left: "12px",
                    color: "var(--color-text-muted)",
                    pointerEvents: "none",
                  }}
                />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  placeholder={`Search ${label.toLowerCase()}s…`}
                  style={{
                    width: "100%",
                    height: "40px",
                    padding: "8px 12px 8px 38px",
                    borderRadius: "12px",
                    border: "1px solid var(--color-border)",
                    fontSize: "14px",
                    background: "var(--color-bg-surface)",
                    outline: "none",
                  }}
                />
              </div>
            )}

            {/* Options list */}
            <div
              style={{
                overflowY: "auto",
                maxHeight: "50vh",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                padding: "4px 0",
              }}
            >
              {/* Reset to All */}
              <button
                type="button"
                onClick={() => handleSelect("")}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "13px 16px",
                  borderRadius: "12px",
                  border: "none",
                  background: !selectedValue ? "rgba(0, 113, 227, 0.08)" : "transparent",
                  color: !selectedValue ? "var(--color-accent)" : "var(--color-text-primary)",
                  fontSize: "15px",
                  fontWeight: !selectedValue ? 700 : 500,
                  textAlign: "left",
                  cursor: "pointer",
                  transition: "background 120ms ease",
                }}
              >
                <span>{defaultAll}</span>
                {!selectedValue && <Check size={18} color="var(--color-accent)" />}
              </button>

              {filteredOptions.map((opt) => {
                const isItemActive = selectedValue === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "13px 16px",
                      borderRadius: "12px",
                      border: "none",
                      background: isItemActive ? "rgba(0, 113, 227, 0.08)" : "transparent",
                      color: isItemActive ? "var(--color-accent)" : "var(--color-text-primary)",
                      fontSize: "15px",
                      fontWeight: isItemActive ? 700 : 500,
                      textAlign: "left",
                      cursor: "pointer",
                      transition: "background 120ms ease",
                    }}
                  >
                    <span>{opt.label}</span>
                    {isItemActive && <Check size={18} color="var(--color-accent)" />}
                  </button>
                );
              })}

              {filteredOptions.length === 0 && (
                <div style={{ textAlign: "center", padding: "24px 0", color: "var(--color-text-muted)", fontSize: "14px" }}>
                  No {label.toLowerCase()} found
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .ios-dropdown-trigger:active {
          transform: scale(0.96) !important;
        }

        .ios-option-item:hover {
          background: var(--color-bg-surface) !important;
        }

        @keyframes ios-popover-in {
          from {
            opacity: 0;
            transform: translateY(-4px) scale(0.98);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        @keyframes ios-sheet-backdrop {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes ios-sheet-up {
          from {
            transform: translateY(100%);
            opacity: 0.8;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
