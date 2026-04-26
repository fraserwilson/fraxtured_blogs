import type { MetadataRoute } from "next";
import { getPublishedBlogs } from "@/lib/api";
import { BlogSummary } from "@/lib/types";
import { getSiteUrl } from "@/lib/site";

async function getAllPublishedBlogs(pageSize = 100): Promise<BlogSummary[]> {
  const posts: BlogSummary[] = [];
  let page = 1;

  while (true) {
    const response = await getPublishedBlogs(page, pageSize).catch(() => null);
    if (!response || response.items.length === 0) {
      break;
    }

    posts.push(...response.items);

    const loadedCount = page * response.pageSize;
    if (loadedCount >= response.totalCount) {
      break;
    }

    page += 1;
  }

  return posts;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const posts = await getAllPublishedBlogs();

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1
    },
    ...posts.map((post) => ({
      url: `${siteUrl}/blog/${post.slug}`,
      lastModified: new Date(post.createdAt),
      changeFrequency: "weekly" as const,
      priority: 0.8
    }))
  ];
}
