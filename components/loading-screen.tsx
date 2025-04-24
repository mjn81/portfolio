"use client"

import { useEffect, useState, useRef } from "react"
import { motion } from "framer-motion"
import { Caveat } from "next/font/google"
import { Terminal } from "lucide-react"

const caveat = Caveat({ subsets: ["latin"] })
const monoFont = "'Fira Code', 'Roboto Mono', monospace"

const LoadingScreen = () => {
  const [isComplete, setIsComplete] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [displayedText, setDisplayedText] = useState("")
  const terminalRef = useRef<HTMLDivElement>(null)

  const codeSnippets = [
    "import { Portfolio } from '@/components'",
    "const skills = ['React', 'TypeScript', 'AI', 'Node.js']",
    "function initializePortfolio() {",
    "  return new Portfolio({",
    "    name: 'Mohammad Javad Najafi',",
    "    role: 'Senior Software & AI Engineer',",
    "    experience: '10+ years'",
    "  })",
    "}",
    "const portfolio = initializePortfolio()",
    "portfolio.render()",
  ]

  // Typing effect
  useEffect(() => {
    if (currentTextIndex >= codeSnippets.length) return

    const text = codeSnippets[currentTextIndex]
    let charIndex = 0

    const typingInterval = setInterval(() => {
      if (charIndex <= text.length) {
        setDisplayedText(text.substring(0, charIndex))
        charIndex++
      } else {
        clearInterval(typingInterval)
        setTimeout(() => {
          setCurrentTextIndex((prev) => prev + 1)
        }, 200) // Small pause between lines
      }
    }, 30) // Typing speed

    return () => clearInterval(typingInterval)
  }, [currentTextIndex])

  // Progress bar animation
  useEffect(() => {
    const progressInterval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 1
        if (newProgress >= 100) {
          clearInterval(progressInterval)
          setTimeout(() => setIsComplete(true), 500)
          return 100
        }
        return newProgress
      })
    }, 30)

    return () => clearInterval(progressInterval)
  }, [])

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [displayedText])

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = "auto"
    }
  }, [])

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-background"
      initial={{ opacity: 1 }}
      animate={{ opacity: isComplete ? 0 : 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={() => {
        if (isComplete) {
          document.body.style.overflow = "auto"
        } else {
          document.body.style.overflow = "hidden"
        }
      }}
    >
      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse-slow" />
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-[url('/placeholder.svg?height=2&width=2')] bg-[length:50px_50px] opacity-[0.02]" />

      <div className="relative flex flex-col items-center z-10 w-full max-w-2xl px-4">
        {/* Terminal window */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full bg-black/90 backdrop-blur-lg rounded-lg overflow-hidden border border-primary/20 shadow-xl"
        >
          {/* Terminal header */}
          <div className="bg-background/10 px-4 py-2 flex items-center justify-between border-b border-primary/10">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-foreground/80">portfolio-initializer.ts</span>
            </div>
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
          </div>

          {/* Terminal content */}
          <div
            ref={terminalRef}
            className="p-4 h-64 overflow-y-auto font-mono text-sm"
            style={{ fontFamily: monoFont }}
          >
            {/* Previously "typed" lines */}
            {codeSnippets.slice(0, currentTextIndex).map((line, index) => (
              <div key={index} className="mb-1">
                <span className="text-primary mr-2">$</span>
                <span className="text-foreground/90">{line}</span>
              </div>
            ))}

            {/* Currently typing line */}
            {currentTextIndex < codeSnippets.length && (
              <div className="mb-1">
                <span className="text-primary mr-2">$</span>
                <span className="text-foreground/90">{displayedText}</span>
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ repeat: Number.POSITIVE_INFINITY, duration: 0.8 }}
                  className="inline-block w-2 h-4 bg-primary ml-0.5"
                />
              </div>
            )}

            {/* Final message when all code is typed */}
            {currentTextIndex >= codeSnippets.length && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-400 mt-2">
                Portfolio initialized successfully! Launching application...
              </motion.div>
            )}
          </div>
        </motion.div>

        {/* Progress bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full mt-6 bg-background/30 rounded-full h-2 overflow-hidden"
        >
          <motion.div
            className="h-full bg-gradient-to-r from-primary via-purple-500 to-accent"
            style={{ width: `${progress}%` }}
            initial={{ width: "0%" }}
          />
        </motion.div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-4 text-center"
        >
          <span className={`${caveat.className} text-lg text-foreground/70`}>
            {progress < 30 && "Initializing components..."}
            {progress >= 30 && progress < 60 && "Loading experience..."}
            {progress >= 60 && progress < 90 && "Preparing portfolio..."}
            {progress >= 90 && "Almost ready..."}
          </span>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default LoadingScreen
