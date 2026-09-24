import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Меню ресторана АГНИВА в Новокузнецке",

  description:
    "Меню АГНИВЫ в Новокузнецке: кухня, бар и дымная культура. Актуальные блюда, напитки и цены.",

  alternates: {
    canonical:
      "https://agniva.art/menu",
  },

  openGraph: {
    title:
      "Меню АГНИВА — Новокузнецк",

    description:
      "Кухня, бар и дымная культура. Актуальное меню АГНИВЫ.",

    url:
      "https://agniva.art/menu",
  },
};

export default function MenuLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}