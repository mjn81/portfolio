export interface Tag {
	id: string; // Assuming UUID
	name: string;
	slug: string;
	created_at?: string; // Optional timestamp
	updated_at?: string; // Optional timestamp
}