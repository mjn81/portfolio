import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import { postSchema } from '@/lib/validation/post-schema';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { generateSlug } from '@/lib/utils';

export async function POST(request: NextRequest) {
	try {
		const token = (await cookies()).get('token')?.value;

		if (!token) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		// Verify the JWT token
		let decoded: { sub: string; role: string };
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string; role: string };
		} catch (err) {
			return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
		}

		const body = await request.json();
		const parsed = postSchema.safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: parsed.error.format() },
				{ status: 400 }
			);
		}

		const { scheduledPublishTime, tags, content, image_alt_text, ...rest } = parsed.data;
		const now = new Date();
		let status = 'draft';
		let scheduled_publish_time = null;
		let published_at = null;
		const authorId = decoded.sub; // Extract author ID from token

		if (scheduledPublishTime) {
			const scheduledTime = new Date(scheduledPublishTime);
				if (status === 'published') {
					// If status is explicitly published, set publish date now
					published_at = now.toISOString();
				} else if (scheduledTime > now) {
					// Otherwise, schedule it if the time is in the future
					status = 'scheduled';
					scheduled_publish_time = scheduledTime.toISOString();
				} else {
					// If scheduled time is in the past but status wasn't explicitly published, treat as draft (or default to published? choosing draft for safety)
					// Or set to published now?
					// Let's default to published if a past date is provided for scheduling
					status = 'published'; 
					published_at = now.toISOString();
					// Alternatively, could return an error: 
					// return NextResponse.json({ error: 'Scheduled time must be in the future' }, { status: 400 });
				}
		} else if (parsed.data.status === 'published') {
			// Handle explicit 'published' status without a scheduled time
			status = 'published';
			published_at = now.toISOString();
		}
		// If status remains 'draft', published_at and scheduled_publish_time remain null

		const { data, error } = await supabase
			.from('posts')
			.insert([
				{
					...rest,
					content, // Include content
					author: authorId, // Include author ID
					image_alt_text: image_alt_text, // Include alt text
					status,
					scheduled_publish_time,
					published_at,
				},
			])
			.select()
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}
		// Handle tags
		const toBeCreatedTags =
			tags
				?.filter((tag) => !tag.id)
				.map((tag) => ({
					name: tag.name,
					slug: generateSlug(tag.name),
				})) || [];
		const existingTags = tags?.filter((tag) => tag.id) || [];

		// Insert new tags if any
		if (toBeCreatedTags.length > 0) {
			const { data: newTags, error: tagError } = await supabase
				.from('tags')
				.insert(toBeCreatedTags)
				.select();
			if (tagError) {
				return NextResponse.json({ error: tagError.message }, { status: 500 });
			}

			const newTagIds = newTags.map((tag) => tag.id);
			await supabase.from('post_tags').insert(
				newTagIds.map((tagId) => ({
					post_id: data.id,
					tag_id: tagId,
				}))
			);
		}

		return NextResponse.json(data, { status: 201 });
	} catch (err) {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);

	// Extract query parameters
	const page = parseInt(searchParams.get('page') || '1', 10);
	const limit = parseInt(searchParams.get('limit') || '10', 10);
	const status = searchParams.get('status');
	const author = searchParams.get('author');
	const query = searchParams.get('query');
	const sort = searchParams.get('sort') || 'date';
	const order = searchParams.get('order') || 'desc';
	const tag = searchParams.get('tag');

	// Calculate range for pagination
	const from = (page - 1) * limit;
	const to = from + limit - 1;

	let isAuthenticated = false;
	// Check for authorization token
	const token = (await cookies()).get('token')?.value;
	// Determine if the user is authenticated
	if (token) {
		try {
			jwt.verify(token, process.env.JWT_SECRET!);
			isAuthenticated = true;
		} catch (err) {
			return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
		}
	}	

	// Initialize Supabase query
	let supabaseQuery = supabase.from('posts').select(
		`
      *,
      post_tags (
        tags (
          name
        )
      )
      `,
		{ count: 'exact' }
	);

	// Apply filters
	if (!isAuthenticated) {
		// Restrict to published posts for unauthenticated users
		supabaseQuery = supabaseQuery.eq('status', 'published');
	} else {
		if (status) {
			supabaseQuery = supabaseQuery.eq('status', status);
		}
	}

	if (author) {
		supabaseQuery = supabaseQuery.eq('author', author);
	}

	if (query) {
		supabaseQuery = supabaseQuery.ilike('title', `%${query}%`);
	}

	if (tag) {
		// handle multiple tags
		const tags = tag.split(',');
		supabaseQuery = supabaseQuery.filter('post_tags.tags.slug', 'in', tags);
	}

	// Apply sorting
	supabaseQuery = supabaseQuery.order(sort, { ascending: order === 'asc' });

	// Apply pagination
	supabaseQuery = supabaseQuery.range(from, to);

	// Execute query
	const { data, error, count } = await supabaseQuery;

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	// Transform tags to a list of strings
	const transformedData = data.map((post: any) => {
		const tags =
			post.post_tags?.map((pt: any) => pt.tags?.name).filter(Boolean) || [];
		return {
			...post,
			tags,
		};
	});

	return NextResponse.json({
		data: transformedData,
		meta: {
			page,
			limit,
			total: count,
			totalPages: Math.ceil((count || 0) / limit),
			hasMore: page * limit < (count || 0),
		},
	});
}
