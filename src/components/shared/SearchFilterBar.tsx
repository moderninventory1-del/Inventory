"use client";
// src/components/shared/SearchFilterBar.tsx
// Instant responsive search + iOS-inspired dropdown filter bar

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { Search, X, Loader2, Tag, Tv2, Filter, RotateCcw } from "lucide-react";
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

  // 0ms Optimistic UI state
  const [selectedCategory, setSelectedCategory] = useState(urlCategory);
  const [selectedBrand, setSelectedBrand] = useState(urlBrand);
  const [selectedStatus, setSelectedStatus] = useState(urlStatus);
  const [searchValue, setSearchValue] = useState(urlSearch);

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

  // Auto-debounce search while typing (350ms)
  useEffect(() => {
    if (searchValue === urlSearch) return;
    const timer = setTimeout(() => {
      updateParams({ search: searchValue.trim() });
    }, 350);
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
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
    updateParams({ search: searchValue.trim() });
  }

  function handleClear() {
    setSearchValue("");
    setSelectedCategory("");
    setSelectedBrand("");
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
              paddingRight: hasFilters ? "130px" : "96px",
              height: "44px",
              borderRadius: "var(--radius-md)",
              fontSize: "14px",
              boxShadow: "var(--shadow-card)",
            }}
            aria-label="Search inventory"
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

          {hasFilters && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear all filters"
              style={{
                background: "rgba(0, 0, 0, 0.06)",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "24px",
                height: "24px",
                borderRadius: "50%",
                transition: "all var(--transition-fast)",
              }}
              title="Clear filters"
            >
              <X size={13} />
            </button>
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
            padding-right: 76px !important;
          }
        }
      `}</style>

      {/* ── iOS-inspired Dropdowns Row ── */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          alignItems: "center",
          flexWrap: "wrap",
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

        {/* Reset Filter Button */}
        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
            className="btn-secondary"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "4px",
              padding: "6px 12px",
              borderRadius: "100px",
              fontSize: "12px",
              fontWeight: 500,
              color: "var(--color-text-muted)",
              background: "transparent",
              border: "1px dashed var(--color-border)",
              cursor: "pointer",
              transition: "all 150ms ease",
            }}
            title="Reset filters"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        )}
      </div>
    </div>
  );
}
