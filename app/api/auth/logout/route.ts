import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: NextRequest) {
	// Delete the 'token' cookie to log the user out
	(await cookies()).delete('token');

	// Return a success response
	return NextResponse.json(
		{ message: 'Logged out successfully' },
		{ status: 200 }
	);
}
