import { Baloo_2, JetBrains_Mono, Noto_Sans_SC } from "next/font/google";

/**
 * Shared font definitions for both (zh) and (en) root layouts.
 *
 * Display + body share Baloo 2 (a rounded variable font that works for both
 * headlines and text) so the carousel keeps one consistent voice. Mono stays
 * on JetBrains for the catalog numerals; CJK stays on Noto for the Chinese
 * resume body. Loading once per route group keeps Next.js's font
 * deduplication working.
 */
export const baloo2 = Baloo_2({
  subsets: ["latin"],
  variable: "--font-baloo2",
  display: "swap",
  weight: "variable",
});

export const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-jetbrains",
  display: "swap",
});

export const notoSans = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-noto",
  display: "swap",
  preload: false,
});

/* Single className string for the three vars — applied to <html> in both
 * group layouts so the CSS variables are available globally. */
export const fontVariables = `${baloo2.variable} ${jetbrains.variable} ${notoSans.variable}`;
