"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { link } from "fs"

const Navbar = ({notMain=true}: {notMain?: boolean}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState("")
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true)
      } else {
        setScrolled(false)
      }
      if (notMain) {
        setActiveSection("blog")
      }
      else {
        // Update active section based on scroll position
        const sections = document.querySelectorAll("section[id]")
        const scrollPosition = window.scrollY + 100 // Offset for better UX
  
        sections.forEach((section) => {
          const sectionId = section.getAttribute("id") || ""
          const sectionTop = (section as HTMLElement).offsetTop
          const sectionHeight = (section as HTMLElement).offsetHeight
          
          if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
  
            setActiveSection(sectionId)
          }
        })
      }
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  // Add smooth scrolling behavior to navigation links
  const navLinks = [
		{ name: 'Home', href: notMain ? '/' : '#home' },
		{ name: 'Journey', href: notMain ? '/#journey' : '#journey' },
		{ name: 'Skills', href: notMain ? '/#skills' : '#skills' },
		{ name: 'Projects', href: notMain ? '/#projects' : '#projects' },
		{ name: 'Blog', href: notMain ? '/blog' : '#blog' },
		{ name: 'Contact', href: notMain ? '/#contact' : '#contact' },
	];

  // Add this function to handle smooth scrolling
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    // Only apply to hash links
    if (href.startsWith("#")) {
      e.preventDefault()
      const element = document.querySelector(href)
      if (element) {
        // Get the navbar height to offset the scroll position
        const navbarHeight = document.querySelector("nav")?.offsetHeight || 0
        const elementPosition = element.getBoundingClientRect().top + window.scrollY

        // Scroll to element with offset for navbar
        window.scrollTo({
          top: elementPosition - navbarHeight,
          behavior: "smooth",
        })
      }
      // Close mobile menu if open
      if (isOpen) {
        setIsOpen(false)
      }
    }
  }

  return (
    <nav
      className={`fixed w-full z-50 transition-all duration-300 ${
        scrolled ? "bg-background/80 backdrop-blur-md shadow-md" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex-shrink-0"
          >
            <Link href="/" className="text-xl font-bold relative group">
              <span className="logo-text">MJN</span>
              <span className="absolute -inset-1 -z-10 rounded-md bg-gradient-to-r from-violet-600/20 via-purple-500/20 to-fuchsia-500/20 opacity-0 blur-sm transition-all duration-300 group-hover:opacity-100"></span>
            </Link>
          </motion.div>

          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-4">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.name}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Link
                    href={link.href}
                    className={`relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      activeSection === (link.href === "#" ? "" : link.href.substring(1))
                        ? "text-primary"
                        : "text-foreground/80 hover:text-primary"
                    }`}
                    onClick={(e) => handleNavClick(e, link.href)}
                  >
                    {link.name}
                    {activeSection === (link.href === "#" ? "" : link.href.substring(1)) && (
                      <motion.span
                        className="absolute bottom-0 left-0 w-full h-0.5 bg-primary rounded-full md:hidden"
                        layoutId="navbar-indicator"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}
                  </Link>
                </motion.div>
              ))}
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="relative">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className={`relative h-10 w-10 rounded-full flex items-center justify-center bg-secondary/50 hover:bg-secondary transition-colors duration-300`}
                  aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
                >
                  <motion.div
                    initial={false}
                    animate={{
                      rotate: theme === "dark" ? 0 : 180,
                      opacity: 1,
                    }}
                    transition={{ duration: 0.5, type: "spring" }}
                    className="absolute"
                  >
                    {theme === "dark" ? (
                      <Moon className="h-5 w-5 text-primary" />
                    ) : (
                      <Sun className="h-5 w-5 text-accent" />
                    )}
                  </motion.div>
                </motion.button>
              </motion.div>
            </div>
          </div>

          <div className="md:hidden flex items-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className={`relative h-10 w-10 rounded-full flex items-center justify-center bg-secondary/50 hover:bg-secondary transition-colors duration-300 mr-2`}
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              <motion.div
                initial={false}
                animate={{
                  rotate: theme === "dark" ? 0 : 180,
                  opacity: 1,
                }}
                transition={{ duration: 0.5, type: "spring" }}
                className="absolute"
              >
                {theme === "dark" ? <Moon className="h-5 w-5 text-primary" /> : <Sun className="h-5 w-5 text-accent" />}
              </motion.div>
            </motion.button>
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-foreground hover:text-primary focus:outline-none"
            >
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-background/95 backdrop-blur-md"
          >
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium ${
                    activeSection === (link.href === "#" ? "" : link.href.substring(1))
                      ? "text-primary"
                      : "text-foreground/80 hover:text-primary"
                  }`}
                  onClick={(e) => {
                    handleNavClick(e, link.href)
                    setIsOpen(false)
                  }}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </nav>
  )
}

export default Navbar
