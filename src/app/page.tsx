"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navigation from "@/components/layout/Navigation";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl mb-6 leading-tight">
              <span className="gradient-text">Your Ultimate</span>
              <br />
              <span className="text-foreground">Recipe Vault</span>
              <br />
              <span className="gradient-text">& Meal Planner</span>
            </h1>
            
            <p className="text-foreground/70 text-lg sm:text-xl lg:text-2xl mb-8 font-body font-light max-w-3xl mx-auto leading-relaxed">
              Extract recipes from anywhere - social media, blogs, notes, images - and create personalized meal plans 
              with smart repetition strategies. Your culinary journey, simplified.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link 
                href="/recipes/upload"
                className="group bg-primary text-primary-foreground px-8 py-4 rounded-full font-body font-semibold text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Start Extracting Recipes
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
              <Link 
                href="/meal-plans"
                className="group glass px-8 py-4 rounded-full font-body font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                Create Meal Plan
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
            </div>

            {/* Feature Highlights */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="glass rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Extract from Anywhere</h3>
                <p className="text-foreground/70 text-sm">URLs, social media, images, Evernote, Apple Notes</p>
              </div>
              <div className="glass rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Smart Meal Planning</h3>
                <p className="text-foreground/70 text-sm">Personalized plans with repetition strategies</p>
              </div>
              <div className="glass rounded-xl p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Organize & Share</h3>
                <p className="text-foreground/70 text-sm">Favorites, categories, print & share</p>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Data Extraction Sources Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl sm:text-5xl mb-6 gradient-text">
              Extract Recipes from Anywhere
            </h2>
            <p className="text-foreground/70 text-lg font-body font-light max-w-3xl mx-auto">
              Our advanced extraction technology works with all your favorite sources. From social media to notes apps, 
              we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Social Media */}
            <div className="group glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Social Media</h3>
              <p className="text-foreground/70 font-body leading-relaxed mb-4">
                Instagram, TikTok, Pinterest, Facebook, Twitter, YouTube
              </p>
              <ul className="text-foreground/60 text-sm space-y-1">
                <li>• Instagram Reels & Posts</li>
                <li>• TikTok Video Descriptions</li>
                <li>• Pinterest Recipe Pins</li>
                <li>• Facebook Recipe Posts</li>
              </ul>
            </div>

            {/* Notes Apps */}
            <div className="group glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Notes Apps</h3>
              <p className="text-foreground/70 font-body leading-relaxed mb-4">
                Evernote, Apple Notes, and more
              </p>
              <ul className="text-foreground/60 text-sm space-y-1">
                <li>• Evernote API Integration</li>
                <li>• Apple Notes Export</li>
                <li>• Notebook Organization</li>
                <li>• Rich Text Support</li>
              </ul>
            </div>

            {/* Web & Blogs */}
            <div className="group glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0-9H3" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Web & Blogs</h3>
              <p className="text-foreground/70 font-body leading-relaxed mb-4">
                Any recipe website or food blog
              </p>
              <ul className="text-foreground/60 text-sm space-y-1">
                <li>• Food Blog URLs</li>
                <li>• Recipe Websites</li>
                <li>• Cooking Blogs</li>
                <li>• Restaurant Sites</li>
              </ul>
            </div>

            {/* Images & OCR */}
            <div className="group glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Images & OCR</h3>
              <p className="text-foreground/70 font-body leading-relaxed mb-4">
                Screenshots, photos, handwritten notes
              </p>
              <ul className="text-foreground/60 text-sm space-y-1">
                <li>• Photo Screenshots</li>
                <li>• Handwritten Recipes</li>
                <li>• Recipe Cards</li>
                <li>• Menu Photos</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Meal Planning Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl sm:text-5xl mb-6 gradient-text">
              Smart Meal Planning
            </h2>
            <p className="text-foreground/70 text-lg font-body font-light max-w-3xl mx-auto">
              Create personalized meal plans that adapt to your lifestyle, preferences, and cooking schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Meal Planning Feature 1 */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Smart Repetition</h3>
              <p className="text-foreground/70 font-body leading-relaxed">
                Our AI analyzes your preferences and suggests optimal meal repetition patterns to reduce food waste and save time.
              </p>
            </div>

            {/* Meal Planning Feature 2 */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Time Management</h3>
              <p className="text-foreground/70 font-body leading-relaxed">
                Plan meals around your schedule with smart prep time estimates and cooking duration optimization.
              </p>
            </div>

            {/* Meal Planning Feature 3 */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Dietary Preferences</h3>
              <p className="text-foreground/70 font-body leading-relaxed">
                Customize plans for dietary restrictions, allergies, and personal taste preferences with intelligent filtering.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-6 gradient-text">
            Ready to Transform Your Cooking?
          </h2>
          <p className="text-foreground/70 text-lg font-body font-light mb-8 max-w-2xl mx-auto">
            Join thousands of home cooks who have simplified their meal planning and recipe organization with RecipeVault.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/recipes/upload"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-body font-semibold text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              Get Started Free
            </Link>
            <Link 
              href="/recipes"
              className="glass px-8 py-4 rounded-full font-body font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              Browse Recipes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
