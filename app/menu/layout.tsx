import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Меню ресторана АГНИВА в Новокузнецке",

  description:
    "Меню АГНИВА в Новокузнецке: кухня, бар и дымная культура. Актуальные блюда, напитки и цены.",

  alternates: {
    canonical: "/menu",
  },

  openGraph: {
    title:
      "Меню ресторана АГНИВА в Новокузнецке",
    description:
      "Кухня, бар и дымная культура АГНИВА. Актуальное меню и цены.",
    url: "/menu",
    type: "website",
  },
};

export default function MenuLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}