"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Search, ArrowUpDown, Plus, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { mockPosts, type Post } from "@/lib/mock-data"
import { withAuth } from '@/hooks/use-auth';
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PostActions } from "@/components/admin/post-actions"

function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "ascending" | "descending" }>({
    key: "publishedAt",
    direction: "descending",
  })
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [postToDelete, setPostToDelete] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    // In a real app, this would be an API call
    setPosts(mockPosts)
  }, [])

  const filteredPosts = posts
    .filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesStatus = statusFilter === "all" || post.status === statusFilter
      return matchesSearch && matchesStatus
    })
    .sort((a, b) => {
      if (sortConfig.key === "title") {
        return sortConfig.direction === "ascending" ? a.title.localeCompare(b.title) : b.title.localeCompare(a.title)
      }
      if (sortConfig.key === "views") {
        return sortConfig.direction === "ascending" ? a.views - b.views : b.views - a.views
      }
      // Default sort by date
      const dateA = new Date(a.publishedAt).getTime()
      const dateB = new Date(b.publishedAt).getTime()
      return sortConfig.direction === "ascending" ? dateA - dateB : dateB - dateA
    })

  const handleDeletePost = (id: string) => {
    setPostToDelete(id)
    setDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (postToDelete) {
      // In a real app, this would be an API call
      setPosts(posts.filter((post) => post.id !== postToDelete))
      toast({
        title: "Post deleted",
        description: "The post has been successfully deleted.",
      })
      setDeleteDialogOpen(false)
      setPostToDelete(null)
    }
  }

  const handleSort = (key: string) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === "ascending" ? "descending" : "ascending",
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Posts</h1>
          <p className="text-muted-foreground">Manage your blog posts</p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/create">
            <Plus className="mr-2 h-4 w-4" />
            Create New Post
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Posts Management</CardTitle>
          <CardDescription>
            You have {posts.length} posts in total. {posts.filter((p) => p.status === "published").length} published and{" "}
            {posts.filter((p) => p.status === "draft").length} drafts.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 sm:flex-row mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search posts..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Posts</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="draft">Drafts</SelectItem>
                </SelectContent>
              </Select>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon" className="h-10 w-10">
                    <Filter className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Filter by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Date: Last 7 days</DropdownMenuItem>
                  <DropdownMenuItem>Date: Last 30 days</DropdownMenuItem>
                  <DropdownMenuItem>Author: All</DropdownMenuItem>
                  <DropdownMenuItem>Category: All</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[40%] cursor-pointer" onClick={() => handleSort("title")}>
                      <div className="flex items-center">
                        Title
                        {sortConfig.key === "title" && (
                          <ArrowUpDown
                            className={`ml-1 h-3 w-3 ${sortConfig.direction === "ascending" ? "rotate-180" : ""}`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="hidden sm:table-cell">Status</TableHead>
                    <TableHead
                      className="hidden sm:table-cell cursor-pointer"
                      onClick={() => handleSort("publishedAt")}
                    >
                      <div className="flex items-center">
                        Date
                        {sortConfig.key === "publishedAt" && (
                          <ArrowUpDown
                            className={`ml-1 h-3 w-3 ${sortConfig.direction === "ascending" ? "rotate-180" : ""}`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead
                      className="hidden sm:table-cell text-center cursor-pointer"
                      onClick={() => handleSort("views")}
                    >
                      <div className="flex items-center justify-center">
                        Views
                        {sortConfig.key === "views" && (
                          <ArrowUpDown
                            className={`ml-1 h-3 w-3 ${sortConfig.direction === "ascending" ? "rotate-180" : ""}`}
                          />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No posts found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredPosts.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell>
                          <div className="font-medium">{post.title}</div>
                          <div className="text-sm text-muted-foreground line-clamp-1 hidden sm:block">
                            {post.excerpt}
                          </div>
                          <div className="sm:hidden">
                            <Badge
                              variant={post.status === "published" ? "success" : "warning"}
                              className={`${
                                post.status === "published"
                                  ? "bg-green-100 text-green-800 hover:bg-green-200"
                                  : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                              } mt-1`}
                            >
                              {post.status}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <Badge
                            variant={post.status === "published" ? "success" : "warning"}
                            className={`${
                              post.status === "published"
                                ? "bg-green-100 text-green-800 hover:bg-green-200"
                                : "bg-amber-100 text-amber-800 hover:bg-amber-200"
                            }`}
                          >
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="text-sm text-muted-foreground">{post.publishedAt}</div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-center">
                          <div className="text-sm">{post.views.toLocaleString()}</div>
                        </TableCell>
                        <TableCell>
                          <PostActions post={post} onDelete={() => handleDeletePost(post.id)} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the post.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={confirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default withAuth(PostsPage)
