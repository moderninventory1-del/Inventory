// src/app/(admin)/admin/inventory/loading.tsx
// Instant admin inventory skeleton loading state

import AdminItemCardSkeleton from "@/components/admin/AdminItemCardSkeleton";

export default function AdminInventoryLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header skeleton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div className="skeleton" style={{ width: "140px", height: "26px", borderRadius: "6px" }} />
          <div className="skeleton" style={{ width: "80px", height: "14px", borderRadius: "4px" }} />
        </div>
        <div className="skeleton" style={{ width: "100px", height: "36px", borderRadius: "var(--radius-sm)" }} />
      </div>

      {/* Search & Filter skeleton */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        <div className="skeleton" style={{ height: "44px", width: "100%", borderRadius: "var(--radius-md)" }} />
        <div style={{ display: "flex", gap: "8px" }}>
          <div className="skeleton" style={{ width: "70px", height: "30px", borderRadius: "100px" }} />
          <div className="skeleton" style={{ width: "70px", height: "30px", borderRadius: "100px" }} />
          <div className="skeleton" style={{ width: "70px", height: "30px", borderRadius: "100px" }} />
          <div className="skeleton" style={{ width: "100px", height: "30px", borderRadius: "100px" }} />
          <div className="skeleton" style={{ width: "100px", height: "30px", borderRadius: "100px" }} />
        </div>
      </div>

      {/* Grid skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`skel-admin-load-${i}`} className="animate-fade-in">
            <AdminItemCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
