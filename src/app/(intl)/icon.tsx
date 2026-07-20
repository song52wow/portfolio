import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";
export const dynamic = "force-static";

export default function Icon() {
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
          borderRadius: "16%",
          position: "relative",
        }}
      >
        <div
          style={{
            color: "#f4ecd9",
            fontSize: 22,
            fontWeight: 800,
            letterSpacing: "-0.05em",
            lineHeight: 1,
            marginTop: -2,
          }}
        >
          S
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 4,
            left: 5,
            right: 5,
            height: 2,
            background: "#f15a4a",
            borderRadius: 1,
          }}
        />
      </div>
    ),
    { ...size },
  );
}