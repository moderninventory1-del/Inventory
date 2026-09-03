// src/app/icon.tsx
// Dynamically generated favicon — Modern Electronics Open Box (Primary Blue #2563EB)
// Serves a 32×32 crisp icon for desktop browsers (Windows, Linux, macOS)

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
          background: "#FFFFFF",
          borderRadius: 8,
          border: "1px solid rgba(0, 0, 0, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 100 100"
          width="24"
          height="24"
        >
          <path
            d="M 77.47,42.64 L 82.0,46.6 L 59.91,59.63 L 58.21,59.63 L 50.28,53.4 L 41.79,59.63 L 40.09,59.63 L 18.0,46.6 L 28.19,39.81 L 49.15,52.27 L 49.15,26.78 L 28.19,39.24 L 25.93,38.67 L 19.7,33.01 L 41.22,19.42 L 42.92,19.42 L 49.15,25.08 L 50.85,25.08 L 55.38,20.55 L 58.78,19.42 L 80.3,32.44 L 74.07,38.67 L 71.24,39.24 L 50.85,26.78 L 50.85,52.27 L 71.81,39.81 Z M 36.69,59.06 L 41.22,61.89 L 49.15,56.8 L 49.15,80.58 L 28.19,68.12 L 28.19,54.53 Z M 50.85,77.75 L 50.85,56.23 L 59.35,61.89 L 71.81,54.53 L 71.81,68.12 L 51.98,80.58 L 50.85,80.58 Z"
            fill="#2563EB"
            fillRule="evenodd"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
