import "server-only";

import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * Server-only dictionary loader. Each server page imports this at the
 * top level (awaitable at module scope because both dictionaries are
 * static imports baked into the build) and forwards the result into
 * client components via the `<I18nProvider>` context.
 *
 * Marked `server-only` because `next/dynamic`-style dynamic imports of
 * the JSON files would be wasteful in the client bundle, and because
 * future additions (DB-loaded translations, CMS fetches) MUST stay on
 * the server. Client components should consume the dictionary via
 * context — see `./I18nContext.tsx`.
 */

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  zh: () => import("@/dictionaries/zh.json").then((m) => m.default),
  en: () => import("@/dictionaries/en.json").then((m) => m.default),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  return dictionaries[locale]();
}