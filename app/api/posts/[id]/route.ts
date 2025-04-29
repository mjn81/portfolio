import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import { postSchema } from '@/lib/validation/post-schema';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { TokenDto } from '@/types/user';

export async function GET(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	const { data, error } = await supabase
		.from('posts')
		.select('*')
		.eq('id', params.id)
		.single();

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	const token = (await cookies()).get('token')?.value;
	if (data.status === 'draft') {
		if (!token) {
			return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
		}
		// Verify the JWT token
		try {
			jwt.verify(token, process.env.JWT_SECRET!);
		} catch (err) {
			return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
		}
	}

	return NextResponse.json(data, { status: 200 });
}

export async function PUT(
	request: NextRequest,
	{ params }: { params: { id: string } }
) {
	try {
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

		let decoded;
		try {
			decoded = jwt.verify(token, process.env.JWT_SECRET!) as TokenDto;
		} catch (err) {
			return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
		}

		const body = await request.json();
		const parsed = postSchema.partial().safeParse(body);

		if (!parsed.success) {
			return NextResponse.json(
				{ error: parsed.error.format() },
				{ status: 400 }
			);
		}

		const { data, error } = await supabase
			.from('posts')
			.update({ ...parsed.data, author: decoded.sub })
			.eq('id', params.id)
			.select();

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

export async function DELETE(
	request: NextRequest,
	{ params }: { params: { id: string } }
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

	const allowedRoles = ['admin', 'moderator'];
	if (!allowedRoles.includes(decoded.role.toLowerCase()) || decoded.sub !== params.id) {
		return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
	}
	const { error } = await supabase.from('posts').delete().eq('id', params.id);

	if (error) {
		return NextResponse.json({ error: error.message }, { status: 500 });
	}

	return NextResponse.json(
		{ message: 'Post deleted successfully' },
		{ status: 200 }
	);
}
