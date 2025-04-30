"use client"

import { useEffect, useState, useCallback } from "react"
import Link from "next/link"
import {
  FileText,
  FilePenLine,
  Eye,
  Users,
  TrendingUp,
  Clock,
  Calendar,
  ArrowUpRight,
  MoreHorizontal,
  Bell,
  Search,
  BarChart3,
  Settings,
  Loader2,
  AlertTriangle,
  Info,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/admin/stat-card"
import {
  Area,
  AreaChart,
  CartesianGrid,
  ChartTooltip,
  Tooltip,
  XAxis,
  YAxis,
  Pie,
  PieChart,
} from "@/components/ui/chart"
import { ResponsiveContainer } from "recharts"
import { withAuth } from "@/hooks/use-auth"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from 'date-fns'

// Types for API data
interface PostStats {
  total: number;
  published: number;
  draft: number;
  scheduled: number;
}

interface GaSummaryStats {
  views: number;
  visitors: number;
  bounceRate: number;
  avgTimeOnPage: string;
}

interface GaDailyData {
  date: string;
  views: number;
  visitors: number;
}

interface Post {
  id: string;
  title: string;
  slug: string;
  status: 'published' | 'draft' | 'scheduled';
  created_at: string; // ISO string
  published_at?: string | null; // ISO string
  scheduled_publish_time?: string | null; // ISO string
  tags: string[];
  // Add other fields if needed
}

interface TagCount {
  name: string;
  value: number;
}

function AdminDashboard() {
  // Loading states
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingRecent, setIsLoadingRecent] = useState(true);
  const [isLoadingScheduled, setIsLoadingScheduled] = useState(true);
  const [isLoadingGaSummary, setIsLoadingGaSummary] = useState(true);
  const [isLoadingGaDaily, setIsLoadingGaDaily] = useState(true);

  // Error states
  const [statsError, setStatsError] = useState<string | null>(null);
  const [recentError, setRecentError] = useState<string | null>(null);
  const [scheduledError, setScheduledError] = useState<string | null>(null);
  const [gaSummaryError, setGaSummaryError] = useState<string | null>(null);
  const [gaDailyError, setGaDailyError] = useState<string | null>(null);

  // Data states
  const [postStats, setPostStats] = useState<PostStats>({ total: 0, published: 0, draft: 0, scheduled: 0 });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<Post[]>([]);
  const [gaSummary, setGaSummary] = useState<GaSummaryStats | null>(null);
  const [gaDaily, setGaDaily] = useState<GaDailyData[]>([]);
  const [gaPlaceholder, setGaPlaceholder] = useState(false);
  const [gaMessage, setGaMessage] = useState<string | null>(null);

  // UI states
  const [currentTime, setCurrentTime] = useState(new Date());
  const [activeTrafficTab, setActiveTrafficTab] = useState("views");

  // Fetch data function
  const fetchData = useCallback(async () => {
    setIsLoadingStats(true);
    setIsLoadingRecent(true);
    setIsLoadingScheduled(true);
    setIsLoadingGaSummary(true);
    setIsLoadingGaDaily(true);
    setStatsError(null);
    setRecentError(null);
    setScheduledError(null);
    setGaSummaryError(null);
    setGaDailyError(null);
    setGaPlaceholder(false);
    setGaMessage(null);

    try {
      // Fetch Post Stats
      const statsRes = await fetch('/api/stats/posts');
      if (!statsRes.ok) throw new Error('Failed to fetch post stats');
      const statsData: PostStats = await statsRes.json();
      setPostStats(statsData);
    } catch (error: any) {
      console.error("Error fetching post stats:", error);
      setStatsError(error.message || 'Could not load post statistics.');
    } finally {
      setIsLoadingStats(false);
    }

    try {
      // Fetch Recent Posts (e.g., latest 5 published)
      const recentRes = await fetch('/api/posts?status=published&sort=published_at&order=desc&limit=5');
      if (!recentRes.ok) throw new Error('Failed to fetch recent posts');
      const recentData = await recentRes.json();
      setRecentPosts(recentData.data || []);
    } catch (error: any) {
      console.error("Error fetching recent posts:", error);
      setRecentError(error.message || 'Could not load recent posts.');
    } finally {
      setIsLoadingRecent(false);
    }

    try {
      // Fetch Scheduled Posts (e.g., next 5)
      const scheduledRes = await fetch('/api/posts?status=scheduled&sort=scheduled_publish_time&order=asc&limit=5');
      if (!scheduledRes.ok) throw new Error('Failed to fetch scheduled posts');
      const scheduledData = await scheduledRes.json();
      setScheduledPosts(scheduledData.data || []);
    } catch (error: any) {
      console.error("Error fetching scheduled posts:", error);
      setScheduledError(error.message || 'Could not load scheduled posts.');
    } finally {
      setIsLoadingScheduled(false);
    }

    // Fetch GA Data (Placeholders)
    try {
      const gaSummaryRes = await fetch('/api/stats/ga?metric=summary&range=30day');
      if (!gaSummaryRes.ok) throw new Error('Failed to fetch GA summary');
      const gaSummaryData = await gaSummaryRes.json();
      setGaSummary(gaSummaryData.data);
      setGaPlaceholder(gaSummaryData.placeholder || false);
      setGaMessage(gaSummaryData.message || null);
    } catch (error: any) {
      console.error("Error fetching GA summary:", error);
      setGaSummaryError(error.message || 'Could not load GA summary data.');
    } finally {
      setIsLoadingGaSummary(false);
    }

    try {
      const gaDailyRes = await fetch('/api/stats/ga?metric=daily&range=14day');
      if (!gaDailyRes.ok) throw new Error('Failed to fetch daily GA data');
      const gaDailyData = await gaDailyRes.json();
      setGaDaily(gaDailyData.data || []);
      // Placeholder flag and message are likely the same as summary, but check just in case
      if (!gaPlaceholder) setGaPlaceholder(gaDailyData.placeholder || false);
      if (!gaMessage) setGaMessage(gaDailyData.message || null);
    } catch (error: any) {
      console.error("Error fetching daily GA data:", error);
      setGaDailyError(error.message || 'Could not load daily GA data.');
    } finally {
      setIsLoadingGaDaily(false);
    }

  }, []);

  useEffect(() => {
    fetchData();

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [fetchData])

  // Calculate tag distribution from fetched recent posts
  const tagCounts: Record<string, number> = {};
  if (recentPosts) {
    recentPosts.forEach((post) => {
      post.tags?.forEach((tag: string) => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    });
  }
  const tagData: TagCount[] = Object.entries(tagCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Sort for consistent display

  // Format date for display
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  // Mock Notifications (can be replaced with real data later)
  const notifications = [
    { id: 1, title: "New comment on 'The Future of AI'", time: "5 minutes ago", read: false },
    { id: 2, title: "Your post has reached 1,000 views", time: "2 hours ago", read: false },
    { id: 3, title: "System update completed", time: "Yesterday", read: true },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search posts..." className="w-full sm:w-[200px] pl-9" />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] text-destructive-foreground">
                    {notifications.filter((n) => !n.read).length}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className={`flex flex-col items-start p-3 ${!notification.read ? "bg-muted/50" : ""}`}
                  >
                    <div className="font-medium">{notification.title}</div>
                    <div className="text-xs text-muted-foreground">{notification.time}</div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center font-medium">View all notifications</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button asChild>
              <Link href="/admin/posts/create">
                <FilePenLine className="mr-2 h-4 w-4" />
                New Post
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* GA Placeholder Message */}
      {gaPlaceholder && gaMessage && (
        <Alert variant="default" className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
            <Info className="h-4 w-4 !text-blue-600 dark:!text-blue-400" />
          <AlertTitle className="text-blue-800 dark:text-blue-300">Google Analytics</AlertTitle>
          <AlertDescription className="text-blue-700 dark:text-blue-400">
            {gaMessage} Some stats below are showing placeholder values (0).
            Configure Google Analytics integration to see real data.
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Posts */}
        <StatCard
          title="Total Posts"
          value={isLoadingStats ? <Skeleton className="h-6 w-16" /> : postStats.total}
          icon={<FileText className="text-primary" />}
          description={isLoadingStats ? <Skeleton className="h-4 w-32" /> : `${postStats.published} published, ${postStats.draft} drafts, ${postStats.scheduled} scheduled`}
          error={statsError}
        />
        {/* Total Views (GA Placeholder) */}
        <StatCard
          title="Total Views (GA)"
          value={isLoadingGaSummary ? <Skeleton className="h-6 w-20" /> : (gaSummary?.views ?? 0).toLocaleString()}
          icon={<Eye className="text-blue-500" />}
          description={isLoadingGaSummary ? <Skeleton className="h-4 w-24" /> : "All-time page views"}
          error={gaSummaryError}
          isPlaceholder={gaPlaceholder}
        />
        {/* Unique Visitors (GA Placeholder) */}
        <StatCard
          title="Unique Visitors (GA)"
          value={isLoadingGaSummary ? <Skeleton className="h-6 w-16" /> : (gaSummary?.visitors ?? 0).toLocaleString()}
          icon={<Users className="text-purple-500" />}
          description={isLoadingGaSummary ? <Skeleton className="h-4 w-20" /> : "Last 30 days"}
          error={gaSummaryError}
          isPlaceholder={gaPlaceholder}
        />
        {/* Placeholder for another metric or Quick Action */}
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Quick Links</CardTitle>
                <CardDescription>Common actions</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2">
                <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/posts">
                        <FileText className="mr-2 h-4 w-4"/> Manage Posts
                    </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/users">
                        <Users className="mr-2 h-4 w-4"/> Manage Users
                    </Link>
                </Button>
                 <Button variant="outline" size="sm" asChild>
                    <Link href="/admin/settings">
                        <Settings className="mr-2 h-4 w-4"/> Settings
                    </Link>
                </Button>
            </CardContent>
        </Card>
      </div>

      {/* Main Content Area */}
      <div className="grid gap-6 md:grid-cols-6">
        {/* Traffic Overview Chart (GA Placeholder) */}
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Traffic Overview (GA)</CardTitle>
              <CardDescription>Daily views and visitors (placeholder)</CardDescription>
            </div>
            <Tabs value={activeTrafficTab} onValueChange={setActiveTrafficTab}>
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="views">Views</TabsTrigger>
                <TabsTrigger value="visitors">Visitors</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {isLoadingGaDaily ? (
                  <div className="flex h-full w-full items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                  </div>
              ) : gaDailyError ? (
                   <div className="flex h-full w-full items-center justify-center text-destructive">
                      <AlertTriangle className="mr-2 h-4 w-4" /> {gaDailyError}
                   </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={gaDaily}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => new Date(value).getDate().toString()}
                    />
                    <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTooltip />} />
                    {activeTrafficTab === "views" && (
                      <Area
                        type="monotone"
                        dataKey="views"
                        stroke="hsl(var(--primary))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorViews)"
                        name="Views"
                      />
                    )}
                    {activeTrafficTab === "visitors" && (
                      <Area
                        type="monotone"
                        dataKey="visitors"
                        stroke="hsl(var(--chart-2))"
                        strokeWidth={2}
                        fillOpacity={1}
                        fill="url(#colorVisitors)"
                        name="Visitors"
                      />
                    )}
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <div>{gaPlaceholder ? "Placeholder data (14 days)" : "Updated just now (14 days)"}</div>
          </CardFooter>
        </Card>

        {/* Content Categories (Tags Pie Chart) */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Recent Post Tags</CardTitle>
            <CardDescription>Distribution from latest 5 published posts</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingRecent ? (
                <div className="flex h-[280px] items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground"/>
                </div>
            ) : recentError ? (
                 <div className="flex h-full w-full items-center justify-center text-destructive">
                     <AlertTriangle className="mr-2 h-4 w-4" /> {recentError}
                 </div>
            ) : tagData.length === 0 ? (
                <div className="flex h-[280px] items-center justify-center text-muted-foreground">
                    No tags found in recent posts.
                </div>
            ) : (
              <>
                <div className="h-[230px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tagData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        innerRadius={40}
                        fill="hsl(var(--primary))"
                        dataKey="value"
                        nameKey="name"
                      />
                      <Tooltip content={<ChartTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {tagData.slice(0, 3).map(({ name, value }, index) => (
                    <div key={name} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div
                          className="h-3 w-3 rounded-full mr-2"
                          style={{ backgroundColor: `hsl(var(--chart-${(index % 5) + 1}))` }}
                        />
                        <span className="text-sm truncate max-w-[150px]">{name}</span>
                      </div>
                      <span className="text-sm font-medium">{value}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Recent Published Posts */}
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
             <div>
              <CardTitle>Recent Posts</CardTitle>
              <CardDescription>Latest published articles</CardDescription>
             </div>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                 <Link href="/admin/posts?status=published">
                    View all published
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                 </Link>
             </Button>
          </CardHeader>
          <CardContent>
            {isLoadingRecent ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
            ) : recentError ? (
                <div className="text-destructive"><AlertTriangle className="mr-2 h-4 w-4 inline" /> {recentError}</div>
            ) : recentPosts.length === 0 ? (
                <div className="text-muted-foreground">No recent published posts found.</div>
            ) : (
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between gap-3">
                        <div className="flex-1 space-y-1 overflow-hidden">
                          <Link href={`/blog/${post.slug}`} target="_blank" className="text-sm font-medium leading-none hover:underline line-clamp-1" title={post.title}>
                             {post.title}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            Published {post.published_at ? formatDistanceToNow(new Date(post.published_at), { addSuffix: true }) : 'N/A'}
                          </p>
                        </div>
                         <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/posts/${post.id}/edit`}>Edit</Link>
                        </Button>
                    </div>
                  ))}
                </div>
            )}
          </CardContent>
        </Card>

         {/* Upcoming Scheduled Posts */}
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
             <div>
              <CardTitle>Upcoming Schedule</CardTitle>
              <CardDescription>Posts scheduled for publication</CardDescription>
             </div>
              <Button variant="ghost" size="sm" asChild className="text-xs">
                 <Link href="/admin/posts?status=scheduled">
                    View all scheduled
                    <ArrowUpRight className="ml-1 h-3 w-3" />
                 </Link>
             </Button>
          </CardHeader>
          <CardContent>
            {isLoadingScheduled ? (
                <div className="space-y-4">
                    {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
            ) : scheduledError ? (
                <div className="text-destructive"><AlertTriangle className="mr-2 h-4 w-4 inline" /> {scheduledError}</div>
            ) : scheduledPosts.length === 0 ? (
                <div className="text-muted-foreground">No posts currently scheduled.</div>
            ) : (
                <div className="space-y-4">
                  {scheduledPosts.map((post) => (
                    <div key={post.id} className="flex items-center justify-between gap-3">
                        <div className="flex-1 space-y-1 overflow-hidden">
                          <p className="text-sm font-medium leading-none line-clamp-1" title={post.title}>
                             {post.title}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Scheduled for {post.scheduled_publish_time ? formatDistanceToNow(new Date(post.scheduled_publish_time), { addSuffix: true }) : 'N/A'}
                          </p>
                        </div>
                         <Button variant="outline" size="sm" asChild>
                            <Link href={`/admin/posts/${post.id}/edit`}>Edit</Link>
                        </Button>
                    </div>
                  ))}
                </div>
            )}
          </CardContent>
        </Card>

        {/* Remove Performance Metrics Card (relies on GA) */}
        {/* <Card className="md:col-span-2"> ... </Card> */}

        {/* Remove Upcoming Schedule Card (we have scheduled posts list now) */}
        {/* <Card className="md:col-span-2"> ... </Card> */}

        {/* Keep Quick Actions Card - Maybe simplify? */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-20 flex-col gap-1 text-xs" asChild>
               <Link href="/admin/posts/create">
                 <FilePenLine className="h-5 w-5" />
                 New Post
               </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-1 text-xs" asChild>
               <Link href="/admin/posts?status=draft">
                 <FileText className="h-5 w-5" />
                 Drafts ({isLoadingStats ? <Loader2 className="h-3 w-3 animate-spin inline"/> : postStats.draft})
               </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-1 text-xs" asChild>
               <Link href="/admin/analytics">
                 <BarChart3 className="h-5 w-5" />
                 Analytics
               </Link>
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-1 text-xs" asChild>
               <Link href="/admin/settings">
                 <Settings className="h-5 w-5" />
                 Settings
               </Link>
            </Button>
          </CardContent>
        </Card>

         {/* Placeholder for other content or another quick links card */}
         <Card className="md:col-span-3">
             <CardHeader>
                 <CardTitle>System Status</CardTitle>
                 <CardDescription>Quick overview</CardDescription>
             </CardHeader>
             <CardContent className="space-y-3">
                 <div className="flex items-center justify-between text-sm">
                     <span>API Status:</span>
                     <Badge variant="outline" className="border-green-500 text-green-600">Healthy</Badge> {/* Example */} 
                 </div>
                 <div className="flex items-center justify-between text-sm">
                     <span>Database:</span>
                     <Badge variant="outline" className="border-green-500 text-green-600">Connected</Badge> {/* Example */} 
                 </div>
                  <div className="flex items-center justify-between text-sm">
                     <span>GA Status:</span>
                     {gaPlaceholder ? (
                        <Badge variant="secondary">Not Configured</Badge>
                     ) : (gaSummaryError || gaDailyError) ? (
                        <Badge variant="destructive">Error</Badge>
                     ) : (
                        <Badge variant="outline" className="border-green-500 text-green-600">Connected</Badge>
                     )}
                 </div>
                  <div className="flex items-center justify-between text-sm">
                     <span>Background Jobs:</span>
                     <Badge variant="secondary">Idle</Badge> {/* Example */} 
                 </div>
             </CardContent>
         </Card>

      </div>
    </div>
  )
}

export default withAuth(AdminDashboard)
