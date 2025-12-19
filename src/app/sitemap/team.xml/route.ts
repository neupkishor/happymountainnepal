// src/app/sitemap/team.xml/route.ts
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-server';
import { collection, getDocs } from 'firebase/firestore';
import type { TeamMember } from '@/lib/types';

const BASE_URL = 'https://happymountainnepal.com';

export async function GET() {
  const membersRef = collection(firestore, 'teamMembers');
  const querySnapshot = await getDocs(membersRef);

  const urls = querySnapshot.docs.map(doc => {
    const member = doc.data() as TeamMember;
    return `
    <url>
      <loc>${`${BASE_URL}/about/teams/${member.slug}`}</loc>
      <lastmod>${new Date().toISOString()}</lastmod>
      <changefreq>yearly</changefreq>
      <priority>0.6</priority>
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
