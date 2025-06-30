"use client";

import Link from "next/link";
import Navigation from "@/components/layout/Navigation";

export default function RecipesExtractionPage() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        <div className="relative z-10 max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl mb-6 leading-tight">
              <span className="gradient-text">AI-Powered</span>
              <br />
              <span className="text-foreground">Recipe Extraction</span>
            </h1>
            
            <p className="text-foreground/70 text-lg sm:text-xl lg:text-2xl mb-8 font-body font-light max-w-3xl mx-auto leading-relaxed">
              Extract recipes from anywhere - URLs, social media, images, notes, and more. Our advanced AI technology 
              intelligently parses and organizes your recipes for easy access.
            </p>
          </div>

          {/* Extraction Methods Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* URL Extraction */}
            <Link href="/recipes/upload" className="group">
              <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0-9H3" />
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-xl mb-4 text-foreground">URL Extraction</h3>
                <p className="text-foreground/70 font-body leading-relaxed mb-4">
                  Extract recipes from any website, food blog, or recipe platform
                </p>
                <div className="text-primary font-semibold group-hover:translate-x-1 transition-transform duration-300">
                  Start Extracting →
                </div>
              </div>
            </Link>

            {/* Image Upload */}
            <Link href="/api/extract/image" className="group">
              <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Image & OCR</h3>
                <p className="text-foreground/70 font-body leading-relaxed mb-4">
                  Upload photos, screenshots, or handwritten recipe cards
                </p>
                <div className="text-primary font-semibold group-hover:translate-x-1 transition-transform duration-300">
                  Upload Image →
                </div>
              </div>
            </Link>

            {/* Evernote Integration */}
            <Link href="/api/extract/evernote" className="group">
              <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Evernote Sync</h3>
                <p className="text-foreground/70 font-body leading-relaxed mb-4">
                  Import recipes from your Evernote notebooks automatically
                </p>
                <div className="text-primary font-semibold group-hover:translate-x-1 transition-transform duration-300">
                  Connect Evernote →
                </div>
              </div>
            </Link>

            {/* Apple Notes */}
            <Link href="/api/extract/apple-notes" className="group">
              <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Apple Notes</h3>
                <p className="text-foreground/70 font-body leading-relaxed mb-4">
                  Import recipes from Apple Notes export files
                </p>
                <div className="text-primary font-semibold group-hover:translate-x-1 transition-transform duration-300">
                  Upload Notes →
                </div>
              </div>
            </Link>

            {/* Social Media */}
            <Link href="/api/extract/social-media" className="group">
              <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Social Media</h3>
                <p className="text-foreground/70 font-body leading-relaxed mb-4">
                  Extract from Instagram, TikTok, Pinterest, and more
                </p>
                <div className="text-primary font-semibold group-hover:translate-x-1 transition-transform duration-300">
                  Social Extraction →
                </div>
              </div>
            </Link>

            {/* Manual Entry */}
            <Link href="/recipes/upload" className="group">
              <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105 cursor-pointer">
                <div className="w-16 h-16 bg-gradient-to-br from-gray-500 to-gray-700 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Manual Entry</h3>
                <p className="text-foreground/70 font-body leading-relaxed mb-4">
                  Add recipes manually with our intuitive form
                </p>
                <div className="text-primary font-semibold group-hover:translate-x-1 transition-transform duration-300">
                  Add Recipe →
                </div>
              </div>
            </Link>
          </div>

          {/* Back to Home */}
          <div className="text-center">
            <Link 
              href="/"
              className="inline-flex items-center text-foreground/70 hover:text-foreground transition-colors duration-300"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
} 