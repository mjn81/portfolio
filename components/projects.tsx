'use client';

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
import { ExternalLink, Github } from 'lucide-react';
import Image from 'next/image';
import { projects } from '@/data/projects';

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

	return (
		<section
			className="py-20 bg-background relative overflow-hidden"
		>
			{/* Background elements */}
			<div className="absolute top-0 left-0 w-1/3 h-1/3 bg-accent/5 rounded-br-full blur-3xl" />
			<div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-primary/5 rounded-tl-full blur-3xl" />

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

				<motion.div
					variants={containerVariants}
					initial="hidden"
					whileInView="visible"
					viewport={{ once: true }}
					className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
				>
					{projects.map((project, index) => (
						<motion.div key={index} variants={itemVariants}>
							<Card className="overflow-hidden border border-border bg-card/50 backdrop-blur-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full">
								<div className="relative h-48 overflow-hidden">
									<Image
										src={project.image || '/placeholder.svg'}
										alt={project.title}
										fill
										className="object-cover transition-transform duration-500 hover:scale-105"
									/>
								</div>
								<CardHeader className="flex-none">
									<CardTitle>{project.title}</CardTitle>
									<CardDescription className="line-clamp-3 h-18">
										{project.description}
									</CardDescription>
								</CardHeader>
								<CardContent className="flex-grow">
									<div className="flex flex-wrap gap-2 mt-2">
										{project.tags.map((tag, tagIndex) => (
											<span
												key={tagIndex}
												className="px-2 py-1 bg-accent/10 text-accent/70 text-xs rounded-full"
											>
												{tag}
											</span>
										))}
									</div>
								</CardContent>
								<CardFooter className="flex justify-between mt-auto flex-none">
									<Button variant="outline" size="sm" asChild>
										<a
											href={project.githubLink}
											target="_blank"
											rel="noopener noreferrer"
										>
											<Github className="mr-2 h-4 w-4" />
											Code
										</a>
									</Button>
									<Button size="sm" asChild>
										<a
											href={project.demoLink}
											target="_blank"
											rel="noopener noreferrer"
										>
											<ExternalLink className="mr-2 h-4 w-4" />
											Demo
										</a>
									</Button>
								</CardFooter>
							</Card>
						</motion.div>
					))}
				</motion.div>
			</div>
		</section>
	);
};

export default Projects;
