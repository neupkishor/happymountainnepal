
import { NextRequest, NextResponse } from 'next/server';
import { getPostById, savePost, deletePost } from '@/lib/db/sqlite';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const post = getPostById(id);
        if (!post) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }
        return NextResponse.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        return NextResponse.json({ error: 'Failed to fetch post' }, { status: 500 });
    }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await request.json();
        const existing = getPostById(id);

        if (!existing) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        const updatedPost = {
            ...existing,
            ...body,
            id, // Ensure ID matches URL
            // Ensure array fields are arrays if passed, else keep existing
            tags: body.tags !== undefined ? body.tags : existing.tags,
            searchKeywords: body.searchKeywords !== undefined ? body.searchKeywords : existing.searchKeywords,
        };

        savePost(updatedPost);

        return NextResponse.json({ success: true, id });
    } catch (error: any) {
        console.error('Error updating post:', error);
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return NextResponse.json({ error: 'Slug must be unique' }, { status: 409 });
        }
        return NextResponse.json({ error: 'Failed to update post' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const existing = getPostById(id);
        if (!existing) {
            return NextResponse.json({ error: 'Post not found' }, { status: 404 });
        }

        deletePost(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting post:', error);
        return NextResponse.json({ error: 'Failed to delete post' }, { status: 500 });
    }
}
