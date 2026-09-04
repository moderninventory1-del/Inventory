"use client";
// src/components/shared/IOSDropdown.tsx
// Premium iOS-inspired filter dropdown — Portal-rendered bottom sheet on mobile, smart-boundary popover on desktop

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
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
  hideAllOption?: boolean;
  defaultValue?: string;
}

export default function IOSDropdown({
  label,
  allLabel,
  options,
  selectedValue,
  onChange,
  icon,
  hideAllOption = false,
  defaultValue,
}: IOSDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visualViewportHeight, setVisualViewportHeight] = useState<number | null>(null);

  const [popoverCoords, setPopoverCoords] = useState<{
    top?: number;
    bottom?: number;
    left?: number;
    right?: number;
    minWidth: number;
    placement: "bottom" | "top";
  }>({ minWidth: 220, placement: "bottom" });

  const containerRef = useRef<HTMLDivElement | null>(null);
  const desktopPopoverRef = useRef<HTMLDivElement | null>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mobileSearchFormRef = useRef<HTMLFormElement | null>(null);

  const handleDismissKeyboard = () => {
    searchInputRef.current?.blur();
    desktopSearchInputRef.current?.blur();
    if (typeof document !== "undefined") {
      (document.activeElement as HTMLElement)?.blur?.();
    }
  };

  // Automatically dismiss mobile sheet keyboard when tapping outside search form
  useEffect(() => {
    const handlePointerDownOutside = (e: Event) => {
      if (!isSearchFocused && document.activeElement !== searchInputRef.current) return;

      const target = e.target as Node | null;
      if (!target) return;
      if (mobileSearchFormRef.current && !mobileSearchFormRef.current.contains(target)) {
        handleDismissKeyboard();
        setIsSearchFocused(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDownOutside, true);
    document.addEventListener("touchstart", handlePointerDownOutside, true);
    return () => {
      document.removeEventListener("mousedown", handlePointerDownOutside, true);
      document.removeEventListener("touchstart", handlePointerDownOutside, true);
    };
  }, [isSearchFocused]);

  // Client mount check + screen & visualViewport detection
  useEffect(() => {
    setMounted(true);
    const checkScreen = () => {
      setIsMobile(window.innerWidth < 768);
      if (typeof window !== "undefined" && window.visualViewport) {
        setVisualViewportHeight(window.visualViewport.height);
      }
    };
    checkScreen();
    window.addEventListener("resize", checkScreen);

    const vv = typeof window !== "undefined" ? window.visualViewport : null;
    if (vv) {
      vv.addEventListener("resize", checkScreen);
      vv.addEventListener("scroll", checkScreen);
    }

    return () => {
      window.removeEventListener("resize", checkScreen);
      if (vv) {
        vv.removeEventListener("resize", checkScreen);
        vv.removeEventListener("scroll", checkScreen);
      }
    };
  }, []);

  // Update desktop popover position
  const updateCoords = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedHeight = 300;
    const placement: "bottom" | "top" =
      spaceBelow < estimatedHeight && spaceAbove > spaceBelow ? "top" : "bottom";

    const minWidth = Math.max(rect.width, 220);
    const shouldAlignRight = rect.left + minWidth > window.innerWidth - 16;

    if (shouldAlignRight) {
      const right = Math.max(12, window.innerWidth - rect.right);
      if (placement === "bottom") {
        setPopoverCoords({
          top: rect.bottom + 6,
          right,
          minWidth,
          placement: "bottom",
        });
      } else {
        setPopoverCoords({
          bottom: window.innerHeight - rect.top + 6,
          right,
          minWidth,
          placement: "top",
        });
      }
    } else {
      const left = Math.max(12, rect.left);
      if (placement === "bottom") {
        setPopoverCoords({
          top: rect.bottom + 6,
          left,
          minWidth,
          placement: "bottom",
        });
      } else {
        setPopoverCoords({
          bottom: window.innerHeight - rect.top + 6,
          left,
          minWidth,
          placement: "top",
        });
      }
    }
  }, []);

  // Close desktop popover on outside click or Escape
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current &&
        !containerRef.current.contains(target) &&
        desktopPopoverRef.current &&
        !desktopPopoverRef.current.contains(target)
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
  }, [isOpen, isMobile]);

  // Track scroll and resize when desktop popover is open
  useEffect(() => {
    if (isOpen && !isMobile) {
      updateCoords();
      window.addEventListener("scroll", updateCoords, true);
      window.addEventListener("resize", updateCoords);
      return () => {
        window.removeEventListener("scroll", updateCoords, true);
        window.removeEventListener("resize", updateCoords);
      };
    }
  }, [isOpen, isMobile, updateCoords]);

  // Lock body scroll when mobile sheet is open
  useEffect(() => {
    if (isOpen && isMobile) {
      const original = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = original;
      };
    }
  }, [isOpen, isMobile]);

  // Focus search input when opened (desktop only to prevent unwanted auto-keyboard on mobile)
  useEffect(() => {
    if (isOpen && !isMobile && desktopSearchInputRef.current) {
      setTimeout(() => desktopSearchInputRef.current?.focus(), 80);
    } else if (!isOpen) {
      setSearchFilter("");
      setIsSearchFocused(false);
    }
  }, [isOpen, isMobile]);

  const handleToggle = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (!mobile && !isOpen) {
      updateCoords();
    }
    setIsOpen((prev) => !prev);
  };

  const defaultAll = allLabel ?? `All ${label}s`;
  const selectedOption = options.find((o) => o.value === selectedValue);
  const isSelected =
    defaultValue !== undefined
      ? selectedValue !== defaultValue && Boolean(selectedValue)
      : Boolean(selectedValue);
  const displayLabel = selectedOption ? selectedOption.label : defaultAll;

  // Filter options based on local search inside dropdown
  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(searchFilter.toLowerCase().trim())
  );

  const handleSelect = (val: string) => {
    handleDismissKeyboard();
    onChange(val);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} style={{ position: "relative", display: "inline-block" }}>
      {/* ── Trigger Pill Button ── */}
      <button
        type="button"
        onClick={handleToggle}
        className="ios-dropdown-trigger"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "7px",
          padding: "7px 14px",
          borderRadius: "100px",
          fontSize: "12.5px",
          fontWeight: isSelected ? 700 : 600,
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

      {/* ── Desktop Floating Popover Menu (>= 768px via Portal) ── */}
      {mounted && isOpen && !isMobile && createPortal(
        <div
          ref={desktopPopoverRef}
          className="ios-desktop-popover card"
          style={{
            position: "fixed",
            top: popoverCoords.top !== undefined ? `${popoverCoords.top}px` : "auto",
            bottom: popoverCoords.bottom !== undefined ? `${popoverCoords.bottom}px` : "auto",
            left: popoverCoords.left !== undefined ? `${popoverCoords.left}px` : "auto",
            right: popoverCoords.right !== undefined ? `${popoverCoords.right}px` : "auto",
            zIndex: 99999,
            minWidth: `${popoverCoords.minWidth}px`,
            maxWidth: "calc(100vw - 32px)",
            width: "max-content",
            background: "#ffffff",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--color-border)",
            boxShadow: "0 12px 36px rgba(0, 0, 0, 0.14), 0 2px 8px rgba(0, 0, 0, 0.04)",
            padding: "6px",
            animation: "ios-popover-in 160ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
            transformOrigin:
              popoverCoords.placement === "top"
                ? popoverCoords.right !== undefined ? "bottom right" : "bottom left"
                : popoverCoords.right !== undefined ? "top right" : "top left",
          }}
          role="listbox"
        >
          {/* Quick search if > 6 options */}
          {options.length > 6 && (
            <div style={{ padding: "4px 6px 8px", borderBottom: "1px solid var(--color-border)" }}>
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <Search size={14} style={{ position: "absolute", left: "10px", color: "var(--color-text-muted)", pointerEvents: "none" }} />
                <input
                  ref={desktopSearchInputRef}
                  type="search"
                  enterKeyHint="search"
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleDismissKeyboard();
                    }
                  }}
                  placeholder={`Filter ${label.toLowerCase()}s…`}
                  style={{
                    width: "100%",
                    padding: searchFilter ? "6px 28px 6px 30px" : "6px 10px 6px 30px",
                    borderRadius: "8px",
                    border: "1px solid var(--color-border)",
                    fontSize: "12px",
                    background: "var(--color-bg-surface)",
                    outline: "none",
                  }}
                />
                {Boolean(searchFilter) && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchFilter("");
                      desktopSearchInputRef.current?.focus();
                    }}
                    aria-label="Clear filter"
                    style={{
                      position: "absolute",
                      right: "8px",
                      background: "rgba(0, 0, 0, 0.1)",
                      border: "none",
                      borderRadius: "50%",
                      width: "16px",
                      height: "16px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      cursor: "pointer",
                      color: "#ffffff",
                      padding: 0,
                    }}
                  >
                    <X size={10} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Options scroll list */}
          <div style={{ maxHeight: "260px", overflowY: "auto", padding: "4px 0" }}>
            {/* Default "All" option */}
            {!hideAllOption && (!searchFilter || defaultAll.toLowerCase().includes(searchFilter.toLowerCase().trim())) && (
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
                  fontWeight: !selectedValue ? 700 : 500,
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "background 100ms ease",
                }}
              >
                <span>{defaultAll}</span>
                {!selectedValue && <Check size={15} color="var(--color-accent)" />}
              </button>
            )}

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
                    fontWeight: isItemActive ? 700 : 500,
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
        </div>,
        document.body
      )}

      {/* ── Mobile iOS Bottom Sheet Popup (< 768px via Portal) ── */}
      {isOpen && isMobile && mounted && (() => {
        const isExpanded = isSearchFocused || Boolean(searchFilter.trim());
        return createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              height: visualViewportHeight ? `${visualViewportHeight}px` : "100%",
              zIndex: 9999,
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              animation: "ios-sheet-backdrop 200ms ease-out forwards",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                if (isSearchFocused) {
                  handleDismissKeyboard();
                } else {
                  setIsOpen(false);
                }
              }
            }}
          >
            <div
              className="ios-mobile-sheet"
              style={{
                width: "100%",
                maxWidth: "520px",
                margin: "0 auto",
                background: "#ffffff",
                borderTopLeftRadius: "22px",
                borderTopRightRadius: "22px",
                padding: isExpanded
                  ? "14px 18px calc(14px + env(safe-area-inset-bottom, 12px))"
                  : "16px 20px calc(24px + env(safe-area-inset-bottom, 16px))",
                boxShadow: "0 -8px 36px rgba(0, 0, 0, 0.16)",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
                height:
                  options.length > 5
                    ? isSearchFocused && visualViewportHeight
                      ? `${Math.max(260, visualViewportHeight - 12)}px`
                      : isExpanded
                      ? "calc(100dvh - 16px)"
                      : "70vh"
                    : "auto",
                maxHeight:
                  options.length > 5
                    ? isSearchFocused && visualViewportHeight
                      ? `${Math.max(260, visualViewportHeight - 12)}px`
                      : isExpanded
                      ? "calc(100dvh - 16px)"
                      : "84vh"
                    : "84vh",
                transition:
                  "height 280ms cubic-bezier(0.16, 1, 0.3, 1), max-height 280ms cubic-bezier(0.16, 1, 0.3, 1), padding 200ms ease",
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
                  background: "rgba(0, 0, 0, 0.2)",
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
                  <h3 style={{ fontSize: "17.5px", fontWeight: 800, letterSpacing: "-0.025em", margin: 0 }}>
                    Select {label}
                  </h3>
                  <p style={{ fontSize: "12.5px", fontWeight: 500, color: "var(--color-text-muted)", margin: "2px 0 0 0" }}>
                    Choose a {label.toLowerCase()} to filter inventory
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    handleDismissKeyboard();
                    setIsOpen(false);
                  }}
                  style={{
                    background: "rgba(0,0,0,0.06)",
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
                <form
                  ref={mobileSearchFormRef}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleDismissKeyboard();
                  }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      flex: 1,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Search
                      size={16}
                      style={{
                        position: "absolute",
                        left: "12px",
                        color: isSearchFocused ? "var(--color-accent)" : "var(--color-text-muted)",
                        pointerEvents: "none",
                        transition: "color 150ms ease",
                      }}
                    />
                    <input
                      ref={searchInputRef}
                      type="search"
                      enterKeyHint="search"
                      inputMode="search"
                      value={searchFilter}
                      onFocus={() => setIsSearchFocused(true)}
                      onBlur={() => setIsSearchFocused(false)}
                      onChange={(e) => setSearchFilter(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleDismissKeyboard();
                        }
                      }}
                      placeholder={`Search ${label.toLowerCase()}s…`}
                      style={{
                        width: "100%",
                        height: "42px",
                        padding: searchFilter ? "8px 36px 8px 38px" : "8px 12px 8px 38px",
                        borderRadius: "12px",
                        border: isSearchFocused
                          ? "1.5px solid var(--color-accent)"
                          : "1px solid var(--color-border)",
                        fontSize: "15px",
                        background: isSearchFocused ? "#ffffff" : "var(--color-bg-surface)",
                        outline: "none",
                        boxShadow: isSearchFocused ? "0 0 0 3px rgba(0, 113, 227, 0.12)" : "none",
                        transition: "all 180ms ease",
                        WebkitAppearance: "none",
                      }}
                    />
                    {Boolean(searchFilter) && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchFilter("");
                          searchInputRef.current?.focus();
                        }}
                        aria-label="Clear search"
                        style={{
                          position: "absolute",
                          right: "10px",
                          background: "rgba(0, 0, 0, 0.14)",
                          border: "none",
                          borderRadius: "50%",
                          width: "20px",
                          height: "20px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          cursor: "pointer",
                          color: "#ffffff",
                          padding: 0,
                        }}
                      >
                        <X size={12} strokeWidth={2.5} />
                      </button>
                    )}
                  </div>

                  {/* Clickable Search button to dismiss keyboard and show results */}
                  <button
                    type="submit"
                    onClick={(e) => {
                      e.preventDefault();
                      handleDismissKeyboard();
                    }}
                    onMouseDown={(e) => e.preventDefault()}
                    aria-label="Search and close keyboard"
                    style={{
                      height: "42px",
                      padding: "0 14px",
                      borderRadius: "12px",
                      background: "var(--color-accent)",
                      color: "#ffffff",
                      border: "none",
                      fontSize: "13px",
                      fontWeight: 700,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "5px",
                      cursor: "pointer",
                      flexShrink: 0,
                      boxShadow: "0 2px 8px rgba(0, 113, 227, 0.22)",
                      transition: "transform 100ms ease, opacity 100ms ease",
                    }}
                  >
                    <Search size={14} strokeWidth={2.5} />
                    <span>Search</span>
                  </button>
                </form>
              )}

              {/* Options list */}
              <div
                onScroll={() => {
                  if (isSearchFocused) {
                    handleDismissKeyboard();
                    setIsSearchFocused(false);
                  }
                }}
                style={{
                  overflowY: "auto",
                  WebkitOverflowScrolling: "touch",
                  flex: options.length > 5 ? 1 : "initial",
                  minHeight: options.length > 5 ? "120px" : "auto",
                  maxHeight: options.length > 5 ? "none" : "52vh",
                  display: "flex",
                  flexDirection: "column",
                  gap: "4px",
                  padding: "4px 0",
                }}
              >
              {/* Reset to All */}
              {!hideAllOption && (!searchFilter || defaultAll.toLowerCase().includes(searchFilter.toLowerCase().trim())) && (
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
              )}

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
        </div>,
        document.body
      );
    })()}

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
