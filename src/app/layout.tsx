import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QuakePulse — Real-Time Earthquake Monitor",
  description:
    "Live earthquake tracking powered by USGS data. Interactive map, statistics, and trend analysis for seismic activity worldwide.",
  keywords: ["earthquake", "seismic", "USGS", "real-time", "monitor", "map"],
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
      <body className="h-full bg-gray-950 text-gray-100 flex flex-col">{children}</body>
    </html>
  );
}
