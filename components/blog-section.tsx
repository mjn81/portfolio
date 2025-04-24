'use client';

import { motion } from 'framer-motion';
import { Caveat } from 'next/font/google';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

const caveat = Caveat({ subsets: ['latin'] });

const blogPosts = [
	{
		title: 'The Future of AI in Software Development',
		excerpt:
			'Exploring how artificial intelligence is transforming the way we build and maintain software applications.',
		date: 'April 15, 2023',
		image: '/placeholder.svg?height=400&width=600',
		slug: 'future-of-ai-in-software-development',
		tags: ['AI', 'Software Development', 'Machine Learning'],
		readTime: '5 min read',
	},
	{
		title: 'Building Scalable Microservices Architecture',
		excerpt:
			'A comprehensive guide to designing and implementing microservices that can scale with your business needs.',
		date: 'March 22, 2023',
		image: '/placeholder.svg?height=400&width=600',
		slug: 'building-scalable-microservices-architecture',
		tags: ['Architecture', 'Microservices', 'System Design'],
		readTime: '8 min read',
	},
	{
		title: 'Optimizing Machine Learning Models for Production',
		excerpt:
			'Best practices for deploying efficient and reliable machine learning models in production environments.',
		date: 'February 10, 2023',
		image: '/placeholder.svg?height=400&width=600',
		slug: 'optimizing-ml-models-for-production',
		tags: ['Machine Learning', 'DevOps', 'Performance'],
		readTime: '6 min read',
	},
];

const BlogSection = () => {
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
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
				>
					{blogPosts.map((post, index) => (
						<motion.div
							key={index}
							variants={itemVariants}
							className="h-full flex"
						>
							<Link
								href={`/blog/${post.slug}`}
								className="block h-full w-full group"
							>
								<div className="bg-background border border-border rounded-xl overflow-hidden h-full w-full flex flex-col transition-all duration-300 group-hover:shadow-lg group-hover:shadow-primary/10 group-hover:-translate-y-1">
									{/* Image container with fixed height */}
									<div className="relative h-48 md:h-52 overflow-hidden">
										<Image
											src={post.image || '/placeholder.svg'}
											alt={post.title}
											fill
											className="object-cover transition-transform duration-500 group-hover:scale-105"
										/>
										<div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
									</div>

									{/* Content container with fixed layout */}
									<div className="p-6 flex flex-col h-[calc(100%-12rem)] md:h-[calc(100%-13rem)]">
										{/* Meta info with fixed height */}
										<div className="flex items-center justify-between text-sm h-6 mb-3">
											<span className="text-primary/80 font-medium">
												{post.date}
											</span>
											<span className="text-foreground/60">
												{post.readTime}
											</span>
										</div>

										{/* Title with fixed height */}
										<h3 className="text-xl font-bold mb-3 line-clamp-2 h-14 group-hover:text-accent/80 transition-colors">
											{post.title}
										</h3>

										{/* Excerpt with fixed height */}
										<p className="text-foreground/70 mb-4 line-clamp-2 h-10 text-sm">
											{post.excerpt}
										</p>

										{/* Tags with fixed height - Fixed positioning issue */}
										<div className="flex flex-wrap gap-2 mb-4">
											{post.tags.slice(0, 2).map((tag, tagIndex) => (
												<span
													key={tagIndex}
													className="inline-flex items-center px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
												>
													{tag}
												</span>
											))}
											{post.tags.length > 2 && (
												<span className="inline-flex items-center px-2 py-1 bg-secondary/50 text-foreground/70 text-xs rounded-full">
													+{post.tags.length - 2}
												</span>
											)}
										</div>

										{/* Read more link at the bottom */}
										<div className="text-foreground/80 group-hover:text-accent font-medium text-sm flex items-center mt-auto group-hover:translate-x-1 transition-transform">
											Read More
											<ArrowRight className="ml-1 h-4 w-4" />
										</div>
									</div>
								</div>
							</Link>
						</motion.div>
					))}
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
