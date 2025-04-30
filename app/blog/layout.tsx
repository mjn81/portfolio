import { Metadata } from 'next';
import React from 'react';

// --- Define Static Metadata ---
export const metadata: Metadata = {
    title: 'Blog - Mohammad Javad Najafi',
    description: 'Read the latest articles and insights on software engineering, AI, and technology from Mohammad Javad Najafi.',
    // Add other relevant meta tags like open graph, keywords etc. if needed
    // openGraph: { ... },
};

// --- Layout Component ---
export default function BlogListLayout({ children }: { children: React.ReactNode }) {
    // This layout just passes children through
    return <>{children}</>;
} 