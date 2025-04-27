
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const token = (await cookies()).get('token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
      jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

		const formData = await request.formData();
		const file = formData.get('file') as File;

		if (!file) {
			return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
		}

		const isPrivateField = formData.get('is_private');
		const isPrivate = isPrivateField === 'true';
		const bucket = isPrivate ? process.env.PRIVATE_MEDIA_BUCKET! : process.env.PUBLIC_MEDIA_BUCKET!;

		const fileExt = file.name.split('.').pop();
		const filePath = `${randomUUID()}.${fileExt}`;

		// Convert the file to a Buffer
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		// Determine the file type
		const mimeType = file.type;
		let type: 'image' | 'document' | 'video' | 'audio' = 'document';
    switch (true) {
      case mimeType.startsWith('image/'):
        type = 'image';
        break;
      case mimeType.startsWith('video/'):
        type = 'video';
        break;
      case mimeType.startsWith('audio/'):
        type = 'audio';
        break;
    }


		// Extract image dimensions if the file is an image
		let dimensions: string | null = null;
		if (type === 'image') {
			try {
        const metadata = await sharp(buffer).metadata();
        if (metadata.width && metadata.height) {
          dimensions = `${metadata.width}x${metadata.height}`;
        }	
			} catch (err) {
				console.warn('Unable to determine image dimensions:', err);
			}
		}

		// Upload the file to Supabase Storage
		const { error: uploadError } = await supabase.storage
			.from(bucket)
			.upload(filePath, buffer, {
				cacheControl: '3600',
				upsert: false,
			});

		if (uploadError) {
			return NextResponse.json({ error: uploadError.message }, { status: 500 });
		}

		// Get the public URL if the file is in the public bucket
		let fileUrl: string | null = null;
    if (!isPrivate) {
      const { data: publicUrlData } = supabase.storage
        .from(bucket)
        .getPublicUrl(filePath);

      fileUrl = publicUrlData.publicUrl;
    }

		// Insert a record into the 'media' table
		const { error: insertError } = await supabase.from('media').insert([
			{
				name: file.name,
				type: type,
				url: fileUrl,
				size: file.size,
				dimensions: dimensions,
				uploaded_at: new Date().toISOString(),
				used: 0,
        is_private: isPrivate,
        file_path: filePath,
			},
		]);

		if (insertError) {
			return NextResponse.json({ error: insertError.message }, { status: 500 });
		}

		return NextResponse.json(
			{
				message: 'File uploaded successfully',
				fileUrl: fileUrl,
				isPrivate: isPrivate,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error uploading file:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
