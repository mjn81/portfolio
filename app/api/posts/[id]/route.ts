import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import { postSchema } from '@/lib/validation/post-schema';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { TokenDto } from '@/types/user';
import { generateSlug } from '@/lib/utils';

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { data, error } = await supabase
		.from('posts')
		.select(`
            *,
            post_tags (
                tags (
                    id,
                    name,
                    slug
                )
            )
        `)
		.eq('id', params.id)
		.single();

	if (error) {
		if (error.code === 'PGRST116') {
			return NextResponse.json({ error: 'Post not found' }, { status: 404 });
		}
		console.error('Error fetching post:', error);
		return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
	}

	const transformedData = {
		...data,
		tags: data.post_tags?.map((pt: any) => pt.tags).filter(Boolean) || []
	};
	delete transformedData.post_tags;

	const token = (await cookies()).get('token')?.value;
	if (transformedData.status === 'draft') {
		if (!token) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		try {
			jwt.verify(token, process.env.JWT_SECRET!);
		} catch (err) {
			return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
		}
	}

	return NextResponse.json(transformedData, { status: 200 });
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		const token = (await cookies()).get('token')?.value;
		if (!token) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		let decoded: TokenDto;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenDto;
		} catch (err) {
			return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
		}

		const body = await request.json();
		const parsed = postSchema.partial().safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: parsed.error.format() },
				{ status: 400 }
			);
		}

		const { tags, ...postUpdateDataFromSchema } = parsed.data;

		// Prepare the final update object for the database (using snake_case)
		const postUpdateData: { [key: string]: any } = { ...postUpdateDataFromSchema };

		// Map scheduledPublishTime from schema (camelCase) to database column (snake_case)
		// Important: Only include if it was actually in the parsed data
		if (postUpdateDataFromSchema.hasOwnProperty('scheduledPublishTime')) {
			postUpdateData.scheduled_publish_time = postUpdateDataFromSchema.scheduledPublishTime;
			// Remove the camelCase version if you want to be strict, though Supabase might ignore it
			// delete postUpdateData.scheduledPublishTime;
		}

		// --- Add/Clear published_at based on status ---
		if (postUpdateData.status === 'published') {
			postUpdateData.published_at = new Date().toISOString(); // Use snake_case
			postUpdateData.scheduled_publish_time = null; // Use snake_case & ensure it's null
		} else if (postUpdateData.status === 'draft') {
			 // Optional: Clear published_at if moving back to draft?
			 // postUpdateData.published_at = null;
		} else if (postUpdateData.status === 'scheduled' && postUpdateData.scheduled_publish_time !== undefined) {
			 // If moving to scheduled (and time is provided), clear published_at
			 postUpdateData.published_at = null; // Use snake_case
		}

		// --- Update Post Table ---
		// Remove fields not directly in the 'posts' table before update
		// (e.g., remove scheduledPublishTime if you didn't delete it earlier)
		delete postUpdateData.scheduledPublishTime; 

		const { data: updatedPost, error: updateError } = await supabase
			.from('posts')
			.update(postUpdateData) // Use the processed update data
			.eq('id', params.id)
			.select('id')
			.single();

		if (updateError) {
			if (updateError.code === 'PGRST116') {
				return NextResponse.json({ error: 'Post not found' }, { status: 404 });
			}
			console.error("Error updating post:", updateError);
			return NextResponse.json({ error: updateError.message }, { status: 500 });
		}

		const postId = updatedPost.id;

		if (tags) {
			const { error: deleteTagsError } = await supabase
				.from('post_tags')
				.delete()
				.eq('post_id', postId);

			if (deleteTagsError) {
				console.error("Error deleting old tags:", deleteTagsError);
			}

			const tagsToCreate = tags.filter(tag => !tag.id);
			const existingTagIds = tags.filter(tag => tag.id).map(tag => tag.id as string);
			let newTagIds: string[] = [];

			if (tagsToCreate.length > 0) {
				const newTagsData = tagsToCreate.map(tag => ({
					name: tag.name,
					slug: generateSlug(tag.name)
				}));
				const { data: createdTags, error: createTagsError } = await supabase
					.from('tags')
					.insert(newTagsData)
					.select('id');

				if (createTagsError) {
					console.error("Error creating new tags:", createTagsError);
				} else {
					newTagIds = createdTags?.map(tag => tag.id) || [];
				}
			}

			const allTagIds = [...existingTagIds, ...newTagIds];

			if (allTagIds.length > 0) {
				const postTagsData = allTagIds.map(tagId => ({ post_id: postId, tag_id: tagId }));
				const { error: insertTagsError } = await supabase
					.from('post_tags')
					.insert(postTagsData);

				if (insertTagsError) {
					console.error("Error inserting new tags:", insertTagsError);
				}
			}
		} else {
			const { error: deleteTagsError } = await supabase
				.from('post_tags')
				.delete()
				.eq('post_id', postId);
			if (deleteTagsError) {
				console.error("Error deleting tags when empty array provided:", deleteTagsError);
			}
		}

		return NextResponse.json({ id: postId, message: 'Post updated successfully' }, { status: 200 });
	} catch (err: any) {
		console.error("Unexpected error in PUT /api/posts/[id]:", err);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const token = (await cookies()).get('token')?.value;
	if (!token) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	let decoded;
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenDto;
	} catch (err) {
		return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
	}

	// 1. Fetch the post to check the author
	const { data: postData, error: fetchError } = await supabase
		.from('posts')
		.select('author')
		.eq('id', params.id)
		.single();

	if (fetchError) {
		// Handle case where post doesn't exist or other DB error
		if (fetchError.code === 'PGRST116') { // Post not found
			return NextResponse.json({ error: 'Post not found' }, { status: 404 });
		}
		return NextResponse.json({ error: fetchError.message }, { status: 500 });
	}

	// 2. Perform Authorization Check
	const allowedRoles = ['admin', 'moderator'];
	const isAllowedRole = allowedRoles.includes(decoded.role.toLowerCase());
	const isAuthor = postData?.author === decoded.sub;

	if (!isAllowedRole && !isAuthor) {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	}

	// 3. Proceed with deletion
	const { error: deleteError } = await supabase.from('posts').delete().eq('id', params.id);

	if (deleteError) {
		return NextResponse.json({ error: deleteError.message }, { status: 500 });
	}

	return NextResponse.json(
		{ message: 'Post deleted successfully' },
		{ status: 200 }
	);
}
