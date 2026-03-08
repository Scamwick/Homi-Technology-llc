import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "HōMI — Decision Readiness Intelligence",
  description: "The voice nobody else provides. Now here. HōMI tells you if you're ready to make a major decision—not just how to do it.",
  keywords: ["decision readiness", "financial planning", "home buying", "readiness assessment", "HōMI"],
  authors: [{ name: "HOMI TECHNOLOGIES LLC" }],
  openGraph: {
    title: "HōMI — Decision Readiness Intelligence",
    description: "Every major purchase you make has one person missing from the table. Someone with no incentive to push you forward.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-[#0B0F19] text-white`}
      >
        {children}
      </body>
    </html>
  );
}
