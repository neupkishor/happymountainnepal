import { NextRequest, NextResponse } from 'next/server';
import { getTourById } from '@/lib/db/tours';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const tour = await getTourById(id);

        if (!tour) {
            return NextResponse.json(
                { error: 'Package not found' },
                { status: 404 }
            );
        }

        return NextResponse.json(tour);
    } catch (error) {
        console.error('Error fetching tour:', error);
        return NextResponse.json(
            { error: 'Failed to fetch package' },
            { status: 500 }
        );
    }
}
