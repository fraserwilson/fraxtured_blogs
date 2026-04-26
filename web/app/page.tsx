import Link from "next/link";
import { getPublishedBlogs } from "@/lib/api";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-[rgba(15,118,110,0.12)] blur-2xl" />
        <div className="pointer-events-none absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-[rgba(204,81,38,0.16)] blur-2xl" />
        <div className="relative space-y-3">
          <p className="kicker">Welcome to the chaos — in the best way possible.</p>
          <h1 className="title-display max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
            A collection of everything I’m obsessed with.
          </h1>
          <p className="max-w-3xl text-lg text-[color:var(--muted)]">
            Wrestling storylines that deserve better. Pokémon nostalgia. Games I can’t stop playing. Building apps and
            figuring things out as I go — it all ends up here.
          </p>
          <p className="max-w-3xl text-lg text-[color:var(--muted)]">No niche. No rules. Just things I think are worth your time.</p>
          <p className="max-w-3xl text-lg text-[color:var(--muted)]">Stick around — there’s always something new loading.</p>
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
            className="panel fade-rise relative overflow-hidden p-6 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_14px_32px_rgba(25,22,17,0.14)] md:p-7"
            style={{ animationDelay: `${Math.min(index * 40, 220)}ms` }}
          >
            <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-[var(--accent)] via-[var(--accent-2)] to-transparent" />
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.09em] text-foreground/55">
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              <span>{post.readTimeMinutes} min read</span>
            </div>
            <h2 className="title-display text-2xl font-semibold md:text-3xl">
              <Link href={`/blog/${post.slug}`} className="transition hover:text-accent">
                {post.title}
              </Link>
            </h2>
            {post.summary ? <p className="mt-3 text-[color:var(--muted)]">{post.summary}</p> : null}
            {post.tags.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li
                    key={tag}
                    className="rounded-full border border-soft bg-[rgba(15,118,110,0.08)] px-3 py-1 text-xs font-medium text-foreground/75"
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
