import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { SignOutButton } from "@/components/sign-out-button";
import { ThemeToggle } from "@/components/theme-toggle";

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const isSignedIn = Boolean(session?.user?.email);

  return (
    <header className="site-header sticky top-0 z-40">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-5 py-4 md:px-8">
        <Link href="/" className="title-display text-2xl font-bold tracking-tight text-white transition hover:text-[#00d4ff]">
          fractured_<span className="text-[#00d4ff]">blogs</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm font-medium">
          <Link
            href="/"
            className="rounded-sm border border-transparent px-3 py-2 text-[color:var(--muted)] transition hover:border-[#2a2a2a] hover:text-[#00d4ff]"
          >
            Posts
          </Link>
          {isSignedIn ? (
            <>
              <Link
                href="/upload"
                className="rounded-sm border border-transparent px-3 py-2 text-[color:var(--muted)] transition hover:border-[#2a2a2a] hover:text-[#00d4ff]"
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
