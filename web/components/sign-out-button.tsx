"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="rounded-md bg-accent px-3 py-2 text-white transition hover:opacity-90"
    >
      Sign out
    </button>
  );
}
