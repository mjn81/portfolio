import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
		// Retrieve the token from cookies
		const token = (await cookies()).get('token')?.value;

		if (!token) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}

		// Verify the JWT token
		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET!);
		} catch (err) {
			return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
		}

		// Delete the tag with the specified ID
		const { data, error } = await supabase
			.from('tags')
			.delete()
			.eq('id', params.id)
			.select();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(
			{ message: 'Tag deleted successfully' },
			{ status: 200 }
		);
	} catch (err) {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
