"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

export default function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
  }, [pathname]);

  const isActiveLink = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-out ${
      isScrolled 
        ? 'bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20 py-3' 
        : 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md py-5'
    } border-b border-gray-200/50 dark:border-gray-700/50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="relative">
              <div className="w-12 h-12 bg-gradient-to-br from-primary via-primary/90 to-accent rounded-xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                <span className="text-primary-foreground font-display font-bold text-xl">R</span>
              </div>
              <div className="absolute inset-0 bg-gradient-to-br from-accent/20 to-primary/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-bold text-2xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent group-hover:from-accent group-hover:to-primary transition-all duration-300">
                RecipeVault
              </span>
              <span className="text-xs text-muted-foreground font-accent font-medium tracking-wider">
                Smart Recipe Management
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link 
              href="/recipes" 
              className={`relative px-4 py-2 rounded-lg font-body font-medium transition-all duration-300 group ${
                isActiveLink('/recipes') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
              }`}
            >
              Browse Recipes
              <span className={`absolute -bottom-1 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full group-hover:left-0 ${
                isActiveLink('/recipes') ? 'w-full left-0' : ''
              }`}></span>
            </Link>
            
            <Link 
              href="/recipes/upload" 
              className={`relative px-4 py-2 rounded-lg font-body font-medium transition-all duration-300 group ${
                isActiveLink('/recipes/upload') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
              }`}
            >
              Upload Recipe
              <span className={`absolute -bottom-1 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full group-hover:left-0 ${
                isActiveLink('/recipes/upload') ? 'w-full left-0' : ''
              }`}></span>
            </Link>
            
            <Link 
              href="/meal-plans" 
              className={`relative px-4 py-2 rounded-lg font-body font-medium transition-all duration-300 group ${
                isActiveLink('/meal-plans') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
              }`}
            >
              Meal Planning
              <span className={`absolute -bottom-1 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full group-hover:left-0 ${
                isActiveLink('/meal-plans') ? 'w-full left-0' : ''
              }`}></span>
            </Link>
            
            <Link 
              href="/favorites" 
              className={`relative px-4 py-2 rounded-lg font-body font-medium transition-all duration-300 group ${
                isActiveLink('/favorites') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
              }`}
            >
              Favorites
              <span className={`absolute -bottom-1 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full group-hover:left-0 ${
                isActiveLink('/favorites') ? 'w-full left-0' : ''
              }`}></span>
            </Link>
            
            <Link 
              href="/categories" 
              className={`relative px-4 py-2 rounded-lg font-body font-medium transition-all duration-300 group ${
                isActiveLink('/categories') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
              }`}
            >
              Categories
              <span className={`absolute -bottom-1 left-1/2 w-0 h-0.5 bg-gradient-to-r from-primary to-accent transition-all duration-300 group-hover:w-full group-hover:left-0 ${
                isActiveLink('/categories') ? 'w-full left-0' : ''
              }`}></span>
            </Link>
          </div>

          {/* User Actions */}
          <div className="hidden lg:flex items-center space-x-3">
            {/* Search Button */}
            <button 
              className="p-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all duration-300 group"
              aria-label="Search"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center space-x-2 p-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all duration-300 group"
                aria-label="User menu"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
                  <span className="text-primary-foreground font-body font-medium text-sm">U</span>
                </div>
                <svg className={`w-4 h-4 transition-transform duration-300 ${isUserMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* User Dropdown Menu */}
              <div className={`absolute right-0 top-full mt-2 w-56 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl shadow-xl shadow-black/10 dark:shadow-black/30 border border-gray-200/50 dark:border-gray-700/50 transition-all duration-300 ${
                isUserMenuOpen 
                  ? 'opacity-100 translate-y-0 pointer-events-auto' 
                  : 'opacity-0 -translate-y-2 pointer-events-none'
              }`}>
                <div className="p-2 space-y-1">
                  <Link 
                    href="/(auth)/login" 
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all duration-300 group"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-body font-medium">Login</span>
                  </Link>
                  
                  <Link 
                    href="/(auth)/register" 
                    className="flex items-center space-x-3 px-3 py-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all duration-300 group"
                  >
                    <svg className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                    </svg>
                    <span className="font-body font-medium">Sign Up</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Sign Up Button */}
            <Link 
              href="/(auth)/register" 
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-6 py-2.5 rounded-full font-body font-medium hover:shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300 group"
            >
              <span className="group-hover:translate-x-0.5 transition-transform duration-300">Get Started</span>
            </Link>
          </div>

          {/* Tablet Navigation (simplified) */}
          <div className="hidden md:flex lg:hidden items-center space-x-4">
            <Link 
              href="/recipes" 
              className={`px-3 py-2 rounded-lg font-body font-medium transition-all duration-300 ${
                isActiveLink('/recipes') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
              }`}
            >
              Recipes
            </Link>
            <Link 
              href="/meal-plans" 
              className={`px-3 py-2 rounded-lg font-body font-medium transition-all duration-300 ${
                isActiveLink('/meal-plans') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
              }`}
            >
              Meal Plans
            </Link>
            <Link 
              href="/recipes/upload" 
              className="bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-2 rounded-full font-body font-medium hover:shadow-lg hover:shadow-primary/25 hover:scale-105 transition-all duration-300"
            >
              Upload
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all duration-300 group"
            aria-label="Toggle mobile menu"
          >
            <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1">
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : '-translate-y-0.5'
              }`}></span>
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                isMobileMenuOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
              }`}></span>
              <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${
                isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-0.5'
              }`}></span>
            </div>
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className={`md:hidden transition-all duration-500 ease-out overflow-hidden ${
          isMobileMenuOpen ? 'max-h-96 opacity-100 mt-4' : 'max-h-0 opacity-0'
        }`}>
          <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-xl p-4 space-y-2 shadow-xl shadow-black/10 dark:shadow-black/30 border border-gray-200/50 dark:border-gray-700/50">
            <Link 
              href="/recipes" 
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-body font-medium transition-all duration-300 ${
                isActiveLink('/recipes') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Browse Recipes</span>
            </Link>
            
            <Link 
              href="/recipes/upload" 
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-body font-medium transition-all duration-300 ${
                isActiveLink('/recipes/upload') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <span>Upload Recipe</span>
            </Link>
            
            <Link 
              href="/meal-plans" 
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-body font-medium transition-all duration-300 ${
                isActiveLink('/meal-plans') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Meal Planning</span>
            </Link>
            
            <Link 
              href="/favorites" 
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-body font-medium transition-all duration-300 ${
                isActiveLink('/favorites') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>Favorites</span>
            </Link>
            
            <Link 
              href="/categories" 
              className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-body font-medium transition-all duration-300 ${
                isActiveLink('/categories') 
                  ? 'text-primary bg-primary/10' 
                  : 'text-foreground/70 hover:text-primary hover:bg-primary/5'
              }`}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              <span>Categories</span>
            </Link>
            
            <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-2 mt-2">
              <Link 
                href="/(auth)/login" 
                className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-foreground/70 hover:text-primary hover:bg-primary/5 transition-all duration-300"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                <span>Login</span>
              </Link>
              
              <Link 
                href="/(auth)/register" 
                className="flex items-center justify-center space-x-2 bg-gradient-to-r from-primary to-accent text-primary-foreground px-4 py-2.5 rounded-full font-body font-medium hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 mt-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span>Sign Up</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
} 