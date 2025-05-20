"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef, useState, useEffect } from "react"
import { Caveat } from "next/font/google"
import { Calendar, Briefcase, Award, Code, Cpu, Layers, Sparkles, CloudDownload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { experiences, type ExperienceProps } from "@/data/journey"

const caveat = Caveat({ subsets: ["latin"] })

const icons = [
	<Cpu className="h-5 w-5" />,
	<Code className="h-5 w-5" />,
	<Layers className="h-5 w-5" />,
	<Sparkles className="h-5 w-5" />,
	<Award className="h-5 w-5" />,
];


const ExperienceItem = ({ year, role, company, description, skills, index }: ExperienceProps) => {
  const itemRef = useRef<HTMLDivElement>(null)

  return (
    <motion.div
      ref={itemRef}
      className="flex items-start gap-8 mb-16 relative"
      initial={{ opacity: 0, x: 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay: index * 0.2 }}
    >
      {/* Timeline node */}
      <div className="relative flex-shrink-0 mt-1">
        <motion.div
          className="w-14 h-14 rounded-full bg-background border border-primary/30 flex items-center justify-center z-10 relative"
          initial={{ scale: 0.8, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
        >
          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
            {icons[index % 5]}
          </div>
        </motion.div>
      </div>

      {/* Content card */}
      <motion.div
        className="bg-background/50 backdrop-blur-sm border border-border rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 flex-1"
        whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
      >
        <div className="flex items-center mb-2 text-sm font-medium text-primary/80">
          <Calendar className="h-4 w-4 mr-2" />
          <span>{year}</span>
        </div>

        <h3 className="text-xl font-bold mb-1">{role}</h3>

        <div className="flex items-center text-sm text-foreground/70 mb-4">
          <Briefcase className="h-3 w-3 mr-1" />
          <span>{company}</span>
        </div>

        <p className="text-foreground/80 mb-4">{description}</p>

        <div className="flex flex-wrap gap-2">
          {skills.map((skill, skillIndex) => (
            <span key={skillIndex} className="px-2 py-1 bg-accent/10 text-accent/70 text-xs rounded-full">
              {skill}
            </span>
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

const ProfessionalJourney = () => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  })

  const [isHovering, setIsHovering] = useState(false);
  const [resumeUrl, setResumeUrl] = useState<string | null>(null);
  const [isLoadingResume, setIsLoadingResume] = useState(true);

  useEffect(() => {
    const fetchResumeUrl = async () => {
      setIsLoadingResume(true);
      try {
        const response = await fetch('/api/settings/resume');
        if (response.ok) {
          const data = await response.json();
          setResumeUrl(data.resumeUrl || null);
        } else {
          console.error('Failed to fetch resume URL for Professional Journey');
          setResumeUrl(null);
        }
      } catch (error) {
        console.error('Error fetching resume URL:', error);
        setResumeUrl(null);
      } finally {
        setIsLoadingResume(false);
      }
    };

    fetchResumeUrl();
  }, []);

  const lineHeight = useTransform(scrollYProgress, [0, 1], ["0%", "100%"])

  return (
		<section className="py-20 bg-background relative overflow-hidden">
			{/* Background elements */}
			<div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-bl-full blur-3xl" />
			<div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-accent/5 rounded-tr-full blur-3xl" />

			{/* Grid pattern overlay */}
			<div className="absolute inset-0 bg-[url('/placeholder.svg?height=2&width=2')] bg-[length:50px_50px] opacity-[0.02] pointer-events-none" />

			<div className="container mx-auto px-4">
				<motion.div
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5 }}
					className="text-center mb-16"
				>
					<span className={`${caveat.className} text-accent text-xl`}>
						My Path
					</span>
					<h2 className="text-3xl md:text-4xl font-bold mt-2">
						Professional Journey
					</h2>
					<div className="w-20 h-1 bg-primary mx-auto mt-4 rounded-full" />
				</motion.div>

				<div className="flex justify-center">
					<div className="relative max-w-4xl" ref={containerRef}>
						{/* Animated timeline line - now positioned on the left */}
						<div className="absolute left-7 top-0 bottom-0 w-0.5 bg-border/50">
							<motion.div
								className="absolute top-0 left-0 right-0 bg-gradient-to-b from-primary via-purple-500 to-accent"
								style={{ height: lineHeight }}
							/>
						</div>

						<div className="relative z-10 pl-0">
							{experiences.map((exp, index) => (
								<ExperienceItem key={index} {...exp} index={index} />
							))}
						</div>
					</div>
				</div>

				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="text-center mt-12"
				>
          {/* Conditionally render button based on resumeUrl and loading state */} 
          {!isLoadingResume && resumeUrl ? (
            <a href={resumeUrl} target="_blank" rel="noopener noreferrer" download>
              <Button
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                variant="outline"
                size="lg"
                className="group overflow-hidden hover:bg-primary hover:text-primary-foreground"
              >
                Download CV
                <motion.div
                  className="relative ml-2" 
                  animate={
                    isHovering
                      ? {
                          scale: [1, 1.25, 1],
                          transition: {
                            duration: 1.5,
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: 'loop',
                          },
                        }
                      : { scale: 1 }
                  }
                >
                  <CloudDownload className="h-5 w-5" />
                  {isHovering && (
                    <motion.div
                      className="absolute left-1/2 top-1/2 h-full w-full -translate-x-1/2 -translate-y-1/2 rounded-full border border-foreground/20"
                      initial={{ opacity: 1, scale: 1 }}
                      animate={{
                        opacity: [1, 0],
                        scale: [1, 3],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: 'loop',
                      }}
                    />
                  )}
                </motion.div>
              </Button>
            </a>
          ) : isLoadingResume ? (
            <Button variant="outline" size="lg" disabled>
              Loading CV...
            </Button>
          ) : (
            <Button variant="outline" size="lg" disabled>
              CV Not Available
            </Button>
          )}
				</motion.div>
			</div>

			{/* Decorative tech elements */}
			<div className="absolute left-0 top-1/4 w-24 h-24 border border-primary/20 rounded-full opacity-20"></div>
			<div className="absolute right-10 bottom-1/3 w-32 h-32 border border-accent/20 rounded-full opacity-20"></div>
			<div className="absolute right-32 top-1/3 w-16 h-16 border border-primary/20 rounded-full opacity-20"></div>
		</section>
	);
}

export default ProfessionalJourney;
