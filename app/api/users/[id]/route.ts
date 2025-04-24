// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
// app/api/users/[id]/route.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	// user authentication only
	const token = (await cookies()).get('token')?.value;

	if (!token) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	// Verify the JWT token
	try {
		jwt.verify(token, process.env.JWT_SECRET!);
	} catch (err) {
		return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
	}

	const { data, error } = await supabase
		.from('users')
		.select('*')
		.eq('id', params.id)
		.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 404 });
	}

	return NextResponse.json({ user: data }, { status: 200 });
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const token = (await cookies()).get('token')?.value;

	if (!token) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	let decoded;
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
			role: string;
			email: string;
			sub: string;
		};
	} catch (err) {
		return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
	}

	const { id } = params;
	const updates = await request.json();

	// If the user is not admin and trying to update another user's info
	if (decoded.role !== 'Admin' && decoded.sub !== id) {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	}

	// Prevent non-admins from changing roles
	if (decoded.role !== 'Admin') {
		delete updates.role;
	}

	// Hash new password if provided
	if (updates.password) {
		updates.password = await bcrypt.hash(updates.password, 10);
	}

	const { data, error } = await supabase
		.from('users')
		.update(updates)
		.eq('id', id)
		.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 400 });
	}

	return NextResponse.json(
		{ message: 'User updated successfully', user: data },
		{ status: 200 }
	);
}
