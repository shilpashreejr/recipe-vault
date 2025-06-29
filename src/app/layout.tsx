import type { Metadata } from "next";
import { Inter, Playfair_Display, Poppins } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
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
        className={`${inter.variable} ${playfairDisplay.variable} ${poppins.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
