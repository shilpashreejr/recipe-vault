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
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        
        {/* Hero Content */}
        <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
          <div className={`transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl mb-6 leading-tight">
              <span className="gradient-text">Culinary</span>
              <br />
              <span className="text-foreground">Excellence</span>
              <br />
              <span className="gradient-text">Awaits</span>
            </h1>
            
            <p className="text-foreground/70 text-lg sm:text-xl lg:text-2xl mb-8 font-body font-light max-w-2xl mx-auto leading-relaxed">
              Discover, extract, and organize the world's finest recipes. From traditional classics to modern innovations, 
              your culinary journey starts here.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/recipes"
                className="group bg-primary text-primary-foreground px-8 py-4 rounded-full font-body font-semibold text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
              >
                Explore Recipes
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
              <Link 
                href="/recipes/upload"
                className="group glass px-8 py-4 rounded-full font-body font-semibold text-lg hover:bg-white/10 transition-all duration-300 hover:scale-105"
              >
                Upload Recipe
                <span className="inline-block ml-2 group-hover:translate-x-1 transition-transform duration-300">→</span>
              </Link>
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

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl sm:text-5xl mb-6 gradient-text">
              Why Choose RecipeVault?
            </h2>
            <p className="text-foreground/70 text-lg font-body font-light max-w-2xl mx-auto">
              Experience the future of recipe management with our cutting-edge features and elegant design.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="group glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Smart Extraction</h3>
              <p className="text-foreground/70 font-body leading-relaxed">
                Extract recipes from any URL, Instagram Reel, or image with our advanced AI-powered technology.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="group glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Organized Collections</h3>
              <p className="text-foreground/70 font-body leading-relaxed">
                Keep your recipes beautifully organized by categories, dietary preferences, and cooking styles.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="group glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-8 h-8 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Customizable Experience</h3>
              <p className="text-foreground/70 font-body leading-relaxed">
                Personalize your cooking experience with custom categories, tags, and recipe modifications.
              </p>
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
            Join thousands of home chefs who have already discovered the joy of organized recipe management.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/(auth)/register"
              className="bg-primary text-primary-foreground px-8 py-4 rounded-full font-body font-semibold text-lg hover:bg-primary/90 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
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
