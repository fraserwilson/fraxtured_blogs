import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";

export const metadata: Metadata = {
  title: "Fractured_Blogs",
  description: "Upload DOCX/PDF and publish styled blog posts."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main className="mx-auto w-full max-w-5xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
