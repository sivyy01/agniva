import { Hero } from "@/components/hero/Hero";
import { SpaceSection } from "@/components/space/SpaceSection";
import { ContactsSection } from "@/components/contacts/ContactsSection";

export default function Home() {
  return (
    <main>
      <Hero />
      <SpaceSection />
      <ContactsSection />
    </main>
  );
}