import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm">
      <nav
        className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6"
        aria-label="主导航"
      >
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-100">
          作品集
        </Link>
        <span className="text-sm text-zinc-500">影像 · 短片 · 实验</span>
      </nav>
    </header>
  );
}
