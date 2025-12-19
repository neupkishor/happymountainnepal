// src/app/sitemap/blogs.xml/route.ts
import { NextResponse } from 'next/server';
import { firestore } from '@/lib/firebase-server';
import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import type { BlogPost } from '@/lib/types';

const BASE_URL = 'https://happymountainnepal.com';

export async function GET() {
  const postsRef = collection(firestore, 'blogPosts');
  const q = query(postsRef, where('status', '==', 'published'));
  const querySnapshot = await getDocs(q);

  const urls = querySnapshot.docs.map(doc => {
    const post = doc.data() as BlogPost;
    const lastMod = post.date instanceof Timestamp 
      ? post.date.toDate().toISOString() 
      : new Date(post.date).toISOString();
      
    return `
    <url>
      <loc>${`${BASE_URL}/blog/${post.slug}`}</loc>
      <lastmod>${lastMod}</lastmod>
      <changefreq>monthly</changefreq>
      <priority>0.7</priority>
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
