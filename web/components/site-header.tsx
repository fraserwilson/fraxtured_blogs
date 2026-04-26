import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const isSignedIn = Boolean(session?.user?.email);

  return (
    <header className="site-header sticky top-0 z-40 border-b border-soft/60 bg-[var(--header-bg)] backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="title-display text-2xl font-bold tracking-tight text-foreground">
          Fractured_Blogs
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium">
          <Link
            href="/"
            className="rounded-lg border border-transparent px-3 py-2 text-foreground/80 transition hover:border-soft hover:bg-white/70 hover:text-foreground"
          >
            Posts
          </Link>
          {isSignedIn ? (
            <>
              <Link
                href="/upload"
                className="rounded-lg border border-transparent px-3 py-2 text-foreground/80 transition hover:border-soft hover:bg-white/70 hover:text-foreground"
              >
                Upload
              </Link>
              <SignOutButton />
            </>
          ) : (
            <Link href="/signin" className="btn-primary px-4 py-2 text-sm">
              Sign in
            </Link>
          )}
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}
