import { NextResponse } from 'next/server';
import { db } from '@/lib/db/sqlite';

export async function POST(request: Request) {
  const { recordId, url } = await request.json();
  if (!recordId || !url) return NextResponse.json({ error: 'recordId and url are required' }, { status: 400 });
  const row = db.prepare('select contentFound from ContentSearch where id = ?').get(recordId) as { contentFound: string } | undefined;
  if (!row) return NextResponse.json({ error: 'Scan record not found' }, { status: 404 });
  let contentFound: Array<Record<string, unknown>> = [];
  try { contentFound = JSON.parse(row.contentFound); } catch {}
  let statusCode: number | null = null; let statusText = 'Request failed';
  try {
    const target = url.startsWith('/') ? `https://happymountainnepal.com${url}` : url;
    let response = await fetch(target, { method: 'HEAD', signal: AbortSignal.timeout(10000) });
    if (response.status === 405 || response.status === 403) response = await fetch(target, { signal: AbortSignal.timeout(10000) });
    statusCode = response.status; statusText = response.statusText || 'OK';
  } catch (error) { statusText = error instanceof Error ? error.message : 'Request failed'; }
  const updated = contentFound.map((image) => image.url === url ? { ...image, statusCode, statusText } : image);
  const allChecked = updated.every((image) => image.statusCode !== null);
  db.prepare('update ContentSearch set contentFound = ?, foundOn = ?, status = ? where id = ?').run(JSON.stringify(updated), new Date().toISOString(), allChecked ? 'checked' : 'partially_checked', recordId);
  return NextResponse.json({ url, statusCode, statusText });
}
