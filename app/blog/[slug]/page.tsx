"use client"

import React, { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Clock, Tag, Share2, Bookmark, ChevronRight, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Navbar from "@/components/navbar"
import ScrollToTop from "@/components/scroll-to-top"
import ScrollProgress from "@/components/scroll-progress"
import { Caveat } from "next/font/google"
import { Skeleton } from "@/components/ui/skeleton"
import { Post } from "@/types/post"
import { User } from "@/hooks/use-auth"
import { Tag as TagType } from "@/types/tag"
import { useToast } from "@/components/ui/use-toast"
import { Marked } from 'marked'
import { markedHighlight } from "marked-highlight"
import hljs from 'highlight.js'
// import 'highlight.js/styles/github-dark.css'
import 'highlight.js/styles/atom-one-dark.css'

const caveat = Caveat({ subsets: ["latin"] })

interface BlogPostData extends Omit<Post, 'author' | 'tags'> {
    author: User | null;
    tags: TagType[];
}

function PostSkeleton() {
  return (
    <div className="pt-32 pb-20 relative overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-3xl mx-auto mb-8">
          <Skeleton className="h-5 w-48 mb-6" />
          <Skeleton className="h-9 w-36" />
        </div>

        <div className="max-w-5xl mx-auto mb-16 relative rounded-2xl overflow-hidden shadow-lg">
          <Skeleton className="h-[50vh] md:h-[60vh] w-full" />
          <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
            <div className="flex flex-wrap gap-2 mb-6">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
            <Skeleton className="h-10 md:h-14 w-3/4 mb-6" />
            <div className="flex flex-wrap items-center gap-6">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-5 w-20" />
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-5 p-6 bg-card/50 border border-border rounded-xl mb-12">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>

          <div className="prose prose-lg dark:prose-invert max-w-none mx-auto mb-16 space-y-6">
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-11/12" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-48 w-full rounded-xl" />
            <Skeleton className="h-6 w-full" />
            <Skeleton className="h-6 w-5/6" />
          </div>
        </div>
      </div>
    </div>
  )
}

function PostError({ message }: { message: string }) {
  const router = useRouter()
  return (
    <div className="pt-32 pb-20 flex items-center justify-center min-h-[80vh]">
      <div className="flex flex-col items-center gap-4 text-center p-6 border rounded-lg bg-card">
        <AlertCircle className="h-12 w-12 text-destructive" />
        <h2 className="text-2xl font-semibold">Could Not Load Post</h2>
        <p className="text-muted-foreground">{message || "An unexpected error occurred."}</p>
        <Button onClick={() => router.push('/blog')}>Back to Blog</Button>
      </div>
    </div>
  )
}

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params?.slug as string
  const { toast } = useToast()

  const [post, setPost] = useState<BlogPostData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const articleRef = useRef<HTMLElement>(null)
  const [activeHeadingId, setActiveHeadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) {
      setError("Post slug is missing.")
      setIsLoading(false)
      return
    }

    const fetchPost = async () => {
      setIsLoading(true)
      setError(null)
      try {
        const response = await fetch(`/api/posts/slug/${slug}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Post not found.")
          }
          throw new Error("Failed to fetch post data.")
        }
        const data = await response.json() as BlogPostData
        setPost(data)
      } catch (err: any) {
        console.error("Error fetching post:", err)
        setError(err.message || "An error occurred while loading the post.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchPost()
  }, [slug])

  useEffect(() => {
    // Initial scroll to hash if present
    if (!isLoading && !error && post && window.location.hash) {
      const hash = window.location.hash.substring(1);
      if (hash) {
        setTimeout(() => {
          const element = document.getElementById(hash);
          if (element) {
            element.scrollIntoView({ behavior: "smooth", block: "start" });
            setActiveHeadingId(hash); // Set initial active heading
            // element.classList.add("target-highlight");
            // setTimeout(() => element.classList.remove("target-highlight"), 2000);
          }
        }, 100); // Increased timeout slightly for safety with IntersectionObserver setup
      }
    }
  }, [isLoading, error, post, slug]);

  useEffect(() => {
    // Scroll-spying for headings
    if (isLoading || error || !post || !articleRef.current) return;

    const headingElements = Array.from(
      articleRef.current.querySelectorAll("h1[id], h2[id], h3[id]")
    ) as HTMLElement[];

    if (headingElements.length === 0) return;

    let currentHighlightedElement: HTMLElement | null = null;

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach(entry => {
        const id = entry.target.id;
        if (entry.isIntersecting) {
          // Update URL if this heading is the topmost visible one
          // This simple check takes the first one that becomes visible as active.
          // More complex logic could be used to find the "most" visible.
          if (id !== activeHeadingId) {
             // Update activeHeadingId state, which will trigger re-render for highlighting
            setActiveHeadingId(id);
            // Update URL hash without reloading or pushing to history stack
            history.replaceState(null, "", `#${id}`);
          }
        }
      });
      // After processing all entries, update highlight based on activeHeadingId
      headingElements.forEach(heading => {
        if (heading.id === activeHeadingId) {
          if (heading !== currentHighlightedElement) {
            currentHighlightedElement?.classList.remove("target-highlight");
            heading.classList.add("target-highlight");
            currentHighlightedElement = heading;
          }
        } else {
          heading.classList.remove("target-highlight");
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, {
      rootMargin: "-20% 0px -70% 0px", // Trigger when heading is in the middle 50% of the viewport
      threshold: 0.5, // Trigger when 50% of the element is visible
    });

    headingElements.forEach(element => observer.observe(element));

    return () => {
      observer.disconnect();
      headingElements.forEach(heading => heading.classList.remove("target-highlight"));
      currentHighlightedElement = null;
    };
  }, [isLoading, error, post, activeHeadingId]); // Add activeHeadingId to dependencies

  const handleShare = async () => {
    console.log("handleShare called");
    if (!post) {
      console.log("handleShare aborted: post is null");
      return;
    }
    console.log("Share Data:", { title: post.title, url: window.location.href });

    const shareData = {
      title: post.title,
      text: post.excerpt || `Check out this article: ${post.title}`,
      url: window.location.href,
    };

    if (typeof navigator.share === 'function') {
      console.log("Attempting navigator.share");
      try {
        await navigator.share(shareData);
        console.log("navigator.share successful");
        toast({ title: "Shared successfully!" });
      } catch (error) {
        console.error('Error sharing:', error);
        if ((error as Error).name !== 'AbortError') {
          console.log("Share failed, attempting clipboard fallback.");
          try {
            await navigator.clipboard.writeText(window.location.href);
            console.log("Clipboard write successful");
            toast({ title: "Sharing failed, URL Copied!", description: "Link copied to clipboard instead.", variant: "default" });
          } catch (copyError) {
            console.error('Error copying URL after share failure:', copyError);
            toast({ title: "Could not share or copy URL", variant: "destructive" });
          }
        } else {
          console.log("Share cancelled by user (AbortError).");
        }
      }
    } else {
      console.log("navigator.share not supported, attempting clipboard.");
      try {
        await navigator.clipboard.writeText(window.location.href);
        console.log("Clipboard write successful (fallback)");
        toast({ title: "URL Copied!", description: "Link copied to clipboard (Web Share not supported)." });
      } catch (error) {
        console.error('Error copying URL (fallback):', error);
        toast({ title: "Could not copy URL", variant: "destructive" });
      }
    }
  };

  const handleBookmark = () => {
    console.log("handleBookmark called");
    if (!post) {
      console.log("handleBookmark aborted: post is null");
      return;
    }
    const bookmarkKey = navigator.userAgent.includes("Mac") ? "Cmd+D" : "Ctrl+D";
    console.log("Showing bookmark toast for key:", bookmarkKey);
    toast({
      title: "Bookmark this page",
      description: `Press ${bookmarkKey} to add this page to your bookmarks.`,
      duration: 5000,
    });
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <PostSkeleton />
        <ScrollToTop />
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <PostError message={error} />
        <ScrollToTop />
      </main>
    )
  }

  if (!post) {
    return (
      <main className="min-h-screen bg-background">
        <Navbar />
        <PostError message={"Post data could not be loaded."} />
        <ScrollToTop />
      </main>
    )
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'Date unavailable'
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric'
      })
    } catch (e) {
      return 'Invalid Date'
    }
  }

  // Create and configure a Marked instance
  const markedInstance = new Marked(
    markedHighlight({
      langPrefix: 'hljs language-', // CSS class prefix for compatibility
      highlight(code: string, lang: string) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
      }
    })
  );

  // Parse markdown content using the configured instance
  const parsedContent = post.content ? markedInstance.parse(post.content) as string : '';

  return (
		<main className="min-h-screen bg-background">
			<Navbar />
			<ScrollProgress />

			<article
				ref={articleRef}
				className="pt-32 pb-20 relative overflow-hidden"
			>
				<div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-bl-full blur-3xl" />
				<div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-accent/5 rounded-tr-full blur-3xl" />
				<div className="absolute inset-0 bg-[url('/placeholder.svg?height=2&width=2')] bg-[length:30px_30px] opacity-[0.02] pointer-events-none" />

				<div className="container mx-auto px-4 sm:px-6">
					<div className="max-w-3xl mx-auto mb-8">
						<nav className="flex items-center text-sm text-muted-foreground mb-6">
							<Link href="/" className="hover:text-primary transition-colors">
								Home
							</Link>
							<ChevronRight className="h-4 w-4 mx-2" />
							<Link
								href="/blog"
								className="hover:text-primary transition-colors"
							>
								Blog
							</Link>
							<ChevronRight className="h-4 w-4 mx-2" />
							<span className="text-foreground font-medium truncate">
								{post.title}
							</span>
						</nav>

						<Link href="/blog">
							<Button
								variant="outline"
								size="sm"
								className="hover:bg-primary hover:text-primary-foreground"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Blog
							</Button>
						</Link>
					</div>

					<div className="max-w-5xl mx-auto mb-16 relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/5">
						<motion.div
							initial={{ opacity: 0, scale: 1.05 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.7 }}
							className="relative h-[50vh] md:h-[60vh]"
						>
							<Image
								src={post.image || '/placeholder.svg'}
                alt={post.image_alt_text || post.title}
								fill
								className="object-cover"
								priority
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
						</motion.div>

						<div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
							>
								<div className="flex flex-wrap gap-2 mb-6">
									{post.tags.map((tag) => (
										<Badge
                      key={tag.id}
											className="bg-primary/90 hover:bg-primary text-white text-xs px-3 py-1"
										>
                      {tag.name}
										</Badge>
									))}
								</div>

								<h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-foreground drop-shadow-sm leading-tight tracking-tight">
									{post.title}
								</h1>

								<div className="flex flex-wrap items-center gap-6 text-sm text-foreground/90">
									<div className="flex items-center">
										<Calendar className="h-4 w-4 mr-2" />
                    {formatDate(post.published_at)}
									</div>
									<div className="flex items-center">
										<Clock className="h-4 w-4 mr-2" />
                    {post.read_time || '-'}
									</div>
								</div>
							</motion.div>
						</div>
					</div>

					<div className="max-w-3xl mx-auto">
            {post.author && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.3 }}
							className="flex items-center gap-5 p-6 bg-card/50 backdrop-blur-sm border border-border rounded-xl mb-12 shadow-lg"
						>
							<Avatar className="h-16 w-16 border-2 border-primary/20">
								<AvatarImage
									src={post.author.avatar || '/placeholder.svg'}
                    alt={post.author.name || 'Author'}
								/>
                  <AvatarFallback>{(post.author.name || 'A').charAt(0)}</AvatarFallback>
							</Avatar>
							<div>
                  <h3 className="font-bold text-lg">{post.author.name || 'Author Name'}</h3>
                  {post.author.role && <p className="text-muted-foreground text-sm">{post.author.role}</p>}
							</div>
							<div className="ml-auto flex gap-2">
								<Button
									variant="ghost"
									size="icon"
									className="rounded-full hover:bg-accent/10 hover:text-accent"
                    onClick={handleShare}
                    aria-label="Share post"
								>
									<Share2 className="h-5 w-5" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="rounded-full hover:bg-primary/10 hover:text-primary"
                    onClick={handleBookmark}
                    aria-label="Bookmark post"
								>
									<Bookmark className="h-5 w-5" />
								</Button>
							</div>
						</motion.div>
            )}

						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.4 }}
							className="prose prose-lg dark:prose-invert max-w-none mx-auto mb-16"
						>
							<div
								className="prose-headings:font-semibold prose-headings:text-foreground prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:text-lg prose-p:mb-6 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-ul:text-foreground/80 prose-ul:mb-6 prose-li:mb-2 prose-li:text-lg"
                dangerouslySetInnerHTML={{ __html: parsedContent }}
							/>
						</motion.div>

					</div>
				</div>
			</article>

			<ScrollToTop />
		</main>
  )
}
