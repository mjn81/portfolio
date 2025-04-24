'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
	ArrowLeft,
	Calendar,
	Tag,
	Search,
	Clock,
	ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import LoadingScreen from '@/components/loading-screen';
import ScrollToTop from '@/components/scroll-to-top';
import ScrollProgress from '@/components/scroll-progress';
import { Caveat } from 'next/font/google';
import { Skeleton } from '@/components/ui/skeleton';

const caveat = Caveat({ subsets: ['latin'] });

// Animation variants
const containerVariants = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const itemVariants = {
	hidden: { opacity: 0, y: 20 },
	visible: {
		opacity: 1,
		y: 0,
		transition: { duration: 0.5 },
	},
};

// Define a type for blog posts
interface BlogPost {
	id: string;
	title: string;
	excerpt: string;
	date: string;
	image: string;
	slug: string;
	tags: string[];
	readTime?: string;
}

interface PaginationData {
	page: number;
	limit: number;
	total: number;
	totalPages: number;
	hasMore: boolean;
}

interface Tag {
	name: string;
	slug: string;
}

export default function BlogPage() {
	// Loading state
	const [initialLoading, setInitialLoading] = useState(true);
	const [loading, setLoading] = useState(false);

	// Posts and pagination state
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [pagination, setPagination] = useState<PaginationData>({
		page: 1,
		limit: 9,
		total: 0,
		totalPages: 0,
		hasMore: false,
	});

	// Search and filter states
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
	const [allTags, setAllTags] = useState<Tag[]>([]);
	const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);

	// Fetch posts with pagination and filters
	const fetchPosts = async (reset = false) => {
		const currentPage = reset ? 1 : pagination.page;

		if (reset) {
			setLoading(true);
		}

		try {
			const queryParams = new URLSearchParams({
				page: currentPage.toString(),
				limit: pagination.limit.toString(),
				status: 'published', // Only fetch published posts
				sortBy: 'date',
				sortOrder: 'desc',
			});

			if (searchTerm) queryParams.append('search', searchTerm);

			// Add all selected tags
			selectedTags.forEach((tag) => {
				queryParams.append('tag', tag.slug);
			});

			const response = await fetch(`/api/posts?${queryParams.toString()}`);
			const data = await response.json();

			if (reset) {
				setPosts(data.data);
			} else {
				setPosts((prev) => [...prev, ...data.posts]);
			}

			setPagination(data.meta);
		} catch (error) {
			console.error('Error fetching posts:', error);
		} finally {
			setLoading(false);
			if (initialLoading) setInitialLoading(false);
		}
	};


	const fetchTags = async () => {
		try {
			const response = await fetch('/api/tags');
			const data = await response.json();
			setAllTags(data.map((tag: { name: string, slug:string }) => ({name: tag.name, slug: tag.slug})));
		} catch (error) {
			console.error('Error fetching tags:', error);
		}
	}

	// Initial fetch
	useEffect(() => {
		fetchPosts(true);
		fetchTags();
	}, []);

	// Handle search with debounce
	useEffect(() => {
		if (searchTimeoutRef.current) {
			clearTimeout(searchTimeoutRef.current);
		}

		searchTimeoutRef.current = setTimeout(() => {
			fetchPosts(true);
		}, 500);

		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
		};
	}, [searchTerm, selectedTags]);

	// Handle tag selection
	const toggleTag = (tag: Tag) => {
		setSelectedTags((prev) =>
			prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
		);
	};

	// Load more posts
	const loadMorePosts = () => {
		if (pagination.hasMore && !loading) {
			setPagination((prev) => ({ ...prev, page: prev.page + 1 }));
			fetchPosts(false);
		}
	};

	return (
		<main className="min-h-screen">
			<Navbar />
			<ScrollProgress />

			<section className="pt-32 pb-20 bg-background relative overflow-hidden">
				{/* Background elements */}
				<div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-bl-full blur-3xl" />
				<div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-accent/5 rounded-tr-full blur-3xl" />
				<div className="absolute inset-0 bg-[url('/placeholder.svg?height=2&width=2')] bg-[length:30px_30px] opacity-[0.02]" />

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
								{allTags.length === 0 && !initialLoading ? (
									<p className="text-sm text-muted-foreground">
										No tags available
									</p>
								) : initialLoading ? (
									Array(5)
										.fill(0)
										.map((_, i) => (
											<Skeleton key={i} className="h-6 w-16 rounded-full" />
										))
								) : (
									allTags.map((tag) => (
										<Badge
											key={tag.slug}
											variant={
												selectedTags.includes(tag) ? 'default' : 'outline'
											}
											className={`cursor-pointer ${
												selectedTags.includes(tag)
													? 'bg-primary hover:bg-primary/80'
													: 'hover:bg-primary/10'
											}`}
											onClick={() => toggleTag(tag)}
										>
											{tag.name}
										</Badge>
									))
								)}
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
						{loading && pagination.page === 1 ? (
							<Skeleton className="h-4 w-40" />
						) : posts.length === 0 ? (
							<p>No articles found. Try adjusting your filters.</p>
						) : (
							<p>
								Showing {posts.length} of {pagination.total} article
								{pagination.total !== 1 ? 's' : ''}
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
						{loading && pagination.page === 1
							? // Skeleton loading for initial load
							  Array(6)
									.fill(0)
									.map((_, index) => (
										<div
											key={`skeleton-${index}`}
											className="bg-background border border-border rounded-xl overflow-hidden h-full"
										>
											<Skeleton className="h-48 w-full" />
											<div className="p-6 space-y-4">
												<div className="flex justify-between">
													<Skeleton className="h-4 w-24" />
													<Skeleton className="h-4 w-16" />
												</div>
												<Skeleton className="h-6 w-full" />
												<Skeleton className="h-4 w-3/4" />
												<div className="flex gap-2 pt-2">
													<Skeleton className="h-6 w-16 rounded-full" />
													<Skeleton className="h-6 w-16 rounded-full" />
												</div>
											</div>
										</div>
									))
							: posts.map((post) => (
									<motion.div
										key={post.id}
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
														<div className="flex items-center text-primary font-medium">
															<Calendar className="h-4 w-4 mr-1" />
															<span>{post.date}</span>
														</div>
														<div className="flex items-center text-foreground/60">
															<Clock className="h-4 w-4 mr-1" />
															<span>{post.readTime || '5 min read'}</span>
														</div>
													</div>

													<h3 className="text-xl font-bold mb-3 line-clamp-2 title-fill-animation">
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

													<div className="text-primary font-medium text-sm flex items-center group-hover:translate-x-1 transition-transform">
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
					{!loading && posts.length === 0 && (
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

					{/* Load more button */}
					{pagination.hasMore && posts.length > 0 && (
						<div className="flex justify-center mt-12">
							<Button
								variant="outline"
								size="lg"
								onClick={loadMorePosts}
								disabled={loading}
								className="min-w-[200px]"
							>
								{loading ? (
									<div className="flex items-center">
										<div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
										Loading...
									</div>
								) : (
									<>Load More Articles</>
								)}
							</Button>
						</div>
					)}
				</div>
			</section>

			<Footer />
			<ScrollToTop />
		</main>
	);
}
