import type { Metadata } from "next";

import { Hero } from "@/components/hero/Hero";
import { SpaceSection } from "@/components/space/SpaceSection";
import { ContactsSection } from "@/components/contacts/ContactsSection";

export const metadata: Metadata = {
  alternates: {
    canonical:
      "https://agniva.art",
  },

  openGraph: {
    url:
      "https://agniva.art",
  },
};

export default function Home() {
  return (
    <main>
      <Hero />
      <SpaceSection />
      <ContactsSection />
    </main>
  );
}