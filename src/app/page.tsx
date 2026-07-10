import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { ExhibitionLoader } from "@/components/ExhibitionLoader";

export const metadata: Metadata = {
  title: "作品集 / EXHIBITION WORKS",
  description: "个人影像作品索引 · Index of moving-image works.",
  openGraph: {
    title: "作品集 / EXHIBITION WORKS",
    description: "个人影像作品索引 · Index of moving-image works.",
  },
};

function SimpleLoading() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <p className="catalog-num text-[11px] text-[var(--mute-on-night)]">
        Loading…
      </p>
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <Suspense fallback={<SimpleLoading />}>
        <ExhibitionLoader />
      </Suspense>
    </>
  );
}
