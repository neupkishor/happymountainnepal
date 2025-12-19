// src/app/sitemap/pages.xml/route.ts
import { NextResponse } from 'next/server';

const BASE_URL = 'https://happymountainnepal.com';

const staticPages = [
  '/',
  '/tours',
  '/about',
  '/about/teams',
  '/blog',
  '/contact',
  '/reviews',
  '/customize',
  '/legal/privacy',
  '/legal/terms',
  '/legal/documents',
];

export async function GET() {
  const urls = staticPages.map(page => `
    <url>
      <loc>${`${BASE_URL}${page}`}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>weekly</changefreq>
      <priority>${page === '/' ? '1.0' : '0.8'}</priority>
    </url>`).join('');

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls}
</urlset>`;

  return new NextResponse(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}
