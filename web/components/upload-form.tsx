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
    <section className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Upload Document</h1>
        <p className="mt-2 text-foreground/75">
          Submit your DOCX/PDF file plus metadata. The API extracts text and can publish immediately.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-soft bg-white/85 p-6 shadow-sm">
        <label className="block space-y-2">
          <span className="text-sm font-medium">Title</span>
          <input name="title" required className="w-full rounded-md border border-soft px-3 py-2" />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Summary (optional)</span>
          <textarea name="summary" rows={3} className="w-full rounded-md border border-soft px-3 py-2" />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Tags (comma-separated)</span>
          <input name="tags" placeholder="architecture, writing" className="w-full rounded-md border border-soft px-3 py-2" />
        </label>

        <label className="block space-y-2">
          <span className="text-sm font-medium">Document</span>
          <input name="file" type="file" accept=".docx,.pdf" required className="w-full rounded-md border border-soft px-3 py-2" />
        </label>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="publishNow" defaultChecked className="h-4 w-4 rounded border-soft" />
          Publish immediately
        </label>

        <button
          type="submit"
          disabled={isUploading}
          className="rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isUploading ? "Processing..." : "Upload"}
        </button>
      </form>

      {status ? <p className="text-sm text-foreground/75">{status}</p> : null}
    </section>
  );
}
