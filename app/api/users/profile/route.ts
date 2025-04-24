import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
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

		const userId = decoded.sub;

		// Fetch the user profile from Supabase
		const { data, error } = await supabase
			.from('users')
			.select('id, name, email, avatar, role, status, created_at, last_active')
			.eq('id', userId)
			.single();

		if (error) {
			return NextResponse.json({ error: error.message }, { status: 500 });
		}

		return NextResponse.json(data, { status: 200 });
	} catch (err) {
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
}
