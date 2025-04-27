import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

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
		if (decoded.role !== 'admin') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}

		// Parse request body
		const body = await request.json();
		const { mediaId } = body;

		if (!mediaId) {
			return NextResponse.json(
				{ error: 'mediaId is required' },
				{ status: 400 }
			);
		}

		// Fetch media record
		const { data: mediaData, error: fetchError } = await supabase
			.from('media')
			.select('*')
			.eq('id', mediaId)
			.single();

		if (fetchError || !mediaData) {
			return NextResponse.json({ error: 'Media not found' }, { status: 404 });
		}

		const bucket = mediaData.is_private
			? process.env.PRIVATE_MEDIA_BUCKET!
			: process.env.PUBLIC_MEDIA_BUCKET!;
		const filePath = mediaData.file_path;

		// Delete file from Supabase Storage
		const { error: deleteError } = await supabase.storage
			.from(bucket)
			.remove([filePath]);

		if (deleteError) {
			return NextResponse.json(
				{ error: 'Error deleting file from storage' },
				{ status: 500 }
			);
		}

		// Delete record from 'media' table
		const { error: deleteRecordError } = await supabase
			.from('media')
			.delete()
			.eq('id', mediaId);

		if (deleteRecordError) {
			return NextResponse.json(
				{ error: 'Error deleting media record' },
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{ message: 'Media deleted successfully' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error deleting media:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
