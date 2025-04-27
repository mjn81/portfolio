// lib/validation/postSchema.ts
import { z } from 'zod';

export const postSchema = z.object({
	title: z.string().min(1, 'Title is required'),
	excerpt: z.string().optional(),
	image: z.string().url().optional(),
	slug: z.string().min(1, 'Slug is required'),
	read_time: z.string().optional(),
	status: z.enum(['draft', 'published', 'scheduled']),
	meta_title: z.string().optional(),
	meta_description: z.string().optional(),
	og_title: z.string().optional(),
	og_description: z.string().optional(),
	seo_keywords: z.string().optional(),
	seo_canonical_url: z.string().url().optional(),
	og_image_url: z.string().url().optional(),
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
