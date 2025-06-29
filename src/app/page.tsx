"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import Navigation from "@/components/layout/Navigation";
import HeroSection from "@/components/ui/HeroSection";
import FeatureShowcase from "@/components/ui/FeatureShowcase";
import AnimatedStatistics from "@/components/ui/AnimatedStatistics";

export default function Home() {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const statistics = [
    {
      value: 15000,
      label: 'Recipes Extracted',
      icon: '🍳',
    },
    {
      value: 8500,
      label: 'Happy Users',
      suffix: '+',
      icon: '👥',
    },
    {
      value: 45,
      label: 'Countries',
      icon: '🌍',
    },
    {
      value: 99,
      label: 'Success Rate',
      suffix: '%',
      icon: '⭐',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Enhanced Hero Section */}
      <HeroSection />

      {/* Feature Showcase Section with Animated Icons */}
      <FeatureShowcase />

      {/* Social Proof Section with Animated Statistics */}
      <AnimatedStatistics 
        statistics={statistics}
        title="Trusted by Recipe Enthusiasts Worldwide"
        subtitle="Join thousands of users who have transformed their cooking experience with our intelligent recipe extraction platform"
      />

      {/* Food Logging Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 to-emerald-500/10"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl sm:text-5xl mb-6 gradient-text">
              Photo-Based Food Logging Made Easy
            </h2>
            <p className="text-foreground/70 text-lg font-body font-light max-w-3xl mx-auto">
              Track your nutrition effortlessly with AI-powered photo recognition. Simply snap a photo of your meal 
              and let our technology do the rest.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Food Logging Feature 1 */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Snap & Track</h3>
              <p className="text-foreground/70 font-body leading-relaxed">
                Take a photo of your meal and our AI automatically identifies ingredients and estimates nutritional content.
              </p>
            </div>

            {/* Food Logging Feature 2 */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Macro Tracking</h3>
              <p className="text-foreground/70 font-body leading-relaxed">
                Monitor your daily protein, carbs, and fat intake with detailed breakdowns and goal tracking.
              </p>
            </div>

            {/* Food Logging Feature 3 */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Progress Insights</h3>
              <p className="text-foreground/70 font-body leading-relaxed">
                Get personalized insights and recommendations based on your eating patterns and nutritional goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Grocery Shopping Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-indigo-500/10"></div>
        <div className="relative z-10 max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="font-display font-bold text-4xl sm:text-5xl mb-6 gradient-text">
              Smart Grocery Shopping Lists
            </h2>
            <p className="text-foreground/70 text-lg font-body font-light max-w-3xl mx-auto">
              Never forget ingredients again. Our smart system automatically generates shopping lists from your meal plans 
              and tracks your inventory to prevent waste.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Grocery Feature 1 */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Auto-Generated Lists</h3>
              <p className="text-foreground/70 font-body leading-relaxed">
                Shopping lists are automatically created from your meal plans, saving you time and ensuring you have everything you need.
              </p>
            </div>

            {/* Grocery Feature 2 */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Inventory Management</h3>
              <p className="text-foreground/70 font-body leading-relaxed">
                Track what you have in your pantry and fridge to avoid buying duplicates and reduce food waste.
              </p>
            </div>

            {/* Grocery Feature 3 */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Budget Optimization</h3>
              <p className="text-foreground/70 font-body leading-relaxed">
                Get price comparisons, sale alerts, and budget-friendly alternatives to help you save money on groceries.
              </p>
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
            Ready to Transform Your Cooking & Nutrition?
          </h2>
          <p className="text-foreground/70 text-lg font-body font-light mb-8 max-w-2xl mx-auto">
            Join thousands of home cooks who have simplified their meal planning, food logging, and grocery shopping with RecipeVault.
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
