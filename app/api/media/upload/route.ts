import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import sharp from 'sharp';
import { randomUUID } from 'crypto';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { FileType, MediaFile } from '@/types/file';

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
		const files = formData.getAll('files') as File[];

		if (!files || files.length === 0) {
			return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
		}

		const isPrivateField = formData.get('is_private');
		const isPrivateByDefault = isPrivateField === 'true';
		const defaultBucket = isPrivateByDefault
			? process.env.PRIVATE_MEDIA_BUCKET!
			: process.env.PUBLIC_MEDIA_BUCKET!;

		const mediaDataToInsert = [];
		const successfulUploadResults: MediaFile[] = [];

		for (const file of files) {
			const isPrivate = isPrivateByDefault;
			const bucket = defaultBucket;

			const fileExt = file.name.split('.').pop();
			const filePath = `${randomUUID()}.${fileExt}`;

			const arrayBuffer = await file.arrayBuffer();
			const buffer = Buffer.from(arrayBuffer);

			const mimeType = file.type;
			let type: FileType = 'document';
			if (mimeType.startsWith('image/')) type = 'image';
			else if (mimeType.startsWith('video/')) type = 'video';
			else if (mimeType.startsWith('audio/')) type = 'audio';

			let dimensions: string | null = null;
			if (type === 'image') {
				try {
					const metadata = await sharp(buffer).metadata();
					if (metadata.width && metadata.height) {
						dimensions = `${metadata.width}x${metadata.height}`;
					}
				} catch (err) {
					console.warn(
						`Unable to determine image dimensions for ${file.name}`,
						err
					);
				}
			}

			const { error: uploadError } = await supabase.storage
				.from(bucket)
				.upload(filePath, buffer, {
					contentType: mimeType,
					cacheControl: '3600',
					upsert: false,
				});

			if (uploadError) {
				console.error(
					`Storage upload error for ${file.name} to bucket ${bucket}:`,
					uploadError.message
				);
				continue;
			}

			let fileUrl: string | null = null;
			if (!isPrivate) {
				const { data: publicUrlData } = supabase.storage
					.from(bucket)
					.getPublicUrl(filePath);
				fileUrl = publicUrlData?.publicUrl ?? null;
			}

			mediaDataToInsert.push({
				name: file.name,
				type,
				url: fileUrl,
				size: file.size,
				dimensions,
				uploaded_at: new Date().toISOString(),
				used: 0,
				is_private: isPrivate,
				file_path: filePath,
			});
		}

		if (mediaDataToInsert.length > 0) {
			const { data: insertedBatch, error: insertError } = await supabase
				.from('media')
				.insert(mediaDataToInsert)
				.select('*');

			if (insertError || !insertedBatch) {
				console.error(
					`Batch insert error into media table:`,
					insertError?.message
				);
			}

			if (insertedBatch) {
				insertedBatch.forEach(inserted => {
					successfulUploadResults.push({
						id: inserted.id,
						name: inserted.name,
						type: inserted.type,
						url: inserted.url,
						size: inserted.size,
						dimensions: inserted.dimensions,
						uploaded_at: inserted.uploaded_at,
						used: inserted.used,
						is_private: inserted.is_private,
					});
				});
			}
		}

		return NextResponse.json(
			{
				message: `${successfulUploadResults.length} of ${files.length} files processed.`,
				files: successfulUploadResults,
			},
			{ status: successfulUploadResults.length > 0 ? 201 : 500 }
		);
	} catch (error) {
		console.error('General error during file upload process:', error);
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
