import { ImageResponse } from "next/og";

/* Favicon rendered by Next.js's app-router metadata system.
 * Square dark plate + serif "S" + ember accent bar at the bottom —
 * mirrors the in-app SiteHeader monogram while adding a visual mark
 * that survives the 16×16 reduction of a browser tab. */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/* Required by `output: 'export'` — the icon route must be statically
 * generated at build time and not treated as a dynamic server route. */
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
        {/* Monogram — letterpress cream on night */}
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
        {/* Ember accent bar — echoes the project's --ember color token */}
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