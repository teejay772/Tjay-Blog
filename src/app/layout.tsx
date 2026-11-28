import type { Metadata } from "next";
import localFont from "next/font/local";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Suspense } from "react";
import { AppToaster } from "@/components/AppToaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { site, publicationUrl, FEED_PATH } from "@/lib/site";
import "./globals.css";
import "./mobile.css";
import "./reader.css";

const geistSans = localFont({
  src: "../../public/fonts/ibm-plex-sans-latin.woff2",
  variable: "--font-geist-sans",
  weight: "100 700",
  display: "swap",
});

const newsreader = localFont({
  src: [
    { path: "../../public/fonts/newsreader-latin.woff2", style: "normal", weight: "200 800" },
    { path: "../../public/fonts/newsreader-italic-latin.woff2", style: "italic", weight: "200 800" },
  ],
  variable: "--font-newsreader",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(publicationUrl()),
  title: {
    default: `${site.name} — ${site.tagline}`,
    template: `%s | ${site.name}`,
  },
  description: site.description,
  alternates: { types: { "application/rss+xml": FEED_PATH } },
  icons: {
    icon: "/brand/abyss-logo.png",
    shortcut: "/brand/abyss-logo.png",
    apple: "/brand/abyss-logo.png",
  },
  openGraph: {
    type: "website",
    siteName: site.name,
    title: site.name,
    description: site.description,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.description,
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <TooltipProvider>
          {children}
          <Suspense>
            <AppToaster />
          </Suspense>
        </TooltipProvider>
        <SpeedInsights />
      </body>
    </html>
  );
}
