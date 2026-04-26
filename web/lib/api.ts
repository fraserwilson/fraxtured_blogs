import { BlogPost, BlogSummary, PagedResult, SearchResult, UploadResponse } from "@/lib/types";

const basePath = process.env.NEXT_PUBLIC_API_BASE_PATH ?? "/api";
const internalApiBaseUrl = process.env.INTERNAL_API_BASE_URL;

function resolveBaseUrl() {
  if (typeof window !== "undefined") {
    return basePath;
  }

  return internalApiBaseUrl ?? "http://localhost:5050/api";
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${resolveBaseUrl()}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {})
    },
    cache: "no-store"
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API ${response.status}: ${body || "Unknown error"}`);
  }

  return (await response.json()) as T;
}

export async function getPublishedBlogs(page = 1, pageSize = 10): Promise<PagedResult<BlogSummary>> {
  return request<PagedResult<BlogSummary>>(`/blogs?page=${page}&pageSize=${pageSize}`);
}

export async function getBlogBySlug(slug: string): Promise<BlogPost> {
  return request<BlogPost>(`/blogs/${slug}`);
}

export async function searchBlogs(query: string): Promise<SearchResult> {
  return request<SearchResult>(`/blogs/search?q=${encodeURIComponent(query)}`);
}

export async function uploadBlog(form: FormData, token?: string): Promise<UploadResponse> {
  const response = await fetch("/api/upload", {
    method: "POST",
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Upload failed: ${body || response.statusText}`);
  }

  return (await response.json()) as UploadResponse;
}
