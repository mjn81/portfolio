import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';

export async function GET(request: NextRequest) {
	try {
		// Fetch tags from the 'tags' table
		const { data, error } = await supabase
			.from('tags')
			.select('*')
			.order('name', { ascending: true });

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		// Return the list of tags as a JSON response
		return NextResponse.json(data, { status: 200 });
	} catch (err) {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
