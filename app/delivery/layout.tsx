import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Доставка АГНИВА в Новокузнецке",

  description:
    "Доставка блюд АГНИВЫ в Новокузнецке. Актуальное меню, цены, доставка и самовывоз.",

  alternates: {
    canonical:
      "https://agniva.art/delivery",
  },

  openGraph: {
    title:
      "Доставка АГНИВА — Новокузнецк",

    description:
      "Заказ блюд АГНИВЫ с доставкой и самовывозом.",

    url:
      "https://agniva.art/delivery",
  },
};

export default function DeliveryLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}