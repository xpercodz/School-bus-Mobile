import type { Metadata } from "next";
import type { ReactNode } from "react";
import { IBM_Plex_Sans_Arabic, Inter, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/app/providers";
import { LOCALE_DIR } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n";
import { getServerLocale } from "@/lib/i18n/server";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

// Arabic falls back onto Inter's Latin glyphs via unicode-range: the browser
// picks this font only for Arabic-script characters.
const arabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  variable: "--font-arabic",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains",
});

export async function generateMetadata(): Promise<Metadata> {
  const dict = getDictionary(await getServerLocale());
  return {
    title: dict["meta.title"],
    description: dict["meta.description"],
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  // Section layouts (mobile/dashboard) override this per area.
  const locale = await getServerLocale();

  return (
    <html
      lang={locale}
      dir={LOCALE_DIR[locale]}
      className={`${inter.variable} ${arabic.variable} ${jetbrainsMono.variable}`}
    >
      <body>
        {/* Material Symbols Rounded + Outlined — not available in next/font, loaded
            via CDN. React 19 hoists these resource links into <head>. Swap to the
            `material-symbols` npm package when we self-host (Firebase phase). */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* App Router — no pages/_document; React 19 hoists this into <head>. */}
        {/* eslint-disable-next-line @next/next/no-page-custom-font -- Pages-Router-only rule */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght,FILL@100..700,0..1&family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
        />
        <Providers initialLocale={locale}>{children}</Providers>
      </body>
    </html>
  );
}
