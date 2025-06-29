"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function HeroSection() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentWord, setCurrentWord] = useState(0);
  const words = ["Extract", "Organize", "Plan", "Track", "Share"];

  useEffect(() => {
    setIsLoaded(true);
    
    // Animated word cycling
    const interval = setInterval(() => {
      setCurrentWord((prev) => (prev + 1) % words.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        ease: "easeOut",
      },
    },
  };

  const buttonVariants = {
    hover: {
      scale: 1.05,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    tap: {
      scale: 0.95,
    },
  };

  const floatingVariants = {
    animate: {
      y: [-10, 10, -10],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      },
    },
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20"></div>
      
      {/* Animated floating elements */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        variants={floatingVariants}
        animate="animate"
      />
      <motion.div
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "1s" }}
      />
      <motion.div
        className="absolute top-1/2 left-1/4 w-48 h-48 bg-secondary/10 rounded-full blur-2xl"
        variants={floatingVariants}
        animate="animate"
        style={{ animationDelay: "2s" }}
      />

      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      {/* Hero Content */}
      <motion.div
        className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate={isLoaded ? "visible" : "hidden"}
      >
        {/* Main Headline */}
        <motion.div variants={itemVariants} className="mb-8">
          <h1 className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-tight">
            <span className="block">
              <span className="gradient-text bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
                Your Complete
              </span>
            </span>
            <span className="block mt-2">
              <span className="text-foreground">Food Management</span>
            </span>
            <span className="block mt-2">
              <span className="gradient-text bg-gradient-to-r from-secondary via-accent to-primary bg-clip-text text-transparent">
                Ecosystem
              </span>
            </span>
          </h1>
        </motion.div>

        {/* Animated Subtitle */}
        <motion.div variants={itemVariants} className="mb-8">
          <p className="text-foreground/70 text-lg sm:text-xl lg:text-2xl font-body font-light max-w-4xl mx-auto leading-relaxed">
            AI-powered recipe extraction from anywhere, intelligent meal planning with personalized preferences, 
            photo-based nutrition tracking, and smart inventory management. Your ultimate culinary companion.
          </p>
        </motion.div>

        {/* Animated Action Words */}
        <motion.div variants={itemVariants} className="mb-8">
          <div className="flex justify-center items-center gap-2 text-xl sm:text-2xl font-accent font-medium">
            <span className="text-foreground/60">We help you</span>
            <AnimatePresence mode="wait">
              <motion.span
                key={currentWord}
                className="text-accent font-semibold min-w-[120px] text-left"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                {words[currentWord]}
              </motion.span>
            </AnimatePresence>
            <span className="text-foreground/60">recipes</span>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div 
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16"
        >
          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link 
              href="/recipes/upload"
              className="group relative bg-primary text-primary-foreground px-10 py-5 rounded-full font-body font-semibold text-lg shadow-2xl hover:shadow-primary/25 transition-all duration-300 overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Start Extracting Recipes
                <motion.span 
                  className="inline-block ml-3"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </span>
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </motion.div>

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Link 
              href="/meal-plans"
              className="group glass px-10 py-5 rounded-full font-body font-semibold text-lg hover:bg-white/10 transition-all duration-300 border border-white/20"
            >
              <span className="flex items-center">
                Create Meal Plan
                <motion.span 
                  className="inline-block ml-3"
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, delay: 0.5 }}
                >
                  →
                </motion.span>
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div variants={itemVariants}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {[
              {
                icon: "⚡",
                title: "AI-Powered Extraction",
                description: "From URLs, social media, images & notes",
                gradient: "from-blue-500 to-purple-600"
              },
              {
                icon: "🧠",
                title: "Intelligent Meal Planning",
                description: "Personalized with smart repetition",
                gradient: "from-green-500 to-teal-600"
              },
              {
                icon: "📸",
                title: "Photo-Based Tracking",
                description: "AI food recognition & macro analysis",
                gradient: "from-orange-500 to-red-600"
              },
              {
                icon: "🛒",
                title: "Smart Inventory & Shopping",
                description: "AI-powered analysis & auto-lists",
                gradient: "from-purple-500 to-pink-600"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="glass rounded-xl p-6 text-center hover:bg-white/10 transition-all duration-500 hover:scale-105"
                whileHover={{ y: -5 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mx-auto mb-4 text-white text-xl`}>
                  {feature.icon}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{feature.title}</h3>
                <p className="text-foreground/70 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>

      {/* Enhanced Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center">
          <motion.div 
            className="w-1 h-3 bg-primary rounded-full mt-2"
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          />
        </div>
      </motion.div>
    </section>
  );
} 