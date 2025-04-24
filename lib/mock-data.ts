export type Post = {
  id: string
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  publishedAt: string
  status: "published" | "draft"
  views: number
  likes: number
  comments: number
  tags: string[]
}

export type DailyStats = {
  date: string
  views: number
  visitors: number
}

export const mockPosts: Post[] = [
  {
    id: "1",
    title: "Getting Started with Next.js",
    slug: "getting-started-with-nextjs",
    excerpt: "Learn how to build modern web applications with Next.js",
    content: "Next.js is a React framework that enables server-side rendering and static site generation...",
    coverImage: "/placeholder.svg?height=400&width=600",
    publishedAt: "2023-10-15",
    status: "published",
    views: 1250,
    likes: 45,
    comments: 12,
    tags: ["Next.js", "React", "Web Development"],
  },
  {
    id: "2",
    title: "Understanding TypeScript Generics",
    slug: "understanding-typescript-generics",
    excerpt: "A deep dive into TypeScript generics and how to use them effectively",
    content: "TypeScript generics provide a way to create reusable components...",
    coverImage: "/placeholder.svg?height=400&width=600",
    publishedAt: "2023-09-22",
    status: "published",
    views: 980,
    likes: 32,
    comments: 8,
    tags: ["TypeScript", "JavaScript", "Programming"],
  },
  {
    id: "3",
    title: "Building AI-Powered Applications",
    slug: "building-ai-powered-applications",
    excerpt: "How to integrate AI capabilities into your web applications",
    content: "Artificial Intelligence is transforming how we build applications...",
    coverImage: "/placeholder.svg?height=400&width=600",
    publishedAt: "2023-11-05",
    status: "published",
    views: 2100,
    likes: 78,
    comments: 24,
    tags: ["AI", "Machine Learning", "Web Development"],
  },
  {
    id: "4",
    title: "Advanced CSS Techniques",
    slug: "advanced-css-techniques",
    excerpt: "Modern CSS techniques for creating responsive and beautiful UIs",
    content: "CSS has evolved significantly over the years...",
    coverImage: "/placeholder.svg?height=400&width=600",
    publishedAt: "2023-08-18",
    status: "draft",
    views: 0,
    likes: 0,
    comments: 0,
    tags: ["CSS", "Web Design", "Frontend"],
  },
  {
    id: "5",
    title: "Optimizing React Performance",
    slug: "optimizing-react-performance",
    excerpt: "Tips and tricks to make your React applications faster",
    content: "Performance optimization is crucial for providing a good user experience...",
    coverImage: "/placeholder.svg?height=400&width=600",
    publishedAt: "2023-10-30",
    status: "draft",
    views: 0,
    likes: 0,
    comments: 0,
    tags: ["React", "Performance", "JavaScript"],
  },
]

export const mockDailyStats: DailyStats[] = [
  { date: "2023-11-01", views: 120, visitors: 85 },
  { date: "2023-11-02", views: 145, visitors: 92 },
  { date: "2023-11-03", views: 132, visitors: 78 },
  { date: "2023-11-04", views: 160, visitors: 105 },
  { date: "2023-11-05", views: 178, visitors: 116 },
  { date: "2023-11-06", views: 195, visitors: 125 },
  { date: "2023-11-07", views: 210, visitors: 142 },
  { date: "2023-11-08", views: 198, visitors: 131 },
  { date: "2023-11-09", views: 215, visitors: 145 },
  { date: "2023-11-10", views: 230, visitors: 155 },
  { date: "2023-11-11", views: 245, visitors: 168 },
  { date: "2023-11-12", views: 260, visitors: 175 },
  { date: "2023-11-13", views: 278, visitors: 190 },
  { date: "2023-11-14", views: 290, visitors: 205 },
]

export const getPostStats = () => {
  const published = mockPosts.filter((post) => post.status === "published").length
  const drafts = mockPosts.filter((post) => post.status === "draft").length
  const totalViews = mockPosts.reduce((sum, post) => sum + post.views, 0)
  const totalLikes = mockPosts.reduce((sum, post) => sum + post.likes, 0)
  const totalComments = mockPosts.reduce((sum, post) => sum + post.comments, 0)

  return {
    published,
    drafts,
    total: published + drafts,
    views: totalViews,
    likes: totalLikes,
    comments: totalComments,
  }
}

export const getPopularPosts = () => {
  return [...mockPosts]
    .filter((post) => post.status === "published")
    .sort((a, b) => b.views - a.views)
    .slice(0, 5)
}

export const getRecentPosts = () => {
  return [...mockPosts]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 5)
}
