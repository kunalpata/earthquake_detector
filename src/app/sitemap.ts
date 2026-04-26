import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quakepulse.com";
  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "always", // data updates every minute
      priority: 1,
    },
  ];
}
