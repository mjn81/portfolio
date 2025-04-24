"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, ArrowDown } from "lucide-react"
import { Caveat } from "next/font/google"
import Link from "next/link"
import { useRef } from "react"

const caveat = Caveat({ subsets: ["latin"] })

const Hero = () => {
  const ref = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  })

  // Parallax effect for background elements
  const backgroundY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"])
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center justify-center overflow-visible bg-gradient-to-b from-background to-background/95 pt-16"
    >
      {/* Animated background elements with parallax effect */}
      <motion.div className="absolute inset-0 overflow-hidden pointer-events-none" style={{ y: backgroundY, opacity }}>
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
      </motion.div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=2&width=2')] bg-[length:50px_50px] opacity-[0.02] pointer-events-none" />

      <div className="container mx-auto px-4 z-10">
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-6"
          >
            <span className={`${caveat.className} text-accent text-xl md:text-2xl`}>Hello, I&apos;m</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 tracking-tight"
          >
            <span className="hero-text animate-gradient">Mohammad Javad Najafi</span>
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex items-center gap-4 mb-8"
          >
            <div className="h-[1px] w-12 bg-primary/50"></div>
            <h2 className="text-xl md:text-2xl text-foreground/80">Senior Software & AI Engineer</h2>
            <div className="h-[1px] w-12 bg-primary/50"></div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="text-foreground/70 max-w-2xl mb-10 text-lg"
          >
            Crafting innovative solutions at the intersection of software engineering and artificial intelligence.
            Turning complex problems into elegant, efficient, and scalable solutions.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex flex-wrap gap-4 justify-center"
          >
            <Link href="#journey">
              <Button size="lg" className="group">
                View My Work
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <Link href="#contact">
              <Button size="lg" variant="outline" className="hover:bg-accent hover:text-primary-foreground">
                Get In Touch
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Enhanced scroll indicator with animation */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-10 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
      >
        <span className="text-sm text-foreground/50 mb-2">Scroll Down</span>
        <motion.div
          animate={{
            y: [0, 8, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
          }}
          className="flex items-center justify-center w-10 h-10 rounded-full border-2 border-foreground/20"
        >
          <ArrowDown className="h-4 w-4 text-foreground/50" />
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero

