// app/api/users/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
  const token = (await cookies()).get('token')?.value;

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      role: string;
      email: string;
      sub: string;
    };
    if (decoded.role !== 'Admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
  } catch (err) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }

  const { name, email, password, role, status, avatar, provider } = await request.json();

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert new user
  const { error } = await supabase.from('users').insert([
    {
      name,
      email,
      password: hashedPassword,
      role,
      status,
      avatar,
      provider,
    },
  ]);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ message: 'User created successfully' }, { status: 201 });
}
