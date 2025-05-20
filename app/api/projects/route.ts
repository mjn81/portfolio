import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import { projectSchema } from '@/lib/validation/project-schema';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { generateSlug } from '@/lib/utils';

async function verifyTokenAndGetUserId(): Promise<{ sub: string; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string; role: string };
    return decoded;
  } catch (err) {
    return null;
  }
}

// Helper function to convert DB tags string to array
function convertDbTagsToArray(dbTags: any): string[] {
  if (typeof dbTags === 'string') {
    if (dbTags.trim() === '') return [];
    return dbTags.split(',').map(tag => tag.trim()).filter(tag => tag);
  }
  // If it's already an array (e.g. old data or inconsistent state), return it as is or an empty array
  if (Array.isArray(dbTags)) return dbTags.map(String); 
  return []; // Default to empty array for null, undefined, or other types
}

export async function POST(request: NextRequest) {
  const authorInfo = await verifyTokenAndGetUserId();
  if (!authorInfo || authorInfo.role.toLowerCase() !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const parsed = projectSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.format() }, { status: 400 });
    }

    const { title, tags, ...projectDataFields } = parsed.data;
    const slug = generateSlug(title);

    const processedTagsArray = Array.isArray(tags) ? tags : [];
    const tagsString = processedTagsArray.map(t => t.trim()).filter(t => t).join(',');

    const { data: newProject, error: projectError } = await supabase
      .from('projects')
      .insert([{ ...projectDataFields, title, slug, tags: tagsString, author_id: authorInfo.sub }])
      .select()
      .single();

    if (projectError) {
      console.error('Supabase error creating project:', projectError);
      if (projectError.code === '23505') {
        return NextResponse.json({ error: `Project with this title/slug already exists. Supabase: ${projectError.message}` }, { status: 409 });
      }
      return NextResponse.json({ error: `Failed to create project: ${projectError.message}` }, { status: 500 });
    }

    // Convert tags back to array for the response, consistent with Project type
    const responseProject = {
      ...newProject,
      tags: convertDbTagsToArray(newProject.tags),
    };

    return NextResponse.json(responseProject, { status: 201 });
  } catch (err: any) {
    console.error('Error in POST /api/projects:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const queryParam = searchParams.get('query');
  const sortParam = searchParams.get('sort') || 'created_at';
  const orderParam = searchParams.get('order') || 'desc';

  if (searchParams.get('count') === 'true') {
    try {
      const { count, error } = await supabase
        .from('projects')
        .select('', { count: 'exact', head: true });
      if (error) throw error;
      return NextResponse.json({ count });
    } catch (err: any) {
      console.error('Error in GET /api/projects (count):', err);
      return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
    }
  }
  
  const userId = await verifyTokenAndGetUserId();

  try {
    let queryBuilder = supabase
      .from('projects')
      .select('*')
      .order(sortParam, { ascending: orderParam === 'asc', nullsFirst: false });

    if (!userId) {
      queryBuilder = queryBuilder.eq('status', 'published');
    }

    if (queryParam) {
      queryBuilder = queryBuilder.ilike('title', `%${queryParam}%`);
    }

    const { data: projects, error } = await queryBuilder;

    if (error) {
      console.error('Supabase error fetching projects:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const projectsWithArrayTags = projects 
      ? projects.map(p => ({ ...p, tags: convertDbTagsToArray(p.tags) })) 
      : [];

    return NextResponse.json(projectsWithArrayTags);
  } catch (err: any) {
    console.error('Error in GET /api/projects:', err);
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
} 