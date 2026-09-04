"use client";
// src/components/shared/SearchFilterBar.tsx
// Instant responsive search + iOS-inspired dropdown filter bar

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Search, X, Loader2, Tag, Tv2, Filter, RotateCcw, ArrowUpDown, Package } from "lucide-react";
import { ITEM_CATEGORIES } from "@/types";
import { extractItemIdFromQuery } from "@/lib/utils";
import IOSDropdown from "./IOSDropdown";

interface SearchFilterBarProps {
  brands: { id: string; name: string }[];
  categories?: { id: string; name: string }[] | string[];
  showStatusFilter?: boolean;
  showBoxFilter?: boolean;
  initialBoxes?: { key: string; name: string }[];
  placeholder?: string;
  onSearchActiveChange?: (active: boolean) => void;
}

export default function SearchFilterBar({
  brands,
  categories,
  showStatusFilter,
  showBoxFilter,
  initialBoxes,
  placeholder,
  onSearchActiveChange,
}: SearchFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isNavigating, setIsNavigating] = useState(false);

  useEffect(() => {
    setIsNavigating(false);
  }, [searchParams]);

  const categoryList: string[] =
    categories && categories.length > 0
      ? categories.map((c) => (typeof c === "string" ? c : c.name))
      : ITEM_CATEGORIES;

  const urlCategory = searchParams.get("category") ?? "";
  const urlBrand = searchParams.get("brand") ?? "";
  const urlBox = searchParams.get("box") ?? "";
  const urlStatus = searchParams.get("status") ?? "active";
  const urlSearch = searchParams.get("search") ?? "";
  const urlSort = searchParams.get("sort") ?? "latest";

  // 0ms Optimistic UI state
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedBrand, setSelectedBrand] = useState(urlBrand);
  const [selectedBox, setSelectedBox] = useState(urlBox);
  const [boxes, setBoxes] = useState<{ key: string; name: string }[]>(initialBoxes || []);
  const [isLoadingBoxes, setIsLoadingBoxes] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(urlStatus);
  const [searchValue, setSearchValue] = useState(urlSearch);
  const [currentSort, setCurrentSort] = useState<"latest" | "oldest">(
    urlSort === "oldest" ? "oldest" : "latest"
  );

  // Sync state if URL changes externally
  useEffect(() => {
    setSelectedCategory(urlCategory);
  }, [urlCategory]);

  useEffect(() => {
    setSelectedBrand(urlBrand);
  }, [urlBrand]);

  useEffect(() => {
    setSelectedBox(urlBox);
  }, [urlBox]);

  useEffect(() => {
    if (initialBoxes && initialBoxes.length > 0) {
      setBoxes(initialBoxes);
    }
  }, [initialBoxes]);

  // Dynamically fetch grouped boxes whenever selectedBrand changes
  useEffect(() => {
    if (!showBoxFilter) return;
    if (!selectedBrand) {
      setBoxes([]);
      setSelectedBox("");
      return;
    }

    let active = true;
    setIsLoadingBoxes(true);
    fetch(`/api/admin/boxes?brandId=${encodeURIComponent(selectedBrand)}`)
      .then((res) => res.json())
      .then((data) => {
        if (active && data.boxes) {
          setBoxes(data.boxes);
        }
      })
      .catch((err) => console.error("Failed to load boxes for brand:", err))
      .finally(() => {
        if (active) setIsLoadingBoxes(false);
      });

    return () => {
      active = false;
    };
  }, [selectedBrand, showBoxFilter]);

  useEffect(() => {
    setSelectedStatus(urlStatus);
  }, [urlStatus]);

  useEffect(() => {
    setSearchValue(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setCurrentSort(urlSort === "oldest" ? "oldest" : "latest");
  }, [urlSort]);

  const searchFormRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isSearchActive = isFocused || Boolean(searchValue);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      // Clear any pending typing debounce timer immediately
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
        searchTimerRef.current = null;
      }

      const params = new URLSearchParams(searchParams.toString());
      params.delete("cursor"); // Reset pagination on any filter change

      // If this update was triggered by a filter (category, brand, box, status, sort),
      // make sure any typed search text is flushed into the query right now
      if (!("search" in updates)) {
        const clean = searchValue.trim();
        const extractedId = extractItemIdFromQuery(clean);
        const effectiveSearch = extractedId || clean;
        if (effectiveSearch) {
          params.set("search", effectiveSearch);
        } else {
          params.delete("search");
        }
      }

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      setIsNavigating(true);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams, searchValue]
  );

  const handleDismissSearchKeyboard = useCallback(() => {
    inputRef.current?.blur();
    if (typeof document !== "undefined") {
      (document.activeElement as HTMLElement)?.blur?.();
    }
    setIsFocused(false);
  }, []);

  // Automatically dismiss virtual keyboard when clicking or tapping anywhere outside the search bar
  useEffect(() => {
    const handlePointerDownOutside = (e: Event) => {
      if (!isFocused && document.activeElement !== inputRef.current) return;

      const target = e.target as Node | null;
      if (!target) return;
      if (searchFormRef.current && !searchFormRef.current.contains(target)) {
        handleDismissSearchKeyboard();
        // Immediately flush any unsubmitted search text on outside tap
        const clean = searchValue.trim();
        const extractedId = extractItemIdFromQuery(clean);
        const finalSearch = extractedId || clean;
        if (finalSearch !== urlSearch) {
          if (searchTimerRef.current) {
            clearTimeout(searchTimerRef.current);
            searchTimerRef.current = null;
          }
          updateParams({ search: finalSearch });
        }
      }
    };

    const handleWindowScroll = () => {
      if (document.activeElement === inputRef.current || isFocused) {
        handleDismissSearchKeyboard();
      }
    };

    document.addEventListener("mousedown", handlePointerDownOutside, true);
    document.addEventListener("touchstart", handlePointerDownOutside, true);
    window.addEventListener("scroll", handleWindowScroll, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handlePointerDownOutside, true);
      document.removeEventListener("touchstart", handlePointerDownOutside, true);
      window.removeEventListener("scroll", handleWindowScroll);
    };
  }, [isFocused, searchValue, urlSearch, updateParams, handleDismissSearchKeyboard]);

  useEffect(() => {
    onSearchActiveChange?.(isSearchActive);
  }, [isSearchActive, onSearchActiveChange]);

  // Auto-debounce search: wait 1 second of inactivity after typing before searching
  useEffect(() => {
    if (searchValue === urlSearch) return;

    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
    }

    searchTimerRef.current = setTimeout(() => {
      const clean = searchValue.trim();
      const extractedId = extractItemIdFromQuery(clean);
      updateParams({ search: extractedId || clean });
    }, 1000);

    return () => {
      if (searchTimerRef.current) {
        clearTimeout(searchTimerRef.current);
      }
    };
  }, [searchValue, urlSearch, updateParams]);

  function handleInputFocus() {
    setIsFocused(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleCancelSearch() {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
    setIsFocused(false);
    setSearchValue("");
    inputRef.current?.blur();
    updateParams({ search: "" });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handlePaste(e: React.ClipboardEvent<HTMLInputElement>) {
    const pastedText = e.clipboardData.getData("text");
    const extractedId = extractItemIdFromQuery(pastedText);
    if (extractedId) {
      e.preventDefault();
      setSearchValue(extractedId);
      updateParams({ search: extractedId });
      inputRef.current?.blur();
      setIsFocused(false);
    }
  }

  function handleSearchChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    const extractedId = extractItemIdFromQuery(val);
    if (extractedId && (val.includes("/") || val.startsWith("http"))) {
      setSearchValue(extractedId);
      updateParams({ search: extractedId });
      inputRef.current?.blur();
      setIsFocused(false);
      return;
    }
    setSearchValue(val);
  }

  function handleSearchSubmit(e?: React.FormEvent) {
    if (e) e.preventDefault();
    // Automatically hide/dismiss the virtual keyboard on mobile & desktop
    inputRef.current?.blur();
    if (typeof document !== "undefined") {
      (document.activeElement as HTMLElement)?.blur?.();
    }
    setIsFocused(false);

    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }

    const clean = searchValue.trim();
    const extractedId = extractItemIdFromQuery(clean);
    const finalSearch = extractedId || clean;
    if (extractedId && extractedId !== clean) {
      setSearchValue(extractedId);
    }
    updateParams({ search: finalSearch });
  }

  function handleToggleSort() {
    const nextSort = currentSort === "oldest" ? "latest" : "oldest";
    setCurrentSort(nextSort);
    updateParams({ sort: nextSort === "latest" ? "" : "oldest" });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleClear() {
    if (searchTimerRef.current) {
      clearTimeout(searchTimerRef.current);
      searchTimerRef.current = null;
    }
    setSearchValue("");
    setSelectedCategory("");
    setSelectedBrand("");
    setSelectedBox("");
    setCurrentSort("latest");
    if (showStatusFilter) setSelectedStatus("active");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    setIsNavigating(true);
    router.push(pathname, { scroll: false });
  }

  const hasFilters =
    Boolean(searchValue) ||
    Boolean(selectedCategory) ||
    Boolean(selectedBrand) ||
    Boolean(selectedBox) ||
    (showStatusFilter && selectedStatus !== "active");

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      data-filter-pending={isNavigating ? "" : undefined}
    >
      {/* ── Search Bar Row ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <form
          ref={searchFormRef}
          onSubmit={handleSearchSubmit}
          style={{ position: "relative", flex: 1 }}
        >
          <button
            type="submit"
            aria-label="Search"
            title="Search"
            style={{
              position: "absolute",
              left: "6px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "transparent",
              border: "none",
              padding: "8px",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "50%",
            }}
          >
            <Search size={16} />
          </button>
          <input
            ref={inputRef}
            type="text"
            value={searchValue}
            onFocus={handleInputFocus}
            onClick={handleInputFocus}
            onChange={handleSearchChange}
            onPaste={handlePaste}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleSearchSubmit(e);
              } else if (e.key === "Escape") {
                handleDismissSearchKeyboard();
              }
            }}
            placeholder={placeholder ?? "Search by model number or brand…"}
            className="input-field search-input"
            style={{
              paddingLeft: "38px",
              paddingRight: "86px",
              height: "44px",
              borderRadius: "var(--radius-md)",
              fontSize: "14.5px",
              fontWeight: 500,
              boxShadow: "var(--shadow-card)",
            }}
            aria-label="Search inventory"
            enterKeyHint="search"
          />

        <div
          style={{
            position: "absolute",
            right: "6px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            gap: "6px",
          }}
        >
          {isNavigating && (
            <Loader2
              size={15}
              className="animate-spin"
              style={{ color: "var(--color-accent)", flexShrink: 0 }}
            />
          )}

          {/* Premium Apple Blue Search Button */}
          <button
            type="submit"
            aria-label="Search"
            className="search-submit-btn"
            title="Search inventory"
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "5px",
              padding: "7px 14px",
              height: "32px",
              borderRadius: "100px",
              background: "var(--color-accent)",
              color: "#ffffff",
              border: "none",
              fontSize: "13px",
              fontWeight: 700,
              cursor: "pointer",
              boxShadow: "0 2px 8px rgba(0, 113, 227, 0.28)",
              transition: "transform 150ms ease, opacity 150ms ease",
              flexShrink: 0,
              userSelect: "none",
            }}
          >
            <Search size={13} strokeWidth={2.4} />
            <span className="search-submit-label">Search</span>
          </button>
        </div>
      </form>

      {isSearchActive && (
        <button
          type="button"
          onClick={handleCancelSearch}
          className="search-cancel-btn animate-fade-in"
          style={{
            background: "transparent",
            border: "none",
            color: "var(--color-accent)",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
            padding: "4px 8px",
            flexShrink: 0,
            userSelect: "none",
          }}
        >
          Cancel
        </button>
      )}
    </div>

      <style>{`
        .search-submit-btn:hover {
          opacity: 0.92;
        }
        .search-submit-btn:active {
          transform: scale(0.94) !important;
        }
        @media (max-width: 440px) {
          .search-submit-label {
            display: none;
          }
          .search-submit-btn {
            padding: 7px 10px !important;
            border-radius: 50% !important;
            width: 32px !important;
          }
          .search-input {
            padding-right: 48px !important;
          }
        }
        .filter-dropdowns-row::-webkit-scrollbar {
          display: none;
        }
        @media (min-width: 768px) {
          .filter-dropdowns-row {
            overflow: visible !important;
            overflow-x: visible !important;
            overflow-y: visible !important;
            flex-wrap: wrap !important;
          }
        }
        .filter-reset-pill:active {
          transform: scale(0.95) !important;
        }
        .sort-toggle-btn:hover {
          border-color: var(--color-accent) !important;
        }
        .sort-toggle-btn:active {
          transform: scale(0.95) !important;
        }
      `}</style>

      {/* ── iOS-inspired Dropdowns Row ── */}
      <div
        className="filter-dropdowns-row"
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "nowrap",
          overflowX: "auto",
          WebkitOverflowScrolling: "touch",
          scrollbarWidth: "none",
          padding: "2px 0 4px",
        }}
      >
        {/* Category iOS Dropdown */}
        <IOSDropdown
          label="Category"
          allLabel="All Categories"
          options={categoryList.map((c) => ({ value: c, label: c }))}
          selectedValue={selectedCategory}
          onChange={(val) => {
            setSelectedCategory(val);
            updateParams({ category: val });
          }}
          icon={<Tag size={12} />}
        />

        {/* Brand iOS Dropdown */}
        <IOSDropdown
          label="Brand"
          allLabel="All Brands"
          options={brands.map((b) => ({ value: b.id, label: b.name }))}
          selectedValue={selectedBrand}
          onChange={(val) => {
            setSelectedBrand(val);
            setSelectedBox("");
            updateParams({ brand: val, box: "" });
          }}
          icon={<Tv2 size={12} />}
        />

        {/* Box Location iOS Dropdown (Admin only: visible ONLY when brand is selected) */}
        {showBoxFilter && Boolean(selectedBrand) && (
          <IOSDropdown
            label="Box"
            allLabel={isLoadingBoxes ? "Loading boxes…" : "All Boxes"}
            options={boxes.map((b) => ({ value: b.key, label: b.name }))}
            selectedValue={selectedBox}
            onChange={(val) => {
              setSelectedBox(val);
              updateParams({ box: val });
            }}
            icon={<Package size={12} />}
          />
        )}

        {/* Status iOS Dropdown (Admin only) */}
        {showStatusFilter && (
          <IOSDropdown
            label="Status"
            hideAllOption
            defaultValue="active"
            options={[
              { value: "active", label: "Active Only" },
              { value: "deleted", label: "Deleted Only" },
              { value: "all", label: "All Items" },
            ]}
            selectedValue={selectedStatus}
            onChange={(val) => {
              setSelectedStatus(val);
              updateParams({ status: val === "active" ? "" : val });
            }}
            icon={<Filter size={12} />}
          />
        )}

        {/* Reset Filter Button — always aligned to the side of filters */}
        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="btn-secondary filter-reset-pill animate-fade-in"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 12px",
              borderRadius: "100px",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              background: "rgba(0, 0, 0, 0.03)",
              border: "1px dashed var(--color-border)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "all 150ms ease",
              userSelect: "none",
            }}
            title="Reset filters"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* ── Toggle Sort Button (distinct rounded-rectangle shape, custom colour & increased gap) ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          alignItems: "center",
          marginTop: "12px",
          paddingRight: "2px",
        }}
      >
        {(() => {
          const isDeletedMode = selectedStatus === "deleted";
          const sortLabel = isDeletedMode
            ? currentSort === "oldest"
              ? "Oldest Deleted"
              : "Recently Deleted"
            : currentSort === "oldest"
            ? "Oldest First"
            : "Latest First";
          const sortTitle = isDeletedMode
            ? currentSort === "oldest"
              ? "Currently sorted Oldest Deleted First. Click to switch to Recently Deleted."
              : "Currently sorted Recently Deleted (Default). Click to switch to Oldest Deleted First."
            : currentSort === "oldest"
            ? "Currently sorted Oldest First. Click to switch to Latest First."
            : "Currently sorted Latest First (Default). Click to switch to Oldest First.";
          const sortAriaLabel = `Current sort order: ${sortLabel}. Click to toggle.`;

          return (
            <button
              type="button"
              onClick={handleToggleSort}
              className="sort-toggle-btn"
              aria-label={sortAriaLabel}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                padding: "6px 12px",
                borderRadius: "8px",
                fontSize: "12.5px",
                fontWeight: 700,
                letterSpacing: "-0.01em",
                cursor: "pointer",
                border:
                  currentSort === "oldest"
                    ? "1px solid #005bb5"
                    : "1px solid #0f172a",
                background:
                  currentSort === "oldest"
                    ? "var(--color-accent)"
                    : "#1e293b",
                color: "#ffffff",
                boxShadow:
                  currentSort === "oldest"
                    ? "0 2px 8px rgba(0, 113, 227, 0.35)"
                    : "0 2px 6px rgba(15, 23, 42, 0.16)",
                transition: "all 180ms cubic-bezier(0.16, 1, 0.3, 1)",
                userSelect: "none",
              }}
              title={sortTitle}
            >
              <ArrowUpDown
                size={12}
                strokeWidth={2.5}
                style={{
                  flexShrink: 0,
                  color: currentSort === "oldest" ? "#ffffff" : "#94a3b8",
                }}
              />
              <span>Sort: {sortLabel}</span>
            </button>
          );
        })()}
      </div>
    </div>
  );
}
