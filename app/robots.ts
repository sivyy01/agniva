import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/admin/",
        "/api/",
        "/qr/ginza",
        "/supabase-test",
      ],
    },
    sitemap:
      "https://xn--80aafdz3a.art/sitemap.xml",
    host:
      "https://xn--80aafdz3a.art",
  };
}