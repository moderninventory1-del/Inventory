"use client";
// src/components/admin/IOSSelect.tsx
// Premium Apple-inspired Form Select Popover (Desktop) & Bottom Sheet (Mobile)
// Replaces standard HTML <select> dropdowns with a smooth, tactile "pop" experience

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search, X, Plus } from "lucide-react";

export interface IOSSelectOption {
  value: string;
  label: string;
  subtitle?: string;
}

interface IOSSelectProps {
  id?: string;
  name: string;
  label: string; // e.g. "Brand" or "Category"
  placeholder?: string; // e.g. "Select brand…"
  options: IOSSelectOption[];
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  onAddNew?: () => void;
  addNewLabel?: string; // e.g. "+ Add New Brand"
}

export default function IOSSelect({
  id,
  name,
  label,
  placeholder = `Select ${label.toLowerCase()}…`,
  options,
  value,
  onChange,
  required = false,
  disabled = false,
  icon,
  onAddNew,
  addNewLabel = `+ Add New ${label}`,
}: IOSSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchFilter, setSearchFilter] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [visualViewportHeight, setVisualViewportHeight] = useState<number | null>(null);
  const [popoverCoords, setPopoverCoords] = useState<{
    top?: number;
    bottom?: number;
    left: number;
    width: number;
    placement: "bottom" | "top";
  }>({ left: 0, width: 280, placement: "bottom" });

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const hiddenInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const mobileSearchInputRef = useRef<HTMLInputElement | null>(null);
  const mobileSearchFormRef = useRef<HTMLFormElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  const selectedOption = options.find((o) => o.value === value);

  const handleDismissKeyboard = useCallback(() => {
    searchInputRef.current?.blur();
    mobileSearchInputRef.current?.blur();
    if (typeof document !== "undefined") {
      (document.activeElement as HTMLElement)?.blur?.();
    }
  }, []);

  // Automatically dismiss mobile sheet keyboard when tapping outside search form
  useEffect(() => {
    const handlePointerDownOutside = (e: Event) => {
      if (!isSearchFocused && document.activeElement !== mobileSearchInputRef.current) return;

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
  }, [isSearchFocused, handleDismissKeyboard]);

  // Mount detection & visualViewport tracking for mobile virtual keyboard
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

  // Update position on open, scroll, or resize
  const updateCoords = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const spaceAbove = rect.top;
    const popHeight = Math.min(340, options.length * 44 + 90);

    const placement: "bottom" | "top" =
      spaceBelow < popHeight && spaceAbove > spaceBelow ? "top" : "bottom";

    const width = Math.max(rect.width, 240);
    let left = rect.left;
    if (left + width > window.innerWidth - 12) {
      left = window.innerWidth - width - 12;
    }
    if (left < 12) left = 12;

    if (placement === "bottom") {
      setPopoverCoords({
        top: rect.bottom + 6,
        left,
        width,
        placement: "bottom",
      });
    } else {
      setPopoverCoords({
        bottom: window.innerHeight - rect.top + 6,
        left,
        width,
        placement: "top",
      });
    }
  }, [options.length]);

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

  // Lock body scroll on mobile sheet
  useEffect(() => {
    if (isOpen && isMobile) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isOpen, isMobile]);

  // Outside click & Escape close for desktop popover
  useEffect(() => {
    if (!isOpen || isMobile) return;

    const handleDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        triggerRef.current &&
        !triggerRef.current.contains(target) &&
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen, isMobile]);

  // Focus search input when opened
  useEffect(() => {
    if (isOpen && !isMobile && options.length > 5 && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 60);
    } else if (!isOpen) {
      setSearchFilter("");
      setIsSearchFocused(false);
      handleDismissKeyboard();
    }
  }, [isOpen, isMobile, options.length, handleDismissKeyboard]);

  const handleToggle = () => {
    if (disabled) return;
    const mobile = window.innerWidth < 768;
    setIsMobile(mobile);
    if (isOpen) {
      handleDismissKeyboard();
      setIsSearchFocused(false);
    } else {
      updateCoords();
    }
    setIsOpen((prev) => !prev);
  };

  const handleSelect = (val: string) => {
    handleDismissKeyboard();
    setIsSearchFocused(false);
    onChange(val);
    setIsOpen(false);
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      try {
        navigator.vibrate(12);
      } catch {}
    }
  };

  const filteredOptions = options.filter(
    (opt) =>
      opt.label.toLowerCase().includes(searchFilter.toLowerCase().trim()) ||
      (opt.subtitle && opt.subtitle.toLowerCase().includes(searchFilter.toLowerCase().trim()))
  );

  return (
    <>
      <style>{`
        @keyframes iosSelectPopIn {
          0% {
            opacity: 0;
            transform: scale(0.95) translateY(-5px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes iosSelectSheetUp {
          0% {
            transform: translateY(100%);
          }
          100% {
            transform: translateY(0);
          }
        }
        @keyframes iosSelectFadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        .ios-select-item:hover {
          background: rgba(0, 113, 227, 0.08) !important;
        }
        .ios-select-item:active {
          transform: scale(0.985);
        }
        .ios-select-trigger:active {
          transform: scale(0.99);
        }
      `}</style>

      <div style={{ position: "relative", width: "100%" }}>
        {/* Native hidden input for form submission & HTML5 required validation */}
        <input
          ref={hiddenInputRef}
          type="text"
          id={id}
          name={name}
          value={value}
          required={required}
          readOnly
          tabIndex={-1}
          style={{
            position: "absolute",
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none",
            left: "50%",
            bottom: 0,
          }}
          onInvalid={(e) => {
            e.preventDefault();
            setIsOpen(true);
            triggerRef.current?.focus();
          }}
        />

        {/* ── Premium Trigger Field ── */}
        <button
          ref={triggerRef}
          type="button"
          onClick={handleToggle}
          disabled={disabled}
          className="ios-select-trigger"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          style={{
            width: "100%",
            minHeight: "42px",
            padding: "9px 14px",
            borderRadius: "10px",
            border: isOpen
              ? "1.5px solid var(--color-accent)"
              : "1px solid var(--color-border)",
            background: disabled ? "var(--color-bg-surface)" : "var(--color-bg-card)",
            color: selectedOption
              ? "var(--color-text-primary)"
              : "var(--color-text-muted)",
            fontSize: "14.5px",
            fontWeight: selectedOption ? 600 : 400,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "10px",
            cursor: disabled ? "not-allowed" : "pointer",
            boxShadow: isOpen
              ? "0 0 0 3px rgba(0, 113, 227, 0.14)"
              : "0 1px 2px rgba(0, 0, 0, 0.02)",
            transition: "all 180ms cubic-bezier(0.16, 1, 0.3, 1)",
            textAlign: "left",
            boxSizing: "border-box",
            userSelect: "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              flex: 1,
            }}
          >
            {icon && (
              <span
                style={{
                  display: "flex",
                  alignItems: "center",
                  color: selectedOption ? "var(--color-accent)" : "var(--color-text-muted)",
                  flexShrink: 0,
                  opacity: selectedOption ? 1 : 0.7,
                }}
              >
                {icon}
              </span>
            )}
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          <ChevronDown
            size={16}
            style={{
              color: isOpen ? "var(--color-accent)" : "var(--color-text-muted)",
              transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 220ms cubic-bezier(0.16, 1, 0.3, 1), color 180ms ease",
              flexShrink: 0,
            }}
          />
        </button>
      </div>

      {/* ── Desktop Floating Popover ── */}
      {mounted &&
        isOpen &&
        !isMobile &&
        createPortal(
          <div
            ref={popoverRef}
            role="listbox"
            style={{
              position: "fixed",
              top: popoverCoords.top,
              bottom: popoverCoords.bottom,
              left: popoverCoords.left,
              width: `${popoverCoords.width}px`,
              background: "rgba(255, 255, 255, 0.98)",
              backdropFilter: "blur(24px) saturate(180%)",
              WebkitBackdropFilter: "blur(24px) saturate(180%)",
              border: "1px solid rgba(0, 0, 0, 0.08)",
              borderRadius: "14px",
              boxShadow:
                "0 18px 44px -8px rgba(0, 0, 0, 0.16), 0 4px 14px rgba(0, 0, 0, 0.05)",
              padding: "6px",
              zIndex: 9999,
              animation: "iosSelectPopIn 180ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
              transformOrigin:
                popoverCoords.placement === "bottom" ? "top center" : "bottom center",
            }}
          >
            {/* Search filter if more than 5 options */}
            {options.length > 5 && (
              <div
                style={{
                  padding: "4px 6px 8px",
                  borderBottom: "1px solid var(--color-border)",
                  marginBottom: "4px",
                }}
              >
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  <Search
                    size={14}
                    style={{
                      position: "absolute",
                      left: "10px",
                      color: isSearchFocused ? "var(--color-accent)" : "var(--color-text-muted)",
                      pointerEvents: "none",
                      transition: "color 150ms ease",
                    }}
                  />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchFilter}
                    onFocus={() => setIsSearchFocused(true)}
                    onBlur={() => setIsSearchFocused(false)}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && filteredOptions.length > 0) {
                        e.preventDefault();
                        handleSelect(filteredOptions[0].value);
                      }
                    }}
                    placeholder={`Search ${label.toLowerCase()}…`}
                    style={{
                      width: "100%",
                      height: "34px",
                      padding: searchFilter ? "6px 28px 6px 30px" : "6px 10px 6px 30px",
                      borderRadius: "8px",
                      border: isSearchFocused
                        ? "1.5px solid var(--color-accent)"
                        : "1px solid var(--color-border)",
                      fontSize: "13px",
                      background: isSearchFocused ? "#ffffff" : "var(--color-bg-surface)",
                      outline: "none",
                      boxShadow: isSearchFocused ? "0 0 0 2px rgba(0, 113, 227, 0.12)" : "none",
                      transition: "all 150ms ease",
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
                        right: "8px",
                        background: "rgba(0, 0, 0, 0.14)",
                        border: "none",
                        borderRadius: "50%",
                        width: "18px",
                        height: "18px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        cursor: "pointer",
                        color: "#ffffff",
                        padding: 0,
                      }}
                    >
                      <X size={11} strokeWidth={2.5} />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Options List */}
            <div
              style={{
                maxHeight: "240px",
                overflowY: "auto",
                padding: "2px 0",
              }}
            >
              {filteredOptions.length === 0 ? (
                <div
                  style={{
                    padding: "16px 12px",
                    textAlign: "center",
                    color: "var(--color-text-muted)",
                    fontSize: "13px",
                  }}
                >
                  No {label.toLowerCase()} found
                </div>
              ) : (
                filteredOptions.map((opt) => {
                  const isItemActive = value === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => handleSelect(opt.value)}
                      className="ios-select-item"
                      role="option"
                      aria-selected={isItemActive}
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "9px 12px",
                        border: "none",
                        background: isItemActive ? "rgba(0, 113, 227, 0.09)" : "transparent",
                        color: isItemActive ? "var(--color-accent)" : "var(--color-text-primary)",
                        borderRadius: "8px",
                        fontSize: "13.5px",
                        fontWeight: isItemActive ? 600 : 400,
                        cursor: "pointer",
                        textAlign: "left",
                        transition: "all 120ms ease",
                        boxSizing: "border-box",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span>{opt.label}</span>
                        {opt.subtitle && (
                          <span
                            style={{
                              fontSize: "11px",
                              color: "var(--color-text-muted)",
                              fontWeight: 400,
                            }}
                          >
                            {opt.subtitle}
                          </span>
                        )}
                      </div>
                      {isItemActive && (
                        <Check size={16} color="var(--color-accent)" strokeWidth={2.5} />
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Quick "+ Add New" button inside popover */}
            {onAddNew && (
              <div
                style={{
                  borderTop: "1px solid var(--color-border)",
                  paddingTop: "4px",
                  marginTop: "4px",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    onAddNew();
                  }}
                  className="ios-select-item"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    padding: "8px 12px",
                    border: "none",
                    background: "transparent",
                    color: "var(--color-accent)",
                    borderRadius: "8px",
                    fontSize: "13px",
                    fontWeight: 600,
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 120ms ease",
                  }}
                >
                  <Plus size={15} strokeWidth={2.5} />
                  <span>{addNewLabel}</span>
                </button>
              </div>
            )}
          </div>,
          document.body
        )}

      {/* ── Mobile iOS Bottom Sheet ── */}
      {mounted &&
        isOpen &&
        isMobile &&
        createPortal(
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              height: visualViewportHeight ? `${visualViewportHeight}px` : "100%",
              zIndex: 99999,
              background: "rgba(0, 0, 0, 0.5)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              display: "flex",
              flexDirection: "column",
              justifyContent: "flex-end",
              animation: "iosSelectFadeIn 200ms ease forwards",
            }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                if (isSearchFocused) {
                  handleDismissKeyboard();
                  setIsSearchFocused(false);
                } else {
                  setIsOpen(false);
                }
              }
            }}
          >
            {(() => {
              const isExpanded = isSearchFocused || Boolean(searchFilter.trim());
              const sheetHeight =
                options.length > 5
                  ? isSearchFocused && visualViewportHeight
                    ? `${Math.max(260, visualViewportHeight - 12)}px`
                    : isExpanded
                    ? "calc(100dvh - 16px)"
                    : "70vh"
                  : "auto";

              const sheetMaxHeight =
                options.length > 5
                  ? isSearchFocused && visualViewportHeight
                    ? `${Math.max(260, visualViewportHeight - 12)}px`
                    : isExpanded
                    ? "calc(100dvh - 16px)"
                    : "84vh"
                  : "84vh";

              return (
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
                    height: sheetHeight,
                    maxHeight: sheetMaxHeight,
                    transition:
                      "height 280ms cubic-bezier(0.16, 1, 0.3, 1), max-height 280ms cubic-bezier(0.16, 1, 0.3, 1), padding 200ms ease",
                    animation: "iosSelectSheetUp 260ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
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

                  {/* Sheet Header */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      paddingBottom: "8px",
                      borderBottom: "1px solid var(--color-border)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      {icon && (
                        <span style={{ color: "var(--color-accent)", display: "flex" }}>
                          {icon}
                        </span>
                      )}
                      <div>
                        <h3
                          style={{
                            fontSize: "17.5px",
                            fontWeight: 800,
                            letterSpacing: "-0.025em",
                            color: "var(--color-text-primary)",
                            margin: 0,
                          }}
                        >
                          Select {label}
                        </h3>
                        <p
                          style={{
                            fontSize: "12.5px",
                            fontWeight: 500,
                            color: "var(--color-text-muted)",
                            margin: "2px 0 0 0",
                          }}
                        >
                          Choose a {label.toLowerCase()} from the list
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        handleDismissKeyboard();
                        setIsSearchFocused(false);
                        setIsOpen(false);
                      }}
                      style={{
                        background: "rgba(0, 0, 0, 0.06)",
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
                        setIsSearchFocused(false);
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
                            color: isSearchFocused
                              ? "var(--color-accent)"
                              : "var(--color-text-muted)",
                            pointerEvents: "none",
                            transition: "color 150ms ease",
                          }}
                        />
                        <input
                          ref={mobileSearchInputRef}
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
                              setIsSearchFocused(false);
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
                            boxShadow: isSearchFocused
                              ? "0 0 0 3px rgba(0, 113, 227, 0.12)"
                              : "none",
                            transition: "all 180ms ease",
                            WebkitAppearance: "none",
                          }}
                        />
                        {Boolean(searchFilter) && (
                          <button
                            type="button"
                            onClick={() => {
                              setSearchFilter("");
                              mobileSearchInputRef.current?.focus();
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

                      {/* Search / Done button that closes the keyboard */}
                      <button
                        type="submit"
                        onClick={() => {
                          handleDismissKeyboard();
                          setIsSearchFocused(false);
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

                  {/* Mobile Options List — scrolling dismisses keyboard */}
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
                    {filteredOptions.length === 0 ? (
                      <div
                        style={{
                          padding: "32px 16px",
                          textAlign: "center",
                          color: "var(--color-text-muted)",
                          fontSize: "14px",
                        }}
                      >
                        No {label.toLowerCase()} found
                      </div>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        {filteredOptions.map((opt) => {
                          const isItemActive = value === opt.value;
                          return (
                            <button
                              key={opt.value}
                              type="button"
                              onClick={() => handleSelect(opt.value)}
                              className="ios-select-item"
                              style={{
                                width: "100%",
                                minHeight: "46px",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                padding: "10px 14px",
                                borderRadius: "12px",
                                border: "none",
                                background: isItemActive
                                  ? "rgba(0, 113, 227, 0.09)"
                                  : "transparent",
                                color: isItemActive
                                  ? "var(--color-accent)"
                                  : "var(--color-text-primary)",
                                fontSize: "15px",
                                fontWeight: isItemActive ? 600 : 400,
                                textAlign: "left",
                                cursor: "pointer",
                                transition: "all 120ms ease",
                              }}
                            >
                              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                                <span>{opt.label}</span>
                                {opt.subtitle && (
                                  <span
                                    style={{
                                      fontSize: "12px",
                                      color: "var(--color-text-muted)",
                                      fontWeight: 400,
                                    }}
                                  >
                                    {opt.subtitle}
                                  </span>
                                )}
                              </div>
                              {isItemActive && (
                                <Check size={18} color="var(--color-accent)" strokeWidth={2.5} />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Mobile "+ Add New" button */}
                  {onAddNew && (
                    <div style={{ padding: "4px 0 0" }}>
                      <button
                        type="button"
                        onClick={() => {
                          handleDismissKeyboard();
                          setIsSearchFocused(false);
                          setIsOpen(false);
                          onAddNew();
                        }}
                        className="btn-secondary"
                        style={{
                          width: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          padding: "12px",
                          borderRadius: "12px",
                          fontSize: "14px",
                          fontWeight: 600,
                          color: "var(--color-accent)",
                          background: "rgba(0, 113, 227, 0.06)",
                          border: "1px dashed rgba(0, 113, 227, 0.3)",
                          cursor: "pointer",
                        }}
                      >
                        <Plus size={16} strokeWidth={2.5} />
                        <span>{addNewLabel}</span>
                      </button>
                    </div>
                  )}
                </div>
              );
            })()}
          </div>,
          document.body
        )}
    </>
  );
}
