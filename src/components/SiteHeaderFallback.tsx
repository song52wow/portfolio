import Link from "next/link";
import type { Dictionary } from "@/lib/i18n";

/**
 * Server-rendered fallback for <SiteHeader />. The real SiteHeader is
 * a client component that uses `useSearchParams()` to power the
 * language switcher, which forces Next.js to require a Suspense
 * boundary at the page level during static export prerender.
 *
 * During SSR (and on the very first client paint before JS hydrates),
 * this fallback renders the chrome users care about most — the logo,
 * the primary nav, and a placeholder slot for the right-side actions.
 * Once the real SiteHeader hydrates inside the Suspense boundary, it
 * replaces this fallback and adds the search button, language
 * switcher, menu button, and apps button.
 *
 * Keeping the fallback as a server component (no hooks, no event
 * handlers) means it ships in the static HTML and is visible
 * immediately, without waiting for the client bundle.
 */
export function SiteHeaderFallback({
  dict,
  localeBasePath,
}: {
  dict: Dictionary;
  localeBasePath: string;
}) {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-5 sm:px-6">
      <div className="relative mx-auto max-w-[1240px]">
        <div className="glass-pill pointer-events-auto mx-auto flex h-14 w-full items-center justify-between rounded-full pl-4 pr-2">
          {/* Logo — round ember disc with monogram (matches SiteHeader) */}
          <Link
            href={`${localeBasePath}/`}
            aria-label={dict.header.homeAria}
            className="focus-ring flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[var(--ember)] no-underline"
          >
            <span
              className="leading-none text-[var(--paper-on-night)]"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 800,
                fontSize: "18px",
                letterSpacing: "-0.04em",
              }}
            >
              S
            </span>
          </Link>

          {/* Center nav — same links as the live header */}
          <nav
            aria-label={dict.header.navAria}
            className="hidden flex-1 items-center justify-center md:flex"
          >
            <div
              className="flex items-center gap-8 rounded-full border border-white/[0.11] bg-white/[0.03] px-7 py-2.5 backdrop-blur-sm"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
            >
              <Link
                href={`${localeBasePath}/`}
                className="catalog-num focus-ring text-[11px] text-[var(--paper-on-night)] no-underline transition-colors duration-150 hover:text-[var(--ember)]"
              >
                {dict.nav.works}
              </Link>
              <Link
                href={`${localeBasePath}/resume#about`}
                className="catalog-num focus-ring text-[11px] text-[var(--paper-on-night)] no-underline transition-colors duration-150 hover:text-[var(--ember)]"
              >
                {dict.nav.about}
              </Link>
              <Link
                href={`${localeBasePath}/resume/`}
                className="catalog-num focus-ring text-[11px] text-[var(--paper-on-night)] no-underline transition-colors duration-150 hover:text-[var(--ember)]"
              >
                {dict.nav.resume}
              </Link>
              <Link
                href="mailto:hello@studio.local"
                className="catalog-num focus-ring text-[11px] text-[var(--paper-on-night)] no-underline transition-colors duration-150 hover:text-[var(--ember)]"
              >
                {dict.nav.contact}
              </Link>
            </div>
          </nav>

          {/* Right cluster — same shape and size as the live header so
              the layout doesn't shift when hydration swaps in the
              real SiteHeader. Buttons are inert placeholders. */}
          <div className="flex items-center gap-2">
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[var(--paper-on-night)]/40"
            />
            <span
              aria-hidden
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 text-[12px] text-[var(--paper-on-night)]/40"
            >
              中 / EN
            </span>
            <span
              aria-hidden
              className="inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-[12px] text-[var(--paper-on-night)]/40"
            >
              Menu
            </span>
            <span
              aria-hidden
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-[var(--paper-on-night)]/40"
            />
          </div>
        </div>
      </div>
    </header>
  );
}