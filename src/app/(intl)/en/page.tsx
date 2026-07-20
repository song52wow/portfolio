import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteHeaderFallback } from "@/components/SiteHeaderFallback";
import { ExhibitionLoader } from "@/components/ExhibitionLoader";
import { I18nProvider } from "@/lib/I18nContext";
import { getDictionary } from "@/lib/dictionaries";
import { localeBasePath as basePathFor } from "@/lib/i18n";

const dict = await getDictionary("en");

function SimpleLoading() {
  return (
    <div className="grid min-h-dvh place-items-center">
      <p className="catalog-num text-[11px] text-[var(--mute-on-night)]">
        {dict.carousel.loading}
      </p>
    </div>
  );
}

export default function HomePageEn() {
  return (
    <I18nProvider locale="en" dict={dict}>
      <Suspense
        fallback={<SiteHeaderFallback dict={dict} localeBasePath={basePathFor("en")} />}
      >
        <SiteHeader />
      </Suspense>
      <Suspense fallback={<SimpleLoading />}>
        <ExhibitionLoader />
      </Suspense>
    </I18nProvider>
  );
}