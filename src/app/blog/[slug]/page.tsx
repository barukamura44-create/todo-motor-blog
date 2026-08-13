/**
 * Blog post detail page.
 * Dynamic route: /blog/[slug]
 *
 * Shows the full article with share buttons and lead conversion CTA.
 */

import type { Metadata } from 'next';
import Link from 'next/link';
import PostDetailClient from './PostDetailClient';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  // In production, fetch from API and generate real metadata
  return {
    title: `${slug.replace(/-/g, ' ')} | Todo Motor Blog`,
    description: 'Leia esta notícia exclusiva no blog Todo Motor — o maior portal de veículos, máquinas e equipamentos do Brasil.',
    openGraph: {
      type: 'article',
      siteName: 'Todo Motor Blog',
    },
  };
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  return <PostDetailClient slug={slug} />;
}
