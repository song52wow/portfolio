import Link from "next/link";

type NavItem = { label: string; href: string };

const NAV: NavItem[] = [
  { label: "Works", href: "/" },
  { label: "About", href: "/resume#about" },
  { label: "Resume", href: "/resume" },
  { label: "Contact", href: "mailto:hello@studio.local" },
];

export function SiteHeader() {
  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-5 sm:px-6">
      <div className="glass-pill pointer-events-auto mx-auto flex h-14 w-full max-w-[1240px] items-center justify-between rounded-full pl-4 pr-2">
        {/* Logo — round ember disc with monogram */}
        <Link
          href="/"
          aria-label="回到首页"
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

        {/* Center nav — wrapped in an inner pill (matches reference) */}
        <nav
          aria-label="主导航"
          className="hidden flex-1 items-center justify-center md:flex"
        >
          <div
            className="flex items-center gap-8 rounded-full border border-white/[0.11] bg-white/[0.03] px-7 py-2.5 backdrop-blur-sm"
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

        {/* Right cluster — search + menu + apps */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="搜索作品"
            className="focus-ring circle-btn"
          >
            <SearchIcon />
          </button>
          <button
            type="button"
            aria-label="菜单"
            className="focus-ring glass-pill inline-flex h-10 items-center gap-2 rounded-full border border-white/15 px-4 text-[12px] text-[var(--paper-on-night)] transition-colors duration-150 hover:bg-white/10"
          >
            <span className="catalog-num">Menu</span>
          </button>
          <button
            type="button"
            aria-label="应用视图"
            className="focus-ring circle-btn"
          >
            <AppsIcon />
          </button>
        </div>
      </div>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function AppsIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <circle cx="5" cy="5" r="1.6" />
      <circle cx="12" cy="5" r="1.6" />
      <circle cx="19" cy="5" r="1.6" />
      <circle cx="5" cy="12" r="1.6" />
      <circle cx="12" cy="12" r="1.6" />
      <circle cx="19" cy="12" r="1.6" />
      <circle cx="5" cy="19" r="1.6" />
      <circle cx="12" cy="19" r="1.6" />
      <circle cx="19" cy="19" r="1.6" />
    </svg>
  );
}
