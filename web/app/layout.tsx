import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Fractured_Blogs",
  description: "Upload DOCX/PDF and publish styled blog posts."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var stored=localStorage.getItem("theme");var dark=stored?stored==="dark":window.matchMedia("(prefers-color-scheme: dark)").matches;document.documentElement.classList.toggle("theme-dark",dark);document.documentElement.classList.toggle("theme-light",!dark);}catch(e){document.documentElement.classList.add("theme-light");}})();`
          }}
        />
      </head>
      <body>
        <SiteHeader />
        <main className="mx-auto w-full max-w-6xl px-5 py-8 md:px-8 md:py-12">{children}</main>
      </body>
    </html>
  );
}
