import type { Metadata } from "next";
import "./globals.css";

const siteName = "作品集";
const siteDescription =
  "个人影像作品集，展示短片、实验影像与视觉创作。";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  title: siteName,
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "zh_CN",
    siteName,
    title: siteName,
    description: siteDescription,
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="overflow-hidden bg-[var(--background)] text-[var(--text)]">
        {children}
      </body>
    </html>
  );
}