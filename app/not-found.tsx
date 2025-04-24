"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Home, ArrowLeft, RefreshCw } from "lucide-react"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { Caveat } from "next/font/google"

const caveat = Caveat({ subsets: ["latin"] })

export default function NotFound() {
  const [isGlitching, setIsGlitching] = useState(false)
  const [codeLines, setCodeLines] = useState<string[]>([])

  // Generate random code lines for the background
  useEffect(() => {
    const generateCodeLines = () => {
      const lines = []
      const codeSnippets = [
        "function findPage() {",
        "  try {",
        "    const page = await fetch('/page');",
        "    if (!page.ok) throw new Error('404');",
        "    return page.data;",
        "  } catch (error) {",
        "    console.error('Page not found');",
        "    return null;",
        "  }",
        "}",
        "const router = createRouter();",
        "router.get('/missing-page', () => {",
        "  return new Response(null, { status: 404 });",
        "});",
        "export default function Page() {",
        "  // This page doesn't exist",
        "  return <div>Missing Content</div>;",
        "}",
        "class PageNotFoundError extends Error {",
        "  constructor() {",
        "    super('The requested page was not found');",
        "    this.name = '404Error';",
        "    this.status = 404;",
        "  }",
        "}",
      ]

      // Generate 30 lines of code by randomly selecting from snippets
      for (let i = 0; i < 30; i++) {
        const randomIndex = Math.floor(Math.random() * codeSnippets.length)
        lines.push(codeSnippets[randomIndex])
      }

      return lines
    }

    setCodeLines(generateCodeLines())
  }, [])

  // Trigger glitch effect periodically
  useEffect(() => {
    const glitchInterval = setInterval(() => {
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 200)
    }, 3000)

    return () => clearInterval(glitchInterval)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="relative pt-32 pb-20 overflow-hidden">
        {/* Background code lines */}
        <div className="absolute inset-0 overflow-hidden opacity-5">
          <div className="max-w-7xl mx-auto px-4 h-full">
            {codeLines.map((line, index) => (
              <div key={index} className="text-xs md:text-sm font-mono">
                {line}
              </div>
            ))}
          </div>
        </div>

        {/* Background elements */}
        <div className="absolute inset-0 overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse-slow" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col items-center justify-center text-center max-w-3xl mx-auto">
            {/* 404 Text with glitch effect */}
            <motion.div
              className={`relative ${isGlitching ? "glitch" : ""}`}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-8xl md:text-9xl font-bold text-primary mb-2">
                <span className="relative inline-block">
                  4
                  {isGlitching && (
                    <>
                      <span className="absolute top-0 left-0 -ml-2 text-accent opacity-70">4</span>
                      <span className="absolute top-0 left-0 ml-2 text-primary/70 opacity-70">4</span>
                    </>
                  )}
                </span>
                <span className="relative inline-block">
                  0
                  {isGlitching && (
                    <>
                      <span className="absolute top-0 left-0 -ml-2 text-accent opacity-70">0</span>
                      <span className="absolute top-0 left-0 ml-2 text-primary/70 opacity-70">0</span>
                    </>
                  )}
                </span>
                <span className="relative inline-block">
                  4
                  {isGlitching && (
                    <>
                      <span className="absolute top-0 left-0 -ml-2 text-accent opacity-70">4</span>
                      <span className="absolute top-0 left-0 ml-2 text-primary/70 opacity-70">4</span>
                    </>
                  )}
                </span>
              </h1>
            </motion.div>

            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.5 }}>
              <span className={`${caveat.className} text-accent text-xl md:text-2xl`}>Oops! Page not found</span>
            </motion.div>

            <motion.h2
              className="text-2xl md:text-3xl font-bold mt-4 mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.5 }}
            >
              Looks like this page has drifted into the void
            </motion.h2>

            <motion.p
              className="text-foreground/70 mb-8 max-w-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
            >
              The page you&apos;re looking for doesn&apos;t exist or has been moved. Don&apos;t worry, even the best
              engineers encounter 404 errors sometimes.
            </motion.p>

            {/* Terminal-like error message */}
            <motion.div
              className="w-full max-w-lg bg-background/80 border border-primary/20 rounded-lg p-4 mb-8 font-mono text-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="ml-2 text-foreground/60">Terminal</span>
              </div>
              <div className="text-foreground/80">
                <span className="text-primary">$</span> find /page
                <br />
                <span className="text-red-500">Error:</span> Page not found (404)
                <br />
                <span className="text-primary">$</span> suggest --alternatives
                <br />
                <span className="text-green-500">Suggestion:</span> Try navigating to the home page
                <br />
                <span className="text-primary">$</span> <span className="animate-pulse">_</span>
              </div>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              className="flex flex-wrap gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
            >
              <Link href="/">
                <Button size="lg" className="group">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Home
                </Button>
              </Link>
              <Button size="lg" variant="outline" onClick={() => window.history.back()} className="group">
                <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
                Go Back
              </Button>
              <Button size="lg" variant="ghost" onClick={() => window.location.reload()} className="group">
                <RefreshCw className="mr-2 h-4 w-4 transition-transform group-hover:rotate-180" />
                Refresh Page
              </Button>
            </motion.div>

            {/* Interactive element - Click to trigger glitch */}
            <motion.div
              className="mt-12 cursor-pointer"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              onClick={() => {
                setIsGlitching(true)
                setTimeout(() => setIsGlitching(false), 500)
              }}
            >
              <p className="text-sm text-foreground/50 hover:text-accent transition-colors">
                Click here to trigger the glitch effect
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }
        
        .glitch {
          animation: glitch 0.2s linear infinite;
        }
      `}</style>
    </main>
  )
}
