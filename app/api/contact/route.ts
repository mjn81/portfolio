import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/db-client';
import { z } from 'zod';

// Define the validation schema using Zod
const contactSchema = z.object({
	name: z.string().min(1, 'Name is required').max(255),
	email: z.string().email('Invalid email address').max(255),
	subject: z.string().min(1, 'Subject is required').max(255),
	message: z.string().min(1, 'Message is required'),
});

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();

		// Validate the request body
		const parsed = contactSchema.safeParse(body);

		if (!parsed.success) {
			// Return validation errors
			return NextResponse.json(
				{ error: 'Validation failed', details: parsed.error.format() },
				{ status: 400 }
			);
		}

		// Extract validated data
		const { name, email, subject, message } = parsed.data;

		// Insert data into the Supabase table
		const { data, error } = await supabase
			.from('contact_me')
			.insert([
				{
					sender_name: name,
					sender_email: email,
					subject: subject,
					message: message,
				},
			])
			.select() // Optionally select the inserted row
			.single(); // Assuming you only insert one row

		if (error) {
			console.error('Supabase insertion error:', error);
			return NextResponse.json(
				{ error: 'Failed to save message', details: error.message },
				{ status: 500 }
			);
		}

		// Return success response
		return NextResponse.json(
			{ message: 'Message received successfully!', data }, // Optionally return inserted data
			{ status: 201 } // 201 Created status
		);

	} catch (err) {
		console.error('API Contact Form Error:', err);
		// Handle unexpected errors (e.g., JSON parsing issues)
		if (err instanceof SyntaxError) {
			return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
		}
		return NextResponse.json(
			{ error: 'Internal Server Error' },
			{ status: 500 }
		);
	}
} 