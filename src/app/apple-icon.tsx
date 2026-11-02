import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "#ff6633" }}>
        <svg width="120" height="120" viewBox="0 0 64 64">
          <g fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round">
            <path d="M21 12v24" />
            <circle cx="32.5" cy="38" r="11.5" />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
