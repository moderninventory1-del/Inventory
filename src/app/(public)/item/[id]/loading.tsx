// src/app/(public)/item/[id]/loading.tsx
// Instant item detail skeleton loading state

export default function ItemDetailLoading() {
  return (
    <div className="page-container" style={{ paddingTop: "32px", paddingBottom: "60px" }}>
      {/* Back link placeholder */}
      <div
        className="skeleton"
        style={{ width: "140px", height: "36px", borderRadius: "var(--radius-sm)", marginBottom: "32px" }}
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr",
          gap: "32px",
        }}
        className="item-detail-grid"
      >
        {/* Images skeleton */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          <div
            className="card"
            style={{
              overflow: "hidden",
              position: "relative",
              aspectRatio: "16/10",
              background: "var(--color-bg-surface)",
            }}
          >
            <div className="skeleton" style={{ width: "100%", height: "100%" }} />
          </div>
        </div>

        {/* Details skeleton */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {/* Title row */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div className="skeleton" style={{ width: 44, height: 44, borderRadius: "var(--radius-sm)" }} />
            <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
              <div className="skeleton" style={{ width: "60%", height: "24px", borderRadius: "4px" }} />
              <div className="skeleton" style={{ width: "40%", height: "16px", borderRadius: "4px" }} />
            </div>
          </div>

          {/* Specs card skeleton */}
          <div
            className="card"
            style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "14px" }}
          >
            <div className="skeleton" style={{ width: "100px", height: "14px", borderRadius: "4px" }} />
            <div className="skeleton" style={{ width: "100%", height: "20px", borderRadius: "4px" }} />
            <div className="skeleton" style={{ width: "100%", height: "20px", borderRadius: "4px" }} />
            <div className="skeleton" style={{ width: "100%", height: "20px", borderRadius: "4px" }} />
          </div>

          {/* CTA card skeleton */}
          <div
            className="card"
            style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}
          >
            <div className="skeleton" style={{ width: "50%", height: "18px", borderRadius: "4px" }} />
            <div className="skeleton" style={{ width: "70%", height: "14px", borderRadius: "4px" }} />
            <div className="skeleton" style={{ width: "100%", height: "44px", borderRadius: "var(--radius-sm)", marginTop: "8px" }} />
          </div>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .item-detail-grid {
            grid-template-columns: 55fr 45fr !important;
          }
        }
      `}</style>
    </div>
  );
}
