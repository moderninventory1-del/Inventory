// src/app/(public)/loading.tsx
// Instant page transition skeleton for public inventory

import ItemCardSkeleton from "@/components/public/ItemCardSkeleton";

export default function PublicLoading() {
  return (
    <div className="page-container" style={{ paddingTop: "36px", paddingBottom: "60px" }}>
      {/* Hero header skeleton */}
      <div style={{ marginBottom: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div className="skeleton" style={{ width: 42, height: 42, borderRadius: "var(--radius-md)" }} />
          <div className="skeleton" style={{ width: "200px", height: "32px", borderRadius: "6px" }} />
        </div>
        <div className="skeleton" style={{ width: "340px", height: "16px", borderRadius: "4px" }} />
      </div>

      {/* Search & Filter skeleton */}
      <div style={{ marginBottom: "28px", display: "flex", flexDirection: "column", gap: "14px" }}>
        <div className="skeleton" style={{ height: "44px", width: "100%", borderRadius: "var(--radius-md)" }} />
        <div style={{ display: "flex", gap: "8px" }}>
          <div className="skeleton" style={{ width: "70px", height: "30px", borderRadius: "100px" }} />
          <div className="skeleton" style={{ width: "70px", height: "30px", borderRadius: "100px" }} />
          <div className="skeleton" style={{ width: "70px", height: "30px", borderRadius: "100px" }} />
          <div className="skeleton" style={{ width: "100px", height: "30px", borderRadius: "100px" }} />
        </div>
      </div>

      {/* Cards skeleton grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "24px",
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`skel-load-${i}`} className="animate-fade-in">
            <ItemCardSkeleton />
          </div>
        ))}
      </div>
    </div>
  );
}
