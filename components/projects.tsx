'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Caveat } from 'next/font/google';
import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Loader2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import { Project } from '@/types/project';

const caveat = Caveat({ subsets: ['latin'] });

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

const Projects = () => {
	const [projects, setProjects] = useState<Project[]>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProjects = async () => {
			setIsLoading(true);
			setError(null);
			try {
				const response = await fetch('/api/projects');
				if (!response.ok) {
					throw new Error('Failed to fetch projects. Please try again later.');
				}
				const data = await response.json();
				setProjects(data || []);
			} catch (err) {
				console.error("Error fetching projects:", err);
				setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
				setProjects([]);
			} finally {
				setIsLoading(false);
			}
		};
		fetchProjects();
	}, []);

	return (
		<section
			id="projects"
			className="py-20 bg-background relative overflow-hidden"
		>
			{/* Background elements */}
			<div className="absolute top-0 left-0 w-1/3 h-1/3 bg-accent/5 rounded-br-full blur-3xl -z-10" />
			<div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-primary/5 rounded-tl-full blur-3xl -z-10" />

			<div className="container mx-auto px-4">
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="text-center mb-16"
				>
					<span className={`${caveat.className} text-accent text-xl`}>
						My Work
					</span>
					<h2 className="text-3xl md:text-4xl font-bold mt-2">
						Featured Projects
					</h2>
					<div className="w-20 h-1 bg-primary mx-auto mt-4 rounded-full" />
				</motion.div>

				{isLoading && (
					<div className="flex justify-center items-center py-10">
						<Loader2 className="h-12 w-12 animate-spin text-primary" />
						<p className="ml-3 text-lg">Loading projects...</p>
					</div>
				)}

				{error && (
					<div className="flex flex-col items-center justify-center py-10 text-center bg-destructive/10 p-6 rounded-lg border border-destructive">
						<AlertTriangle className="h-12 w-12 text-destructive mb-4" />
						<h3 className="text-xl font-semibold text-destructive">Could not load projects</h3>
						<p className="text-destructive/80 mt-2">{error}</p>
						<Button variant="outline" onClick={() => window.location.reload()} className="mt-6">Try Again</Button>
					</div>
				)}

				{!isLoading && !error && projects.length === 0 && (
					<div className="text-center py-10">
						<h3 className="text-xl font-semibold text-muted-foreground">No projects to display yet.</h3>
						<p className="text-muted-foreground mt-2">Please check back later!</p>
					</div>
				)}

				{!isLoading && !error && projects.length > 0 && (
					<motion.div
						variants={containerVariants}
						initial="hidden"
						whileInView="visible"
						viewport={{ once: true }}
						className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
					>
						{projects.map((project) => (
							<motion.div key={project.id} variants={itemVariants}>
								<Card className="overflow-hidden border border-border bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
									<div className="relative h-56 sm:h-64 overflow-hidden">
										<Image
											src={project.image_url || '/placeholder-project.svg'}
											alt={project.image_alt_text || project.title}
											fill
											className="object-cover transition-transform duration-500 hover:scale-105"
											sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
										/>
									</div>
									<CardHeader className="flex-none">
										<CardTitle>{project.title}</CardTitle>
										<CardDescription className="line-clamp-3 h-[4.5em]">
											{project.description}
										</CardDescription>
									</CardHeader>
									<CardContent className="flex-grow">
										{project.tags && Array.isArray(project.tags) && project.tags.length > 0 && (
											<div className="flex flex-wrap gap-2 mt-2">
												{project.tags.map((tagString, index) => (
													<span
														key={`${project.id}-tag-${index}-${tagString}`}
														className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full"
													>
														{tagString}
													</span>
												))}
											</div>
										)}
									</CardContent>
									<CardFooter className="flex justify-between items-center mt-auto flex-none pt-4">
										{project.github_link && (
											<Button variant="outline" size="sm" asChild>
												<a
													href={project.github_link}
													target="_blank"
													rel="noopener noreferrer"
													aria-label={`View source code for ${project.title} on GitHub`}
												>
													<Github className="mr-2 h-4 w-4" />
													Code
												</a>
											</Button>
										)}
										{project.demo_link && project.demo_link !== '#' && (
											<Button size="sm" asChild>
												<a
													href={project.demo_link}
													target="_blank"
													rel="noopener noreferrer"
													aria-label={`View live demo for ${project.title}`}
												>
													<ExternalLink className="mr-2 h-4 w-4" />
													Demo
												</a>
											</Button>
										)}
									</CardFooter>
								</Card>
							</motion.div>
						))}
					</motion.div>
				)}
			</div>
		</section>
	);
};

export default Projects;
