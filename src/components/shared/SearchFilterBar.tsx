"use client";
// src/components/shared/SearchFilterBar.tsx
// Instant responsive search + iOS-inspired dropdown filter bar

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Search, X, Loader2, Tag, Tv2, Filter, RotateCcw, ArrowUpDown } from "lucide-react";
import { ITEM_CATEGORIES } from "@/types";
import IOSDropdown from "./IOSDropdown";

interface SearchFilterBarProps {
  brands: { id: string; name: string }[];
  categories?: { id: string; name: string }[] | string[];
  showStatusFilter?: boolean;
  placeholder?: string;
  onSearchActiveChange?: (active: boolean) => void;
}

export default function SearchFilterBar({
  brands,
  categories,
  showStatusFilter,
  placeholder,
  onSearchActiveChange,
}: SearchFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const categoryList: string[] =
    categories && categories.length > 0
      ? categories.map((c) => (typeof c === "string" ? c : c.name))
      : ITEM_CATEGORIES;

  const urlCategory = searchParams.get("category") ?? "";
  const urlBrand = searchParams.get("brand") ?? "";
  const urlStatus = searchParams.get("status") ?? "active";
  const urlSearch = searchParams.get("search") ?? "";
  const urlSort = searchParams.get("sort") ?? "latest";

  // 0ms Optimistic UI state
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedBrand, setSelectedBrand] = useState(urlBrand);
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
    setSelectedStatus(urlStatus);
  }, [urlStatus]);

  useEffect(() => {
    setSearchValue(urlSearch);
  }, [urlSearch]);

  useEffect(() => {
    setCurrentSort(urlSort === "oldest" ? "oldest" : "latest");
  }, [urlSort]);

  const inputRef = useRef<HTMLInputElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const isSearchActive = isFocused || Boolean(searchValue);

  useEffect(() => {
    onSearchActiveChange?.(isSearchActive);
  }, [isSearchActive, onSearchActiveChange]);

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("cursor"); // Reset pagination on any filter change

      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });

      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

  // Auto-debounce search: wait 1 second of inactivity after typing before searching
  useEffect(() => {
    if (searchValue === urlSearch) return;
    const timer = setTimeout(() => {
      updateParams({ search: searchValue.trim() });
    }, 1000);
    return () => clearTimeout(timer);
  }, [searchValue, urlSearch, updateParams]);

  function handleInputFocus() {
    setIsFocused(true);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function handleCancelSearch() {
    setIsFocused(false);
    setSearchValue("");
    inputRef.current?.blur();
    updateParams({ search: "" });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
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
    updateParams({ search: searchValue.trim() });
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
    setSearchValue("");
    setSelectedCategory("");
    setSelectedBrand("");
    setCurrentSort("latest");
    if (showStatusFilter) setSelectedStatus("active");
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    startTransition(() => {
      router.push(pathname);
    });
  }

  const hasFilters =
    Boolean(searchValue) ||
    Boolean(selectedCategory) ||
    Boolean(selectedBrand) ||
    (showStatusFilter && selectedStatus !== "active");

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      data-filter-pending={isPending ? "" : undefined}
    >
      {/* ── Search Bar Row ── */}
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <form onSubmit={handleSearchSubmit} style={{ position: "relative", flex: 1 }}>
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
            onChange={(e) => setSearchValue(e.target.value)}
            placeholder={placeholder ?? "Search by model number or brand…"}
            className="input-field search-input"
            style={{
              paddingLeft: "38px",
              paddingRight: "86px",
              height: "44px",
              borderRadius: "var(--radius-md)",
              fontSize: "14px",
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
          {isPending && (
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
              fontWeight: 600,
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
            updateParams({ brand: val });
          }}
          icon={<Tv2 size={12} />}
        />

        {/* Status iOS Dropdown (Admin only) */}
        {showStatusFilter && (
          <IOSDropdown
            label="Status"
            allLabel="Active Only"
            options={[
              { value: "active", label: "Active Only" },
              { value: "deleted", label: "Deleted Only" },
              { value: "all", label: "All Items" },
            ]}
            selectedValue={selectedStatus}
            onChange={(val) => {
              setSelectedStatus(val);
              updateParams({ status: val });
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
        <button
          type="button"
          onClick={handleToggleSort}
          className="sort-toggle-btn"
          aria-label={`Current sort order: ${currentSort === "oldest" ? "Oldest First" : "Latest First"}. Click to toggle.`}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "6px 12px",
            borderRadius: "8px",
            fontSize: "12px",
            fontWeight: 600,
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
          title={
            currentSort === "oldest"
              ? "Currently sorted Oldest First. Click to switch to Latest First."
              : "Currently sorted Latest First (Default). Click to switch to Oldest First."
          }
        >
          <ArrowUpDown
            size={12}
            strokeWidth={2.5}
            style={{
              flexShrink: 0,
              color: currentSort === "oldest" ? "#ffffff" : "#94a3b8",
            }}
          />
          <span>Sort: {currentSort === "oldest" ? "Oldest First" : "Latest First"}</span>
        </button>
      </div>
    </div>
  );
}
