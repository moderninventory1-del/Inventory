"use client";
<<<<<<< HEAD
// src/components/shared/SearchFilterBar.tsx
// Instant responsive search + iOS-inspired dropdown filter bar

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";
import { Search, X, Loader2, Tag, Tv2, Filter, RotateCcw } from "lucide-react";
import { ITEM_CATEGORIES } from "@/types";
import IOSDropdown from "./IOSDropdown";

interface SearchFilterBarProps {
  brands: { id: string; name: string }[];
  categories?: { id: string; name: string }[] | string[];
=======
// src/components/public/SearchFilterBar.tsx
// Search + category filter — client component

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { ITEM_CATEGORIES } from "@/types";

interface SearchFilterBarProps {
  brands: { id: string; name: string }[];
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
  showStatusFilter?: boolean;
  placeholder?: string;
}

<<<<<<< HEAD
export default function SearchFilterBar({
  brands,
  categories,
  showStatusFilter,
  placeholder,
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
=======
export default function SearchFilterBar({ brands, showStatusFilter, placeholder }: SearchFilterBarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  const [searchValue, setSearchValue] = useState(
    searchParams.get("search") ?? ""
  );
  const selectedCategory = searchParams.get("category") ?? "";
  const selectedBrand = searchParams.get("brand") ?? "";
  const selectedStatus = searchParams.get("status") ?? "active";
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
<<<<<<< HEAD
      params.delete("cursor"); // Reset pagination on any filter change

=======
      // Reset cursor on filter change
      params.delete("cursor");
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
      Object.entries(updates).forEach(([key, value]) => {
        if (value) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      });
<<<<<<< HEAD

=======
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`);
      });
    },
    [pathname, router, searchParams]
  );

<<<<<<< HEAD
  // Auto-debounce search while typing (350ms)
  useEffect(() => {
    if (searchValue === urlSearch) return;
    const timer = setTimeout(() => {
      updateParams({ search: searchValue.trim() });
    }, 350);
    return () => clearTimeout(timer);
  }, [searchValue, urlSearch, updateParams]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search: searchValue.trim() });
=======
  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    updateParams({ search: searchValue });
  }

  function handleCategoryClick(category: string) {
    updateParams({
      category: selectedCategory === category ? "" : category,
    });
  }

  function handleBrandChange(e: React.ChangeEvent<HTMLSelectElement>) {
    updateParams({
      brand: e.target.value,
    });
  }

  function handleStatusChange(e: React.ChangeEvent<HTMLSelectElement>) {
    updateParams({
      status: e.target.value,
    });
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
  }

  function handleClear() {
    setSearchValue("");
<<<<<<< HEAD
    setSelectedCategory("");
    setSelectedBrand("");
    if (showStatusFilter) setSelectedStatus("active");
=======
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
    startTransition(() => {
      router.push(pathname);
    });
  }

<<<<<<< HEAD
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
      {/* ── Search Bar ── */}
      <form onSubmit={handleSearchSubmit} style={{ position: "relative" }}>
        <Search
          size={16}
=======
  const hasFilters = searchValue || selectedCategory || selectedBrand || (showStatusFilter && selectedStatus !== "active");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} style={{ position: "relative" }}>
        <Search
          size={18}
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
          style={{
            position: "absolute",
            left: "14px",
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-text-muted)",
            pointerEvents: "none",
          }}
        />
        <input
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={placeholder ?? "Search by model number or brand…"}
          className="input-field"
<<<<<<< HEAD
          style={{
            paddingLeft: "40px",
            paddingRight: hasFilters || isPending ? "64px" : "14px",
            height: "42px",
            borderRadius: "var(--radius-md)",
            fontSize: "14px",
            boxShadow: "var(--shadow-card)",
          }}
          aria-label="Search inventory"
        />

        <div
          style={{
            position: "absolute",
            right: "10px",
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
                background: "rgba(0, 0, 0, 0.05)",
                border: "none",
                cursor: "pointer",
                color: "var(--color-text-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "22px",
                height: "22px",
                borderRadius: "50%",
                transition: "all var(--transition-fast)",
              }}
              title="Clear filters"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </form>

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
=======
          style={{ paddingLeft: "44px", paddingRight: hasFilters ? "44px" : "14px" }}
          aria-label="Search inventory"
        />
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
<<<<<<< HEAD
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
=======
            aria-label="Clear search"
            style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "var(--color-text-muted)",
              display: "flex",
              alignItems: "center",
              padding: "4px",
              borderRadius: "50%",
              transition: "color var(--transition-fast)",
            }}
          >
            <X size={16} />
          </button>
        )}
      </form>

      {/* Category chips */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <span
          style={{
            fontSize: "12px",
            color: "var(--color-text-muted)",
            fontWeight: 500,
            whiteSpace: "nowrap",
          }}
        >
          Filter:
        </span>
        {ITEM_CATEGORIES.map((cat) => {
          const isActive = selectedCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => handleCategoryClick(cat)}
              style={{
                padding: "5px 14px",
                borderRadius: "100px",
                fontSize: "12px",
                fontWeight: 600,
                cursor: "pointer",
                border: isActive
                  ? "1px solid rgba(99, 102, 241, 0.5)"
                  : "1px solid var(--color-border)",
                background: isActive
                  ? "var(--color-accent-glow)"
                  : "transparent",
                color: isActive
                  ? "var(--color-accent-text)"
                  : "var(--color-text-secondary)",
                transition: "all var(--transition-fast)",
                letterSpacing: "0.03em",
              }}
            >
              {cat}
            </button>
          );
        })}
        <select
          value={selectedBrand}
          onChange={handleBrandChange}
          style={{
            padding: "5px 14px",
            borderRadius: "100px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            border: selectedBrand
              ? "1px solid rgba(99, 102, 241, 0.5)"
              : "1px solid var(--color-border)",
            background: selectedBrand
              ? "var(--color-accent-glow)"
              : "var(--color-bg-surface)",
            color: selectedBrand
              ? "var(--color-accent-text)"
              : "var(--color-text-secondary)",
            outline: "none",
            appearance: "none",
            letterSpacing: "0.03em",
          }}
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
        
        {showStatusFilter && (
          <select
            value={selectedStatus}
            onChange={handleStatusChange}
            style={{
              padding: "5px 14px",
              borderRadius: "100px",
              fontSize: "12px",
              fontWeight: 600,
              cursor: "pointer",
              border: selectedStatus !== "active"
                ? "1px solid rgba(99, 102, 241, 0.5)"
                : "1px solid var(--color-border)",
              background: selectedStatus !== "active"
                ? "var(--color-accent-glow)"
                : "var(--color-bg-surface)",
              color: selectedStatus !== "active"
                ? "var(--color-accent-text)"
                : "var(--color-text-secondary)",
              outline: "none",
              appearance: "none",
              letterSpacing: "0.03em",
            }}
          >
            <option value="active">Active Only</option>
            <option value="deleted">Deleted Only</option>
            <option value="all">All Items</option>
          </select>
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
        )}
      </div>
    </div>
  );
}
