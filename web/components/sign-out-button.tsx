"use client";

import { signOut } from "next-auth/react";

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/" })}
      className="btn-outline rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-white"
    >
      Sign out
    </button>
  );
}
