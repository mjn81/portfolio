"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import {
  FileText,
  FilePenLine,
  Eye,
  ThumbsUp,
  MessageSquare,
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
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { StatCard } from "@/components/admin/stat-card"
import { getPostStats, getPopularPosts, getRecentPosts, mockDailyStats } from "@/lib/mock-data"
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

function AdminDashboard() {
  const [stats, setStats] = useState({
    published: 0,
    drafts: 0,
    total: 0,
    views: 0,
    likes: 0,
    comments: 0,
  })
  const [popularPosts, setPopularPosts] = useState<any[]>([])
  const [recentPosts, setRecentPosts] = useState<any[]>([])
  const [currentTime, setCurrentTime] = useState(new Date())
  const [activeTab, setActiveTab] = useState("views")

  useEffect(() => {
    // In a real app, these would be API calls
    setStats(getPostStats())
    setPopularPosts(getPopularPosts())
    setRecentPosts(getRecentPosts())

    // Update time every minute
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000)

    return () => clearInterval(timer)
  }, [])

  // Calculate tag distribution for the pie chart
  const tagCounts: Record<string, number> = {}
  recentPosts.forEach((post) => {
    post.tags.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  const tagData = Object.entries(tagCounts).map(([name, value]) => ({ name, value }))

  // Format date for display
  const formattedDate = currentTime.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Notifications
  const notifications = [
    { id: 1, title: "New comment on 'The Future of AI'", time: "5 minutes ago", read: false },
    { id: 2, title: "Your post has reached 1,000 views", time: "2 hours ago", read: false },
    { id: 3, title: "System update completed", time: "Yesterday", read: true },
  ]

  return (
    <div className="space-y-6">
      {/* Header with search and actions */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">Dashboard</h1>
          <p className="text-muted-foreground">{formattedDate}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="w-full sm:w-[200px] pl-9" />
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

      {/* Stats overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Posts"
          value={stats.total}
          icon={<FileText className="text-primary" />}
          description={`${stats.published} published, ${stats.drafts} drafts`}
          trend={{ value: 8.2, isPositive: true }}
        />
        <StatCard
          title="Total Views"
          value={stats.views.toLocaleString()}
          icon={<Eye className="text-blue-500" />}
          description="All-time page views"
          trend={{ value: 12.5, isPositive: true }}
        />
        <StatCard
          title="Engagement"
          value={`${(((stats.likes + stats.comments) / stats.views) * 100).toFixed(1)}%`}
          icon={<ThumbsUp className="text-green-500" />}
          description={`${stats.likes} likes, ${stats.comments} comments`}
          trend={{ value: 3.1, isPositive: true }}
        />
        <StatCard
          title="Unique Visitors"
          value="1,245"
          icon={<Users className="text-purple-500" />}
          description="Last 30 days"
          trend={{ value: 2.3, isPositive: false }}
        />
      </div>

      {/* Main content area */}
      <div className="grid gap-6 md:grid-cols-6">
        {/* Main chart - 4 columns on larger screens */}
        <Card className="md:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle>Traffic Overview</CardTitle>
              <CardDescription>Daily views and visitors for the last 14 days</CardDescription>
            </div>
            <Tabs defaultValue="views" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="grid w-[200px] grid-cols-2">
                <TabsTrigger value="views">Views</TabsTrigger>
                <TabsTrigger value="visitors">Visitors</TabsTrigger>
              </TabsList>
            </Tabs>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <div className="h-full w-full">
                <AreaChart
                  data={mockDailyStats}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  width={500}
                  height={300}
                >
                  <defs>
                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#82ca9d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => {
                      const date = new Date(value)
                      return date.getDate().toString()
                    }}
                  />
                  <YAxis tick={{ fontSize: 12 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTooltip />} />
                  {activeTab === "views" && (
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#8884d8"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorViews)"
                    />
                  )}
                  {activeTab === "visitors" && (
                    <Area
                      type="monotone"
                      dataKey="visitors"
                      stroke="#82ca9d"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorVisitors)"
                    />
                  )}
                </AreaChart>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between text-sm text-muted-foreground">
            <div>Updated just now</div>
            <div>14-day period</div>
          </CardFooter>
        </Card>

        {/* Content categories - 2 columns on larger screens */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Content Categories</CardTitle>
            <CardDescription>Distribution of post tags</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[230px] w-full">
              <div className="h-full w-full">
                <PieChart width={300} height={230}>
                  <Pie
                    data={tagData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    innerRadius={40}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  />
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {Object.entries(tagCounts)
                .slice(0, 3)
                .map(([tag, count], index) => (
                  <div key={tag} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div
                        className="h-3 w-3 rounded-full mr-2"
                        style={{ backgroundColor: ["#8884d8", "#82ca9d", "#ffc658"][index % 3] }}
                      />
                      <span className="text-sm">{tag}</span>
                    </div>
                    <span className="text-sm font-medium">{count}</span>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent activity - 3 columns on larger screens */}
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Latest posts and updates</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="text-xs">
              View all
              <ArrowUpRight className="ml-1 h-3 w-3" />
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.slice(0, 4).map((post, index) => (
                <div key={post.id} className="flex items-start gap-3">
                  <div className="relative mt-1">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                      {index === 0 ? (
                        <FilePenLine className="h-4 w-4 text-primary" />
                      ) : index === 1 ? (
                        <Eye className="h-4 w-4 text-blue-500" />
                      ) : (
                        <MessageSquare className="h-4 w-4 text-green-500" />
                      )}
                    </div>
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium leading-none">
                        {index === 0
                          ? "New post created"
                          : index === 1
                            ? "Post reached milestone"
                            : "New comment received"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {index === 0 ? "2h ago" : index === 1 ? "5h ago" : "1d ago"}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {index === 0
                        ? `You created "${post.title}"`
                        : index === 1
                          ? `"${post.title}" reached ${post.views} views`
                          : `New comment on "${post.title}"`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Popular posts - 3 columns on larger screens */}
        <Card className="md:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Popular Posts</CardTitle>
              <CardDescription>Your most viewed content</CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Last 7 days</DropdownMenuItem>
                <DropdownMenuItem>Last 30 days</DropdownMenuItem>
                <DropdownMenuItem>All time</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>View report</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularPosts.slice(0, 3).map((post) => (
                <div key={post.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="hidden sm:block h-12 w-12 rounded bg-muted flex-shrink-0" />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium line-clamp-1">{post.title}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" /> {post.views}
                        </span>
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="h-3 w-3" /> {post.likes}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <Link href={`/admin/posts/${post.id}/edit`}>Edit</Link>
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View all posts
            </Button>
          </CardFooter>
        </Card>

        {/* Performance metrics - 2 columns on larger screens */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Performance Metrics</CardTitle>
            <CardDescription>Key metrics for your blog</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Avg. Time on Page</span>
                </div>
                <span className="font-medium">3m 24s</span>
              </div>
              <Progress value={68} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">+12% from last month</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Returning Visitors</span>
                </div>
                <span className="font-medium">42%</span>
              </div>
              <Progress value={42} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">+5% from last month</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium">Bounce Rate</span>
                </div>
                <span className="font-medium">28%</span>
              </div>
              <Progress value={28} className="h-2" />
              <p className="text-xs text-muted-foreground text-right">-3% from last month</p>
            </div>
          </CardContent>
        </Card>

        {/* Upcoming schedule - 2 columns on larger screens */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Upcoming Schedule</CardTitle>
            <CardDescription>Your planned content</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Draft Review</p>
                  <p className="text-xs text-muted-foreground">Tomorrow, 10:00 AM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-500/10">
                  <FilePenLine className="h-5 w-5 text-blue-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">New Post Publishing</p>
                  <p className="text-xs text-muted-foreground">Friday, 2:00 PM</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-green-500/10">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-medium">Monthly Analytics Review</p>
                  <p className="text-xs text-muted-foreground">Next Monday, 11:00 AM</p>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" size="sm" className="w-full">
              View calendar
            </Button>
          </CardFooter>
        </Card>

        {/* Quick actions - 2 columns on larger screens */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="h-20 flex-col gap-1 text-xs">
              <FilePenLine className="h-5 w-5" />
              New Post
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-1 text-xs">
              <FileText className="h-5 w-5" />
              Drafts
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-1 text-xs">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </Button>
            <Button variant="outline" className="h-20 flex-col gap-1 text-xs">
              <Settings className="h-5 w-5" />
              Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default withAuth(AdminDashboard)
