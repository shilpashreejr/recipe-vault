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
  creator: "RecipeVault",
  publisher: "RecipeVault",
  robots: "index, follow",
  openGraph: {
    title: "RecipeVault - Smart Recipe Extraction & Management",
    description: "Extract, organize, and manage recipes from URLs, Instagram Reels, and images with AI-powered technology.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "RecipeVault - Smart Recipe Extraction & Management",
    description: "Extract, organize, and manage recipes from URLs, Instagram Reels, and images with AI-powered technology.",
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
        <header className="w-full py-4 px-6 bg-gray-100 border-b mb-4">
          <nav>
            <span className="font-bold text-xl tracking-tight">RecipeVault</span>
            {/* Navigation links will go here */}
          </nav>
        </header>
        <main className="max-w-4xl mx-auto px-4">
          {children}
        </main>
      </body>
    </html>
  );
}
