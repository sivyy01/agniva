import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Афиша АГНИВА — события в Новокузнецке",

  description:
    "Афиша АГНИВЫ в Новокузнецке: ближайшие события, специальные вечера и мероприятия. Проспект Николая Ермакова, 30А.",

  alternates: {
    canonical:
      "https://agniva.art/events",
  },

  openGraph: {
    title:
      "Афиша АГНИВА — Новокузнецк",

    description:
      "События и специальные вечера в АГНИВЕ.",

    url:
      "https://agniva.art/events",
  },
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}