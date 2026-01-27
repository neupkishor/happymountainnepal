
import { NextRequest, NextResponse } from 'next/server';
import { getLocations, saveLocation } from '@/lib/db/sqlite';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const featured = searchParams.get('featured') === 'true';

        const locations = getLocations({ featured });
        return NextResponse.json(locations);
    } catch (error) {
        console.error('Error fetching locations:', error);
        return NextResponse.json({ error: 'Failed to fetch locations' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, slug, description, image, isFeatured, parentId } = body;

        if (!name || !slug) {
            return NextResponse.json({ error: 'Name and Slug are required' }, { status: 400 });
        }

        const id = uuidv4();
        const newLocation = {
            id,
            name,
            slug,
            description: description || '',
            image: image || '',
            isFeatured: isFeatured ? 1 : 0,
            parentId: parentId || null,
        };

        saveLocation(newLocation);

        return NextResponse.json({ success: true, id }, { status: 201 });
    } catch (error) {
        console.error('Error creating location:', error);
        return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
    }
}
