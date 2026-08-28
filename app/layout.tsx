import type { Metadata } from "next";
import {
  Manrope,
  Poiret_One,
} from "next/font/google";

import { SiteShell } from "@/components/layout/SiteShell";

import "./globals.css";

const manrope = Manrope({
  subsets: ["cyrillic", "latin"],
  variable: "--font-manrope",
  display: "swap",
});

const poiret = Poiret_One({
  subsets: ["cyrillic", "latin"],
  weight: "400",
  variable: "--font-hero",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Агнива — место дымной культуры",
  description:
    "Агнива — кухня, бар и дымная культура в Новокузнецке.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ru"
      className={`${manrope.variable} ${poiret.variable}`}
    >
      <body>
        <SiteShell>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}