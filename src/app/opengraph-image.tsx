import { ImageResponse } from "next/og";
import { SITE_NAME } from "@/lib/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0f172a",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", fontSize: 96, fontWeight: 800 }}>
          <span style={{ color: "#3b82f6" }}>Buy</span>
          <span>&nbsp;Stuff</span>
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#94a3b8", marginTop: 16 }}>
          Buy, sell, and bid on anything
        </div>
      </div>
    ),
    { ...size }
  );
}

export const alt = `${SITE_NAME} — Buy, sell, and bid on anything`;
