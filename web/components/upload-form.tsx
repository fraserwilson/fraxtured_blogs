"use client";

import { FormEvent, useState } from "react";
import { uploadBlog } from "@/lib/api";

export function UploadForm() {
  const [status, setStatus] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const publishNowInput = formElement.querySelector<HTMLInputElement>('input[name="publishNow"]');
    formData.set("publishNow", publishNowInput?.checked ? "true" : "false");

    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      setStatus("Please choose a DOCX or PDF file.");
      return;
    }

    const extension = file.name.split(".").pop()?.toLowerCase();
    if (!extension || !["docx", "pdf"].includes(extension)) {
      setStatus("Only .docx and .pdf files are accepted.");
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      setStatus("File is too large. Max size is 50MB.");
      return;
    }

    setIsUploading(true);
    setStatus("Uploading and processing...");

    try {
      const response = await uploadBlog(formData);
      setStatus(`Upload complete. Status: ${response.status}. Go to Home to see the post card.`);
      formElement.reset();
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <div className="space-y-3">
        <p className="kicker">Creator Studio</p>
        <h1 className="title-display text-4xl font-bold tracking-tight md:text-5xl">Upload A New Post</h1>
        <p className="text-[color:var(--muted)]">
          Submit your DOCX/PDF file plus metadata. The API extracts text and can publish immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="panel space-y-4 p-6 md:p-8">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground/80">Title</span>
          <input name="title" required className="field" />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground/80">Summary (optional)</span>
          <textarea name="summary" rows={3} className="field" />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground/80">Tags (comma-separated)</span>
          <input name="tags" placeholder="wrestling, pokemon, games, apps" className="field" />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium text-foreground/80">Document</span>
          <input name="file" type="file" accept=".docx,.pdf" required className="field" />
        </label>

        <label className="flex items-center gap-2 text-sm text-foreground/80">
          <input type="checkbox" name="publishNow" defaultChecked className="h-4 w-4 rounded border-soft" />
          Publish immediately
        </label>

        <button
          type="submit"
          disabled={isUploading}
          className="btn-primary px-5 py-2.5 text-sm disabled:cursor-not-allowed disabled:opacity-55"
        >
          {isUploading ? "Processing..." : "Upload"}
        </button>
      </form>

      {status ? <p className="rounded-lg border border-soft bg-white/70 px-4 py-3 text-sm text-foreground/75">{status}</p> : null}
    </section>
  );
}
