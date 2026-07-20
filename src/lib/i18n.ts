/**
 * Locale types + pure helpers shared between server and client.
 *
 * Pure functions only — no I/O, no `import "server-only"`. Safe to
 * import from `"use client"` components (SiteHeader, WorkIndex, …)
 * and from server components alike.
 *
 * The dynamic-import dictionary loader lives in `./dictionaries.ts`
 * (server-only) so server pages can call `getDictionary()` while
 * client components stay bundlable with just the types from here.
 */

export const LOCALES = ["zh", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "zh";

export const isLocale = (value: string): value is Locale =>
  (LOCALES as readonly string[]).includes(value);

/** Type contract — every dictionary file must satisfy this shape. */
export type Dictionary = typeof import("@/dictionaries/zh.json");

/** Single-work translation shape — derived from the Dictionary so it
 *  stays in sync automatically when the schema evolves. */
export type WorkTranslation = Dictionary["works"][keyof Dictionary["works"]];

/**
 * Look up a work's translation by slug. The Dictionary's `works`
 * shape is a closed record of known slugs, but `Work.slug` is a
 * generic string — without a helper, every lookup would need a
 * type-assertion. Centralising the cast here keeps the call sites
 * clean and the type definition in one place.
 */
export function getWorkTranslation(
  dict: Dictionary,
  slug: string,
): WorkTranslation | undefined {
  return (dict.works as Record<string, WorkTranslation>)[slug];
}

/**
 * Build the URL to switch to the other locale, preserving the rest of
 * the path and any query string (notably `?w=<slug>` on the carousel).
 *
 * Examples (current pathname → target):
 *   /                  → zh (already here, no-op)
 *   /en/               → en (already here, no-op)
 *   /?w=cuporacle      → en/?w=cuporacle
 *   /en/?w=cuporacle   → /?w=cuporacle
 *   /resume/           → en/resume/
 *   /en/resume/        → /resume/
 *
 * Trailing slashes are preserved verbatim because `trailingSlash: true`
 * in next.config.ts emits every URL with one. The (zh) root "/" and
 * (intl)/en root "/en/" are both treated as "home" and mapped to the
 * opposite group's home.
 */
export function buildLocaleSwitchUrl(
  pathname: string,
  search: string,
  target: Locale,
): string {
  const isEnPath = pathname === "/en" || pathname.startsWith("/en/");

  if (target === "en") {
    if (isEnPath) return pathname + search;
    const stripped = pathname === "/" ? "" : pathname;
    return `/en${stripped}${search}`;
  }

  // target === "zh"
  if (!isEnPath) return pathname + search;
  const rest = pathname.slice(3); // drop "/en"
  const zhPath = rest === "" || rest === "/" ? "/" : rest;
  return `${zhPath}${search}`;
}

/** Compute the URL prefix for the active locale's root. Used to keep
 *  in-app router pushes (e.g. `/?w=cuporacle` → `/en/?w=cuporacle`)
 *  inside the current locale instead of bouncing to the default. */
export function localeBasePath(locale: Locale): string {
  return locale === "en" ? "/en" : "";
}