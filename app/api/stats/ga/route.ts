import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';

// Placeholder function - Replace with actual Google Analytics API calls
async function fetchGAData(metric: string, dateRange: string) {
    console.warn(`Google Analytics fetch not implemented for: ${metric}, range: ${dateRange}`);
    // In a real implementation, you would use the googleapis library here
    // to fetch data based on the metric (e.g., 'pageviews', 'users') and dateRange.
    // Return mock/empty data for now.
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    switch (metric) {
        case 'summary':
            return { views: 0, visitors: 0, bounceRate: 0, avgTimeOnPage: '0s' };
        case 'daily':
            return Array.from({ length: 14 }, (_, i) => {
                const d = new Date();
                d.setDate(d.getDate() - i);
                return { date: d.toISOString().split('T')[0], views: 0, visitors: 0 };
            }).reverse();
        default:
            return null;
    }
}

export async function GET(request: NextRequest) {
    const token = (await cookies()).get('token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'summary'; // e.g., 'summary', 'daily'
    const range = searchParams.get('range') || '14day'; // e.g., '7day', '14day', '30day'

    try {
        const data = await fetchGAData(metric, range);
        if (!data) {
            return NextResponse.json({ error: 'Invalid metric for GA data' }, { status: 400 });
        }
        // Add a flag indicating this is placeholder data
        return NextResponse.json({ data, placeholder: true, message: "Google Analytics not configured. Showing placeholder data." }, { status: 200 });
    } catch (error) {
        console.error("Placeholder GA API Error:", error);
        return NextResponse.json({ error: 'Failed to fetch placeholder GA data' }, { status: 500 });
    }
} 