import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { BetaAnalyticsDataClient } from '@google-analytics/data';

// --- GA Data Fetching Logic ---

const propertyId = process.env.GA4_PROPERTY_ID;

// Configure the Analytics Data Client
// It automatically finds credentials based on environment variables
// (GOOGLE_APPLICATION_CREDENTIALS path or GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON content)
let analyticsDataClient: BetaAnalyticsDataClient | null = null;
let credentialsError: string | null = null;

try {
    if (!propertyId) {
        throw new Error("GA4_PROPERTY_ID environment variable is not set.");
    }
    // Attempt to initialize the client. This might throw if credentials are fundamentally wrong.
    analyticsDataClient = new BetaAnalyticsDataClient();
    console.log("Google Analytics Data Client initialized successfully.");
} catch (error: any) {
    credentialsError = `Failed to initialize Google Analytics client: ${error.message}. Ensure credentials (GOOGLE_APPLICATION_CREDENTIALS or GOOGLE_SERVICE_ACCOUNT_CREDENTIALS_JSON) and GA4_PROPERTY_ID are set correctly.`;
    console.error(credentialsError);
    // analyticsDataClient remains null
}


// Helper to parse GA date range string
function getDateRange(range: string): { startDate: string, endDate: string } {
    const endDate = 'today';
    let startDate = '14daysAgo'; // Default
    if (range === '7day') startDate = '7daysAgo';
    else if (range === '30day') startDate = '30daysAgo';
    else if (range === '90day') startDate = '90daysAgo';
    // Add more ranges if needed
    return { startDate, endDate };
}

// Fetch Summary Stats (Views, Visitors, etc.)
async function fetchGASummary(client: BetaAnalyticsDataClient, dateRange: { startDate: string, endDate: string }) {
     try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [dateRange],
            metrics: [
                { name: 'screenPageViews' }, // Total Views
                { name: 'activeUsers' },      // Unique Visitors approximation
                // { name: 'bounceRate' }, // Often requires session dimensions, can be complex
                { name: 'averageSessionDuration' }, // Can also be added
            ],
        });

        let views = 0;
        let visitors = 0;
        // let bounceRate = 0;
        let avgTimeOnPage = '0s';

        if (response.rows && response.rows.length > 0) {
            // For a simple summary without dimensions, results are usually in the first row
            views = parseInt(response.rows[0].metricValues?.[0]?.value || '0');
            visitors = parseInt(response.rows[0].metricValues?.[1]?.value || '0');
            // Extract other metrics similarly if added
            const avgSessionDurationSec = parseFloat(response.rows[0].metricValues?.[2]?.value || '0');
            if (!isNaN(avgSessionDurationSec) && avgSessionDurationSec > 0) {
                // Convert seconds to "Xm Ys" format
                const minutes = Math.floor(avgSessionDurationSec / 60);
                const seconds = Math.round(avgSessionDurationSec % 60);
                avgTimeOnPage = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
            }
        }

        return { views, visitors, bounceRate: 0, avgTimeOnPage }; // Returning 0 for unimplemented metrics
     } catch (error: any) {
         console.error('Error fetching GA Summary Data:', error);
         throw new Error(`GA API Error (Summary): ${error.message || 'Unknown error'}`);
     }
}

// Fetch Daily Stats (Views, Visitors per day)
async function fetchGADaily(client: BetaAnalyticsDataClient, dateRange: { startDate: string, endDate: string }) {
     try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [dateRange],
            dimensions: [{ name: 'date' }],
            metrics: [
                { name: 'screenPageViews' },
                { name: 'activeUsers' },
            ],
             orderBys: [ // Order by date ascending
                 { dimension: { dimensionName: 'date' }, desc: false }
             ]
        });

        const dailyData: { date: string, views: number, visitors: number }[] = [];

        response.rows?.forEach((row) => {
            const dateStr = row.dimensionValues?.[0]?.value || 'unknown';
            // Format date YYYYMMDD to YYYY-MM-DD
            const formattedDate = dateStr.length === 8
                ? `${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}`
                : dateStr;

            dailyData.push({
                date: formattedDate,
                views: parseInt(row.metricValues?.[0]?.value || '0'),
                visitors: parseInt(row.metricValues?.[1]?.value || '0'),
            });
        });
        return dailyData;
     } catch (error: any) {
         console.error('Error fetching GA Daily Data:', error);
         throw new Error(`GA API Error (Daily): ${error.message || 'Unknown error'}`);
     }
}

// Fetch Top Pages
async function fetchGATopPages(client: BetaAnalyticsDataClient, dateRange: { startDate: string, endDate: string }, limit: number = 10) {
    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [dateRange],
            dimensions: [{ name: 'pagePath' }], // Can also use pageTitle
            metrics: [{ name: 'screenPageViews' }],
            orderBys: [
                { metric: { metricName: 'screenPageViews' }, desc: true }
            ],
            limit: limit
        });

        const topPages: { path: string, views: number }[] = [];
        response.rows?.forEach((row) => {
            topPages.push({
                path: row.dimensionValues?.[0]?.value || 'unknown',
                views: parseInt(row.metricValues?.[0]?.value || '0'),
            });
        });
        return topPages;
    } catch (error: any) {
        console.error('Error fetching GA Top Pages:', error);
        throw new Error(`GA API Error (Top Pages): ${error.message || 'Unknown error'}`);
    }
}

// Fetch Top Referrers
async function fetchGATopReferrers(client: BetaAnalyticsDataClient, dateRange: { startDate: string, endDate: string }, limit: number = 10) {
    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [dateRange],
            dimensions: [{ name: 'sessionSource' }],
            metrics: [{ name: 'activeUsers' }], // Or 'sessions'
            orderBys: [
                { metric: { metricName: 'activeUsers' }, desc: true }
            ],
            limit: limit
        });

        const topReferrers: { source: string, users: number }[] = [];
        response.rows?.forEach((row) => {
            topReferrers.push({
                source: row.dimensionValues?.[0]?.value || 'unknown',
                users: parseInt(row.metricValues?.[0]?.value || '0'),
            });
        });
        return topReferrers;
    } catch (error: any) {
        console.error('Error fetching GA Top Referrers:', error);
        throw new Error(`GA API Error (Referrers): ${error.message || 'Unknown error'}`);
    }
}

// Fetch Device Breakdown
async function fetchGADevices(client: BetaAnalyticsDataClient, dateRange: { startDate: string, endDate: string }) {
    try {
        const [response] = await client.runReport({
            property: `properties/${propertyId}`,
            dateRanges: [dateRange],
            dimensions: [{ name: 'deviceCategory' }],
            metrics: [{ name: 'activeUsers' }],
            orderBys: [
                { metric: { metricName: 'activeUsers' }, desc: true }
            ]
        });

        const deviceData: { category: string, users: number }[] = [];
        response.rows?.forEach((row) => {
            deviceData.push({
                category: row.dimensionValues?.[0]?.value || 'unknown',
                users: parseInt(row.metricValues?.[0]?.value || '0'),
            });
        });
        return deviceData;
    } catch (error: any) {
        console.error('Error fetching GA Devices:', error);
        throw new Error(`GA API Error (Devices): ${error.message || 'Unknown error'}`);
    }
}

// --- In-Memory Cache ---
interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

const cache = new Map<string, CacheEntry<any>>();
// Cache duration: 12 hours * 60 minutes/hour * 60 seconds/minute * 1000 ms/second
const CACHE_DURATION_MS = 12 * 60 * 60 * 1000; 

function setCache<T>(key: string, data: T) {
    const entry: CacheEntry<T> = { data, timestamp: Date.now() };
    cache.set(key, entry);
    console.log(`Cache set for key: ${key}`);
}

function getCache<T>(key: string): T | null {
    const entry = cache.get(key);
    if (entry && (Date.now() - entry.timestamp < CACHE_DURATION_MS)) {
        console.log(`Cache hit for key: ${key}`);
        return entry.data as T;
    }
    if (entry) {
        // Cache expired
        console.log(`Cache expired for key: ${key}`);
        cache.delete(key); // Clean up expired entry
    } else {
        console.log(`Cache miss for key: ${key}`);
    }
    return null;
}

// --- API Route Handler ---

export async function GET(request: NextRequest) {
    const token = (await cookies()).get('token')?.value;
    if (!token) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    try {
        jwt.verify(token, process.env.JWT_SECRET!); // Verify token
    } catch (err) {
        return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Check if GA client failed to initialize during startup
    if (!analyticsDataClient || credentialsError) {
        console.warn("GA Client not available, returning error message.");
        const errorMessage = credentialsError || "Google Analytics client not initialized.";
        return NextResponse.json({
            data: null,
            placeholder: true, // Still indicate data isn't real
            message: `Configuration Issue: ${errorMessage}`
        }, { status: 503 });
    }

    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric') || 'summary';
    const range = searchParams.get('range') || '14day';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10; // Default limit for lists

    const dateRange = getDateRange(range);
    const cacheKey = `ga-${metric}-${range}${limitParam ? `-limit${limit}` : ''}`;

    // Check cache first
    const cachedData = getCache<any>(cacheKey);
    if (cachedData) {
        // Return cached data with a flag indicating it's from cache
        return NextResponse.json({ data: cachedData, placeholder: false, message: null, cached: true }, { status: 200 });
    }

    // If not cached or expired, fetch from API
    console.log(`Fetching fresh GA data for key: ${cacheKey}`);
    try {
        let data;
        if (metric === 'summary') {
            data = await fetchGASummary(analyticsDataClient, dateRange);
        } else if (metric === 'daily') {
            data = await fetchGADaily(analyticsDataClient, dateRange);
        } else if (metric === 'topPages') {
            data = await fetchGATopPages(analyticsDataClient, dateRange, limit);
        } else if (metric === 'referrers') {
            data = await fetchGATopReferrers(analyticsDataClient, dateRange, limit);
        } else if (metric === 'devices') {
            data = await fetchGADevices(analyticsDataClient, dateRange);
        } else {
            return NextResponse.json({ error: 'Invalid metric for GA data' }, { status: 400 });
        }

        // Store successful fetch in cache
        setCache(cacheKey, data);

        // Successful fetch - return real data, indicate not cached
        return NextResponse.json({ data, placeholder: false, message: null, cached: false }, { status: 200 });

    } catch (error: any) {
        console.error("Error in GA API Route Handler fetching fresh data:", error);
        // Return an error response - DO NOT CACHE ERRORS
        return NextResponse.json({
            data: null,
            placeholder: true, // Indicate data is missing due to error
            message: `Failed to fetch GA data: ${error.message || 'Internal Server Error'}`
        }, { status: 500 });
    }
} 