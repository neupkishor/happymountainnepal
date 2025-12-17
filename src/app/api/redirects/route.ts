
import { NextResponse } from 'next/server';
import { readBaseFile, writeBaseFile } from '@/lib/base';

export async function GET() {
    try {
        const redirects = await readBaseFile('redirects.json');
        return NextResponse.json(redirects);
    } catch (error) {
        console.error('Error reading redirects:', error);
        return NextResponse.json([]);
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { action, data, id } = body;

        let redirects: any[] = [];
        try {
            redirects = await readBaseFile('redirects.json');
        } catch (e) {
            // File might not exist yet, which is fine for the first add.
            if ((e as NodeJS.ErrnoException).code !== 'ENOENT') {
                throw e;
            }
        }
        
        if (!Array.isArray(redirects)) {
            redirects = [];
        }

        if (action === 'add') {
            const newRedirect = {
                ...data,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
            };
            redirects.push(newRedirect);
            await writeBaseFile('redirects.json', redirects);
            return NextResponse.json({ success: true, id: newRedirect.id });
        } else if (action === 'delete') {
            redirects = redirects.filter((r: any) => r.id !== id);
            await writeBaseFile('redirects.json', redirects);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error updating redirects:', error);
        return NextResponse.json({ success: false, error: 'Failed to update redirects' }, { status: 500 });
    }
}
