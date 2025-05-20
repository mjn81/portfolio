import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { CookieConsent } from "@/components/cookie-consent"
import { PageLoadingProvider } from "@/app/contexts/page-loading-context"
import { SpeedInsights } from "@vercel/speed-insights/next"
import { Analytics } from '@vercel/analytics/next';
const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: {
    template: '%s | Mohammad Javad Najafi',
    default: 'Mohammad Javad Najafi | Software & AI Engineer',
  },
  description: "Portfolio of Mohammad Javad Najafi, Senior Software and AI Engineer",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  keywords: [
    'Mohammad Javad Najafi', 'Software Engineer', 'AI Engineer', 'Portfolio', 'Machine Learning', 'Full Stack', 'React', 'Next.js', 'TypeScript', 'Node.js', 'Supabase', 'OpenAI', 'Blog', 'Tech', 'Startup', 'Innovation'
  ],
  openGraph: {
    title: 'Mohammad Javad Najafi | Software & AI Engineer',
    description: 'Portfolio of Mohammad Javad Najafi, Senior Software and AI Engineer',
    url: '/',
    siteName: 'Mohammad Javad Najafi',
    images: [
      {
        url: '/opengraph-image.jpeg',
        width: 1200,
        height: 630,
        alt: 'Mohammad Javad Najafi Portfolio',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: '/',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mohammad Javad Najafi | Software & AI Engineer',
    description: 'Portfolio of Mohammad Javad Najafi, Senior Software and AI Engineer',
    images: ['/opengraph-image.jpeg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
		<html lang="en" suppressHydrationWarning>
      <SpeedInsights />
      <Analytics />
			<PageLoadingProvider>
				<body className={inter.className}>
					<ThemeProvider
						attribute="class"
						defaultTheme="dark"
						enableSystem
						disableTransitionOnChange={false}
						storageKey="mjn-portfolio-theme"
					>
						{children}
					</ThemeProvider>
					<Toaster />
					<CookieConsent />
				</body>
			</PageLoadingProvider>
		</html>
	);
}
