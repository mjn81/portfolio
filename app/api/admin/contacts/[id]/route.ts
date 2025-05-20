import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Contact ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('contact_me')
      .delete()
      .match({ id });

    if (error) {
      console.error('Supabase DELETE contact error:', error);
      return NextResponse.json(
        { error: 'Failed to delete contact message', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ message: 'Contact message deleted successfully' }, { status: 200 });

  } catch (err) {
    console.error('API DELETE contact error:', err);
    // Check if err is an instance of Error to access err.message safely
    const errorMessage = err instanceof Error ? err.message : 'Internal Server Error';
    return NextResponse.json({ error: 'Internal Server Error', details: errorMessage }, { status: 500 });
  }
} 