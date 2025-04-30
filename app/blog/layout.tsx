import { Metadata } from 'next';
import React from 'react';

// --- Define Static Metadata ---
export const metadata: Metadata = {
    title: 'Blog - Mohammad Javad Najafi',
    description: 'Read the latest articles and insights on software engineering, AI, and technology from Mohammad Javad Najafi.',
    keywords: [
        'Blog', 'Software Engineering', 'AI', 'Technology', 'Articles', 'Insights', 'Mohammad Javad Najafi', 'Programming', 'Machine Learning', 'Web Development'
    ],
    openGraph: {
        title: 'Blog - Mohammad Javad Najafi',
        description: 'Read the latest articles and insights on software engineering, AI, and technology from Mohammad Javad Najafi.',
        url: '/blog',
        siteName: 'Mohammad Javad Najafi',
        images: [
            {
                url: '/opengraph-image.jpg',
                width: 1200,
                height: 630,
                alt: 'Blog - Mohammad Javad Najafi',
            },
        ],
        locale: 'en_US',
        type: 'website',
    },
    alternates: {
        canonical: '/blog',
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Blog - Mohammad Javad Najafi',
        description: 'Read the latest articles and insights on software engineering, AI, and technology from Mohammad Javad Najafi.',
        images: ['/opengraph-image.jpg'],
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
};

// --- Layout Component ---
export default function BlogListLayout({ children }: { children: React.ReactNode }) {
    // This layout just passes children through
    return <>{children}</>;
} 