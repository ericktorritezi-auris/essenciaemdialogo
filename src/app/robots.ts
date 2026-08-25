import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/public/seo";

export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin", "/api", "/login", "/busca", "/contato"],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}
