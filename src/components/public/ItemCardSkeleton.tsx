// src/components/public/ItemCardSkeleton.tsx
// Loading skeleton for ItemCard

export default function ItemCardSkeleton() {
  return (
    <div
      className="card"
      style={{ overflow: "hidden", display: "flex", flexDirection: "column" }}
    >
      {/* Image skeleton */}
      <div
        className="skeleton aspect-inventory"
        style={{ flexShrink: 0 }}
      />
      {/* Content skeleton */}
      <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          <div className="skeleton" style={{ width: 32, height: 32, borderRadius: "8px", flexShrink: 0 }} />
          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
            <div className="skeleton" style={{ height: "14px", width: "60%", borderRadius: "4px" }} />
            <div className="skeleton" style={{ height: "12px", width: "80%", borderRadius: "4px" }} />
          </div>
        </div>
        <div className="skeleton" style={{ height: "12px", width: "90%", borderRadius: "4px" }} />
        <div className="skeleton" style={{ height: "12px", width: "70%", borderRadius: "4px" }} />
      </div>
    </div>
  );
}
