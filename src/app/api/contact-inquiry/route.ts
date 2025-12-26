
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { saveContactInquiry } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, subject, message, page } = body;

        if (!name || !email || !subject || !message || !page) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get temporary_id from middleware header
        const headersList = headers();
        const temporaryId = headersList.get('x-temp-account-id');
        
        if (!temporaryId) {
             return NextResponse.json({ error: 'User identifier not found' }, { status: 400 });
        }

        await saveContactInquiry({
            page,
            temporary_id: temporaryId,
            data: { name, email, subject, message }
        });

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error('Error in /api/contact-inquiry:', error);
        return NextResponse.json({ error: 'Failed to process inquiry' }, { status: 500 });
    }
}
