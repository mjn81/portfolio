'use client';

import { motion } from 'framer-motion';
import { Caveat } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const caveat = Caveat({ subsets: ['latin'] });

interface BlogPost {
	id: string;
	title: string;
	excerpt: string | null;
	image: string | null;
	slug: string;
	tags: string[];
	published_at: string | null;
	read_time: string | null;
}

const BlogSection = () => {
	const [posts, setPosts] = useState<BlogPost[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchLatestPosts = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch('/api/posts?limit=3&status=published&sort=published_at&order=desc');
				if (!response.ok) {
					throw new Error('Failed to fetch posts');
				}
				const data = await response.json();
				setPosts(data.data || []);
			} catch (err: any) {
				console.error("Error fetching latest posts:", err);
				setError(err.message || 'Could not load articles.');
			} finally {
				setIsLoading(false);
			}
		};

		fetchLatestPosts();
	}, []);

	const formatDate = (dateString: string | null | undefined) => {
		if (!dateString) return null;
		try {
			return new Date(dateString).toLocaleDateString('en-US', {
				year: 'numeric', month: 'long', day: 'numeric'
			});
		} catch (e) {
			return 'Invalid Date';
		}
	};

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

	return (
		<section className="py-20 bg-background/50 relative overflow-hidden">
			{/* Background elements */}
			<div className="absolute pointer-events-none inset-0 bg-[url('/placeholder.svg?height=2&width=2')] bg-[length:30px_30px] opacity-[0.02]" />

			<div className="container mx-auto px-4">
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="text-center mb-16"
				>
					<span className={`${caveat.className} text-accent text-xl`}>
						My Thoughts
					</span>
					<h2 className="text-3xl md:text-4xl font-bold mt-2">
						Latest Articles
					</h2>
					<div className="w-20 h-1 bg-primary mx-auto mt-4 rounded-full" />
				</motion.div>

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 min-h-[400px]"
				>
					{/* Loading State */}
					{isLoading && (
						Array(3).fill(0).map((_, index) => (
							<motion.div key={`skel-${index}`} variants={itemVariants} className="h-full flex">
								<div className="bg-background border border-border rounded-xl overflow-hidden h-full w-full flex flex-col">
									<Skeleton className="relative h-48 md:h-52 w-full" />
									<div className="p-6 flex flex-col space-y-3 flex-grow">
										<div className="flex justify-between">
											<Skeleton className="h-4 w-24" />
											<Skeleton className="h-4 w-16" />
										</div>
										<Skeleton className="h-6 w-full" />
										<Skeleton className="h-4 w-3/4" />
										<div className="flex gap-2 pt-2">
											<Skeleton className="h-5 w-14 rounded-full" />
											<Skeleton className="h-5 w-16 rounded-full" />
										</div>
										<div className="mt-auto pt-2">
											<Skeleton className="h-5 w-24" />
										</div>
									</div>
								</div>
							</motion.div>
						))
					)}

					{/* Error State */}
					{!isLoading && error && (
						<motion.div variants={itemVariants} className="col-span-1 md:col-span-3 text-center py-10">
							<p className="text-destructive">Error loading articles: {error}</p>
						</motion.div>
					)}

					{/* No Posts State */}
					{!isLoading && !error && posts.length === 0 && (
						<motion.div variants={itemVariants} className="col-span-1 md:col-span-3 text-center py-10">
							<p className="text-muted-foreground">No articles published yet. Check back soon!</p>
						</motion.div>
					)}

					{/* Display Posts */}
					{!isLoading && !error && posts.map((post) => {
						const formattedDate = formatDate(post.published_at);
						return (
							<motion.div
								key={post.id}
								variants={itemVariants}
								className="h-full flex"
							>
								<Link
									href={`/blog/${post.slug}`}
									className="block h-full w-full group"
								>
									<div className="bg-background border border-border rounded-xl overflow-hidden h-full w-full flex flex-col transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:-translate-y-1">
										<div className="relative h-48 md:h-52 overflow-hidden">
											<Image
												src={post.image || '/placeholder.svg'}
												alt={post.title}
												fill
												sizes="(max-width: 768px) 50vw, 33vw"
												className="object-cover transition-transform duration-500 group-hover:scale-105"
											/>
											<div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
										</div>
										<div className="p-6 flex flex-col flex-grow">
											<div className="flex items-center justify-between text-sm h-6 mb-3">
												{formattedDate && (
													<span className="text-primary/80 font-medium flex items-center">
														<Calendar className="h-4 w-4 mr-1.5 opacity-80" />
														{formattedDate}
													</span>
												)}
												<span className="text-foreground/60 flex items-center">
													<Clock className="h-4 w-4 mr-1.5 opacity-80" />
													{post.read_time || '-'}
												</span>
											</div>
											<h3 className="text-xl font-bold mb-3 line-clamp-2 h-14 group-hover:text-accent/80 transition-colors">
												{post.title}
											</h3>
											<p className="text-foreground/70 mb-4 line-clamp-2 h-10 text-sm">
												{post.excerpt}
											</p>
											<div className="flex flex-wrap gap-2 mb-4 min-h-[28px]">
												{post.tags?.slice(0, 2).map((tag, tagIndex) => (
													<span
														key={tagIndex}
														className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
													>
														{tag}
													</span>
												))}
												{post.tags && post.tags.length > 2 && (
													<span className="inline-flex items-center px-2 py-1 bg-secondary/50 text-foreground/70 text-xs rounded-full">
														+{post.tags.length - 2}
													</span>
												)}
											</div>
											<div className="text-foreground/80 group-hover:text-accent font-medium text-sm flex items-center mt-auto group-hover:translate-x-1 transition-transform">
												Read More
												<ArrowRight className="ml-1 h-4 w-4" />
											</div>
										</div>
									</div>
								</Link>
							</motion.div>
						);
					})}
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="text-center mt-12"
				>
					<Link href="/blog">
						<Button
							variant="outline"
							size="lg"
							className="group hover:bg-primary hover:text-primary-foreground"
						>
							View All Articles
							<ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
						</Button>
					</Link>
				</motion.div>
			</div>
		</section>
	);
};

export default BlogSection;
