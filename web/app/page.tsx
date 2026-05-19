import Link from "next/link";
import type { Metadata } from "next";
import { getPublishedBlogs } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const metadata: Metadata = {
  title: "Home",
  description:
    "Explore Fractured Blogs posts on wrestling, gaming, tech, and everything else worth reading."
};

export default async function HomePage() {
  const posts = await getPublishedBlogs(1, 20).catch(() => ({
    items: [],
    page: 1,
    pageSize: 20,
    totalCount: 0
  }));

  return (
    <section className="space-y-8">
      <div className="panel fade-rise relative overflow-hidden p-7 md:p-10">
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[rgba(0,212,255,0.05)] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-[rgba(0,136,204,0.06)] blur-2xl" />
        <div className="relative space-y-3">
          <p className="kicker">Welcome to the chaos — in the best way possible.</p>
          <h1 className="title-display max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            A collection of everything I'm obsessed with.
          </h1>
          <p className="max-w-3xl text-lg text-[color:var(--muted)]">
            Wrestling storylines that deserve better. Pokémon nostalgia. Games I can't stop playing. Building apps and
            figuring things out as I go — it all ends up here.
          </p>
          <p className="max-w-3xl text-lg text-[color:var(--muted)]">No niche. No rules. Just things I think are worth your time.</p>
          <p className="max-w-3xl text-lg text-[color:var(--muted)]">Stick around — there's always something new loading.</p>
        </div>
      </div>

      <div className="grid gap-5">
        {posts.items.length === 0 ? (
          <div className="panel p-7">
            <p className="text-[color:var(--muted)]">No published posts yet. New posts are on the way.</p>
          </div>
        ) : null}

        {posts.items.map((post, index) => (
          <article
            key={post.id}
            className="panel fade-rise relative overflow-hidden p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_rgba(0,212,255,0.08)] md:p-7"
            style={{ animationDelay: `${Math.min(index * 40, 220)}ms` }}
          >
            <div className="absolute left-0 top-0 h-0.5 w-full bg-gradient-to-r from-[#00d4ff] via-[#0088cc] to-transparent" />
            {post.coverImageUrl ? (
              <div className="mb-4 overflow-hidden rounded border border-[#1e1e1e] bg-[#0a0a0a]">
                <img src={post.coverImageUrl} alt={`${post.title} cover image`} className="h-56 w-full object-cover" />
              </div>
            ) : null}
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.09em] text-[color:var(--muted)]">
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              <span>{post.readTimeMinutes} min read</span>
            </div>
            <h2 className="title-display text-2xl font-semibold md:text-3xl">
              <Link href={`/blog/${post.slug}`} className="transition hover:text-[#00d4ff]">
                {post.title}
              </Link>
            </h2>
            {post.summary ? <p className="mt-3 text-[color:var(--muted)]">{post.summary}</p> : null}
            {post.tags.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-sm border border-[#2a2a2a] bg-[rgba(0,212,255,0.05)] px-3 py-1 text-xs font-medium text-[color:var(--muted)]"
                  >
                    {tag}
                  </li>
                ))}
              </ul>
            ) : null}
          </article>
        ))}
      </div>
    </section>
  );
}
