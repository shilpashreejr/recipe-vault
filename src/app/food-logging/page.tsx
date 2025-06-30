"use client";

import Link from "next/link";
import Navigation from "@/components/layout/Navigation";

export default function FoodLoggingPage() {
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
              <span className="gradient-text">Photo-Based</span>
              <br />
              <span className="text-foreground">Food Logging</span>
            </h1>
            
            <p className="text-foreground/70 text-lg sm:text-xl lg:text-2xl mb-8 font-body font-light max-w-3xl mx-auto leading-relaxed">
              Track your nutrition effortlessly with AI-powered photo recognition. Simply snap a photo of your meal 
              and let our technology identify ingredients and calculate macros automatically.
            </p>
          </div>

          {/* Food Logging Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {/* Photo Capture */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Snap & Track</h3>
              <p className="text-foreground/70 font-body leading-relaxed mb-4">
                Take a photo of your meal and our AI automatically identifies ingredients and estimates nutritional content
              </p>
              <button className="bg-primary text-primary-foreground px-6 py-3 rounded-full font-semibold hover:bg-primary/90 transition-all duration-300">
                Start Logging
              </button>
            </div>

            {/* Macro Tracking */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Macro Tracking</h3>
              <p className="text-foreground/70 font-body leading-relaxed mb-4">
                Monitor your daily protein, carbs, and fat intake with detailed breakdowns and goal tracking
              </p>
              <button className="bg-secondary text-secondary-foreground px-6 py-3 rounded-full font-semibold hover:bg-secondary/90 transition-all duration-300">
                View Macros
              </button>
            </div>

            {/* Progress Insights */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Progress Insights</h3>
              <p className="text-foreground/70 font-body leading-relaxed mb-4">
                Get personalized insights and recommendations based on your eating patterns and nutritional goals
              </p>
              <button className="bg-accent text-accent-foreground px-6 py-3 rounded-full font-semibold hover:bg-accent/90 transition-all duration-300">
                View Insights
              </button>
            </div>

            {/* Daily Log */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Daily Log</h3>
              <p className="text-foreground/70 font-body leading-relaxed mb-4">
                View and edit your daily food intake with a comprehensive timeline and photo gallery
              </p>
              <button className="bg-primary/20 text-primary px-6 py-3 rounded-full font-semibold hover:bg-primary/30 transition-all duration-300">
                View Today's Log
              </button>
            </div>

            {/* Goals & Targets */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Goals & Targets</h3>
              <p className="text-foreground/70 font-body leading-relaxed mb-4">
                Set and track your nutritional goals with smart recommendations and progress tracking
              </p>
              <button className="bg-secondary/20 text-secondary px-6 py-3 rounded-full font-semibold hover:bg-secondary/30 transition-all duration-300">
                Manage Goals
              </button>
            </div>

            {/* Meal Plan Integration */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="font-display font-semibold text-xl mb-4 text-foreground">Meal Plan Integration</h3>
              <p className="text-foreground/70 font-body leading-relaxed mb-4">
                Log meals from your meal plans and track adherence to your planned nutrition
              </p>
              <button className="bg-accent/20 text-accent px-6 py-3 rounded-full font-semibold hover:bg-accent/30 transition-all duration-300">
                View Meal Plans
              </button>
            </div>
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