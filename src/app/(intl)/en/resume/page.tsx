import type { Metadata } from "next";
import { Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteHeaderFallback } from "@/components/SiteHeaderFallback";
import { Resume } from "@/components/Resume";
import { I18nProvider } from "@/lib/I18nContext";
import { getDictionary } from "@/lib/dictionaries";
import { localeBasePath as basePathFor } from "@/lib/i18n";

const dict = await getDictionary("en");

export const metadata: Metadata = {
  title: dict.resume.title,
  description: dict.resume.description,
};

export default function ResumePageEn() {
  const basePath = basePathFor("en");

  return (
    <I18nProvider locale="en" dict={dict}>
      <Suspense
        fallback={<SiteHeaderFallback dict={dict} localeBasePath={basePath} />}
      >
        <SiteHeader />
      </Suspense>
      <Resume />
    </I18nProvider>
  );
}
