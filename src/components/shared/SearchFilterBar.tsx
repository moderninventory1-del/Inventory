"use client";
// src/components/public/SearchFilterBar.tsx
// Search + category filter — client component

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useState, useTransition } from "react";
import { Search, X } from "lucide-react";
import { ITEM_CATEGORIES } from "@/types";

interface SearchFilterBarProps {
  brands: { id: string; name: string }[];
  showStatusFilter?: boolean;
  placeholder?: string;
}

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

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString());
      // Reset cursor on filter change
      params.delete("cursor");
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
  }

  function handleClear() {
    setSearchValue("");
    startTransition(() => {
      router.push(pathname);
    });
  }

  const hasFilters = searchValue || selectedCategory || selectedBrand || (showStatusFilter && selectedStatus !== "active");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Search bar */}
      <form onSubmit={handleSearchSubmit} style={{ position: "relative" }}>
        <Search
          size={18}
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
          style={{ paddingLeft: "44px", paddingRight: hasFilters ? "44px" : "14px" }}
          aria-label="Search inventory"
        />
        {hasFilters && (
          <button
            type="button"
            onClick={handleClear}
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
        )}
      </div>
    </div>
  );
}
