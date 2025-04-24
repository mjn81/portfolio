"use client"

import { useState, useEffect, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ArrowLeft, Calendar, Clock, Tag, Share2, Bookmark, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Navbar from "@/components/navbar"
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
  author: {
    name: string
    avatar: string
    role: string
  }
  content: string
}

// Sample blog posts data
const blogPosts: BlogPost[] = [
  {
    title: "The Future of AI in Software Development",
    excerpt:
      "Exploring how artificial intelligence is transforming the way we build and maintain software applications.",
    date: "April 15, 2023",
    image: "/placeholder.svg?height=800&width=1200",
    slug: "future-of-ai-in-software-development",
    tags: ["AI", "Software Development", "Machine Learning"],
    readTime: "5 min read",
    author: {
      name: "Mohammad Javad Najafi",
      avatar: "/placeholder.svg?height=100&width=100",
      role: "Senior Software & AI Engineer",
    },
    content: `
      <p>Artificial Intelligence (AI) is rapidly transforming the landscape of software development, introducing new paradigms and methodologies that promise to revolutionize how we build, test, and maintain software applications.</p>
      
      <h2>AI-Assisted Coding</h2>
      <p>One of the most immediate impacts of AI on software development is in the realm of coding assistance. Tools like GitHub Copilot, powered by OpenAI's Codex, can generate code snippets, complete functions, and even suggest entire algorithms based on natural language descriptions or partial implementations. This not only speeds up the development process but also helps developers explore alternative approaches they might not have considered.</p>
      
      <p>As these AI assistants continue to evolve, we can expect them to become increasingly sophisticated, understanding not just syntax but also best practices, design patterns, and even project-specific conventions. The future may see AI pair programmers that can actively collaborate with human developers, offering suggestions, identifying potential issues, and helping to maintain code quality.</p>
      
      <h2>Automated Testing and Quality Assurance</h2>
      <p>Testing is another area where AI is making significant inroads. Traditional testing approaches often struggle to keep pace with modern development cycles, especially in complex systems. AI-powered testing tools can automatically generate test cases, identify edge cases that human testers might miss, and adapt testing strategies based on code changes.</p>
      
      <p>Machine learning algorithms can analyze patterns in bug reports and code changes to predict where future issues might arise, allowing teams to proactively address potential problems before they affect users. This predictive maintenance approach represents a shift from reactive to proactive quality assurance.</p>
      
      <h2>Intelligent Project Management</h2>
      <p>Beyond the technical aspects of development, AI is also transforming how projects are managed. Predictive analytics can help estimate timelines more accurately, allocate resources more efficiently, and identify potential bottlenecks before they impact delivery schedules.</p>
      
      <p>Natural language processing can analyze requirements documents, user stories, and feedback to ensure alignment between what's being built and what users actually need. This helps reduce the risk of building features that don't address real user problems or business objectives.</p>
      
      <h2>Challenges and Considerations</h2>
      <p>While the potential benefits of AI in software development are substantial, there are also important challenges to address. These include ensuring that AI tools don't perpetuate biases present in their training data, maintaining appropriate human oversight and accountability, and helping developers build the skills needed to work effectively with AI assistants.</p>
      
      <p>There's also the question of how AI will change the nature of software development as a profession. Rather than replacing developers, AI is more likely to augment their capabilities, automating routine tasks and allowing them to focus on more creative and strategic aspects of software design and architecture.</p>
      
      <h2>Conclusion</h2>
      <p>The integration of AI into software development processes represents a significant evolution in how we build and maintain software. By embracing these technologies thoughtfully, development teams can deliver higher quality software more efficiently, ultimately creating better experiences for users and more value for businesses.</p>
      
      <p>As we look to the future, the most successful organizations will be those that find the right balance between human creativity and AI capabilities, leveraging the strengths of both to push the boundaries of what's possible in software development.</p>
    `,
  },
  {
    title: "Building Scalable Microservices Architecture",
    excerpt:
      "A comprehensive guide to designing and implementing microservices that can scale with your business needs.",
    date: "March 22, 2023",
    image: "/placeholder.svg?height=800&width=1200",
    slug: "building-scalable-microservices-architecture",
    tags: ["Architecture", "Microservices", "System Design"],
    readTime: "8 min read",
    author: {
      name: "Mohammad Javad Najafi",
      avatar: "/placeholder.svg?height=100&width=100",
      role: "Senior Software & AI Engineer",
    },
    content: `
      <p>Microservices architecture has become the go-to approach for building complex, scalable applications. This article explores best practices for designing microservices that can grow with your business needs.</p>
      
      <h2>Understanding Microservices</h2>
      <p>Microservices architecture is an approach to application development where a large application is built as a suite of small, independent services. Each service runs in its own process and communicates with other services through well-defined APIs, typically HTTP/REST or messaging protocols.</p>
      
      <p>The key characteristics of microservices include:</p>
      <ul>
        <li>Independent deployment and scaling</li>
        <li>Decentralized data management</li>
        <li>Resilience to failure</li>
        <li>Domain-driven design</li>
        <li>Technology diversity</li>
      </ul>
      
      <h2>Designing for Scalability</h2>
      <p>When building microservices with scalability in mind, consider these design principles:</p>
      
      <h3>1. Service Boundaries</h3>
      <p>Define service boundaries based on business capabilities rather than technical functions. This approach, known as domain-driven design, ensures that services remain cohesive and loosely coupled. Each service should own its data and be responsible for a specific business capability.</p>
      
      <h3>2. Asynchronous Communication</h3>
      <p>Favor asynchronous communication patterns over synchronous ones. Message queues and event-driven architectures allow services to communicate without tight coupling, improving resilience and scalability. Technologies like Apache Kafka, RabbitMQ, or cloud-native services like AWS SQS/SNS can facilitate this approach.</p>
      
      <h3>3. Statelessness</h3>
      <p>Design services to be stateless whenever possible. Stateless services are easier to scale horizontally by simply adding more instances. Store state externally in databases, caches, or specialized state management services.</p>
      
      <h2>Implementation Strategies</h2>
      
      <h3>1. Containerization</h3>
      <p>Use containers (Docker) to package services and their dependencies. Containers provide consistency across environments and make deployment more predictable. Container orchestration platforms like Kubernetes automate the deployment, scaling, and management of containerized applications.</p>
      
      <h3>2. API Gateway Pattern</h3>
      <p>Implement an API gateway to provide a single entry point for clients. The gateway handles cross-cutting concerns like authentication, rate limiting, and request routing. This pattern simplifies the client interface while allowing the underlying services to evolve independently.</p>
      
      <h3>3. Service Discovery</h3>
      <p>Use service discovery mechanisms to enable services to find and communicate with each other dynamically. Tools like Consul, etcd, or cloud provider solutions like AWS Service Discovery provide this capability.</p>
      
      <h2>Monitoring and Observability</h2>
      <p>As the number of services grows, monitoring becomes increasingly important. Implement comprehensive observability with:</p>
      
      <ul>
        <li>Distributed tracing (e.g., Jaeger, Zipkin)</li>
        <li>Metrics collection (e.g., Prometheus)</li>
        <li>Centralized logging (e.g., ELK stack)</li>
        <li>Health checks and circuit breakers</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Building scalable microservices requires careful design, appropriate technology choices, and a focus on operational excellence. By following these principles and practices, you can create a microservices architecture that not only meets your current needs but can also scale effectively as your business grows.</p>
      
      <p>Remember that microservices are not a silver bullet. They introduce complexity that may not be justified for smaller applications. Always evaluate whether the benefits of microservices align with your specific business and technical requirements before committing to this architectural approach.</p>
    `,
  },
  {
    title: "Optimizing Machine Learning Models for Production",
    excerpt: "Best practices for deploying efficient and reliable machine learning models in production environments.",
    date: "February 10, 2023",
    image: "/placeholder.svg?height=800&width=1200",
    slug: "optimizing-ml-models-for-production",
    tags: ["Machine Learning", "DevOps", "Performance"],
    readTime: "6 min read",
    author: {
      name: "Mohammad Javad Najafi",
      avatar: "/placeholder.svg?height=100&width=100",
      role: "Senior Software & AI Engineer",
    },
    content: `
      <p>Deploying machine learning models to production environments presents unique challenges that go beyond traditional software deployment. This article explores strategies for optimizing ML models for production use.</p>
      
      <h2>The Production-Ready ML Model</h2>
      <p>A production-ready machine learning model must balance several competing concerns:</p>
      <ul>
        <li>Prediction accuracy</li>
        <li>Inference speed</li>
        <li>Resource efficiency</li>
        <li>Reliability and stability</li>
        <li>Monitoring and explainability</li>
      </ul>
      
      <h2>Model Optimization Techniques</h2>
      
      <h3>1. Quantization</h3>
      <p>Quantization reduces the precision of the weights in your model, typically from 32-bit floating-point to 8-bit integers. This can reduce model size by 75% and significantly speed up inference with minimal impact on accuracy. Frameworks like TensorFlow and PyTorch provide built-in quantization tools.</p>
      
      <h3>2. Pruning</h3>
      <p>Pruning removes unnecessary connections in neural networks by setting weights below a certain threshold to zero. This creates sparse models that require less computation and memory. Techniques like magnitude-based pruning and lottery ticket hypothesis have shown that models can be pruned by 90% or more while maintaining similar performance.</p>
      
      <h3>3. Knowledge Distillation</h3>
      <p>Knowledge distillation trains a smaller "student" model to mimic a larger "teacher" model. The student model learns not just from the ground truth labels but also from the probability distributions produced by the teacher. This approach can create compact models that retain much of the performance of larger models.</p>
      
      <h2>Deployment Strategies</h2>
      
      <h3>1. Model Serving Infrastructure</h3>
      <p>Choose the right serving infrastructure based on your requirements. Options include:</p>
      <ul>
        <li>TensorFlow Serving for TensorFlow models</li>
        <li>TorchServe for PyTorch models</li>
        <li>ONNX Runtime for framework-agnostic deployment</li>
        <li>Cloud-based services like AWS SageMaker, Google AI Platform, or Azure ML</li>
      </ul>
      
      <h3>2. Containerization</h3>
      <p>Package your model and its dependencies in containers to ensure consistency across environments. Docker containers with optimized ML runtimes like NVIDIA Triton Inference Server can provide both flexibility and performance.</p>
      
      <h3>3. Batch vs. Real-time Inference</h3>
      <p>Consider whether your use case requires real-time predictions or can benefit from batch processing. Batch inference is typically more efficient for processing large volumes of data, while real-time inference is necessary for interactive applications.</p>
      
      <h2>Monitoring and Maintenance</h2>
      
      <h3>1. Performance Monitoring</h3>
      <p>Implement comprehensive monitoring for both technical metrics (latency, throughput, resource utilization) and ML-specific metrics (prediction distribution, feature drift). Tools like Prometheus, Grafana, and specialized ML monitoring platforms can help.</p>
      
      <h3>2. Data Drift Detection</h3>
      <p>Monitor for data drift, where the statistical properties of your input data change over time. This can cause model performance to degrade silently. Techniques like statistical tests, distribution comparisons, and adversarial validation can help detect drift.</p>
      
      <h3>3. Continuous Retraining</h3>
      <p>Establish pipelines for continuous model retraining to adapt to changing data patterns. This might involve scheduled retraining, trigger-based retraining when drift is detected, or online learning for certain types of models.</p>
      
      <h2>Conclusion</h2>
      <p>Optimizing machine learning models for production requires a multifaceted approach that addresses model efficiency, deployment infrastructure, and ongoing maintenance. By applying these techniques, you can create ML systems that deliver accurate predictions while meeting the performance, reliability, and cost requirements of production environments.</p>
      
      <p>Remember that the specific optimization strategies will depend on your use case, model type, and deployment environment. Always benchmark different approaches to find the optimal balance for your particular situation.</p>
    `,
  },
  {
    title: "The Role of DevOps in Modern Software Development",
    excerpt:
      "How DevOps practices are essential for delivering high-quality software at speed in today's competitive landscape.",
    date: "January 5, 2023",
    image: "/placeholder.svg?height=800&width=1200",
    slug: "role-of-devops-in-modern-software-development",
    tags: ["DevOps", "CI/CD", "Software Development"],
    readTime: "4 min read",
    author: {
      name: "Mohammad Javad Najafi",
      avatar: "/placeholder.svg?height=100&width=100",
      role: "Senior Software & AI Engineer",
    },
    content: `
      <p>DevOps has evolved from a buzzword to an essential practice in modern software development. This article explores how DevOps practices enable organizations to deliver high-quality software rapidly and reliably.</p>
      
      <h2>Understanding DevOps</h2>
      <p>DevOps is a set of practices that combines software development (Dev) and IT operations (Ops) with the goal of shortening the development lifecycle and providing continuous delivery of high-quality software. It's not just about tools or a specific role—it's a culture and mindset that emphasizes collaboration, automation, and continuous improvement.</p>
      
      <h2>Key DevOps Practices</h2>
      
      <h3>1. Continuous Integration (CI)</h3>
      <p>Continuous Integration involves automatically building and testing code changes whenever they're committed to version control. This practice helps detect integration issues early, ensures code quality, and provides rapid feedback to developers. Tools like Jenkins, GitHub Actions, CircleCI, and GitLab CI/CD facilitate this process.</p>
      
      <h3>2. Continuous Delivery/Deployment (CD)</h3>
      <p>Continuous Delivery extends CI by automatically deploying all code changes to a testing or staging environment after the build stage. Continuous Deployment takes this further by automatically deploying to production. These practices reduce manual processes, minimize deployment risks, and enable frequent releases.</p>
      
      <h3>3. Infrastructure as Code (IaC)</h3>
      <p>Infrastructure as Code manages and provisions infrastructure through code rather than manual processes. This approach makes infrastructure changes reproducible, version-controlled, and testable. Tools like Terraform, AWS CloudFormation, and Ansible enable teams to define infrastructure in a declarative way.</p>
      
      <h3>4. Monitoring and Observability</h3>
      <p>Comprehensive monitoring and observability practices provide insights into application performance, user experience, and system health. This includes collecting metrics, logs, and traces to understand system behavior and quickly identify issues. Tools like Prometheus, Grafana, ELK stack, and Datadog support these capabilities.</p>
      
      <h2>Benefits of DevOps</h2>
      
      <h3>1. Faster Time to Market</h3>
      <p>By automating the software delivery process and removing manual handoffs, DevOps practices significantly reduce the time from code commit to production deployment. This enables organizations to respond quickly to market changes and user feedback.</p>
      
      <h3>2. Improved Quality and Reliability</h3>
      <p>Automated testing, continuous integration, and infrastructure as code lead to more reliable software with fewer defects. The ability to deploy frequently in smaller batches also reduces the risk associated with each release.</p>
      
      <h3>3. Enhanced Collaboration</h3>
      <p>DevOps breaks down silos between development, operations, and other teams, fostering a culture of shared responsibility for the entire software lifecycle. This collaboration leads to better communication, faster problem-solving, and more innovative solutions.</p>
      
      <h3>4. Increased Efficiency</h3>
      <p>Automation of repetitive tasks frees up team members to focus on higher-value work. Infrastructure as code and self-service platforms enable developers to provision resources without waiting for operations teams, reducing bottlenecks.</p>
      
      <h2>Implementing DevOps</h2>
      
      <h3>1. Start Small</h3>
      <p>Begin with a single application or team rather than attempting an organization-wide transformation. This allows you to learn, adapt, and demonstrate value before scaling. Focus on automating one part of the delivery pipeline, such as automated testing or deployment to a staging environment.</p>
      
      <h3>2. Foster a DevOps Culture</h3>
      <p>Technical tools alone won't deliver DevOps benefits without cultural change. Encourage collaboration, shared responsibility, and a blameless culture where failures are viewed as learning opportunities. Break down silos between teams and establish common goals focused on delivering value to users.</p>
      
      <h3>3. Automate Incrementally</h3>
      <p>Identify manual, repetitive processes and automate them one by one. Prioritize based on frequency, risk, and impact. Build a continuous integration pipeline first, then extend to continuous delivery, infrastructure as code, and automated monitoring.</p>
      
      <h3>4. Measure and Improve</h3>
      <p>Establish metrics to track the impact of DevOps practices, such as deployment frequency, lead time for changes, change failure rate, and mean time to recovery. Use these metrics to identify bottlenecks and continuously improve your processes.</p>
      
      <h2>Conclusion</h2>
      <p>DevOps has become essential in modern software development because it enables organizations to deliver value to users quickly, reliably, and at scale. By embracing DevOps practices and culture, teams can overcome the traditional barriers between development and operations, resulting in faster innovation, higher quality software, and more satisfied users.</p>
      
      <p>As technology continues to evolve, DevOps practices will also evolve, incorporating new tools and approaches like GitOps, DevSecOps, and AIOps. The fundamental principles of collaboration, automation, measurement, and continuous improvement will remain at the core of successful DevOps implementations.</p>
    `,
  },
  {
    title: "Securing Your Web Applications: Best Practices",
    excerpt:
      "Essential security measures every developer should implement to protect web applications from common vulnerabilities.",
    date: "December 12, 2022",
    image: "/placeholder.svg?height=800&width=1200",
    slug: "securing-web-applications-best-practices",
    tags: ["Security", "Web Development", "Best Practices"],
    readTime: "7 min read",
    author: {
      name: "Mohammad Javad Najafi",
      avatar: "/placeholder.svg?height=100&width=100",
      role: "Senior Software & AI Engineer",
    },
    content: `
      <p>Web application security is more critical than ever as businesses increasingly rely on web-based systems to deliver services and manage sensitive data. This article outlines essential security practices that every developer should implement to protect web applications from common vulnerabilities.</p>
      
      <h2>Understanding the Threat Landscape</h2>
      <p>Before diving into specific security measures, it's important to understand the types of threats web applications face. The OWASP Top Ten provides a regularly updated list of the most critical web application security risks, including:</p>
      <ul>
        <li>Injection attacks (SQL, NoSQL, OS, etc.)</li>
        <li>Broken authentication</li>
        <li>Sensitive data exposure</li>
        <li>XML External Entities (XXE)</li>
        <li>Broken access control</li>
        <li>Security misconfigurations</li>
        <li>Cross-Site Scripting (XSS)</li>
        <li>Insecure deserialization</li>
        <li>Using components with known vulnerabilities</li>
        <li>Insufficient logging and monitoring</li>
      </ul>
      
      <h2>Essential Security Practices</h2>
      
      <h3>1. Input Validation and Sanitization</h3>
      <p>Never trust user input. Validate all input on both client and server sides to ensure it meets expected formats and constraints. Sanitize input to remove potentially malicious content before processing or storing it. Use parameterized queries or prepared statements for database operations to prevent SQL injection attacks.</p>
      
      <h3>2. Authentication and Session Management</h3>
      <p>Implement strong authentication mechanisms with multi-factor authentication where appropriate. Use secure session management practices:</p>
      <ul>
        <li>Generate strong, random session identifiers</li>
        <li>Set appropriate session timeouts</li>
        <li>Invalidate sessions after logout or inactivity</li>
        <li>Use secure, HTTP-only cookies with SameSite attributes</li>
        <li>Implement CSRF protection</li>
      </ul>
      
      <h3>3. Access Control</h3>
      <p>Enforce proper authorization checks for all resources and operations. Follow the principle of least privilege, granting users only the permissions they need. Implement role-based access control (RBAC) or attribute-based access control (ABAC) systems. Verify access control on the server side, never relying solely on client-side checks.</p>
      
      <h3>4. Data Protection</h3>
      <p>Protect sensitive data both in transit and at rest:</p>
      <ul>
        <li>Use HTTPS for all communications</li>
        <li>Implement proper TLS/SSL configuration</li>
        <li>Encrypt sensitive data before storing it</li>
        <li>Use strong, modern encryption algorithms</li>
        <li>Manage encryption keys securely</li>
        <li>Apply data minimization principles</li>
      </ul>
      
      <h3>5. Security Headers and Configurations</h3>
      <p>Implement security headers to provide additional layers of protection:</p>
      <ul>
        <li>Content-Security-Policy (CSP) to prevent XSS attacks</li>
        <li>X-Content-Type-Options to prevent MIME type sniffing</li>
        <li>X-Frame-Options to prevent clickjacking</li>
        <li>Strict-Transport-Security (HSTS) to enforce HTTPS</li>
        <li>X-XSS-Protection as an additional XSS safeguard</li>
      </ul>
      
      <h2>Conclusion</h2>
      <p>Securing web applications requires a comprehensive approach that addresses multiple layers of protection. By implementing these best practices, developers can significantly reduce the risk of security breaches and protect both their applications and their users' data.</p>
    `,
  },
  {
    title: "The Impact of Blockchain on Software Architecture",
    excerpt: "Exploring how blockchain technology is influencing the design and implementation of distributed systems.",
    date: "November 8, 2022",
    image: "/placeholder.svg?height=800&width=1200",
    slug: "impact-of-blockchain-on-software-architecture",
    tags: ["Blockchain", "Architecture", "Distributed Systems"],
    readTime: "9 min read",
    author: {
      name: "Mohammad Javad Najafi",
      avatar: "/placeholder.svg?height=100&width=100",
      role: "Senior Software & AI Engineer",
    },
    content: `
      <p>Blockchain technology has emerged as a transformative force in software architecture, particularly for distributed systems. This article explores how blockchain principles and technologies are influencing modern software design patterns and architectural approaches.</p>
      
      <h2>Understanding Blockchain Architecture</h2>
      <p>At its core, blockchain is a distributed ledger technology that maintains a continuously growing list of records (blocks) that are linked and secured using cryptography. Key characteristics include:</p>
      <ul>
        <li>Decentralization: No single entity has control over the entire network</li>
        <li>Immutability: Once data is recorded, it cannot be altered retroactively</li>
        <li>Transparency: All transactions are visible to network participants</li>
        <li>Consensus mechanisms: Rules that ensure agreement on the state of the ledger</li>
        <li>Smart contracts: Self-executing code that automates business logic</li>
      </ul>
      
      <h2>Architectural Paradigm Shifts</h2>
      
      <h3>1. From Centralized to Decentralized Trust</h3>
      <p>Traditional software architectures often rely on trusted central authorities to validate transactions and maintain system state. Blockchain introduces a paradigm where trust is distributed across the network through consensus mechanisms like Proof of Work, Proof of Stake, or Practical Byzantine Fault Tolerance.</p>
      
      <p>This shift enables new architectural patterns where applications can operate without a central authority, reducing single points of failure and potential censorship. However, it also introduces new challenges in terms of performance, scalability, and governance.</p>
      
      <h2>Conclusion</h2>
      <p>Blockchain technology is driving significant innovations in software architecture, particularly for systems that require decentralized trust, immutable records, or multi-party coordination. While not suitable for every application, blockchain principles are expanding the architectural toolkit available to software designers.</p>
    `,
  },
]

export default function BlogPostPage() {
  const params = useParams()
  const router = useRouter()
  const { slug } = params

  const [post, setPost] = useState<BlogPost | null>(null)
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([])
  const articleRef = useRef<HTMLElement>(null)

  useEffect(() => {
    // Find the current post
    const currentPost = blogPosts.find((post) => post.slug === slug)

    if (currentPost) {
      setPost(currentPost)

      // Find related posts based on tags
      const related = blogPosts
        .filter((p) => p.slug !== slug && p.tags.some((tag) => currentPost.tags.includes(tag)))
        .slice(0, 3)

      setRelatedPosts(related)
    } else {
      // Post not found, redirect to blog list
      router.push("/blog")
    }

  }, [slug, router])

  if (!post) {
    return null // This will redirect in the useEffect
  }

  return (
		<main className="min-h-screen bg-background">
			<Navbar />
			<ScrollProgress />

			<article
				ref={articleRef}
				className="pt-32 pb-20 relative overflow-hidden"
			>
				{/* Background elements */}
				<div className="absolute top-0 right-0 w-1/3 h-1/3 bg-primary/5 rounded-bl-full blur-3xl" />
				<div className="absolute bottom-0 left-0 w-1/4 h-1/4 bg-accent/5 rounded-tr-full blur-3xl" />
				<div className="absolute inset-0 bg-[url('/placeholder.svg?height=2&width=2')] bg-[length:30px_30px] opacity-[0.02] pointer-events-none" />

				<div className="container mx-auto px-4 sm:px-6">
					{/* Breadcrumb navigation */}
					<div className="max-w-3xl mx-auto mb-8">
						<nav className="flex items-center text-sm text-muted-foreground mb-6">
							<Link href="/" className="hover:text-primary transition-colors">
								Home
							</Link>
							<ChevronRight className="h-4 w-4 mx-2" />
							<Link
								href="/blog"
								className="hover:text-primary transition-colors"
							>
								Blog
							</Link>
							<ChevronRight className="h-4 w-4 mx-2" />
							<span className="text-foreground font-medium truncate">
								{post.title}
							</span>
						</nav>

						<Link href="/blog">
							<Button
								variant="outline"
								size="sm"
								className="hover:bg-primary hover:text-primary-foreground"
							>
								<ArrowLeft className="mr-2 h-4 w-4" />
								Back to Blog
							</Button>
						</Link>
					</div>

					{/* Featured image with overlay */}
					<div className="max-w-5xl mx-auto mb-16 relative rounded-2xl overflow-hidden shadow-2xl shadow-primary/5">
						<motion.div
							initial={{ opacity: 0, scale: 1.05 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.7 }}
							className="relative h-[50vh] md:h-[60vh]"
						>
							<Image
								src={post.image || '/placeholder.svg'}
								alt={post.title}
								fill
								className="object-cover"
								priority
							/>
							<div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-transparent" />
						</motion.div>

						{/* Title and meta overlaid on image */}
						<div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
							<motion.div
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.5 }}
							>
								<div className="flex flex-wrap gap-2 mb-6">
									{post.tags.map((tag) => (
										<Badge
											key={tag}
											className="bg-primary/90 hover:bg-primary text-white text-xs px-3 py-1"
										>
											{tag}
										</Badge>
									))}
								</div>

								<h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 text-white drop-shadow-sm leading-tight tracking-tight">
									{post.title}
								</h1>

								<div className="flex flex-wrap items-center gap-6 text-sm text-white/90">
									<div className="flex items-center">
										<Calendar className="h-4 w-4 mr-2" />
										{post.date}
									</div>
									<div className="flex items-center">
										<Clock className="h-4 w-4 mr-2" />
										{post.readTime}
									</div>
								</div>
							</motion.div>
						</div>
					</div>

					<div className="max-w-3xl mx-auto">
						{/* Author card */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5, delay: 0.3 }}
							className="flex items-center gap-5 p-6 bg-card/50 backdrop-blur-sm border border-border rounded-xl mb-12 shadow-lg"
						>
							<Avatar className="h-16 w-16 border-2 border-primary/20">
								<AvatarImage
									src={post.author.avatar || '/placeholder.svg'}
									alt={post.author.name}
								/>
								<AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
							</Avatar>
							<div>
								<h3 className="font-bold text-lg">{post.author.name}</h3>
								<p className="text-muted-foreground text-sm">
									{post.author.role}
								</p>
							</div>
							<div className="ml-auto flex gap-2">
								<Button
									variant="ghost"
									size="icon"
									className="rounded-full hover:bg-accent/10 hover:text-accent"
								>
									<Share2 className="h-5 w-5" />
								</Button>
								<Button
									variant="ghost"
									size="icon"
									className="rounded-full hover:bg-primary/10 hover:text-primary"
								>
									<Bookmark className="h-5 w-5" />
								</Button>
							</div>
						</motion.div>

						{/* Content */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5, delay: 0.4 }}
							className="prose prose-lg dark:prose-invert max-w-none mx-auto mb-16"
						>
							<div
								className="prose-headings:font-semibold prose-headings:text-foreground prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-4 prose-p:text-foreground/80 prose-p:leading-relaxed prose-p:text-lg prose-p:mb-6 prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-xl prose-ul:text-foreground/80 prose-ul:mb-6 prose-li:mb-2 prose-li:text-lg"
								dangerouslySetInnerHTML={{ __html: post.content }}
							/>
						</motion.div>

						{/* Tags */}
						<div className="mb-16 p-8 bg-card/50 backdrop-blur-sm border border-border rounded-xl shadow-lg">
							<div className="flex flex-col sm:flex-row sm:items-center flex-wrap gap-4">
								<div className="flex items-center">
									<Tag className="h-5 w-5 text-primary mr-2" />
									<span className="font-medium text-lg">Related Topics:</span>
								</div>
								<div className="flex flex-wrap gap-2">
									{post.tags.map((tag) => (
										<Link href={`/blog?tag=${tag}`} key={tag}>
											<Badge
												variant="outline"
												className="hover:bg-primary/10 hover:text-primary cursor-pointer px-4 py-1.5"
											>
												{tag}
											</Badge>
										</Link>
									))}
								</div>
							</div>
						</div>

						{/* Related posts */}
						{relatedPosts.length > 0 && (
							<div className="mb-16">
								<h2 className="text-2xl font-bold mb-8 flex flex-col sm:flex-row sm:items-center">
									<span
										className={`${caveat.className} text-accent text-2xl sm:mr-3`}
									>
										Discover More
									</span>
									<span className="text-3xl font-semibold mt-1 sm:mt-0">
										Related Articles
									</span>
								</h2>

								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
									{relatedPosts.map((relatedPost) => (
										<Link
											href={`/blog/${relatedPost.slug}`}
											key={relatedPost.slug}
											className="block group"
										>
											<div className="bg-card border border-border rounded-xl overflow-hidden h-full flex flex-col transition-all duration-300 group-hover:shadow-xl group-hover:shadow-primary/10 group-hover:-translate-y-1">
												<div className="relative h-40 overflow-hidden">
													<Image
														src={relatedPost.image || '/placeholder.svg'}
														alt={relatedPost.title}
														fill
														className="object-cover transition-transform duration-500 group-hover:scale-105"
													/>
													<div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
												</div>

												<div className="p-5 flex-grow flex flex-col">
													<div className="flex items-center justify-between text-xs mb-2">
														<span className="text-primary font-medium">
															{relatedPost.date}
														</span>
														<span className="text-muted-foreground">
															{relatedPost.readTime}
														</span>
													</div>

													<h3 className="text-base font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
														{relatedPost.title}
													</h3>

													<p className="text-muted-foreground text-sm mb-3 line-clamp-2">
														{relatedPost.excerpt}
													</p>

													<div className="flex flex-wrap gap-1.5 mt-auto">
														{relatedPost.tags.slice(0, 1).map((tag) => (
															<span
																key={tag}
																className="inline-flex items-center px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full"
															>
																{tag}
															</span>
														))}
													</div>
												</div>
											</div>
										</Link>
									))}
								</div>
							</div>
						)}
					</div>
				</div>
			</article>

			<ScrollToTop />
		</main>
	);
}
