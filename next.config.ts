import type { NextConfig } from "next";

/* GitHub Pages is served from https://<owner>.github.io/<repo>/, so all
 * static assets need a /<repo> basePath in production. Dev runs at the
 * site root, so we strip the basePath there. */
const REPO_NAME = "portfolio";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  /* `output: 'export'` makes `next build` produce a static `out/` directory
   * that can be served from any static host (GitHub Pages, Cloudflare
   * Pages, Netlify, S3+CloudFront, etc.). */
  output: "export",

  /* basePath: served under /portfolio on GitHub Pages. */
  basePath: isProd ? `/${REPO_NAME}` : "",

  /* assetPrefix: tell Next to prefix all emitted asset URLs with the
   * basePath so _next/* assets resolve correctly when served from a
   * sub-path. Required alongside basePath for static export. */
  assetPrefix: isProd ? `/${REPO_NAME}` : "",

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
   * prefixed. Expose the basePath as a build-time env var so user code
   * can compose correct URLs in static export. NEXT_PUBLIC_* is inlined
   * into the client bundle at build time, which is what we want for
   * static export (no runtime access to process.env). */
  env: {
    NEXT_PUBLIC_BASE_PATH: isProd ? `/${REPO_NAME}` : "",
  },
};

export default nextConfig;
