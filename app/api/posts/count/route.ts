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
        // Verify token - Ensure only authenticated users (adjust role if needed) can get count
        jwt.verify(token, process.env.JWT_SECRET!) as TokenDto;
    } catch (err) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    try {
        const { count, error } = await supabase
            .from('posts')
            .select('*', { count: 'exact', head: true }); // Use head: true for count only

        if (error) {
            console.error("Error fetching post count:", error);
            return NextResponse.json({ error: 'Failed to fetch post count' }, { status: 500 });
        }

        return NextResponse.json({ count: count ?? 0 }, { status: 200 });

    } catch (err) {
        console.error("API Post Count Error:", err);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
} 