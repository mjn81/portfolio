"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Navbar from "@/components/navbar"
import Hero from "@/components/hero"
import ProfessionalJourney from "@/components/professional-journey"
import Skills from "@/components/skills"
import Projects from "@/components/projects"
import BlogSection from "@/components/blog-section"
import Contact from "@/components/contact"
import Footer from "@/components/footer"
import LoadingScreen from "@/components/loading-screen"
import ScrollReveal from "@/components/scroll-reveal"

// Section wrapper component to handle alternating backgrounds
const SectionWrapper = ({
  children,
  hasEffect = false,
  id,
}: {
  children: React.ReactNode
  hasEffect?: boolean
  id?: string
}) => (
  <section
    id={id}
    className={`relative ${
      hasEffect ? "bg-gradient-to-br from-background to-background/80 backdrop-blur-sm" : ""
    }`}
  >
    {children}
  </section>
)

export default function Home() {
  // Fix the loading state to prevent scroll blocking after animation completes
  const [loading, setLoading] = useState(true)

  // Update the useEffect that handles loading state to ensure overflow is properly reset
  useEffect(() => {
    // Set initial body overflow to hidden
    document.body.style.overflow = "hidden"

    // Simulate loading time - increased to allow the typing animation to complete
    const timer = setTimeout(() => {
      setLoading(false)
      // Ensure body overflow is reset to auto when loading is complete
      document.body.style.overflow = "auto"
    }, 6000) // 6 seconds to ensure the typing animation completes

    return () => {
      clearTimeout(timer)
      // Always ensure body overflow is reset when component unmounts
      document.body.style.overflow = "auto"
    }
  }, [])

  // Initialize scroll reveal animations after page load
  useEffect(() => {
    if (!loading) {
      const revealElements = document.querySelectorAll(
        ".reveal-from-bottom, .reveal-from-left, .reveal-from-right, .reveal-scale",
      )

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("revealed")
              observer.unobserve(entry.target)
            }
          })
        },
        {
          threshold: 0.1,
          rootMargin: "0px 0px -100px 0px",
        },
      )

      revealElements.forEach((element) => {
        observer.observe(element)
      })

      return () => {
        revealElements.forEach((element) => {
          observer.unobserve(element)
        })
      }
    }
  }, [loading])

  return (
    <main className="min-h-screen overflow-hidden">
      {loading && <LoadingScreen />}
      <Navbar notMain={false} />

      {/* Hero section - no effect background */}
      <SectionWrapper id="home">
        <Hero />
      </SectionWrapper>

      {/* Professional Journey - with effect background */}
      <SectionWrapper hasEffect id="journey">
        <ScrollReveal>
          <ProfessionalJourney />
        </ScrollReveal>
      </SectionWrapper>

      {/* Skills section - no effect background */}
      <SectionWrapper id="skills">
        <ScrollReveal animation="from-right" delay={200}>
          <Skills />
        </ScrollReveal>
      </SectionWrapper>

      {/* Projects section - with effect background */}
      <SectionWrapper hasEffect id="projects">
        <ScrollReveal animation="from-left" delay={200}>
          <Projects />
        </ScrollReveal>
      </SectionWrapper>

      {/* Blog section - no effect background */}
      <SectionWrapper id="blog">
        <ScrollReveal animation="scale" delay={200}>
          <BlogSection />
        </ScrollReveal>
      </SectionWrapper>

      {/* Contact section - with effect background */}
      <SectionWrapper hasEffect id="contact">
        <ScrollReveal>
          <Contact />
        </ScrollReveal>
      </SectionWrapper>

      <Footer />
    </main>
  )
}
