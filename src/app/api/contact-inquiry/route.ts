
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { saveContactInquiry } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        console.log('[API /contact-inquiry] Received POST request.');
        const body = await request.json();
        console.log('[API /contact-inquiry] Parsed request body:', JSON.stringify(body, null, 2));

        const { name, email, subject, message, page } = body;

        if (!name || !email || !subject || !message || !page) {
            console.error('[API /contact-inquiry] Validation failed: Missing required fields.');
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get temporary_id from middleware header
        const headersList = headers();
        const temporaryId = headersList.get('x-temp-account-id');
        console.log(`[API /contact-inquiry] Retrieved temporaryId from headers: ${temporaryId}`);
        
        if (!temporaryId) {
             console.error('[API /contact-inquiry] Validation failed: User identifier not found in headers.');
             return NextResponse.json({ error: 'User identifier not found' }, { status: 400 });
        }

        const inquiryPayload = {
            page,
            temporary_id: temporaryId,
            data: { name, email, subject, message }
        };

        console.log('[API /contact-inquiry] Calling saveContactInquiry with payload:', JSON.stringify(inquiryPayload, null, 2));
        await saveContactInquiry(inquiryPayload);
        console.log('[API /contact-inquiry] saveContactInquiry completed successfully.');

        return NextResponse.json({ success: true }, { status: 200 });

    } catch (error) {
        console.error('Error in /api/contact-inquiry:', error);
        return NextResponse.json({ error: 'Failed to process inquiry' }, { status: 500 });
    }
}
