"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Github, Linkedin, Twitter } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

const Footer = () => {
  const currentYear = new Date().getFullYear()

  return (
		<footer className="bg-background border-t border-border py-12 relative overflow-hidden">
			{/* Background elements */}
			<div className="absolute inset-0 bg-[url('/placeholder.svg?height=2&width=2')] bg-[length:30px_30px] opacity-[0.02] pointer-events-none" />

			<div className="container mx-auto px-4">
				<div className="grid grid-cols-1 md:grid-cols-4 gap-8">
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5 }}
						className="md:col-span-2"
					>
						<Link
							href="/"
							className="text-2xl font-bold mb-4 block relative group"
						>
							<span className="logo-text">MJN</span>
							<span className="absolute -inset-1 -z-10 rounded-md bg-gradient-to-r from-violet-600/20 via-purple-500/20 to-fuchsia-500/20 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100"></span>
						</Link>
						<p className="text-foreground/70 mb-6 max-w-md">
							Crafting innovative solutions at the intersection of software
							engineering and artificial intelligence.
						</p>
						<div className="flex space-x-4">
							<a
								href="https://github.com/mjn81"
								target="_blank"
								rel="noopener noreferrer"
								className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
							>
								<Github className="h-5 w-5" />
							</a>
							<a
								href="https://www.linkedin.com/in/mohammad-javad-najafi-670ba0235/"
								target="_blank"
								rel="noopener noreferrer"
								className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
							>
								<Linkedin className="h-5 w-5" />
							</a>
							<ThemeToggle />
						</div>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.2 }}
					>
						<h3 className="font-bold text-lg mb-4">Quick Links</h3>
						<ul className="space-y-2">
							<li>
								<Link
									href="/"
									className="text-foreground/70 hover:text-primary transition-colors"
								>
									Home
								</Link>
							</li>
							<li>
								<Link
									href="#journey"
									className="text-foreground/70 hover:text-primary transition-colors"
								>
									Journey
								</Link>
							</li>
							<li>
								<Link
									href="#skills"
									className="text-foreground/70 hover:text-primary transition-colors"
								>
									Skills
								</Link>
							</li>
							<li>
								<Link
									href="#projects"
									className="text-foreground/70 hover:text-primary transition-colors"
								>
									Projects
								</Link>
							</li>
							<li>
								<Link
									href="#blog"
									className="text-foreground/70 hover:text-primary transition-colors"
								>
									Blog
								</Link>
							</li>
							<li>
								<Link
									href="#contact"
									className="text-foreground/70 hover:text-primary transition-colors"
								>
									Contact
								</Link>
							</li>
						</ul>
					</motion.div>

					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true }}
						transition={{ duration: 0.5, delay: 0.4 }}
					>
						<h3 className="font-bold text-lg mb-4">Contact</h3>
						<ul className="space-y-2">
							<li className="text-foreground/70">Tehran, Iran</li>
							<li>
								<a
									href="mailto:contact@mjnajafi.com"
									className="text-foreground/70 hover:text-primary transition-colors"
								>
                  mjndev1831@gmail.com
								</a>
							</li>
							<li>
								<a
									href="tel:+989123456789"
									className="text-foreground/70 hover:text-primary transition-colors"
								>
									+98 994 151 8698
								</a>
							</li>
						</ul>
					</motion.div>
				</div>

				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.6 }}
					className="border-t border-border mt-12 pt-6 text-center text-foreground/60"
				>
					<p>© {currentYear} Mohammad Javad Najafi. All rights reserved.</p>
				</motion.div>
			</div>
		</footer>
	);
}

export default Footer
