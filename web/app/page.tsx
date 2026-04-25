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
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.12em] text-foreground/60">Document-driven publishing</p>
        <h1 className="text-4xl font-semibold tracking-tight">Write anywhere. Publish once.</h1>
        <p className="max-w-2xl text-foreground/80">
          Upload a DOCX or PDF, and Fractured_Blogs extracts your text and applies your website style automatically.
        </p>
      </div>

      <div className="grid gap-4">
        {posts.items.length === 0 ? (
          <div className="rounded-xl border border-soft bg-white/70 p-6">
            <p className="text-foreground/70">No published posts yet. Upload your first document.</p>
          </div>
        ) : null}

        {posts.items.map((post) => (
          <article key={post.id} className="rounded-xl border border-soft bg-white/80 p-6 shadow-sm">
            <div className="mb-3 flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.08em] text-foreground/55">
              <span>{new Date(post.createdAt).toLocaleDateString()}</span>
              <span>{post.readTimeMinutes} min read</span>
            </div>
            <h2 className="text-2xl font-semibold">
              <Link href={`/blog/${post.slug}`} className="transition hover:text-accent">
                {post.title}
              </Link>
            </h2>
            {post.summary ? <p className="mt-3 text-foreground/80">{post.summary}</p> : null}
            {post.tags.length > 0 ? (
              <ul className="mt-4 flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <li key={tag} className="rounded-full border border-soft px-3 py-1 text-xs text-foreground/70">
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
