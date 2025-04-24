"use client"

import { useState, useEffect } from "react"

const ScrollProgress = () => {
  const [scrollProgress, setScrollProgress] = useState(0)

  const calculateScrollProgress = () => {
    const scrollTop = window.scrollY
    const docHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight
    const scrollPercent = scrollTop / docHeight
    setScrollProgress(scrollPercent * 100)
  }

  useEffect(() => {
    window.addEventListener("scroll", calculateScrollProgress)
    return () => window.removeEventListener("scroll", calculateScrollProgress)
  }, [])

  return (
    <div className="scroll-progress-container">
      <div className="scroll-progress-bar" style={{ width: `${scrollProgress}%` }} />
    </div>
  )
}

export default ScrollProgress
