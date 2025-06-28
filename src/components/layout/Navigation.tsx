"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'glass py-4' : 'bg-transparent py-6'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 group">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-primary-foreground font-display font-bold text-lg">R</span>
            </div>
            <span className="font-display font-semibold text-xl gradient-text">RecipeVault</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            <Link 
              href="/recipes" 
              className="text-foreground/80 hover:text-primary transition-colors duration-300 font-body font-medium relative group"
            >
              Browse Recipes
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/recipes/upload" 
              className="text-foreground/80 hover:text-primary transition-colors duration-300 font-body font-medium relative group"
            >
              Upload Recipe
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/meal-plans" 
              className="text-foreground/80 hover:text-primary transition-colors duration-300 font-body font-medium relative group"
            >
              Meal Planning
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/favorites" 
              className="text-foreground/80 hover:text-primary transition-colors duration-300 font-body font-medium relative group"
            >
              Favorites
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/categories" 
              className="text-foreground/80 hover:text-primary transition-colors duration-300 font-body font-medium relative group"
            >
              Categories
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/(auth)/login" 
              className="text-foreground/80 hover:text-primary transition-colors duration-300 font-body font-medium relative group"
            >
              Login
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full"></span>
            </Link>
            <Link 
              href="/(auth)/register" 
              className="bg-primary text-primary-foreground px-6 py-2 rounded-full font-body font-medium hover:bg-primary/90 transition-all duration-300 hover:scale-105"
            >
              Sign Up
            </Link>
          </div>

          {/* Tablet Navigation (simplified) */}
          <div className="hidden md:flex lg:hidden items-center space-x-6">
            <Link 
              href="/recipes" 
              className="text-foreground/80 hover:text-primary transition-colors duration-300 font-body font-medium"
            >
              Recipes
            </Link>
            <Link 
              href="/meal-plans" 
              className="text-foreground/80 hover:text-primary transition-colors duration-300 font-body font-medium"
            >
              Meal Plans
            </Link>
            <Link 
              href="/recipes/upload" 
              className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-body font-medium hover:bg-primary/90 transition-all duration-300"
            >
              Upload
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg glass hover:bg-white/10 transition-colors duration-300"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center">
              <span className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-1'
              }`}></span>
              <span className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0' : 'opacity-100'
              }`}></span>
              <span className={`block w-5 h-0.5 bg-foreground transition-all duration-300 ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-1'
              }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-300 overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="glass rounded-lg p-4 space-y-4">
            <Link 
              href="/recipes" 
              className="block text-foreground/80 hover:text-primary transition-colors duration-300 font-body font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Browse Recipes
            </Link>
            <Link 
              href="/recipes/upload" 
              className="block text-foreground/80 hover:text-primary transition-colors duration-300 font-body font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Upload Recipe
            </Link>
            <Link 
              href="/meal-plans" 
              className="block text-foreground/80 hover:text-primary transition-colors duration-300 font-body font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Meal Planning
            </Link>
            <Link 
              href="/favorites" 
              className="block text-foreground/80 hover:text-primary transition-colors duration-300 font-body font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Favorites
            </Link>
            <Link 
              href="/categories" 
              className="block text-foreground/80 hover:text-primary transition-colors duration-300 font-body font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Categories
            </Link>
            <Link 
              href="/(auth)/login" 
              className="block text-foreground/80 hover:text-primary transition-colors duration-300 font-body font-medium py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Login
            </Link>
            <Link 
              href="/(auth)/register" 
              className="block bg-primary text-primary-foreground px-4 py-2 rounded-full font-body font-medium hover:bg-primary/90 transition-all duration-300 text-center"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
} 