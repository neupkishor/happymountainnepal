import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/lib/db/sqlite';
import { getImageReport, getLinkReport } from '@/services/links/get-link-report';

export async function POST() {
  const [linkReport, imageReport] = await Promise.all([getLinkReport(), getImageReport()]);
  const brokenLinks = linkReport.entries.filter((entry) => entry.status === 'missing');
  const images = imageReport;
  const foundOn = new Date().toISOString();

  const insert = db.prepare(
    'insert into ContentSearch (id, forPage, lookupFor, pattern, contentFound, foundOn, status) values (?, ?, ?, ?, ?, ?, ?)'
  );
  const find = db.prepare('select id, contentFound from ContentSearch where forPage = ? and lookupFor = ? order by foundOn desc limit 1');
  const update = db.prepare('update ContentSearch set contentFound = ?, foundOn = ? where id = ?');
  const upsert = (forPage: string, lookupFor: string, findings: unknown[]) => {
    const existing = find.get(forPage, lookupFor) as { id: string; contentFound: string } | undefined;
    let previous: unknown[] = [];
    if (existing) {
      try { previous = JSON.parse(existing.contentFound); } catch {}
    }
    const merged = [...previous, ...findings].filter((item, index, all) => {
      const value = item as Record<string, unknown>;
      const key = value.url || `${value.page || value.from || ''}::${value.target || value.to || ''}::${value.anchor || value.anchortext || ''}`;
      return all.findIndex((candidate) => {
        const other = candidate as Record<string, unknown>;
        const otherKey = other.url || `${other.page || other.from || ''}::${other.target || other.to || ''}::${other.anchor || other.anchortext || ''}`;
        return otherKey === key;
      }) === index;
    });
    if (existing) update.run(JSON.stringify(merged), foundOn, existing.id);
    else insert.run(uuidv4(), forPage, lookupFor, null, JSON.stringify(merged), foundOn, 'not_checked');
  };
  const save = db.transaction(() => {
    upsert('/blog', 'blogLinkInBlog', brokenLinks.filter((entry) => entry.targetType === 'internal-blog'));
    upsert('/blog', 'tourLinkInBlog', brokenLinks.filter((entry) => entry.targetType === 'internal-tour'));
    upsert('/blog', 'externalLinkinBlog', brokenLinks.filter((entry) => entry.targetType === 'external'));
    upsert('/blog', 'imageinBlog', images);
  });
  save();

  return NextResponse.json({
    foundOn,
    brokenLinks: brokenLinks.length,
    brokenImages: images.length,
    total: brokenLinks.length + images.length,
  });
}
