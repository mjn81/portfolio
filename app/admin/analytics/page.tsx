"use client"

import { useState, useEffect } from "react"
import { Calendar, ChevronDown, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
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
import { mockDailyStats, mockPosts } from "@/lib/mock-data"
import { withAuth } from "@/hooks/use-auth"

function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("Last 14 Days")
  const [windowWidth, setWindowWidth] = useState(0)

  // Handle window resize for responsive charts
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }

    // Set initial width
    setWindowWidth(window.innerWidth)

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  // Calculate tag distribution
  const tagCounts: Record<string, number> = {}
  mockPosts.forEach((post) => {
    post.tags.forEach((tag) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1
    })
  })

  const tagData = Object.entries(tagCounts).map(([name, value]) => ({ name, value }))

  // Calculate post performance
  const postPerformance = mockPosts
    .filter((post) => post.status === "published")
    .slice(0, 5)
    .map((post) => ({
      name: post.title.length > 20 ? post.title.substring(0, 20) + "..." : post.title,
      views: post.views,
      likes: post.likes,
      comments: post.comments,
    }))

  return (
    <div className="space-y-6">
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
                {timeRange}
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTimeRange("Last 7 Days")}>Last 7 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("Last 14 Days")}>Last 14 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("Last 30 Days")}>Last 30 Days</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTimeRange("Last 90 Days")}>Last 90 Days</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button variant="outline" className="gap-1">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Total Page Views</CardTitle>
            <CardDescription>Across all blog posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {mockPosts.reduce((sum, post) => sum + post.views, 0).toLocaleString()}
            </div>
            <div className="mt-4 h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockDailyStats}>
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
                  <Line
                    type="monotone"
                    dataKey="views"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Unique Visitors</CardTitle>
            <CardDescription>Daily unique visitors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {mockDailyStats.reduce((sum, day) => sum + day.visitors, 0).toLocaleString()}
            </div>
            <div className="mt-4 h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockDailyStats}>
                  <defs>
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
                  <Area
                    type="monotone"
                    dataKey="visitors"
                    stroke="#82ca9d"
                    fillOpacity={1}
                    fill="url(#colorVisitors)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Content Categories</CardTitle>
            <CardDescription>Distribution of post tags</CardDescription>
          </CardHeader>
          <CardContent>
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
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                  />
                  <Tooltip content={<ChartTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Post Performance</CardTitle>
          <CardDescription>Comparison of views, likes, and comments across top posts</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height="100%" minWidth={windowWidth < 768 ? 500 : "100%"}>
              <BarChart data={postPerformance}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.2} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar dataKey="views" fill="#8884d8" name="Views" />
                <Bar dataKey="likes" fill="#82ca9d" name="Likes" />
                <Bar dataKey="comments" fill="#ffc658" name="Comments" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Traffic Sources</CardTitle>
          <CardDescription>Where your visitors are coming from</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full overflow-x-auto">
            <ResponsiveContainer width="100%" height="100%" minWidth={windowWidth < 768 ? 400 : "100%"}>
              <BarChart
                layout="vertical"
                data={[
                  { name: "Direct", value: 4000 },
                  { name: "Search", value: 3000 },
                  { name: "Social", value: 2000 },
                  { name: "Referral", value: 1500 },
                  { name: "Email", value: 1000 },
                  { name: "Other", value: 500 },
                ]}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.2} />
                <XAxis type="number" />
                <YAxis dataKey="name" type="category" width={80} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="value" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default withAuth(AnalyticsPage)
