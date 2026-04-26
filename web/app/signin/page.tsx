"use client";

import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const errorMessages: Record<string, string> = {
  AccessDenied: "This account is not allowed to upload.",
  OAuthSignin: "Microsoft sign-in could not be started.",
  OAuthCallback: "Microsoft sign-in callback failed. Check app credentials and redirect URI.",
  OAuthCreateAccount: "Account creation during OAuth failed.",
  OAuthAccountNotLinked: "This email is linked to a different sign-in method.",
  Configuration: "Authentication is not configured correctly.",
  default: "Sign-in failed. Please try again."
};

export default function SignInPage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const errorMessage = errorCode
    ? (errorMessages[errorCode] ?? errorMessages.default)
    : null;

  return (
    <section className="mx-auto max-w-xl rounded-xl border border-soft bg-white/85 p-8 shadow-sm">
      <h1 className="text-3xl font-semibold tracking-tight">Sign in</h1>
      <p className="mt-2 text-foreground/75">
        Sign in with your Microsoft account. Only allowed accounts can access uploads.
      </p>
      {errorMessage ? (
        <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

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
