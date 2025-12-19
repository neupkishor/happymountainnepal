// src/app/sitemap.xml/route.ts
import { NextResponse } from 'next/server';

const BASE_URL = 'https://happymountainnepal.com';

export async function GET() {
  const sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${BASE_URL}/sitemap/pages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap/packages.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap/blogs.xml</loc>
  </sitemap>
  <sitemap>
    <loc>${BASE_URL}/sitemap/team.xml</loc>
  </sitemap>
</sitemapindex>`;

  return new NextResponse(sitemapIndex, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
