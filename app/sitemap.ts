import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl =
    "https://agniva.art";

  return [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/menu`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/delivery`,
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/events`,
      changeFrequency: "daily",
      priority: 0.8,
    },
  ];
}