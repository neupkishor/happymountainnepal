// src/app/sitemap/packages.xml/route.ts
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-server';
import { collection, query, where, getDocs } from 'firebase/firestore';
import type { Tour } from '@/lib/types';

const BASE_URL = 'https://happymountainnepal.com';

export async function GET() {
  const packagesRef = collection(firestore, 'packages');
  const q = query(packagesRef, where('status', '==', 'published'));
  const querySnapshot = await getDocs(q);

  const urls = querySnapshot.docs.map(doc => {
    const tour = doc.data() as Tour;
    return `
    <url>
      <loc>${`${BASE_URL}/tours/${tour.slug}`}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.9</priority>
    </url>`;
  }).join('');

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
