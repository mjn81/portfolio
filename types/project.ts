// Removed: import { Tag } from './tag'; // Assuming you have a Tag type, adjust if necessary

export interface Project {
  id: string; // UUID
  title: string;
  description: string;
  image_url?: string | null; // URL for the project image
  image_alt_text?: string | null;
  tags: string[]; // Changed to string[]
  demo_link?: string | null;
  github_link?: string | null;
  author_id?: string; // Foreign key to users table (from JWT sub usually)
  status?: 'draft' | 'published' | 'archived';
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
  slug?: string;
  // Consider adding order or featured fields if needed for display
  sort_order?: number;
  featured?: boolean;
  // Any other fields specific to your projects, e.g., sort_order, featured, etc.
}

// For creating/updating projects, some fields might be optional or different
export type ProjectInput = Partial<Omit<Project, 'id' | 'created_at' | 'updated_at' | 'slug' | 'tags'>> & {
  title: string; // Make title non-optional for input
  description: string; // Make description non-optional for input
  tags?: string[]; // Changed to string[]
  image_url?: string | null;
  image_alt_text?: string | null;
  status?: 'draft' | 'published' | 'archived';
  demo_link?: string | null;
  github_link?: string | null;
  sort_order?: number;
  featured?: boolean;
  author_id?: string; // ensure author_id can be part of input if needed for creation
}; 