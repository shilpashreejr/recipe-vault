"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ChefHat, BookOpen, Heart, Star, Clock, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

// Floating Recipe Card Component
export const FloatingRecipeCard: React.FC<{
  title: string;
  image: string;
  rating: number;
  time: string;
  servings: number;
  delay: number;
}> = ({ title, image, rating, time, servings, delay }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay, ease: "easeOut" }}
      whileHover={{ 
        y: -10, 
        scale: 1.05,
        transition: { duration: 0.3, ease: "easeOut" }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group cursor-pointer"
    >
      <div className="bg-card border rounded-xl p-4 shadow-lg hover:shadow-xl transition-all duration-300">
        <div className="relative aspect-video rounded-lg overflow-hidden mb-3">
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
            <ChefHat className="w-8 h-8 text-primary" />
          </div>
          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        
        <h3 className="font-medium text-sm mb-2 line-clamp-2">{title}</h3>
        
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{rating}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-3 h-3" />
            <span>{time}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Users className="w-3 h-3" />
            <span>{servings}</span>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
          className="absolute -top-2 -right-2 bg-accent text-accent-foreground rounded-full p-1"
        >
          <Heart className="w-3 h-3" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Animated CTA Button Component
export const AnimatedCTAButton: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}> = ({ children, variant = 'primary', onClick }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        "relative px-8 py-4 rounded-lg font-medium text-lg transition-all duration-300 overflow-hidden group",
        variant === 'primary' 
          ? "bg-primary text-primary-foreground shadow-lg hover:shadow-xl" 
          : "bg-secondary text-secondary-foreground border-2 border-secondary hover:bg-secondary/80"
      )}
    >
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: isHovered ? 0 : -100, opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      
      <div className="relative flex items-center space-x-2">
        <span>{children}</span>
        <motion.div
          animate={{ x: isHovered ? 5 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowRight className="w-5 h-5" />
        </motion.div>
      </div>
    </motion.button>
  );
};

// Gradient Text Component
export const GradientText: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className }) => {
  return (
    <span className={cn(
      "bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent",
      className
    )}>
      {children}
    </span>
  );
};

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className = "" }: HeroSectionProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const { scrollY } = useScroll();
  
  // Parallax effects
  const titleY = useTransform(scrollY, [0, 500], [0, -100]);
  const subtitleY = useTransform(scrollY, [0, 500], [0, -50]);
  const backgroundY = useTransform(scrollY, [0, 500], [0, 200]);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const floatingCards = [
    {
      title: "Creamy Mushroom Risotto",
      image: "/recipe-1.jpg",
      rating: 4.8,
      time: "45m",
      servings: 4,
      delay: 0.2
    },
    {
      title: "Spicy Thai Curry",
      image: "/recipe-2.jpg", 
      rating: 4.6,
      time: "30m",
      servings: 6,
      delay: 0.4
    },
    {
      title: "Chocolate Lava Cake",
      image: "/recipe-3.jpg",
      rating: 4.9,
      time: "25m", 
      servings: 2,
      delay: 0.6
    }
  ];
  
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden pt-24 ${className}`}>
      {/* Enhanced Background Elements with Parallax */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/20"
        style={{ y: backgroundY }}
      />
      
      {/* Floating Background Orbs */}
      <motion.div 
        className="absolute top-20 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />
      
      {/* Additional Floating Elements */}
      <motion.div 
        className="absolute top-1/3 right-1/4 w-32 h-32 bg-secondary/20 rounded-full blur-2xl"
        animate={{
          y: [-20, 20, -20],
          x: [-10, 10, -10],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <motion.div 
          className="space-y-8"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: isLoaded ? 1 : 0, y: isLoaded ? 0 : 50 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          {/* Main Headline with Enhanced Typography */}
          <motion.div 
            className="space-y-4"
            style={{ y: titleY }}
          >
            <motion.h1 
              className="font-display font-bold text-5xl sm:text-6xl lg:text-7xl xl:text-8xl leading-tight tracking-tight"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <motion.span 
                className="gradient-text block"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Your Complete
              </motion.span>
              <motion.span 
                className="text-foreground block"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                Food Management
              </motion.span>
              <motion.span 
                className="gradient-text block"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
              >
                Ecosystem
              </motion.span>
            </motion.h1>
          </motion.div>
          
          {/* Enhanced Subtitle */}
          <motion.p 
            className="text-foreground/70 text-lg sm:text-xl lg:text-2xl xl:text-3xl font-body font-light max-w-4xl mx-auto leading-relaxed"
            style={{ y: subtitleY }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            AI-powered recipe extraction from anywhere, intelligent meal planning with personalized preferences, 
            photo-based nutrition tracking, and smart inventory management. Your ultimate culinary companion.
          </motion.p>
          
          {/* Enhanced CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/recipes/upload"
                className="group bg-primary text-primary-foreground px-10 py-5 rounded-full font-accent font-semibold text-lg hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Start Extracting Recipes
                  <motion.span 
                    className="inline-block ml-3"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                  >
                    →
                  </motion.span>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/80 to-accent/80 rounded-full"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                href="/meal-plans"
                className="group glass px-10 py-5 rounded-full font-accent font-semibold text-lg hover:bg-white/10 transition-all duration-300 relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Create Meal Plan
                  <motion.span 
                    className="inline-block ml-3"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  >
                    →
                  </motion.span>
                </span>
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-secondary/20 to-accent/20 rounded-full"
                  initial={{ x: "-100%" }}
                  whileHover={{ x: "0%" }}
                  transition={{ duration: 0.3 }}
                />
              </Link>
            </motion.div>
          </motion.div>

          {/* Enhanced Feature Highlights */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-6xl mx-auto mt-16"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.4 }}
          >
            {[
              {
                icon: "⚡",
                title: "AI-Powered Extraction",
                description: "From URLs, social media, images & notes",
                gradient: "from-blue-500 to-purple-600",
                delay: 0.1
              },
              {
                icon: "🧠",
                title: "Intelligent Meal Planning",
                description: "Personalized with smart repetition",
                gradient: "from-green-500 to-teal-600",
                delay: 0.2
              },
              {
                icon: "📸",
                title: "Photo-Based Tracking",
                description: "AI food recognition & macro analysis",
                gradient: "from-orange-500 to-red-600",
                delay: 0.3
              },
              {
                icon: "🛒",
                title: "Smart Inventory & Shopping",
                description: "AI-powered analysis & auto-lists",
                gradient: "from-purple-500 to-pink-600",
                delay: 0.4
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="glass rounded-xl p-6 text-center group cursor-pointer"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 + feature.delay }}
                whileHover={{ 
                  y: -10,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                <motion.div 
                  className={`w-16 h-16 bg-gradient-to-br ${feature.gradient} rounded-lg flex items-center justify-center mx-auto mb-4 text-2xl`}
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {feature.icon}
                </motion.div>
                <h3 className="font-display font-semibold text-lg mb-2 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-foreground/70 text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Enhanced Scroll Indicator */}
      <motion.div 
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 2 }}
      >
        <motion.div 
          className="w-6 h-10 border-2 border-primary/50 rounded-full flex justify-center cursor-pointer"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.1 }}
        >
          <motion.div 
            className="w-1 h-3 bg-primary rounded-full mt-2"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scaleY: [1, 1.5, 1]
            }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
} 