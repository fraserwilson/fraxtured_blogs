import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import { getBlogBySlug } from "@/lib/api";

type Props = {
  params: {
    slug: string;
  };
};

const getPost = cache(async (slug: string) => getBlogBySlug(slug).catch(() => null));

function createDescription(summary: string | null, contentText: string): string {
  if (summary && summary.trim().length > 0) {
    return summary.trim();
  }

  const plainText = contentText
    .replace(/\{\{imgurl:[\s\S]+?\}\}/g, " ")
    .replace(/\{\{h[1-6]:([\s\S]+?)\}\}/g, "$1")
    .replace(/\{\{quote:([\s\S]+?)\}\}/g, "$1")
    .replace(/\s+/g, " ")
    .trim();

  if (plainText.length <= 160) {
    return plainText;
  }

  return `${plainText.slice(0, 157).trimEnd()}...`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: "Post not found",
      robots: {
        index: false,
        follow: false
      }
    };
  }

  const description = createDescription(post.summary, post.contentText);

  return {
    title: post.title,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`
    },
    openGraph: {
      type: "article",
      title: post.title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.createdAt,
      authors: [post.authorName],
      tags: post.tags
    },
    twitter: {
      card: "summary_large_image",
      title: post.title,
      description
    }
  };
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getPost(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="panel fade-rise p-6 md:p-10">
      <header className="mb-8 space-y-3 border-b border-soft/70 pb-6">
        <p className="kicker">Fractured_Blogs post</p>
        <h1 className="title-display text-4xl font-bold tracking-tight md:text-5xl">{post.title}</h1>
        <p className="text-sm uppercase tracking-[0.08em] text-foreground/65">
          {new Date(post.createdAt).toLocaleDateString()} · {post.readTimeMinutes} min read
        </p>
      </header>

      <section className="prose-like">
        {post.contentText
          .split("\n")
          .filter((line) => line.trim().length > 0)
          .map((rawLine, index) => {
            const line = rawLine.trim();
            const imageMatch = line.match(/^\{\{imgurl:(.+)\}\}$/);
            if (imageMatch) {
              const imageUrl = imageMatch[1];
              if (!imageUrl.startsWith("/api/blogs/assets?key=") && !imageUrl.includes("/api/blogs/assets?key=")) {
                return null;
              }

              return (
                <figure key={index} className="my-8 overflow-hidden rounded-2xl border border-soft bg-white/70 p-2">
                  <img src={imageUrl} alt={`Document visual ${index + 1}`} className="w-full rounded-xl border border-soft/60" />
                </figure>
              );
            }

            const headingMatch = line.match(/^\{\{h([1-6]):([\s\S]+)\}\}$/);
            if (headingMatch) {
              const level = Number(headingMatch[1]);
              const text = headingMatch[2];

              if (level === 1) {
                return <h1 key={index} className="title-display mt-10 text-4xl font-bold tracking-tight md:text-5xl">{text}</h1>;
              }

              if (level === 2) {
                return <h2 key={index} className="title-display mt-10 text-3xl font-semibold tracking-tight md:text-4xl">{text}</h2>;
              }

              if (level === 3) {
                return <h3 key={index} className="title-display mt-8 text-2xl font-semibold tracking-tight md:text-3xl">{text}</h3>;
              }

              if (level === 4) {
                return <h4 key={index} className="title-display mt-7 text-xl font-semibold tracking-tight md:text-2xl">{text}</h4>;
              }

              if (level === 5) {
                return <h5 key={index} className="title-display mt-6 text-lg font-semibold tracking-tight uppercase tracking-[0.06em]">{text}</h5>;
              }

              return <h6 key={index} className="title-display mt-4 text-base font-semibold uppercase tracking-[0.08em] text-foreground/75">{text}</h6>;
            }

            const quoteMatch = line.match(/^\{\{quote:([\s\S]+)\}\}$/);
            if (quoteMatch) {
              return (
                <blockquote key={index} className="my-6 border-l-4 border-accent/65 pl-4 text-foreground/80 italic">
                  {quoteMatch[1]}
                </blockquote>
              );
            }

            return <p key={index}>{line}</p>;
          })}
      </section>
    </article>
  );
}
