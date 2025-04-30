import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(
    request: NextRequest,
    { params }: { params: { slug: string } }
) {
    if (!params.slug) {
        return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
    }

    const { data, error } = await supabase
        .from('posts')
        .select(`
            *,
            author:users (*),
            post_tags (
                tags (
                    id,
                    name,
                    slug
                )
            )
        `)
        .eq('slug', params.slug)
        .maybeSingle(); // Use maybeSingle to handle null if not found gracefully

    if (error) {
        console.error('Error fetching post by slug:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }

    // Handle post not found
    if (!data) {
        return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    // Transform tags data
    const transformedData = {
        ...data,
        tags: data.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || []
    };
    delete transformedData.post_tags;

    // --- Authorization check for draft posts ---
    let isAuthenticated = false;
    const token = (await cookies()).get('token')?.value;
    if (token) {
        try {
            jwt.verify(token, process.env.JWT_SECRET!);
            isAuthenticated = true;
        } catch (err) {
            // Invalid token, but proceed; access check happens next
        }
    }

    if (transformedData.status !== 'published' && !isAuthenticated) {
         // If post is not published AND user is not authenticated, deny access
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    // Allow access if post is published OR if user is authenticated (can view drafts/scheduled)

    return NextResponse.json(transformedData, { status: 200 });
} 