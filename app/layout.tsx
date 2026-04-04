import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://homitechnology.com"),
  title: {
    default: "HōMI — Decision Readiness Intelligence™",
    template: "%s | HōMI",
  },
  description:
    "The first AI that tells you IF you're ready, not just HOW. Decision Readiness Intelligence for every major life decision.",
  keywords: [
    "decision readiness",
    "AI assessment",
    "financial readiness",
    "HōMI Score",
    "major life decisions",
    "home buying readiness",
    "career change readiness",
    "investment readiness",
    "decision intelligence",
    "readiness score",
    "life decision AI",
    "emotional readiness",
    "timing analysis",
    "HōMI",
    "HOMI TECHNOLOGIES",
    "decision readiness intelligence",
  ],
  authors: [{ name: "HOMI TECHNOLOGIES LLC" }],
  creator: "HOMI TECHNOLOGIES LLC",
  publisher: "HOMI TECHNOLOGIES LLC",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://homitechnology.com",
    siteName: "HōMI",
    title: "HōMI — Decision Readiness Intelligence™",
    description:
      "The first AI that tells you IF you're ready, not just HOW.",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Homi_Tech",
    creator: "@Homi_Tech",
    title: "HōMI — Decision Readiness Intelligence™",
    description:
      "The first AI that tells you IF you're ready, not just HOW.",
  },
  icons: {
    icon: '/icon',
  },
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a1628",
  colorScheme: "dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fraunces.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
