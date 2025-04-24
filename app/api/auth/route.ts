// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
	const { email, password } = await request.json();

	// Retrieve user by email
	const { data: user, error } = await supabase
		.from('users')
		.select('*')
		.or(
			// email or username
			`email.eq.${email},email.eq.${email},name.eq.${email},name.eq.${email}`
		)
		.single();
	if (error || !user) {
		return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
	}

	// Verify password
	const isValid = await bcrypt.compare(password, user.password);
	if (!isValid) {
		return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
	}

	// Generate JWT token
	const token = jwt.sign(
		{
			sub: user.id,
			role: user.role,
			email: user.email,
		},
		process.env.JWT_SECRET!,
		{ expiresIn: '7d' }
	);

	(await cookies()).set('token', token, {
		httpOnly: true,
		secure: process.env.NODE_ENV === 'production',
		sameSite: 'strict',
		maxAge: 60 * 60 * 24 * 7, // 7 days
		path: '/',
	});

	console.log("token, ", token);

	return NextResponse.json({ message: 'Login successful' }, { status: 200 });
}
