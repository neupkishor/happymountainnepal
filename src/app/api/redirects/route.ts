import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const REDIRECTS_FILE_PATH = path.join(process.cwd(), 'src', 'redirects.json');

export async function GET() {
    try {
        const fileContent = await fs.readFile(REDIRECTS_FILE_PATH, 'utf-8');
        const redirects = JSON.parse(fileContent);
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

        const fileContent = await fs.readFile(REDIRECTS_FILE_PATH, 'utf-8');
        let redirects = JSON.parse(fileContent);

        if (action === 'add') {
            const newRedirect = {
                ...data,
                id: Date.now().toString(),
                createdAt: new Date().toISOString(),
            };
            redirects.push(newRedirect);
            await fs.writeFile(REDIRECTS_FILE_PATH, JSON.stringify(redirects, null, 2), 'utf-8');
            return NextResponse.json({ success: true, id: newRedirect.id });
        } else if (action === 'delete') {
            redirects = redirects.filter((r: any) => r.id !== id);
            await fs.writeFile(REDIRECTS_FILE_PATH, JSON.stringify(redirects, null, 2), 'utf-8');
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error) {
        console.error('Error updating redirects:', error);
        return NextResponse.json({ success: false, error: 'Failed to update redirects' }, { status: 500 });
    }
}
