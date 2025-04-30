"use client"

import { useState, useEffect, useCallback } from "react"
import { Calendar, ChevronDown, Download, Loader2, AlertTriangle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ChartTooltip,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  Tooltip,
  XAxis,
  YAxis,
} from "@/components/ui/chart"
import { ResponsiveContainer } from "recharts"
import { withAuth } from "@/hooks/use-auth"

// --- Type Definitions (matching API responses) ---
interface GaSummaryStats {
  views: number;
  visitors: number;
}
interface GaDailyData {
  date: string;
  views: number;
  visitors: number;
}
interface GaTopPage {
  path: string;
  views: number;
}
interface GaReferrer {
  source: string;
  users: number;
}
interface GaDevice {
  category: string;
  users: number;
}
interface Post {
  id: string;
  title: string;
  slug: string;
  tags: string[];
}
interface TagCount {
  name: string;
  value: number;
}

// Simplified Recharts Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              {label || 'Value'}
            </span>
            <span className="font-bold text-muted-foreground">
              {payload[0]?.name}
            </span>
          </div>
          <div className="flex flex-col">
             <span className="text-[0.70rem] uppercase text-muted-foreground">
              Count
            </span>
            <span className="font-bold">
              {payload[0]?.value?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("14day") // Use API range values
  const [timeRangeLabel, setTimeRangeLabel] = useState("Last 14 Days")

  // Loading states
  const [isLoading, setIsLoading] = useState(true);

  // Error states
  const [error, setError] = useState<string | null>(null);

  // Data states
  const [summaryData, setSummaryData] = useState<GaSummaryStats | null>(null);
  const [dailyData, setDailyData] = useState<GaDailyData[]>([]);
  const [topPagesData, setTopPagesData] = useState<GaTopPage[]>([]);
  const [referrersData, setReferrersData] = useState<GaReferrer[]>([]);
  const [devicesData, setDevicesData] = useState<GaDevice[]>([]);
  const [tagData, setTagData] = useState<TagCount[]>([]);

  const handleTimeRangeChange = (range: string, label: string) => {
    setTimeRange(range);
    setTimeRangeLabel(label);
    // Refetch data when range changes
  }

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    console.log(`Fetching analytics data for range: ${timeRange}`);

    try {
      const endpoints = [
        `/api/stats/ga?metric=summary&range=${timeRange}`,
        `/api/stats/ga?metric=daily&range=${timeRange}`,
        `/api/stats/ga?metric=topPages&range=${timeRange}&limit=5`,
        `/api/stats/ga?metric=referrers&range=${timeRange}&limit=5`,
        `/api/stats/ga?metric=devices&range=${timeRange}`,
        `/api/posts?status=published&limit=999` // For tag calculation
      ];

      const responses = await Promise.all(endpoints.map(url => fetch(url)));

      const results = await Promise.all(responses.map(async (res, index) => {
         if (!res.ok) {
             const errorData = await res.json().catch(() => ({}));
             console.error(`Error fetching ${endpoints[index]}:`, res.status, errorData);
             throw new Error(errorData.message || `Failed to fetch data from ${endpoints[index]} (${res.status})`);
         }
         return res.json();
      }));

      // Process results
      setSummaryData(results[0].data);
      setDailyData(results[1].data || []);
      setTopPagesData(results[2].data || []);
      setReferrersData(results[3].data || []);
      setDevicesData(results[4].data || []);

      // Calculate tags from posts data
      const posts: Post[] = results[5].data || [];
      const tagCounts: Record<string, number> = {};
      posts.forEach((post) => {
        post.tags?.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      });
      setTagData(Object.entries(tagCounts).map(([name, value]) => ({ name, value })));

    } catch (err: any) {
       console.error("Analytics Page Fetch Error:", err);
       setError(err.message || "An error occurred while loading analytics data.");
       // Reset data on error to avoid showing stale info
       setSummaryData(null);
       setDailyData([]);
       setTopPagesData([]);
       setReferrersData([]);
       setDevicesData([]);
       setTagData([]);
    } finally {
      setIsLoading(false);
    }
  }, [timeRange]); // Refetch when timeRange changes

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Prepare data for charts (add formatting if needed)
  const formattedDeviceData = devicesData.map(d => ({ name: d.category, value: d.users }));
  const formattedReferrerData = referrersData.map(r => ({ name: r.source, users: r.users }));
  const formattedTopPages = topPagesData.map(p => ({
      // Truncate long paths for chart labels
      name: p.path.length > 30 ? `...${p.path.slice(-27)}` : p.path,
      views: p.views
  }));

  return (
    <div className="space-y-6">
      {/* Header with Time Range Dropdown */} 
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Analytics</h1>
          <p className="text-muted-foreground">Detailed insights about your blog performance</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-1">
                <Calendar className="h-4 w-4" />
                {timeRangeLabel}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleTimeRangeChange("7day", "Last 7 Days")}>Last 7 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTimeRangeChange("14day", "Last 14 Days")}>Last 14 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTimeRangeChange("30day", "Last 30 Days")}>Last 30 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleTimeRangeChange("90day", "Last 90 Days")}>Last 90 Days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/* <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button> */}
        </div>
      </div>

      {/* Loading State */} 
      {isLoading && (
         <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <Card key={i}> 
                  <CardHeader><Skeleton className="h-5 w-3/5"/></CardHeader>
                  <CardContent><Skeleton className="h-40 w-full"/></CardContent>
              </Card>
            ))}
         </div>
      )}

      {/* Error State */} 
      {error && !isLoading && (
           <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Error Loading Analytics</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
      )}

      {/* Data Display */} 
      {!isLoading && !error && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Total Page Views Card */} 
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Total Page Views</CardTitle>
              <CardDescription>{timeRangeLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {summaryData?.views?.toLocaleString() ?? 'N/A'}
              </div>
              <div className="mt-4 h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Line type="monotone" dataKey="views" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Unique Visitors Card */} 
           <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Unique Visitors</CardTitle>
               <CardDescription>{timeRangeLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {summaryData?.visitors?.toLocaleString() ?? 'N/A'}
              </div>
              <div className="mt-4 h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyData} margin={{ top: 5, right: 10, left: -15, bottom: 0 }}>
                     <defs>
                        <linearGradient id="visitorsGradient" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
                           <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { month: 'short', day: 'numeric'})} />
                    <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="visitors" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#visitorsGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Content Categories Card */} 
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Content Categories</CardTitle>
              <CardDescription>Distribution from all published posts</CardDescription>
            </CardHeader>
            <CardContent>
              {tagData.length > 0 ? (
                <div className="h-[230px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={tagData} cx="50%" cy="50%" labelLine={false} outerRadius={80} innerRadius={40} fill="hsl(var(--primary))" dataKey="value" nameKey="name" />
                      <Tooltip content={<CustomTooltip />} />
                      {/* Add Legend or list below if many tags */}
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                  <div className="flex h-[230px] items-center justify-center text-muted-foreground">No tag data available</div>
              )}
            </CardContent>
          </Card>

          {/* Top Performing Posts Card */} 
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Top Pages by Views</CardTitle>
               <CardDescription>{timeRangeLabel}</CardDescription>
            </CardHeader>
            <CardContent>
                {topPagesData.length > 0 ? (
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead>Page Path</TableHead>
                            <TableHead className="text-right">Views</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {topPagesData.map((page) => (
                            <TableRow key={page.path}>
                            <TableCell className="font-medium truncate max-w-[300px]"><a href={page.path.startsWith('/') ? page.path : `/${page.path}`} target="_blank" rel="noopener noreferrer" className="hover:underline">{page.path}</a></TableCell>
                            <TableCell className="text-right">{page.views.toLocaleString()}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                 ) : (
                    <div className="flex h-[200px] items-center justify-center text-muted-foreground">No top pages data available</div>
                 )}
            </CardContent>
          </Card>

          {/* Referral Sources Card */} 
           <Card>
            <CardHeader>
              <CardTitle>Top Referrers</CardTitle>
              <CardDescription>{timeRangeLabel}</CardDescription>
            </CardHeader>
            <CardContent>
              {formattedReferrerData.length > 0 ? (
                <div className="h-[200px]"> {/* Adjust height as needed */} 
                     <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={formattedReferrerData} layout="vertical" margin={{ top: 5, right: 10, left: 10, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2}/>
                          <XAxis type="number" hide />
                          <YAxis dataKey="name" type="category" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} width={80} />
                          <Tooltip content={<CustomTooltip />} cursor={{fill: 'hsl(var(--muted))'}} />
                          <Bar dataKey="users" fill="hsl(var(--chart-3))" radius={[0, 4, 4, 0]} />
                       </BarChart>
                     </ResponsiveContainer>
                </div>
               ) : (
                 <div className="flex h-[200px] items-center justify-center text-muted-foreground">No referrer data available</div>
               )}
            </CardContent>
          </Card>

          {/* Device Breakdown Card */} 
          <Card>
            <CardHeader>
              <CardTitle>Device Breakdown</CardTitle>
              <CardDescription>{timeRangeLabel}</CardDescription>
            </CardHeader>
            <CardContent>
             {formattedDeviceData.length > 0 ? (
                <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={formattedDeviceData} cx="50%" cy="50%" labelLine={false} outerRadius={60} fill="hsl(var(--chart-4))" dataKey="value" nameKey="name" />
                        <Tooltip content={<CustomTooltip />} />
                        <Legend wrapperStyle={{ fontSize: '12px'}} />
                    </PieChart>
                    </ResponsiveContainer>
                </div>
              ) : (
                 <div className="flex h-[200px] items-center justify-center text-muted-foreground">No device data available</div>
               )}
            </CardContent>
          </Card>

          {/* Add more cards/sections as needed */} 

        </div>
      )}
    </div>
  )
}

export default withAuth(AnalyticsPage)
