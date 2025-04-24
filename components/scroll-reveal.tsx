"use client"

import { useRef, useEffect, type ReactNode } from "react"

interface ScrollRevealProps {
  children: ReactNode
  animation?: "from-bottom" | "from-left" | "from-right" | "scale"
  delay?: number
  threshold?: number
  className?: string
}

const ScrollReveal = ({
  children,
  animation = "from-bottom",
  delay = 0,
  threshold = 0.1,
  className = "",
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              entry.target.classList.add("revealed")
            }, delay)
            observer.unobserve(entry.target)
          }
        })
      },
      {
        threshold,
        rootMargin: "0px 0px -100px 0px",
      },
    )

    const currentRef = ref.current
    if (currentRef) {
      observer.observe(currentRef)
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef)
      }
    }
  }, [delay, threshold])

  const getAnimationClass = () => {
    switch (animation) {
      case "from-left":
        return "reveal-from-left"
      case "from-right":
        return "reveal-from-right"
      case "scale":
        return "reveal-scale"
      case "from-bottom":
      default:
        return "reveal-from-bottom"
    }
  }

  return (
    <div ref={ref} className={`${getAnimationClass()} ${className}`}>
      {children}
    </div>
  )
}

export default ScrollReveal
