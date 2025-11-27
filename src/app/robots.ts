import { MetadataRoute } from "next";

const siteUrl = "https://sitioexpress.mx";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin-express/",  // Admin panel
          "/api/",            // API routes
          "/gracias/",        // Thank you page (not useful for search)
        ],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

