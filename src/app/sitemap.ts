import type { MetadataRoute } from "next";
import { getAllWorkSlugs } from "@/data/works";

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const workPages = getAllWorkSlugs().map((slug) => ({
    url: `${baseUrl}/works/${slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    ...workPages,
  ];
}
