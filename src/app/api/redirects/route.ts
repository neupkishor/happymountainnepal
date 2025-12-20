
'use server';

import { NextResponse } from 'next/server';

const API_URL = 'https://neupgroup.com/site/bridge/api/v1/redirects';
const API_KEY = process.env.NEUP_API_KEY;

// GET - Fetch all redirects from the external API
export async function GET() {
    if (!API_KEY) {
        return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
    }
    try {
        const response = await fetch(API_URL, {
            headers: { 'x-api-key': API_KEY },
            next: { revalidate: 60 } // Cache for 60 seconds
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch redirects: ${response.statusText}`);
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error: any) {
        console.error('Error fetching redirects from external API:', error);
        return NextResponse.json({ error: 'Failed to fetch redirects' }, { status: 500 });
    }
}

// POST - Add or delete a redirect via the external API
export async function POST(request: Request) {
    if (!API_KEY) {
        return NextResponse.json({ error: 'API key is not configured' }, { status: 500 });
    }
    
    try {
        const body = await request.json();
        const { action, data, id } = body;

        if (action === 'add') {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY,
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) throw new Error('Failed to add redirect');
            const result = await response.json();
            return NextResponse.json({ success: true, id: result.id });

        } else if (action === 'delete') {
            if (!id) return NextResponse.json({ success: false, error: 'ID is required for deletion' }, { status: 400 });
            
            const response = await fetch(`${API_URL}?id=${id}`, {
                method: 'DELETE',
                headers: { 'x-api-key': API_KEY },
            });
            if (!response.ok) throw new Error('Failed to delete redirect');
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    } catch (error: any) {
        console.error('Error updating redirects via external API:', error);
        return NextResponse.json({ success: false, error: 'Failed to update redirects' }, { status: 500 });
    }
}
