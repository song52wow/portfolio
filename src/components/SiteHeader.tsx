"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { useI18n } from "@/lib/I18nContext";
import { buildLocaleSwitchUrl, LOCALES, type Locale } from "@/lib/i18n";

type NavItem = { label: string; href: string };

const LANG_LABELS: Record<Locale, string> = { zh: "中", en: "EN" };

export function SiteHeader() {
  const { locale, dict } = useI18n();
  const pathname = usePathname() ?? "/";
  const search = useSearchParams();
  const searchString = useMemo(() => {
    const s = search?.toString() ?? "";
    return s ? `?${s}` : "";
  }, [search]);

  const [menuOpen, setMenuOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  /* Close the mobile menu on outside tap or Escape. */
  useEffect(() => {
    if (!menuOpen) return;
    function onPointer(e: PointerEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setMenuOpen(false);
    }
    document.addEventListener("pointerdown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  /* Strip the locale prefix before computing nav hrefs — the site is
   * served from "/" for zh and "/en" for en, and the carousel reads
   * the current focus via ?w=<slug>, so "About" points to the locale
   * root's resume anchor. */
  const basePath = locale === "en" ? "/en" : "";

  const NAV: NavItem[] = [
    { label: dict.nav.works, href: `${basePath}/` },
    { label: dict.nav.about, href: `${basePath}/resume#about` },
  ];

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-5 sm:px-6">
      <div ref={wrapRef} className="relative mx-auto max-w-[1240px]">
        <div className="glass-pill pointer-events-auto mx-auto flex h-14 w-full items-center justify-between rounded-full pl-4 pr-2">
          {/* Logo — round ember disc with monogram */}
          <Link
            href={`${basePath}/`}
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

          {/* Center nav — wrapped in an inner pill (desktop only) */}
          <nav
            aria-label={dict.header.navAria}
            className="hidden flex-1 items-center justify-center md:flex"
          >
            <div
              className="flex items-center gap-6 rounded-full border border-white/[0.11] bg-white/[0.03] px-5 py-2.5 backdrop-blur-sm"
              style={{ boxShadow: "inset 0 1px 0 rgba(255,255,255,0.04)" }}
            >
              {NAV.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="catalog-num focus-ring text-[11px] text-[var(--paper-on-night)] no-underline transition-colors duration-150 hover:text-[var(--ember)]"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>

          {/* Right cluster — lang switcher (desktop) + mobile-only menu */}
          <div className="flex items-center gap-2">
            <Suspense fallback={<LanguageSwitcherFallback ariaLabel={dict.header.langSwitchAria} />}>
              <LanguageSwitcher
                current={locale}
                pathname={pathname}
                searchString={searchString}
                ariaLabel={dict.header.langSwitchAria}
              />
            </Suspense>
            {/* Mobile-only menu — desktop shows the centered nav instead. */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={
                menuOpen ? dict.header.menuCloseAria : dict.header.menuOpenAria
              }
              className="focus-ring glass-pill inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-[12px] text-[var(--paper-on-night)] transition-colors duration-150 hover:bg-white/10 sm:hidden"
            >
              <MenuGlyph open={menuOpen} />
              <span className="catalog-num">
                {menuOpen ? dict.header.menuCloseLabel : dict.header.menuOpenLabel}
              </span>
            </button>
          </div>
        </div>

        {/* Mobile dropdown — mirrors the desktop nav, only on < sm.
           * z-50 sits above the header (z-40) and the hero (z-10), and
           * `backdrop-blur-md` re-applies the glass blur here directly
           * — the matching rule on .glass-pill is dropped by Tailwind's
           * CSS optimizer, so without this utility the centerpiece text
           * bleeds through the pill. */}
        <div
          id="mobile-menu"
          className={`glass-pill pointer-events-auto absolute inset-x-0 top-[60px] z-50 mx-1 origin-top overflow-hidden rounded-2xl backdrop-blur-md transition-all duration-200 ease-out sm:hidden ${
            menuOpen
              ? "visible max-h-80 opacity-100"
              : "invisible max-h-0 opacity-0"
          }`}
        >
          <ul className="flex flex-col p-2">
            {NAV.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="focus-ring flex items-center justify-between rounded-xl px-4 py-3 text-[13px] text-[var(--paper-on-night)] no-underline transition-colors duration-150 hover:bg-white/[0.06] hover:text-[var(--ember)]"
                >
                  <span className="catalog-num">{item.label}</span>
                  <span aria-hidden className="text-[var(--mute-on-night)]">
                    ↗
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </header>
  );
}

/* Language switcher — two compact text links "中 / EN". The current
 * locale is highlighted in ember; clicking the other one navigates to
 * the same path (and ?w=<slug> query) under the new locale.
 *
 * Wrapped in a <Suspense> boundary at the call site because
 * `useSearchParams()` forces a client bailout during static export,
 * and Next.js needs a boundary to know what to render as the static
 * fallback. The fallback component below preserves the switcher's
 * pill shape so the header doesn't visibly reflow when the real
 * switcher hydrates.
 *
 * Implemented as a separate component so the parent re-renders only
 * when pathname / searchParams change — `useSearchParams()` is the
 * trigger, and isolating it keeps the rest of the header from
 * re-rendering on every focus carousel tick. */
/* Placeholder rendered during SSR / before hydration. Same outer
 * pill as the real switcher so the header doesn't visibly shift when
 * the client version hydrates and replaces it. */
function LanguageSwitcherFallback({ ariaLabel }: { ariaLabel: string }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-1 text-[11px] text-[var(--paper-on-night)]"
    >
      <span className="inline-flex h-6 min-w-[26px] items-center justify-center rounded-full px-2 text-[var(--paper-on-night)]/70">
        中
      </span>
      <span className="inline-flex h-6 min-w-[26px] items-center justify-center rounded-full px-2 text-[var(--paper-on-night)]/70">
        EN
      </span>
    </div>
  );
}

function LanguageSwitcher({
  current,
  pathname,
  searchString,
  ariaLabel,
}: {
  current: Locale;
  pathname: string;
  searchString: string;
  ariaLabel: string;
}) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className="focus-ring-within inline-flex items-center gap-0.5 rounded-full border border-white/10 bg-white/[0.04] px-1.5 py-1 text-[11px] text-[var(--paper-on-night)]"
    >
      {LOCALES.map((loc) => {
        const isActive = loc === current;
        const href = buildLocaleSwitchUrl(pathname, searchString, loc);
        return (
          <Link
            key={loc}
            href={href}
            aria-current={isActive ? "true" : undefined}
            className={`focus-ring inline-flex h-6 min-w-[26px] items-center justify-center rounded-full px-2 no-underline transition-colors duration-150 ${
              isActive
                ? "bg-[var(--ember)]/15 text-[var(--ember)]"
                : "text-[var(--paper-on-night)]/70 hover:text-[var(--paper-on-night)]"
            }`}
            style={{ fontFamily: "var(--font-mono)" }}
          >
            {LANG_LABELS[loc]}
          </Link>
        );
      })}
    </div>
  );
}

function MenuGlyph({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {open ? (
        <>
          <path d="M6 6l12 12" />
          <path d="M18 6 6 18" />
        </>
      ) : (
        <>
          <path d="M3 6h18" />
          <path d="M3 12h18" />
          <path d="M3 18h18" />
        </>
      )}
    </svg>
  );
}

