"use client";

import { createContext, useContext } from "react";
import type { Dictionary, Locale } from "@/lib/i18n";

/**
 * Locale + dictionary context shared by every client component under
 * a server page. Set once at the page level by `<I18nProvider>` and
 * consumed via `useI18n()` inside client components (SiteHeader,
 * ExhibitionLoader, WorkIndex, PreloaderScreen, etc.).
 *
 * Why context and not props drilling: the carousel page nests
 * SiteHeader alongside a WorkIndex whose Centerpiece / Timeline /
 * VideoOverlay all need dictionary lookups. Props-drilling through
 * 3–4 layers is noisy and easy to break when a new component is
 * added. Context keeps the I18n contract at a single import site per
 * component.
 */

type I18nValue = {
  locale: Locale;
  dict: Dictionary;
};

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: I18nValue & { children: React.ReactNode }) {
  return (
    <I18nContext.Provider value={{ locale, dict }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error(
      "useI18n must be called inside <I18nProvider>. " +
        "Wrap your page's client tree with the provider.",
    );
  }
  return ctx;
}