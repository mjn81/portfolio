// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { TokenDto } from '@/types/user';

// Define allowed roles and statuses
const ALLOWED_ROLES = ['Admin', 'Author', 'Moderator'];
const ALLOWED_STATUSES = ['Active', 'Inactive'];

// GET Handler (New/Enhanced)
export async function GET(request: NextRequest) {
	const token = (await cookies()).get('token')?.value;
	if (!token) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenDto;
		// Ensure only admins can fetch all users
		if (decoded.role?.toLowerCase() !== 'admin') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}
	} catch (err) {
		return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
	}

	const { searchParams } = new URL(request.url);

	// Extract query parameters
	const page = parseInt(searchParams.get('page') || '1', 10);
	const limit = parseInt(searchParams.get('limit') || '10', 10);
	const status = searchParams.get('status'); // e.g., 'Active', 'Inactive'
	const role = searchParams.get('role');     // e.g., 'Admin', 'Editor'
	const query = searchParams.get('query');   // Search term for name/email
	const sort = searchParams.get('sort') || 'created_at'; // Default sort column
	const order = searchParams.get('order') || 'desc'; // Default sort order

	// Calculate range for pagination
	const from = (page - 1) * limit;
	const to = from + limit - 1;

	// Initialize Supabase query
	let supabaseQuery = supabase
		.from('users')
		.select('*', { count: 'exact' }); // Get total count

	// Apply filters
	if (status && status.toLowerCase() !== 'all') {
		supabaseQuery = supabaseQuery.eq('status', status);
	}
	if (role && role.toLowerCase() !== 'all') {
		supabaseQuery = supabaseQuery.eq('role', role);
	}
	if (query) {
		// Search across name and email
		supabaseQuery = supabaseQuery.or(`name.ilike.%${query}%,email.ilike.%${query}%`);
	}

	// Apply sorting
	const isValidSortColumn = ['name', 'email', 'role', 'status', 'created_at'].includes(sort);
	if (isValidSortColumn) {
		supabaseQuery = supabaseQuery.order(sort, { ascending: order === 'asc' });
	} else {
		// Default sort if invalid column provided
		supabaseQuery = supabaseQuery.order('created_at', { ascending: false });
	}


	// Apply pagination
	supabaseQuery = supabaseQuery.range(from, to);

	// Execute query
	const { data, error, count } = await supabaseQuery;

	if (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	// Return data and pagination metadata
	return NextResponse.json({
		data: data || [],
		meta: {
			page,
			limit,
			total: count || 0,
			totalPages: Math.ceil((count || 0) / limit),
			hasMore: page * limit < (count || 0),
		},
	});
}


// POST Handler (Existing - With added validation and response handling)
export async function POST(request: NextRequest) {
	const token = (await cookies()).get('token')?.value;

	if (!token) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	try {
		const decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenDto;
		// Ensure only admins can create users directly via API
		if (decoded.role?.toLowerCase() !== 'admin') {
			return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
		}
	} catch (err) {
		return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
	}

	// Don't destructure provider from the body, we'll set it manually
	const { name, email, password, role, status, avatar } = await request.json();

	// Enhanced validation
	if (!name || !email || !password || !role || !status) {
		return NextResponse.json({ error: 'Missing required fields: name, email, password, role, status' }, { status: 400 });
	}
	if (!ALLOWED_ROLES.includes(role)) {
		return NextResponse.json({ error: `Invalid role. Allowed roles are: ${ALLOWED_ROLES.join(', ')}` }, { status: 400 });
	}
	if (!ALLOWED_STATUSES.includes(status)) {
		return NextResponse.json({ error: `Invalid status. Allowed statuses are: ${ALLOWED_STATUSES.join(', ')}` }, { status: 400 });
	}
	if (password.length < 6) {
		return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
	}

	// Hash password
	const hashedPassword = await bcrypt.hash(password, 10);

	// Insert new user, explicitly setting provider to 'Email'
	const { data: newUser, error } = await supabase.from('users').insert([
		{
			name,
			email,
			password: hashedPassword,
			role, // Validated role
			status, // Validated status
			avatar, // Add avatar URL
			provider: 'Email', // <-- Set provider here
		},
	]).select().single();

	if (error) {
		// Check for unique constraint violation (email)
		if (error.code === '23505') {
			return NextResponse.json({ error: 'Email already exists' }, { status: 409 }); // 409 Conflict
		}
		console.error("Error creating user:", error);
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	// Don't send password back
	if (newUser) {
		delete (newUser as any).password;
	}

	return NextResponse.json({ message: 'User created successfully', user: newUser }, { status: 201 });
}
