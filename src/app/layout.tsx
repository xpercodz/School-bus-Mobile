import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Bus #04 • Morning Run",
  description: "School bus attendance roster",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body>
        {/* Material Symbols Rounded — not available in next/font, loaded via CDN.
            React 19 hoists these resource links into <head>. Swap to the
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
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:wght,FILL@100..700,0..1&display=swap"
        />
        {children}
      </body>
    </html>
  );
}
