// src/app/icon.tsx
// Dynamically generated favicon — Modern Electronics
// Produces a 32×32 PNG served at /icon and injected automatically by Next.js

import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          background: "#0071e3",
          borderRadius: 7,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Subtle accent glow behind letters */}
        <div
          style={{
            position: "absolute",
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.2)",
            display: "flex",
          }}
        />

        {/* "ME" monogram */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            position: "relative",
          }}
        >
          <span
            style={{
              fontFamily: "sans-serif",
              fontWeight: 800,
              fontSize: 13,
              color: "#ffffff",
              letterSpacing: "-0.5px",
              lineHeight: 1,
            }}
          >
            ME
          </span>
        </div>

        {/* Bottom-right circuit dot accent */}
        <div
          style={{
            position: "absolute",
            bottom: 4,
            right: 4,
            width: 3,
            height: 3,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.5)",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
