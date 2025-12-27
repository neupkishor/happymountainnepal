
import { NextRequest, NextResponse } from 'next/server';
import { getBlogPosts } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const limit = parseInt(searchParams.get('limit') || '10', 10);
        const page = parseInt(searchParams.get('page') || '1', 10);
        const search = searchParams.get('search') || '';

        const result = await getBlogPosts({ limit, page, search });

        return NextResponse.json(result);
    } catch (error) {
        console.error('Error fetching blog posts:', error);
        return NextResponse.json(
            { error: 'Failed to fetch blog posts' },
            { status: 500 }
        );
    }
}
