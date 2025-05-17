"use client"

import { motion } from "framer-motion"
import { Caveat } from "next/font/google"
import { Code2, Database, Cloud, Cpu, LineChart, Layers, Globe, Smartphone } from "lucide-react"

const caveat = Caveat({ subsets: ["latin"] })

const skillCategories = [
	{
		title: 'Programming Languages',
		icon: <Code2 className="h-6 w-6" />,
		skills: ['JavaScript', 'TypeScript', 'Python', 'Go'],
	},
	{
		title: 'Web Development',
		icon: <Globe className="h-6 w-6" />,
		skills: ['React', 'Next.js', 'Node.js', 'Express', 'Nest','GraphQL', 'REST API'],
	},
	{
		title: 'Artificial Intelligence',
		icon: <Cpu className="h-6 w-6" />,
		skills: [
			'Machine Learning',
			'Deep Learning',
			'NLP',
			'Computer Vision',
      'LLM',
      'Multi-modal AI',
      'Agent-based AI',
      'Automated Speech Recognition',
		],
	},
	{
		title: 'Data Science',
		icon: <LineChart className="h-6 w-6" />,
		skills: [
			'Data Analysis',
			'Data Visualization',
			'Statistical Modeling',
		],
	},
  {
    title: 'Databases',
    icon: <Database className="h-6 w-6" />,
    skills: ['SQL', 'MongoDB', 'PostgreSQL','MySQL', 'Redis', 'Neo4j'],
	},
	{
		title: 'DevOps & Cloud',
		icon: <Cloud className="h-6 w-6" />,
		skills: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'OpenTelemetry'],
	},
	{
		title: 'Architecture',
		icon: <Layers className="h-6 w-6" />,
		skills: [
			'Microservices',
      'Serverless',
      'Event-Driven Architecture',
      'Edge Computing',
			'System Design',
			'API Design',
      'DDD',
		],
	},
];

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

const Skills = () => {
  
  return (
    <section className="py-20 bg-background/50 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=2&width=2')] bg-[length:30px_30px] opacity-[0.02]" />

      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <span className={`${caveat.className} text-accent text-xl`}>What I Know</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-2">My Skills</h2>
          <div className="w-20 h-1 bg-primary mx-auto mt-4 rounded-full" />
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
        >
          {skillCategories.map((category, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="bg-background border border-border rounded-xl p-6 hover:shadow-lg hover:shadow-primary/5 transition-all duration-300 hover:-translate-y-1"
            >
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3">
                  {category.icon}
                </div>
                <h3 className="font-bold text-lg">{category.title}</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {category.skills.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="px-3 py-1 bg-secondary text-secondary-foreground text-sm rounded-full"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}

export default Skills
