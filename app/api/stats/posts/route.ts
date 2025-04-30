import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { TokenDto } from '@/types/user';

export async function GET(request: NextRequest) {
    const token = (await cookies()).get('token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        // Verify token - Ensure only authenticated users can get stats
        jwt.verify(token, process.env.JWT_SECRET!) as TokenDto;
    } catch (err) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    try {
        // Use a single query with conditional aggregation for better performance via RPC
        // Assumes a function like this exists:
        // CREATE OR REPLACE FUNCTION get_post_status_counts()
        // RETURNS TABLE(total bigint, published bigint, draft bigint, scheduled bigint) AS $$
        // BEGIN
        //   RETURN QUERY
        //   SELECT
        //     count(*) AS total,
        //     count(*) FILTER (WHERE status = 'published') AS published,
        //     count(*) FILTER (WHERE status = 'draft') AS draft,
        //     count(*) FILTER (WHERE status = 'scheduled') AS scheduled
        //   FROM public.posts;
        // END;
        // $$ LANGUAGE plpgsql STABLE;
        const { data, error } = await supabase.rpc('get_post_status_counts');

        if (error) {
             console.error("Error fetching post stats via RPC:", error);
             // If the error indicates the function doesn't exist, we might want to log that specifically
             if (error.code === '42883') { // PostgreSQL error code for undefined function
                 console.error("RPC function 'get_post_status_counts' not found. Please create it in your Supabase SQL editor.");
                 return NextResponse.json({ error: "Database function 'get_post_status_counts' not found." }, { status: 500 });
             }
             return NextResponse.json({ error: `Failed to fetch post stats: ${error.message}` }, { status: 500 });
        }

        // The RPC function returns an array with one object like [{ total: x, published: y, draft: z, scheduled: w }]
        if (!data || data.length === 0) {
             console.warn("RPC function 'get_post_status_counts' returned no data. Returning zero counts.");
             // Fallback to zero counts if RPC returns unexpected results
             return NextResponse.json({
                total: 0,
                published: 0,
                draft: 0,
                scheduled: 0
             }, { status: 200 });
        }

        const stats = data[0]; // Get the first object from the results array

        return NextResponse.json({
            total: stats?.total ?? 0,
            published: stats?.published ?? 0,
            draft: stats?.draft ?? 0,
            scheduled: stats?.scheduled ?? 0
         }, { status: 200 });

    } catch (err) {
        console.error("API Post Stats Error:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 