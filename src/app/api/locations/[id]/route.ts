
import { NextRequest, NextResponse } from 'next/server';
import { getLocationById, saveLocation, deleteLocation } from '@/lib/db/sqlite';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const location = getLocationById(params.id);
        if (!location) {
            return NextResponse.json({ error: 'Location not found' }, { status: 404 });
        }
        return NextResponse.json(location);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch location' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        const body = await request.json();
        const { name, slug, description, image, isFeatured, parentId } = body;

        // Check if exists
        const existing = getLocationById(params.id);
        if (!existing) {
            return NextResponse.json({ error: 'Location not found' }, { status: 404 });
        }

        // Prevent circular dependency (basic check: parent cannot be self)
        if (parentId === params.id) {
            return NextResponse.json({ error: 'Location cannot be its own parent' }, { status: 400 });
        }

        const updatedLocation = {
            id: params.id, // Ensure ID comes from params
            name: name || existing.name,
            slug: slug || existing.slug,
            description: description !== undefined ? description : existing.description,
            image: image !== undefined ? image : existing.image,
            isFeatured: isFeatured !== undefined ? (isFeatured ? 1 : 0) : (existing.isFeatured ? 1 : 0),
            parentId: parentId !== undefined ? parentId : existing.parentId,
            createdAt: existing.createdAt
        };

        saveLocation(updatedLocation);

        return NextResponse.json({ success: true, id: params.id });

    } catch (error) {
        console.error('Error updating location:', error);
        return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
    try {
        deleteLocation(params.id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
    }
}
