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
  metadataBase: new URL(
    "https://xn--80aafdz3a.art"
  ),

  title: {
    default:
      "АГНИВА — место дымной культуры в Новокузнецке",
    template:
      "%s | АГНИВА",
  },

  description:
    "АГНИВА — рестобар и место дымной культуры в Новокузнецке. Кухня, бар, кальяны, мероприятия и бронирование столов. Проспект Николая Ермакова, 30А.",

  keywords: [
    "Агнива",
    "Агнива Новокузнецк",
    "ресторан Новокузнецк",
    "рестобар Новокузнецк",
    "бар Новокузнецк",
    "кальян Новокузнецк",
    "дымная культура Новокузнецк",
    "куда сходить Новокузнецк",
  ],

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    locale: "ru_RU",
    url: "/",
    siteName: "АГНИВА",
    title:
      "АГНИВА — место дымной культуры в Новокузнецке",
    description:
      "Кухня, бар, дымная культура, мероприятия и бронирование столов в Новокузнецке.",
  },

  twitter: {
    card: "summary_large_image",
    title:
      "АГНИВА — место дымной культуры",
    description:
      "Кухня, бар и дымная культура в Новокузнецке.",
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
};

const structuredData = {
  "@context":
    "https://schema.org",

  "@type": [
    "Restaurant",
    "BarOrPub",
  ],

  "@id":
    "https://xn--80aafdz3a.art/#business",

  name: "АГНИВА",

  description:
    "АГНИВА — рестобар и место дымной культуры в Новокузнецке.",

  url:
    "https://xn--80aafdz3a.art",

  telephone:
    "+79230301177",

  image:
    "https://xn--80aafdz3a.art/images/hero-bg.png",

  address: {
    "@type":
      "PostalAddress",

    addressLocality:
      "Новокузнецк",

    streetAddress:
      "проспект Николая Ермакова, 30А",

    addressCountry:
      "RU",
  },

  openingHoursSpecification: [
    {
      "@type":
        "OpeningHoursSpecification",

      dayOfWeek: [
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
        "Sunday",
      ],

      opens: "00:00",
      closes: "23:59",
    },
  ],

  hasMenu:
    "https://xn--80aafdz3a.art/menu",

  acceptsReservations: true,
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html:
              JSON.stringify(
                structuredData
              ),
          }}
        />

        <SiteShell>
          {children}
        </SiteShell>
      </body>
    </html>
  );
}