import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a0814",
          borderRadius: "20%",
          position: "relative",
        }}
      >
        <div
          style={{
            color: "#f4ecd9",
            fontSize: 124,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            marginTop: -12,
          }}
        >
          S
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 22,
            left: 28,
            right: 28,
            height: 10,
            background: "#f15a4a",
            borderRadius: 5,
          }}
        />
      </div>
    ),
    { ...size },
  );
}