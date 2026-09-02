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
<<<<<<< HEAD
          background: "#0071e3",
=======
          background: "#0a0a0f",
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
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
<<<<<<< HEAD
            background: "rgba(255,255,255,0.2)",
=======
            background: "rgba(99,102,241,0.18)",
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
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
<<<<<<< HEAD
              color: "#ffffff",
=======
              color: "#818cf8",
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
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
<<<<<<< HEAD
            background: "rgba(255,255,255,0.5)",
=======
            background: "#6366f1",
>>>>>>> 5efaf11ce2b8c94339206a66f0bf618286973609
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size }
  );
}
