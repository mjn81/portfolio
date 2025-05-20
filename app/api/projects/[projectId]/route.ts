import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import { projectSchema } from '@/lib/validation/project-schema';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { generateSlug } from '@/lib/utils';

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

async function verifyTokenAndGetUserIdAndRole(): Promise<{ userId: string; role: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { sub: string; role: string };
    return { userId: decoded.sub, role: decoded.role };
  } catch (err) {
    return null;
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  if (!projectId) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });

  try {
    const { data: project, error } = await supabase
      .from('projects')
      .select('*') 
      .eq('id', projectId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Project not found' }, { status: 404 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!project) return NextResponse.json({ error: 'Project not found' }, { status: 404 });

    // Convert tags to array for the response
    const responseProject = {
        ...project,
        tags: convertDbTagsToArray(project.tags)
    };

    return NextResponse.json(responseProject);
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { projectId: string } }) {
  const auth = await verifyTokenAndGetUserIdAndRole();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId } = params;
  if (!projectId) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });

  try {
    const body = await request.json();
    const parsed = projectSchema.safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.format() }, { status: 400 });

    const { title, tags, ...projectUpdateDataFields } = parsed.data;
    let slug;
    if (title) slug = generateSlug(title);

    const updateObject: Record<string, any> = { ...projectUpdateDataFields };
    if (title !== undefined) updateObject.title = title;
    if (slug !== undefined) updateObject.slug = slug; // Slug is derived from title

    if (tags !== undefined) { // tags were explicitly provided in the input
        updateObject.tags = Array.isArray(tags) 
            ? tags.map(t => t.trim()).filter(t => t).join(',') 
            : '';
    }

    const { data: updatedProject, error } = await supabase
      .from('projects')
      .update(updateObject)
      .eq('id', projectId)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
      if (error.code === '23505') return NextResponse.json({ error: 'Project with this title/slug already exists.'}, { status: 409 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    if (!updatedProject) return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });

    // Convert tags back to array for the response
    const responseUpdatedProject = {
        ...updatedProject,
        tags: convertDbTagsToArray(updatedProject.tags)
    };
    return NextResponse.json(responseUpdatedProject);
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ projectId: string }> }) {
  const auth = await verifyTokenAndGetUserIdAndRole();
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { projectId } = await params;
  if (!projectId) return NextResponse.json({ error: 'Project ID is required' }, { status: 400 });

  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) {
      if (error.code === 'PGRST116') return NextResponse.json({ error: 'Project not found or unauthorized' }, { status: 404 });
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: 'Project deleted successfully' }, { status: 200 });
  } catch (err: any) {
    return NextResponse.json({ error: 'Internal Server Error', details: err.message }, { status: 500 });
  }
} 