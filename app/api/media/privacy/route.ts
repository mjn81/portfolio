import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { TokenDto } from '@/types/user';

export async function POST(request: NextRequest) {
	try {
		// Authenticate user
		const token = (await cookies()).get('token')?.value;

		// Parse request body
		const body = await request.json();
		const { mediaId } = body;
    
    // Check if the user is authenticated and has the right role
		if (!token) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenDto;
		} catch (err) {
			return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
		}
		if (body.is_private === 'true' && decoded.role !== 'admin') {
			return NextResponse.json(
				{ error: 'Only admins can make media private' },
				{ status: 403 }
			);
		}

    // Validate mediaId
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

		const currentBucket = mediaData.is_private
			? process.env.PRIVATE_MEDIA_BUCKET!
			: process.env.PUBLIC_MEDIA_BUCKET!;
		const targetBucket = mediaData.is_private
			? process.env.PUBLIC_MEDIA_BUCKET!
			: process.env.PRIVATE_MEDIA_BUCKET!;
		const filePath = mediaData.file_path;

		// Copy file to target bucket
		const { error: moveError } = await supabase.storage
			.from(currentBucket)
			.move(filePath, filePath, { destinationBucket: targetBucket });

		if (moveError) {
			return NextResponse.json(
				{ error: 'Error deleting original file' },
				{ status: 500 }
			);
		}

		// Generate new URL
		let newUrl: string | null = null;
		if (targetBucket === process.env.PUBLIC_MEDIA_BUCKET!) {
			const { data: publicUrlData } = supabase.storage
				.from(targetBucket)
				.getPublicUrl(filePath);
			newUrl = publicUrlData.publicUrl;
		}

		// Update media record
		const { error: updateError } = await supabase
			.from('media')
			.update({
				is_private: !mediaData.is_private,
				url: newUrl,
			})
			.eq('id', mediaId);

		if (updateError) {
			return NextResponse.json(
				{ error: 'Error updating media record' },
				{ status: 500 }
			);
		}

		return NextResponse.json(
			{ message: 'Media privacy toggled successfully' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Error toggling media privacy:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
