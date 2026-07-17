import type { MetadataRoute } from "next";

/* Required by `output: 'export'` — the sitemap route must be statically
 * generated at build time and not treated as a dynamic server route.
 * Same rationale as src/app/icon.tsx and src/app/apple-icon.tsx. */
export const dynamic = "force-static";

/* Site URL is injected at build time via NEXT_PUBLIC_SITE_URL (set in
 * .github/workflows/deploy.yml for prod; falls back to localhost for
 * `next dev` so the sitemap resolves there too). Mirrors the
 * metadataBase URL used in src/app/layout.tsx. */
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100";

/* Indexable pages on the site. Deep-link variants (`/?w=<slug>`) share
 * the same document as `/`, so they're not separate entries here.
 * `trailingSlash: true` in next.config.ts means every emitted route
 * ends with `/`, so the sitemap URLs match. */
export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    {
      url: `${SITE_URL}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/resume/`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}