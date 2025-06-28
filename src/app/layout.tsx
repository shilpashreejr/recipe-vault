import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RecipeVault - Smart Recipe Extraction & Management",
  description: "Extract, organize, and manage recipes from URLs, Instagram Reels, and images with AI-powered technology.",
  keywords: ["recipes", "cooking", "food", "recipe extraction", "meal planning", "culinary"],
  authors: [{ name: "RecipeVault Team" }],
  openGraph: {
    title: "RecipeVault - Smart Recipe Extraction & Management",
    description: "Extract, organize, and manage recipes from URLs, Instagram Reels, and images with AI-powered technology.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
