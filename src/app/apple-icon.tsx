// src/app/apple-icon.tsx
// Apple touch icon — Modern Electronics
// Produces a 180×180 PNG for iOS home screen shortcuts

import { ImageResponse } from "next/og";

export const runtime = "edge";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          background: "#0a0a0f",
          borderRadius: 40,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          position: "relative",
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: "absolute",
            width: 120,
            height: 120,
            borderRadius: "50%",
            background: "rgba(99,102,241,0.14)",
            display: "flex",
          }}
        />

        {/* Outer ring accent */}
        <div
          style={{
            position: "absolute",
            width: 110,
            height: 110,
            borderRadius: "50%",
            border: "1.5px solid rgba(99,102,241,0.25)",
            display: "flex",
          }}
        />

        {/* "ME" monogram */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 0,
            position: "relative",
          }}
        >
          <span
            style={{
              fontFamily: "sans-serif",
              fontWeight: 800,
              fontSize: 72,
              color: "#818cf8",
              letterSpacing: "-3px",
              lineHeight: 1,
            }}
          >
            ME
          </span>
          <span
            style={{
              fontFamily: "sans-serif",
              fontWeight: 400,
              fontSize: 13,
              color: "rgba(160,160,184,0.8)",
              letterSpacing: "3px",
              lineHeight: 1,
              marginTop: 4,
              textTransform: "uppercase",
            }}
          >
            Electronics
          </span>
        </div>

        {/* Corner circuit dots */}
        {[
          { bottom: 22, right: 22 },
          { bottom: 22, left: 22 },
        ].map((pos, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#6366f1",
              display: "flex",
              ...pos,
            }}
          />
        ))}
      </div>
    ),
    { ...size }
  );
}
