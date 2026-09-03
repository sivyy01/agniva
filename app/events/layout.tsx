import type { Metadata } from "next";

export const metadata: Metadata = {
  title:
    "Афиша АГНИВА — мероприятия в Новокузнецке",

  description:
    "Афиша АГНИВА в Новокузнецке: вечеринки, события и специальные мероприятия.",

  alternates: {
    canonical: "/events",
  },

  openGraph: {
    title:
      "Афиша АГНИВА — мероприятия в Новокузнецке",
    description:
      "Актуальные события и мероприятия АГНИВА.",
    url: "/events",
    type: "website",
  },
};

export default function EventsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}