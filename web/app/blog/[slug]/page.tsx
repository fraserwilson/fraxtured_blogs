import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/lib/api";

type Props = {
  params: {
    slug: string;
  };
};

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlogBySlug(params.slug).catch(() => null);

  if (!post) {
    notFound();
  }

  return (
    <article className="rounded-xl border border-soft bg-white/80 p-8 shadow-sm">
      <header className="mb-8 space-y-3">
        <h1 className="text-4xl font-semibold tracking-tight">{post.title}</h1>
        <p className="text-sm text-foreground/65">
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
              return (
                <figure key={index} className="my-6">
                  <img src={imageMatch[1]} alt={`Document visual ${index + 1}`} className="w-full rounded-lg border border-soft" />
                </figure>
              );
            }

            const headingMatch = line.match(/^\{\{h([1-6]):([\s\S]+)\}\}$/);
            if (headingMatch) {
              const level = Number(headingMatch[1]);
              const text = headingMatch[2];

              if (level === 1) {
                return <h1 key={index} className="mt-8 text-4xl font-semibold tracking-tight">{text}</h1>;
              }

              if (level === 2) {
                return <h2 key={index} className="mt-7 text-3xl font-semibold tracking-tight">{text}</h2>;
              }

              if (level === 3) {
                return <h3 key={index} className="mt-6 text-2xl font-semibold tracking-tight">{text}</h3>;
              }

              if (level === 4) {
                return <h4 key={index} className="mt-5 text-xl font-semibold tracking-tight">{text}</h4>;
              }

              if (level === 5) {
                return <h5 key={index} className="mt-5 text-lg font-semibold tracking-tight uppercase tracking-[0.06em]">{text}</h5>;
              }

              return <h6 key={index} className="mt-4 text-base font-semibold uppercase tracking-[0.08em] text-foreground/75">{text}</h6>;
            }

            const quoteMatch = line.match(/^\{\{quote:([\s\S]+)\}\}$/);
            if (quoteMatch) {
              return (
                <blockquote key={index} className="my-5 border-l-4 border-accent/65 pl-4 text-foreground/80 italic">
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
