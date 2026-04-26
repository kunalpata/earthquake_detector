import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Replace with your real domain once deployed
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://quakepulse.com";

// Replace with your AdSense publisher ID (format: ca-pub-XXXXXXXXXXXXXXXX)
// Get this from https://adsense.google.com after creating your account
const ADSENSE_PUBLISHER_ID = process.env.NEXT_PUBLIC_ADSENSE_ID ?? "";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "QuakePulse — Real-Time Earthquake Monitor",
    template: "%s | QuakePulse",
  },
  description:
    "Live earthquake tracking powered by USGS data. Interactive map, magnitude filters, depth analysis, and real-time statistics for seismic activity worldwide.",
  keywords: [
    "earthquake",
    "seismic activity",
    "USGS earthquakes",
    "real-time earthquake map",
    "earthquake monitor",
    "earthquake tracker",
    "earthquake today",
    "seismology",
  ],
  authors: [{ name: "QuakePulse" }],
  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: "QuakePulse",
    title: "QuakePulse — Real-Time Earthquake Monitor",
    description:
      "Live earthquake tracking powered by USGS data. Interactive map with magnitude, depth, and trend analysis.",
    // Add og:image once you have a screenshot: images: [{ url: "/og-image.png" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "QuakePulse — Real-Time Earthquake Monitor",
    description: "Live earthquake tracking powered by USGS data.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased dark`}
    >
      <head>
        {/* Google AdSense — only injected when publisher ID is configured.
            Strategy="afterInteractive" defers the script so it never blocks
            the Leaflet map or first paint. Remove this block if switching to
            Ezoic (Ezoic injects its own script via their dashboard). */}
        {ADSENSE_PUBLISHER_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </head>
      <body className="h-full bg-gray-950 text-gray-100 flex flex-col">{children}</body>
    </html>
  );
}
