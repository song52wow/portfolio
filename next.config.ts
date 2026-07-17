import type { NextConfig } from "next";

/* Custom domain (https://www.song52wow.xyz) serves the site from the
 * domain root, so there is no basePath in production. Dev still runs
 * at localhost:3100. */
const nextConfig: NextConfig = {
  /* `output: 'export'` makes `next build` produce a static `out/` directory
   * that can be served from any static host (GitHub Pages, Cloudflare
   * Pages, Netlify, S3+CloudFront, etc.). */
  output: "export",

  /* Custom domain — site is served from the apex, no basePath. */
  basePath: "",

  /* assetPrefix: tell Next to prefix all emitted asset URLs so _next/*
   * assets resolve correctly when served from a sub-path. Root-served
   * custom domain has no prefix. */
  assetPrefix: "",

  /* GitHub Pages doesn't support clean URLs without a trailing slash
   * (no server-side rewrites), so emit /resume/index.html etc. */
  trailingSlash: true,

  /* Static export can't run the next/image optimization worker.
   * Skip optimization — all images are served as-is. */
  images: {
    unoptimized: true,
  },

  /* basePath only auto-prefixes `<Link>`/`<Image>` (and even Image needs
   * manual prefixing per the docs). Raw strings used in `<video src>`,
   * `<source src>`, and user-data paths in src/data/works.ts are NOT
   * prefixed. NEXT_PUBLIC_BASE_PATH stays empty (root-served) so user
   * code composes correct URLs in static export without changes.
   * NEXT_PUBLIC_* is inlined into the client bundle at build time, which
   * is what we want for static export (no runtime access to process.env). */
  env: {
    NEXT_PUBLIC_BASE_PATH: "",
  },
};

export default nextConfig;
