import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const cursor = searchParams.get('cursor');
		const limit = parseInt(searchParams.get('limit') || '10', 10);

		let query = supabase
			.from('media')
			.select('*')
			.order('uploaded_at', { ascending: false })
			.limit(limit + 1);

		if (cursor) {
			query = query.lt('uploaded_at', cursor);
		}

		const { data: mediaRecords, error } = await query;

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		const now = new Date();
		const updatedMediaRecords = [];

		for (const record of mediaRecords) {
			if (record.is_private) {
				const updatedAt = new Date(record.updated_at);
				const diffInSeconds = Math.floor(
					(now.getTime() - updatedAt.getTime()) / 1000
				);

				if (diffInSeconds < 86400) {
					// Signed URL is still valid
					updatedMediaRecords.push(record);
				} else {
					// Signed URL expired, generate a new one
					const { data: signedUrlData, error: signedUrlError } =
						await supabase.storage
							.from(process.env.PRIVATE_MEDIA_BUCKET!)
							.createSignedUrl(record.file_path, 86400); // 24 hours

					if (signedUrlError) {
						console.error(
							`Error generating signed URL for ${record.file_path}:`,
							signedUrlError.message
						);
						continue;
					}


					// Update the media record with the new signed URL and updated_at
					const { error: updateError } = await supabase
						.from('media')
						.update({
							url: signedUrlData.signedUrl,
							updated_at: now.toISOString(),
						})
						.eq('id', record.id);

					if (updateError) {
						console.error(
							`Error updating media record ${record.id}:`,
							updateError.message
						);
						continue;
					}

					// Update the record in the local array
					record.url = signedUrlData.signedUrl;
					record.updated_at = now.toISOString();
					updatedMediaRecords.push(record);
				}
			} else {
				// Public file, use the stored URL
				updatedMediaRecords.push(record);
			}
		}

		// Determine the next cursor
		let nextCursorValue: string | null = null;
		if (updatedMediaRecords.length > limit) {
			// Get the (limit+1)th record to determine the cursor for the next page
			const lastRecordForCursor = updatedMediaRecords[limit];
			if (lastRecordForCursor && lastRecordForCursor.uploaded_at) {
				try {
					// Ensure the outgoing cursor value is a valid ISO string
					nextCursorValue = new Date(lastRecordForCursor.uploaded_at).toISOString();
				} catch (dateError) {
					console.error("Error formatting nextCursor from:", lastRecordForCursor.uploaded_at, dateError);
					// If formatting fails, don't send a cursor to avoid errors
					nextCursorValue = null;
				}
			}
		}

		return NextResponse.json(
			{
				// Slice the array *before* sending to only include 'limit' items
				media: updatedMediaRecords.slice(0, limit),
				nextCursor: nextCursorValue
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error retrieving media files:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}

export async function DELETE(request: NextRequest) {
	try {
		// Authenticate user
		const token = (await cookies()).get('token')?.value;
		if (!token) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
				role: string;
				sub: string;
			};
		} catch (err) {
			return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
		}


		// Check if user is an admin
		if (decoded.role.toLowerCase() !== 'admin') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Parse request body
		const body = await request.json();
		const { mediaIds } = body;

		if (!Array.isArray(mediaIds) || mediaIds.length === 0) {
			return NextResponse.json(
				{ error: 'mediaIds must be a non-empty array' },
				{ status: 400 }
			);
		}

		// Fetch media records matching the provided IDs
		const { data: mediaRecords, error: fetchError } = await supabase
			.from('media')
			.select('id, file_path, is_private')
			.in('id', mediaIds);

		if (fetchError) {
			return NextResponse.json({ error: fetchError.message }, { status: 500 });
		}

		if (!mediaRecords || mediaRecords.length === 0) {
			return NextResponse.json(
				{ error: 'No media found for the provided IDs' },
				{ status: 404 }
			);
		}

		// Group file paths by bucket
		const filesToDelete: Record<string, string[]> = {};

		for (const record of mediaRecords) {
			const bucket = record.is_private
				? process.env.PRIVATE_MEDIA_BUCKET!
				: process.env.PUBLIC_MEDIA_BUCKET!;

			if (!filesToDelete[bucket]) {
				filesToDelete[bucket] = [];
			}
			filesToDelete[bucket].push(record.file_path);
		}

		// Delete files from their respective buckets
		for (const [bucket, paths] of Object.entries(filesToDelete)) {
			const { error: deleteError } = await supabase.storage
				.from(bucket)
				.remove(paths);

			if (deleteError) {
				console.error(
					`Error deleting files from bucket ${bucket}:`,
					deleteError.message
				);
				return NextResponse.json(
					{ error: `Error deleting files from bucket ${bucket}` },
					{ status: 500 }
				);
			}
		}

		// Delete records from 'media' table
		const { error: deleteRecordError } = await supabase
			.from('media')
			.delete()
			.in('id', mediaIds);

		if (deleteRecordError) {
			return NextResponse.json(
				{ error: 'Error deleting media records' },
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{ message: 'Media files deleted successfully' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error deleting media files:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
