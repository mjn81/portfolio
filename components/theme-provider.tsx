"use client"

import { ThemeProvider as NextThemesProvider } from "next-themes"
import type { ThemeProviderProps } from "next-themes/dist/types"
import { useEffect, useState } from "react"

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  const [mounted, setMounted] = useState(false)

  // Add smooth transition to body when theme changes
  useEffect(() => {
    const body = document.body
    body.classList.add("transition-colors", "duration-300")

    // Set mounted to true once the component is mounted
    setMounted(true)

    return () => {
      body.classList.remove("transition-colors", "duration-300")
    }
  }, [])

  // Avoid rendering with incorrect theme
  if (!mounted) {
    return <>{children}</>
  }

  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
