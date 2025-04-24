"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, ImageIcon, Loader2, Link2, Info, Tag, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"
import { withAuth } from '@/hooks/use-auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RichTextEditor } from "@/components/admin/rich-text-editor"

function CreatePostPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [title, setTitle] = useState("")
  const [slug, setSlug] = useState("")
  const [excerpt, setExcerpt] = useState("")
  const [content, setContent] = useState("")
  const [coverImage, setCoverImage] = useState("/placeholder.svg?height=400&width=600")
  const [status, setStatus] = useState("draft")
  const [tags, setTags] = useState("")

  // SEO fields
  const [metaTitle, setMetaTitle] = useState("")
  const [metaDescription, setMetaDescription] = useState("")
  const [canonicalUrl, setCanonicalUrl] = useState("")
  const [keywords, setKeywords] = useState("")
  const [ogTitle, setOgTitle] = useState("")
  const [ogDescription, setOgDescription] = useState("")
  const [ogImage, setOgImage] = useState("/placeholder.svg?height=630&width=1200")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // In a real app, this would be an API call
      await new Promise((resolve) => setTimeout(resolve, 1000))

      toast({
        title: "Post created",
        description: "Your post has been created successfully.",
      })
      router.push("/admin/posts")
    } catch (error) {
      toast({
        title: "Error",
        description: "An error occurred while creating the post.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const generateSlug = () => {
    setSlug(
      title
        .toLowerCase()
        .replace(/[^\w\s]/gi, "")
        .replace(/\s+/g, "-"),
    )
  }

  const handleCoverImageClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // In a real app, you would upload the file to a server
      // For now, we'll just create a local URL
      const url = URL.createObjectURL(file)
      setCoverImage(url)

      // Also update OG image if it's still the default
      if (ogImage.includes("placeholder.svg")) {
        setOgImage(url)
      }
    }
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Create New Post</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="mb-6 w-full justify-start overflow-x-auto">
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO & Meta</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-6 md:col-span-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter post title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onBlur={generateSlug}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="slug"
                      placeholder="enter-post-slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={generateSlug}
                      className="whitespace-nowrap"
                    >
                      Generate
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt</Label>
                  <Textarea
                    id="excerpt"
                    placeholder="Brief description of the post"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    required
                    className="min-h-[100px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <RichTextEditor value={content} onChange={setContent} placeholder="Write your post content here..." />
                </div>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardContent className="p-4">
                    <div className="space-y-2">
                      <Label>Cover Image</Label>
                      <div
                        className="relative aspect-video overflow-hidden rounded-md border border-dashed border-muted-foreground/25 cursor-pointer"
                        onClick={handleCoverImageClick}
                      >
                        <img
                          src={coverImage || "/placeholder.svg"}
                          alt="Cover"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 transition-opacity hover:bg-black/10">
                          <Button variant="secondary" size="sm" className="gap-1.5">
                            <ImageIcon className="h-4 w-4" />
                            Change Cover
                          </Button>
                        </div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleFileChange}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Recommended size: 1200x630 pixels</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="published">Published</SelectItem>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="scheduled">Scheduled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="tags">Tags (comma separated)</Label>
                      <Input
                        id="tags"
                        placeholder="nextjs, react, tutorial"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-3">
              <div className="space-y-6 md:col-span-2">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="metaTitle">Meta Title</Label>
                    <div className="text-xs text-muted-foreground">(Recommended: 50-60 characters)</div>
                  </div>
                  <Input
                    id="metaTitle"
                    placeholder="SEO optimized title"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                  />
                  <div className="text-xs text-muted-foreground text-right">{metaTitle.length}/60 characters</div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="metaDescription">Meta Description</Label>
                    <div className="text-xs text-muted-foreground">(Recommended: 150-160 characters)</div>
                  </div>
                  <Textarea
                    id="metaDescription"
                    placeholder="Brief SEO description for search engines"
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="min-h-[100px]"
                  />
                  <div className="text-xs text-muted-foreground text-right">
                    {metaDescription.length}/160 characters
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords</Label>
                  <Input
                    id="keywords"
                    placeholder="SEO keywords (comma separated)"
                    value={keywords}
                    onChange={(e) => setKeywords(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label htmlFor="canonicalUrl">Canonical URL</Label>
                    <Link2 className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <Input
                    id="canonicalUrl"
                    placeholder="https://example.com/canonical-page"
                    value={canonicalUrl}
                    onChange={(e) => setCanonicalUrl(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-6">
                <Card>
                  <CardContent className="p-4 space-y-4">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4" />
                      <h3 className="font-medium">Social Media Preview</h3>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogTitle">OG Title</Label>
                      <Input
                        id="ogTitle"
                        placeholder="Title for social media"
                        value={ogTitle}
                        onChange={(e) => setOgTitle(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="ogDescription">OG Description</Label>
                      <Textarea
                        id="ogDescription"
                        placeholder="Description for social media"
                        value={ogDescription}
                        onChange={(e) => setOgDescription(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label>OG Image</Label>
                      <div
                        className="relative aspect-[1.91/1] overflow-hidden rounded-md border border-dashed border-muted-foreground/25 cursor-pointer"
                        onClick={() => document.getElementById("ogImageInput")?.click()}
                      >
                        <img
                          src={ogImage || "/placeholder.svg"}
                          alt="OG Image"
                          className="h-full w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/5 transition-opacity hover:bg-black/10">
                          <Button variant="secondary" size="sm" className="gap-1.5">
                            <ImageIcon className="h-4 w-4" />
                            Change Image
                          </Button>
                        </div>
                        <input
                          id="ogImageInput"
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0]
                            if (file) {
                              const url = URL.createObjectURL(file)
                              setOgImage(url)
                            }
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Recommended size: 1200x630 pixels</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <Info className="h-4 w-4 text-blue-500" />
                      <h3 className="font-medium">SEO Tips</h3>
                    </div>
                    <ul className="text-xs space-y-2 text-muted-foreground">
                      <li>• Use keywords naturally in your title and description</li>
                      <li>• Keep meta titles under 60 characters</li>
                      <li>• Keep meta descriptions under 160 characters</li>
                      <li>• Use unique, descriptive titles for each page</li>
                      <li>• Include a call-to-action in your meta description</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-medium">Publishing Settings</h3>

                  <div className="space-y-2">
                    <Label htmlFor="publishDate">Publish Date</Label>
                    <Input id="publishDate" type="datetime-local" className="w-full" />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Author</Label>
                    <Select defaultValue="current">
                      <SelectTrigger>
                        <SelectValue placeholder="Select author" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="current">Current User</SelectItem>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="editor">Editor</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 space-y-4">
                  <h3 className="font-medium">Categories</h3>

                  <div className="space-y-2">
                    <Label htmlFor="category">Primary Category</Label>
                    <Select defaultValue="uncategorized">
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="uncategorized">Uncategorized</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="design">Design</SelectItem>
                        <SelectItem value="development">Development</SelectItem>
                        <SelectItem value="business">Business</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="tags">Tags</Label>
                      <Tag className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <Input
                      id="tags"
                      placeholder="nextjs, react, tutorial"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">Separate tags with commas</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {status === "published" ? "Publish Post" : status === "scheduled" ? "Schedule Post" : "Save as Draft"}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  )
}

export default withAuth(CreatePostPage)
