import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import { z } from 'zod';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
const getContactsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.string().default('created_at'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
  // Add any other filterable fields here if needed, e.g., status (read/unread)
});

async function verifyTokenAndGetUserId(): Promise<{
	sub: string;
	role: string;
} | null> {
	const cookieStore = await cookies();
	const token = cookieStore.get('token')?.value;
	if (!token) return null;
	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			sub: string;
			role: string;
		};
		return decoded;
	} catch (err) {
		return null;
	}
}

export async function GET(request: NextRequest) {
  try {
    const authorInfo = await verifyTokenAndGetUserId();
    if (!authorInfo || authorInfo.role.toLowerCase() !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const { searchParams } = new URL(request.url);
    const queryParams = Object.fromEntries(searchParams.entries());

    const validation = getContactsQuerySchema.safeParse(queryParams);

    if (!validation.success) {
      return NextResponse.json({ error: 'Invalid query parameters', details: validation.error.format() }, { status: 400 });
    }

    const { page, limit, sortBy, sortOrder, search } = validation.data;

    const offset = (page - 1) * limit;

    let query = supabase
      .from('contact_me')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`sender_name.ilike.%${search}%,sender_email.ilike.%${search}%,subject.ilike.%${search}%,message.ilike.%${search}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase GET contacts error:', error);
      return NextResponse.json({ error: 'Failed to fetch contacts', details: error.message }, { status: 500 });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      data,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasMore: page < totalPages,
      },
    });

  } catch (err) {
    console.error('API GET contacts error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
} 