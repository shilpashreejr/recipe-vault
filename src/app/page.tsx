"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navigation from "@/components/layout/Navigation";
import { AnimatedBackground } from "@/components/ui/FloatingElements";
import { useScrollAnimation } from "@/hooks/useScrollAnimation";
import { AnimatedButton } from "@/components/ui/AnimatedButton";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  // Scroll animation hooks for different sections
  const { elementRef: featuresRef, isVisible: featuresVisible } = useScrollAnimation();
  const { elementRef: sourcesRef, isVisible: sourcesVisible } = useScrollAnimation();
  const { elementRef: planningRef, isVisible: planningVisible } = useScrollAnimation();

  useEffect(() => {
    setIsLoaded(true);
    
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
        {/* Animated Background */}
        <AnimatedBackground />
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            {/* Main heading with staggered animation */}
            <div className="mb-6">
              <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl leading-tight">
                <span className={`gradient-text animate-slide-in-top ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                  Your Ultimate
                </span>
                <br />
                <span className={`text-foreground animate-slide-in-top ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
                  Recipe Vault
                </span>
                <br />
                <span className={`gradient-text animate-slide-in-top ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ animationDelay: '0.6s' }}>
                  & Meal Planner
                </span>
              </h1>
            </div>
            
            {/* Subtitle with fade in animation */}
            <p className={`text-foreground/70 text-lg sm:text-xl lg:text-2xl mb-8 font-body font-light max-w-3xl mx-auto leading-relaxed animate-fade-in-up ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
              Extract recipes from anywhere - social media, blogs, notes, images - and create personalized meal plans 
              with smart repetition strategies. Your culinary journey, simplified.
            </p>
            
            {/* CTA Buttons with enhanced animations */}
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 animate-fade-in-up ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ animationDelay: '1s' }}>
              <AnimatedButton 
                href="/recipes/upload"
                variant="primary"
                size="lg"
              >
                Start Extracting Recipes
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </AnimatedButton>
              <AnimatedButton 
                href="/meal-plans"
                variant="glass"
                size="lg"
              >
                Create Meal Plan
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </AnimatedButton>
            </div>

            {/* Feature Highlights with staggered animations */}
            <div ref={featuresRef} className={`grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto animate-fade-in-up ${isLoaded ? 'opacity-100' : 'opacity-0'}`} style={{ animationDelay: '1.2s' }}>
              <div className={`glass rounded-xl p-6 text-center hover-lift transition-all duration-500 ${featuresVisible ? 'animate-slide-in-bottom' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-breathe">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Extract from Anywhere</h3>
                <p className="text-foreground/70 text-sm">URLs, social media, images, Evernote, Apple Notes</p>
              </div>
              <div className={`glass rounded-xl p-6 text-center hover-lift transition-all duration-500 ${featuresVisible ? 'animate-slide-in-bottom' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-breathe" style={{ animationDelay: '0.5s' }}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">Smart Meal Planning</h3>
                <p className="text-foreground/70 text-sm">Personalized plans with repetition strategies</p>
              </div>
              <div className={`glass rounded-xl p-6 text-center hover-lift transition-all duration-500 ${featuresVisible ? 'animate-slide-in-bottom' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center mx-auto mb-4 animate-breathe" style={{ animationDelay: '1s' }}>
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

        {/* Enhanced Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center animate-pulse-glow">
            <div className="w-1 h-3 bg-primary rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Data Extraction Sources Section */}
      <section ref={sourcesRef} className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`font-display font-bold text-4xl sm:text-5xl mb-6 gradient-text ${sourcesVisible ? 'animate-slide-in-top' : 'opacity-0'}`}>
              Extract Recipes from Anywhere
            </h2>
            <p className={`text-foreground/70 text-lg font-body font-light max-w-3xl mx-auto ${sourcesVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              Our advanced extraction technology works with all your favorite sources. From social media to notes apps, 
              we've got you covered.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Social Media */}
            <div className={`group glass rounded-2xl p-8 hover-lift transition-all duration-500 ${sourcesVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.1s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 animate-breathe">
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
            <div className={`group glass rounded-2xl p-8 hover-lift transition-all duration-500 ${sourcesVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 animate-breathe" style={{ animationDelay: '0.5s' }}>
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
            <div className={`group glass rounded-2xl p-8 hover-lift transition-all duration-500 ${sourcesVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.3s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 animate-breathe" style={{ animationDelay: '1s' }}>
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
            <div className={`group glass rounded-2xl p-8 hover-lift transition-all duration-500 ${sourcesVisible ? 'animate-fade-in-up' : 'opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 animate-breathe" style={{ animationDelay: '1.5s' }}>
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
      <section ref={planningRef} className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-accent/10"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`font-display font-bold text-4xl sm:text-5xl mb-6 gradient-text ${planningVisible ? 'animate-slide-in-top' : 'opacity-0'}`}>
              Smart Meal Planning
            </h2>
            <p className={`text-foreground/70 text-lg font-body font-light max-w-3xl mx-auto ${planningVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
              Create personalized meal plans that adapt to your lifestyle, preferences, and cooking schedule.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Features List */}
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xl mb-2 text-foreground">Smart Repetition Strategies</h3>
                  <p className="text-foreground/70 font-body leading-relaxed">
                    Choose your comfort level: No repetition, Smart repetition, or Aggressive repetition for maximum efficiency.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xl mb-2 text-foreground">Favorite Recipe Integration</h3>
                  <p className="text-foreground/70 font-body leading-relaxed">
                    Automatically include your favorite recipes in meal plans with intelligent rotation to prevent burnout.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xl mb-2 text-foreground">Flexible Cooking Schedule</h3>
                  <p className="text-foreground/70 font-body leading-relaxed">
                    Plan around your availability with cooking days, quick meal days, leftovers, and no-cook options.
                  </p>
                </div>
              </div>

              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-display font-semibold text-xl mb-2 text-foreground">Automatic Shopping Lists</h3>
                  <p className="text-foreground/70 font-body leading-relaxed">
                    Generate organized shopping lists from your meal plans with smart ingredient consolidation.
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Preview */}
            <div className="glass rounded-2xl p-8">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-semibold text-lg text-foreground">Sample Meal Plan</h3>
                  <span className="text-sm text-foreground/60">Week of March 1st</span>
                </div>
                <div className="space-y-3">
                  {['Monday - Cooking Day', 'Tuesday - Quick Meals', 'Wednesday - Leftovers', 'Thursday - Cooking Day', 'Friday - No Cook'].map((day, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-lg bg-white/5">
                      <div className="w-3 h-3 bg-primary rounded-full"></div>
                      <span className="text-foreground/80 text-sm">{day}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-foreground/60">Favorites included:</span>
                    <span className="text-primary font-medium">4 recipes</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mt-1">
                    <span className="text-foreground/60">Repetition strategy:</span>
                    <span className="text-primary font-medium">Smart</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl sm:text-5xl mb-6 gradient-text">
              Trusted by Home Chefs
            </h2>
            <p className="text-foreground/70 text-lg font-body font-light max-w-2xl mx-auto">
              Join thousands of users who have transformed their cooking experience.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-primary mb-2">10,000+</div>
              <div className="text-foreground/70 font-body">Recipes Extracted</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-primary mb-2">5,000+</div>
              <div className="text-foreground/70 font-body">Meal Plans Created</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-display font-bold text-primary mb-2">98%</div>
              <div className="text-foreground/70 font-body">Extraction Success Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-6 text-foreground">
            Ready to Transform Your Cooking?
          </h2>
          <p className="text-foreground/70 text-lg font-body font-light mb-8 max-w-2xl mx-auto">
            Start extracting recipes from anywhere and create personalized meal plans that fit your lifestyle.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/recipes/upload"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-body font-semibold text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
            >
              Start Extracting Recipes
            </Link>
            <Link 
              href="/meal-plans"
              className="glass px-8 py-4 rounded-full font-body font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:scale-105"
            >
              Create Meal Plan
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-border">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-sm">R</span>
              </div>
              <span className="font-display font-semibold text-lg gradient-text">RecipeVault</span>
            </div>
            <div className="flex space-x-6 text-foreground/60 font-body">
              <Link href="/recipes" className="hover:text-primary transition-colors duration-300">Recipes</Link>
              <Link href="/meal-plans" className="hover:text-primary transition-colors duration-300">Meal Plans</Link>
              <Link href="/favorites" className="hover:text-primary transition-colors duration-300">Favorites</Link>
              <Link href="/categories" className="hover:text-primary transition-colors duration-300">Categories</Link>
              <Link href="/recipes/upload" className="hover:text-primary transition-colors duration-300">Upload</Link>
              <Link href="/(auth)/login" className="hover:text-primary transition-colors duration-300">Login</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-border text-center">
            <p className="text-foreground/50 font-body text-sm">
              © 2024 RecipeVault. All rights reserved. Crafted with passion for culinary excellence.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
