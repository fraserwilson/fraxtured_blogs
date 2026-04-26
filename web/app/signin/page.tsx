"use client";

import { signIn } from "next-auth/react";

export default function SignInPage() {
  return (
    <section className="mx-auto max-w-xl rounded-xl border border-soft bg-white/85 p-8 shadow-sm">
      <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-foreground/75">
        Sign in with your Microsoft account. Only allowed accounts can access uploads.
      </p>

      <button
        type="button"
        onClick={() => signIn("azure-ad", { callbackUrl: "/upload" })}
        className="mt-6 rounded-md bg-accent px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
      >
        Sign in with Microsoft
      </button>
    </section>
  );
}
