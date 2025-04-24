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

const caveat = Caveat({ subsets: ['latin'] });

const projects = [
	{
		title: 'AI-Powered Analytics Platform',
		description:
			'A comprehensive analytics platform that leverages machine learning to provide predictive insights for businesses.',
		image: '/placeholder.svg?height=600&width=800',
		tags: ['React', 'Python', 'TensorFlow', 'AWS'],
		demoLink: '#',
		githubLink: '#',
	},
	{
		title: 'Smart Home Automation System',
		description:
			'An IoT-based system that uses AI to learn user preferences and automate home environments for optimal comfort and energy efficiency.',
		image: '/placeholder.svg?height=600&width=800',
		tags: ['IoT', 'Node.js', 'Machine Learning', 'React Native'],
		demoLink: '#',
		githubLink: '#',
	},
	{
		title: 'Natural Language Processing API',
		description:
			'A robust API that provides advanced NLP capabilities including sentiment analysis, entity recognition, and language translation.',
		image: '/placeholder.svg?height=600&width=800',
		tags: ['Python', 'NLP', 'Docker', 'FastAPI'],
		demoLink: '#',
		githubLink: '#',
	},
	{
		title: 'E-commerce Recommendation Engine',
		description:
			'A sophisticated recommendation system that analyzes user behavior to suggest products with high relevance and conversion potential.',
		image: '/placeholder.svg?height=600&width=800',
		tags: ['Python', 'React', 'GraphQL', 'MongoDB'],
		demoLink: '#',
		githubLink: '#',
	},
	{
		title: 'Real-time Collaboration Platform',
		description:
			'A secure platform enabling teams to collaborate on documents, code, and designs in real-time with intelligent suggestions.',
		image: '/placeholder.svg?height=600&width=800',
		tags: ['WebSockets', 'React', 'Node.js', 'PostgreSQL'],
		demoLink: '#',
		githubLink: '#',
	},
	{
		title: 'Computer Vision for Quality Control',
		description:
			'An industrial solution that uses computer vision to detect defects in manufacturing processes with high accuracy.',
		image: '/placeholder.svg?height=600&width=800',
		tags: ['Computer Vision', 'Python', 'TensorFlow', 'Docker'],
		demoLink: '#',
		githubLink: '#',
	},
];

const Projects = () => {
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
