import { NextRequest, NextResponse } from 'next/server';
import { getPackagesPaginated } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '10');

        const result = await getPackagesPaginated({ page, limit });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching packages:', error);
        return NextResponse.json(
            { error: 'Failed to fetch packages' },
            { status: 500 }
        );
    }
}
