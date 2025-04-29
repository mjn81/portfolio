import type { Tag } from './tag';

export interface Post {
	id: string; // uuid
	title: string;
	excerpt?: string | null;
	date?: string | null; // Consider naming consistency (e.g., created_at)
	image?: string | null; // URL
	image_alt_text?: string | null;
	slug: string;
	content?: string; // Likely needed but not in original db schema provided
	read_time?: string | null;
	status: 'draft' | 'published' | 'scheduled';
	meta_title?: string | null;
	meta_description?: string | null;
	og_title?: string | null;
	og_description?: string | null;
	seo_keywords?: string | null;
	seo_canonical_url?: string | null; // URL
	og_image_url?: string | null; // URL
	author: string; // uuid of the author (user)
	scheduled_publish_time?: string | null; // ISO Timestamp
	published_at?: string | null; // ISO Timestamp
	created_at?: string; // ISO Timestamp
	updated_at?: string; // ISO Timestamp
	tags?: Tag[] | string[]; // API might return full Tag objects or just names/ids depending on fetch
} 