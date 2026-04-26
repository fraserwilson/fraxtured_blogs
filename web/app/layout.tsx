import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { getSiteUrl } from "@/lib/site";

const siteUrl = getSiteUrl();
const siteName = "Fractured Blogs";
const siteDescription =
  "Fractured Blogs is a document-driven blog platform for publishing writing, ideas, and experiments without a rigid niche.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteName,
    template: `%s | ${siteName}`
  },
  description: siteDescription,
  applicationName: siteName,
  alternates: {
    canonical: "/"
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    siteName,
    title: siteName,
    description: siteDescription
  },
  twitter: {
    card: "summary_large_image",
    title: siteName,
    description: siteDescription
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1
    }
  }
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
