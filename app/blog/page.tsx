"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Calendar, Tag, Search, Clock, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import LoadingScreen from "@/components/loading-screen"
import ScrollToTop from "@/components/scroll-to-top"
import ScrollProgress from "@/components/scroll-progress"
import { Caveat } from "next/font/google"

const caveat = Caveat({ subsets: ["latin"] })

// Define a type for blog posts
interface BlogPost {
  title: string
  excerpt: string
  date: string
  image: string
  slug: string
  tags: string[]
  readTime: string
}

const blogPosts: BlogPost[] = [
  {
    title: "The Future of AI in Software Development",
    excerpt:
      "Exploring how artificial intelligence is transforming the way we build and maintain software applications.",
    date: "April 15, 2023",
    image: "/placeholder.svg?height=400&width=600",
    slug: "future-of-ai-in-software-development",
    tags: ["AI", "Software Development", "Machine Learning"],
    readTime: "5 min read",
  },
  {
    title: "Building Scalable Microservices Architecture",
    excerpt:
      "A comprehensive guide to designing and implementing microservices that can scale with your business needs.",
    date: "March 22, 2023",
    image: "/placeholder.svg?height=400&width=600",
    slug: "building-scalable-microservices-architecture",
    tags: ["Architecture", "Microservices", "System Design"],
    readTime: "8 min read",
  },
  {
    title: "Optimizing Machine Learning Models for Production",
    excerpt: "Best practices for deploying efficient and reliable machine learning models in production environments.",
    date: "February 10, 2023",
    image: "/placeholder.svg?height=400&width=600",
    slug: "optimizing-ml-models-for-production",
    tags: ["Machine Learning", "DevOps", "Performance"],
    readTime: "6 min read",
  },
  {
    title: "The Role of DevOps in Modern Software Development",
    excerpt:
      "How DevOps practices are essential for delivering high-quality software at speed in today's competitive landscape.",
    date: "January 5, 2023",
    image: "/placeholder.svg?height=400&width=600",
    slug: "role-of-devops-in-modern-software-development",
    tags: ["DevOps", "CI/CD", "Software Development"],
    readTime: "4 min read",
  },
  {
    title: "Securing Your Web Applications: Best Practices",
    excerpt:
      "Essential security measures every developer should implement to protect web applications from common vulnerabilities.",
    date: "December 12, 2022",
    image: "/placeholder.svg?height=400&width=600",
    slug: "securing-web-applications-best-practices",
    tags: ["Security", "Web Development", "Best Practices"],
    readTime: "7 min read",
  },
  {
    title: "The Impact of Blockchain on Software Architecture",
    excerpt: "Exploring how blockchain technology is influencing the design and implementation of distributed systems.",
    date: "November 8, 2022",
    image: "/placeholder.svg?height=400&width=600",
    slug: "impact-of-blockchain-on-software-architecture",
    tags: ["Blockchain", "Architecture", "Distributed Systems"],
    readTime: "9 min read",
  },
]

export default function BlogPage() {

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>(blogPosts)

  // Get all unique tags
  const allTags = Array.from(new Set(blogPosts.flatMap((post) => post.tags))).sort()

  // Handle tag selection
  const toggleTag = (tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }

  // Filter posts based on search term and selected tags
  useEffect(() => {
    const filtered = blogPosts.filter((post) => {
      const matchesSearch =
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesTags = selectedTags.length === 0 || selectedTags.some((tag) => post.tags.includes(tag))

      return matchesSearch && matchesTags
    })

    setFilteredPosts(filtered)
  }, [searchTerm, selectedTags])

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 },
    },
  }

  return (
		<main className="min-h-screen overflow-x-hidden">
			<Navbar notMain={true} />
			<ScrollProgress />

			<section className="pt-32 pb-20 bg-background relative overflow-hidden">
				{/* Background elements */}
				<div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-bl-full blur-3xl" />
				<div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-accent/5 rounded-tr-full blur-3xl" />
				<div className="absolute inset-0 bg-[url('/placeholder.svg?height=2&width=2')] bg-[length:30px_30px] opacity-[0.02] pointer-events-none" />

				<div className="container mx-auto px-4">
					{/* Header section */}
					<div className="max-w-4xl mx-auto mb-16">
						<div className="flex justify-between items-center mb-6">
							<Link href="/">
								<Button
									variant="outline"
									size="sm"
									className="hover:bg-primary hover:text-primary-foreground"
								>
									<ArrowLeft className="mr-2 h-4 w-4" />
									Back to Home
								</Button>
							</Link>
						</div>

						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="text-center"
						>
							<span className={`${caveat.className} text-accent text-xl`}>
								My Thoughts
							</span>
							<h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
								Blog & Articles
							</h1>
							<p className="text-foreground/70 max-w-2xl mx-auto">
								Insights and perspectives on software engineering, artificial
								intelligence, and emerging technologies.
							</p>
						</motion.div>
					</div>

					{/* Search and filter section */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="max-w-4xl mx-auto mb-12 bg-background/50 backdrop-blur-sm border border-border rounded-xl p-6"
					>
						<div className="relative mb-6">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-foreground/50" />
							<Input
								placeholder="Search articles..."
								className="pl-10 bg-background/50"
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
							/>
						</div>

						<div>
							<div className="flex items-center gap-2 mb-3">
								<Tag className="h-4 w-4 text-primary" />
								<h3 className="font-medium">Filter by topics</h3>
							</div>
							<div className="flex flex-wrap gap-2">
								{allTags.map((tag) => (
									<Badge
										key={tag}
										variant={selectedTags.includes(tag) ? 'default' : 'outline'}
										className={`cursor-pointer ${
											selectedTags.includes(tag)
												? 'bg-primary hover:bg-primary/80'
												: 'hover:bg-primary/10'
										}`}
										onClick={() => toggleTag(tag)}
									>
										{tag}
									</Badge>
								))}
								{selectedTags.length > 0 && (
									<Badge
										variant="secondary"
										className="cursor-pointer hover:bg-secondary/80"
										onClick={() => setSelectedTags([])}
									>
										Clear filters
									</Badge>
								)}
							</div>
						</div>
					</motion.div>

					{/* Results count */}
					<div className="max-w-6xl mx-auto mb-6 text-sm text-foreground/70">
						{filteredPosts.length === 0 ? (
							<p>No articles found. Try adjusting your filters.</p>
						) : (
							<p>
								Showing {filteredPosts.length} article
								{filteredPosts.length !== 1 ? 's' : ''}
							</p>
						)}
					</div>

					{/* Blog posts grid */}
					<motion.div
						variants={containerVariants}
						initial="hidden"
						animate="visible"
						className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
					>
						{filteredPosts.map((post) => (
							<motion.div
								key={post.slug}
								variants={itemVariants}
								className="h-full"
							>
								<Link
									href={`/blog/${post.slug}`}
									className="block h-full group"
								>
									<div className="bg-background border border-border rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:-translate-y-1">
										<div className="relative h-48 overflow-hidden">
											<Image
												src={post.image || '/placeholder.svg'}
												alt={post.title}
												fill
												className="object-cover transition-transform duration-500 group-hover:scale-105"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										</div>

										<div className="p-6 flex-grow flex flex-col">
											<div className="flex items-center justify-between text-sm mb-3">
												<div className="flex items-center text-primary/80 font-medium">
													<Calendar className="h-4 w-4 mr-1" />
													<span>{post.date}</span>
												</div>
												<div className="flex items-center text-foreground/60">
													<Clock className="h-4 w-4 mr-1" />
													<span>{post.readTime}</span>
												</div>
											</div>

											<h3 className="text-xl font-bold mb-3 line-clamp-2 group-hover:text-accent/80 transition-colors">
												{post.title}
											</h3>

											<p className="text-foreground/70 mb-4 line-clamp-2 text-sm">
												{post.excerpt}
											</p>

											<div className="flex flex-wrap gap-2 mt-auto mb-4">
												{post.tags.slice(0, 2).map((tag, tagIndex) => (
													<span
														key={tagIndex}
														className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
													>
														{tag}
													</span>
												))}
												{post.tags.length > 2 && (
													<span className="px-2 py-1 bg-secondary/50 text-foreground/70 text-xs rounded-full">
														+{post.tags.length - 2}
													</span>
												)}
											</div>

											<div className="text-foreground/80 group-hover:text-accent font-medium text-sm flex items-center group-hover:translate-x-1 transition-transform">
												Read Article
												<ArrowRight className="ml-1 h-4 w-4" />
											</div>
										</div>
									</div>
								</Link>
							</motion.div>
						))}
					</motion.div>

					{/* Empty state */}
					{filteredPosts.length === 0 && (
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="max-w-md mx-auto text-center py-16 bg-background/50 backdrop-blur-sm border border-border rounded-xl mt-8"
						>
							<div className="inline-block p-4 rounded-full bg-primary/10 mb-4">
								<Search className="h-8 w-8 text-primary" />
							</div>
							<h3 className="text-xl font-bold mb-2">No articles found</h3>
							<p className="text-foreground/70 mb-6">
								Try adjusting your search or filter criteria to find what you're
								looking for.
							</p>
							<Button
								onClick={() => {
									setSearchTerm('');
									setSelectedTags([]);
								}}
							>
								Reset filters
							</Button>
						</motion.div>
					)}
				</div>
			</section>

			<Footer />
			<ScrollToTop />
		</main>
	);
}
