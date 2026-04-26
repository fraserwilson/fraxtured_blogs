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
  undefined:
    "Authentication provider is unavailable. Check AZURE_AD_CLIENT_ID / AZURE_AD_CLIENT_SECRET / AZURE_AD_TENANT_ID on the Railway web service.",
  default: "Sign-in failed. Please try again."
};

export default function SignInPage() {
  const searchParams = useSearchParams();
  const errorCode = searchParams.get("error");
  const errorMessage = errorCode
    ? (errorMessages[errorCode] ?? errorMessages.default)
    : null;

  return (
    <section className="panel mx-auto max-w-xl p-8">
      <p className="kicker">Members area</p>
      <h1 className="title-display mt-3 text-4xl font-bold tracking-tight">Sign in</h1>
      <p className="mt-2 text-[color:var(--muted)]">
        Sign in with your Microsoft account. Only allowed accounts can access uploads.
      </p>
      {errorMessage ? (
        <p className="mt-4 rounded-md border border-red-300/70 bg-red-50 px-3 py-2 text-sm text-red-700">
          {errorMessage}
        </p>
      ) : null}

      <button
        type="button"
        onClick={() => signIn("azure-ad", { callbackUrl: "/upload" })}
        className="btn-primary mt-6 px-5 py-2.5 text-sm"
      >
        Sign in with Microsoft
      </button>
    </section>
  );
}
