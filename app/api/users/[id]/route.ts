// app/api/users/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
// app/api/users/[id]/route.ts
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { TokenDto } from '@/types/user';

// Define allowed roles and statuses
const ALLOWED_ROLES = ['Admin', 'Author', 'Moderator'];
const ALLOWED_STATUSES = ['Active', 'Inactive'];

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const paramId = (await params).id;
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
		.eq('id', paramId)
		.single();

	if (error) {
		if (error.code === 'PGRST116') {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}
		console.error('Error fetching user:', error);
		return NextResponse.json(
			{ error: 'Failed to fetch user' },
			{ status: 500 }
		);
	}

	delete (data as any).password;

	return NextResponse.json({ user: data }, { status: 200 });
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const token = (await cookies()).get('token')?.value;

	if (!token) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	let decoded;
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenDto;
	} catch (err) {
		return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
	}

	const { id } = await params;
	const updates = await request.json();

	// If the user is not admin and trying to update another user's info
	if (decoded.role?.toLowerCase() !== 'admin' && decoded.sub !== id) {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	}

	// Prevent non-admins from changing roles or status, and validate if admin provides them
	if (decoded.role?.toLowerCase() !== 'admin') {
		delete updates.role;
		delete updates.status;
	} else {
		// Validate role if admin is changing it
		if (updates.role && !ALLOWED_ROLES.includes(updates.role)) {
			return NextResponse.json({ error: `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(', ')}` }, { status: 400 });
		}
		// Validate status if admin is changing it
		if (updates.status && !ALLOWED_STATUSES.includes(updates.status)) {
			return NextResponse.json({ error: `Invalid status. Allowed statuses are: ${ALLOWED_STATUSES.join(', ')}` }, { status: 400 });
		}
	}

	// Hash new password if provided and validate length
	if (updates.password) {
		if (updates.password.length < 6) {
			return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
		}
		updates.password = await bcrypt.hash(updates.password, 10);
	} else {
		delete updates.password; // Don't update password if not provided or empty
	}

	// Remove fields that shouldn't be directly updated this way
	delete updates.id;
	delete updates.created_at;
	delete updates.provider;
	// Allow avatar update

	const { data, error } = await supabase
		.from('users')
		.update(updates)
		.eq('id', id)
		.select() // Select updated data
		.single();

	if (error) {
		if (error.code === 'PGRST116') {
			return NextResponse.json({ error: 'User not found' }, { status: 404 });
		}
		if (error.code === '23505') {
			return NextResponse.json({ error: 'Email already in use by another account' }, { status: 409 });
		}
		console.error("Error updating user:", error);
		return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
	}

	// Don't return password hash
	delete (data as any).password;

	return NextResponse.json(
		{ message: 'User updated successfully', user: data },
		{ status: 200 }
	);
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> }
) {
	const token = (await cookies()).get('token')?.value;
	if (!token) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	let decoded;
	try {
		decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenDto;
		if (decoded.role?.toLowerCase() !== 'admin') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}
	} catch (err) {
		return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
	}

	const { id } = await params;

	const { error } = await supabase
		.from('users')
		.delete()
		.eq('id', id);

	if (error) {
		if (error.code === 'PGRST116') {
		} else {
			console.error("Error deleting user:", error);
			return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
		}
	}

	return NextResponse.json(
		{ message: 'User deleted successfully' },
		{ status: 200 }
	);
}
