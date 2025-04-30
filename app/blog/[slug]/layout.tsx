import { Metadata, ResolvingMetadata } from 'next';
import { Post } from "@/types/post";
import { User } from "@/hooks/use-auth"; // Assuming User is exported correctly
import { Tag } from "@/types/tag"; // Assuming Tag type is defined/exported
import React from 'react';

// --- Type Definitions (Copied from page.tsx) ---
interface BlogPostData extends Omit<Post, 'author'> {
    author: User | null;
    tags: Tag[];
}

interface GenerateMetadataProps {
    params: { slug: string };
}

// --- Metadata Fetching Logic (Copied from page.tsx) ---
async function getPostMetadata(slug: string): Promise<Partial<BlogPostData> | null> {
    try {
        // Ensure you have NEXT_PUBLIC_BASE_URL set in your .env files
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'; // Fallback for local dev
        const response = await fetch(`${baseUrl}/api/posts/slug/${slug}`);
        if (!response.ok) {
            return null;
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error fetching metadata:", error);
        return null;
    }
}

// --- Metadata Generation Function (Copied from page.tsx) ---
export async function generateMetadata(
    { params }: GenerateMetadataProps,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const slug = params.slug;
    const post = await getPostMetadata(slug);

    if (!post) {
        return {
            title: 'Post Not Found',
            description: 'The blog post you are looking for could not be found.'
        };
    }

    const pageTitle = post.meta_title || post.title || 'Blog Post';
    const pageDescription = post.meta_description || post.excerpt || 'Read this blog post.';
    const ogImage = post.og_image_url || post.image;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    return {
        title: pageTitle,
        description: pageDescription,
        keywords: post.seo_keywords ? post.seo_keywords.split(',').map(k => k.trim()) : (post.tags?.map(t => t.name) || []),
        authors: post.author ? [{ name: post.author.name }] : [],
        openGraph: {
            title: post.og_title || pageTitle,
            description: post.og_description || pageDescription,
            url: `${baseUrl}/blog/${slug}`,
            images: ogImage ? [
                {
                    url: ogImage,
                    alt: post.og_title || pageTitle,
                },
            ] : [],
            type: 'article',
            publishedTime: post.published_at || undefined,
            tags: post.tags?.map(t => t.name),
        },
        alternates: {
            canonical: post.seo_canonical_url || `${baseUrl}/blog/${slug}`,
        },
    };
}

// --- Layout Component ---
export default function BlogLayout({ children }: { children: React.ReactNode }) {
    // This layout just passes children through, but could contain shared UI for blog posts if needed
    return <>{children}</>;
} 