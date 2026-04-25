export function SiteHeader() {
  return (
    <header className="border-b border-soft/70 bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/70">
      <div className="mx-auto flex w-full max-w-5xl items-center justify-between px-6 py-4">
        <a href="/" className="text-xl font-semibold tracking-tight text-foreground">
          Fractured_Blogs
        </a>
        <nav className="flex items-center gap-4 text-sm font-medium">
          <a href="/" className="text-foreground/80 transition hover:text-foreground">
            Posts
          </a>
          <a href="/upload" className="rounded-md bg-accent px-3 py-2 text-white transition hover:opacity-90">
            Upload
          </a>
        </nav>
      </div>
    </header>
  );
}
