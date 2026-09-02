// src/components/admin/AdminItemCardSkeleton.tsx
// Loading skeleton for AdminItemCard — matches card proportions

export default function AdminItemCardSkeleton() {
  return (
    <div
      className="card"
      style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* Image area skeleton */}
      <div
        className="skeleton aspect-inventory"
        style={{ flexShrink: 0 }}
      />
      {/* Content skeleton */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "8px", flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <div className="skeleton" style={{ height: "14px", width: "55%", borderRadius: "4px" }} />
            <div className="skeleton" style={{ height: "12px", width: "75%", borderRadius: "4px" }} />
          </div>
          {/* Chevron placeholder */}
          <div className="skeleton" style={{ width: 20, height: 20, borderRadius: "4px", flexShrink: 0 }} />
        </div>
      </div>
    </div>
  );
}
