// src/app/(admin)/admin/loading.tsx
// Instant admin dashboard skeleton loading state

export default function AdminDashboardLoading() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "32px" }}>
      {/* Header skeleton */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <div className="skeleton" style={{ width: "160px", height: "28px", borderRadius: "6px" }} />
          <div className="skeleton" style={{ width: "120px", height: "14px", borderRadius: "4px" }} />
        </div>
        <div className="skeleton" style={{ width: "110px", height: "38px", borderRadius: "var(--radius-sm)" }} />
      </div>

      {/* Stat cards skeleton */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "16px",
        }}
      >
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={`skel-stat-${i}`} className="card" style={{ padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "8px", flex: 1 }}>
                <div className="skeleton" style={{ width: "80px", height: "13px", borderRadius: "4px" }} />
                <div className="skeleton" style={{ width: "50px", height: "32px", borderRadius: "6px" }} />
              </div>
              <div className="skeleton" style={{ width: 40, height: 40, borderRadius: "var(--radius-sm)" }} />
            </div>
          </div>
        ))}
      </div>

      {/* Recent items skeleton */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div className="skeleton" style={{ width: "120px", height: "18px", borderRadius: "4px" }} />
          <div className="skeleton" style={{ width: "60px", height: "14px", borderRadius: "4px" }} />
        </div>

        <div className="card" style={{ overflow: "hidden", padding: "8px 0" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={`skel-recent-${i}`}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "14px 16px",
                borderBottom: i < 4 ? "1px solid var(--color-border)" : "none",
              }}
            >
              <div className="skeleton" style={{ width: 48, height: 36, borderRadius: "6px" }} />
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "6px" }}>
                <div className="skeleton" style={{ width: "40%", height: "14px", borderRadius: "4px" }} />
                <div className="skeleton" style={{ width: "20%", height: "12px", borderRadius: "4px" }} />
              </div>
              <div className="skeleton" style={{ width: "50px", height: "20px", borderRadius: "100px" }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
