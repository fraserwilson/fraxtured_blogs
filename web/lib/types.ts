export type BlogStatus = "draft" | "published";

export type BlogSummary = {
  id: string;
  title: string;
  slug: string;
  summary: string | null;
  authorName: string;
  tags: string[];
  createdAt: string;
  readTimeMinutes: number;
};

export type BlogPost = BlogSummary & {
  contentText: string;
  status: BlogStatus;
};

export type SearchResult = {
  items: BlogSummary[];
};

export type UploadResponse = {
  id: string;
  slug: string;
  status: BlogStatus;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
};
