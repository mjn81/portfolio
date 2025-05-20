import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(200, 'Title too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(5000, 'Description too long'),
  image_url: z.string().url('Invalid URL for image').nullable().optional(),
  image_alt_text: z.string().max(200, 'Image alt text too long').nullable().optional(),
  tags: z.array(z.string().min(1, 'Tag cannot be empty').max(50, 'Tag too long'))
    .max(10, 'Maximum of 10 tags allowed')
    .optional(),
  demo_link: z.string().optional(),
  github_link: z.string().optional(),
  status: z.enum(['draft', 'published', 'archived']).default('draft').optional(),
  sort_order: z.number().int().optional(),
  featured: z.boolean().optional(),
});

export type ProjectSchemaType = z.infer<typeof projectSchema>;