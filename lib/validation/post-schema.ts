// lib/validation/postSchema.ts
import { z } from 'zod';

export const postSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	excerpt: z.string().optional(),
	image: z.string().url().optional(),
	slug: z.string().min(1, 'Slug is required'),
	read_time: z.string().optional(),
	status: z.enum(['draft', 'published', 'scheduled']),
	metatitle: z.string().optional(),
	metadescription: z.string().optional(),
	ogtitle: z.string().optional(),
	ogdescription: z.string().optional(),
	seokeywords: z.string().optional(),
	seocanonicalurl: z.string().url().optional(),
	ogimageurl: z.string().url().optional(),
	author: z.string().uuid().optional(),
	scheduledPublishTime: z
		.string().optional(),
	tags: z
		.array(z.object({
			id: z.string().uuid().optional(),
			name: z.string(),
		}))
		.optional(),
});
