import type { Metadata, Viewport } from "next";
import { fontVariables } from "@/lib/fonts";
import { getDictionary } from "@/lib/dictionaries";
import "../globals.css";

const dict = await getDictionary("en");

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3100",
  ),
  title: dict.meta.siteName,
  description: dict.meta.siteDescription,
  openGraph: {
    type: "website",
    locale: dict.meta.ogLocale,
    siteName: dict.meta.siteName,
    title: dict.meta.siteName,
    description: dict.meta.siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: dict.meta.siteName,
    description: dict.meta.siteDescription,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0814",
  colorScheme: "dark",
};

export default function EnRootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={fontVariables}>
      <body className="min-h-dvh bg-[var(--night)] text-[var(--paper-on-night)] antialiased">
        {children}
      </body>
    </html>
  );
}