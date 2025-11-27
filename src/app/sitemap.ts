import { MetadataRoute } from "next";

const siteUrl = "https://sitioexpress.mx";

export default function sitemap(): MetadataRoute.Sitemap {
  const currentDate = new Date().toISOString();

  return [
    // Main landing page - highest priority
    {
      url: siteUrl,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 1,
    },
    // Quote wizard - high priority (main conversion page)
    {
      url: `${siteUrl}/cotizaciones`,
      lastModified: currentDate,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    // Legal pages
    {
      url: `${siteUrl}/privacidad`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${siteUrl}/terminos`,
      lastModified: currentDate,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    // Note: /gracias and /admin-express are intentionally excluded
    // - /gracias is a thank-you page (not useful for search)
    // - /admin-express is an admin page (should not be indexed)
  ];
}

