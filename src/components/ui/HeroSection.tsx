"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import { ArrowRight, ChefHat, BookOpen, Heart, Star, Clock, Users, Sparkles, Zap, Camera, ShoppingCart } from 'lucide-react';
import { cn } from '@/lib/utils';

// Enhanced Floating Recipe Card Component
export const FloatingRecipeCard: React.FC<{
  title: string;
  image: string;
  rating: number;
  time: string;
  servings: number;
  delay: number;
  category: string;
}> = ({ title, image, rating, time, servings, delay, category }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9, rotateY: -15 }}
      animate={{ opacity: 1, y: 0, scale: 1, rotateY: 0 }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        y: -15, 
        scale: 1.05,
        rotateY: 5,
        transition: { duration: 0.4, ease: "easeOut" }
      }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="relative group cursor-pointer perspective-1000"
    >
      <div className="bg-card/80 backdrop-blur-sm border border-white/20 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-all duration-500 transform-gpu">
        <div className="relative aspect-video rounded-xl overflow-hidden mb-4">
          <div className="w-full h-full bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 flex items-center justify-center">
            <ChefHat className="w-10 h-10 text-primary" />
          </div>
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
          />
          
          {/* Category Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: delay + 0.3 }}
            className="absolute top-3 left-3 bg-accent/90 backdrop-blur-sm text-accent-foreground px-3 py-1 rounded-full text-xs font-medium"
          >
            {category}
          </motion.div>
        </div>
        
        <h3 className="font-display font-semibold text-lg mb-3 line-clamp-2 leading-tight">{title}</h3>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center space-x-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{rating}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4" />
            <span>{servings}</span>
          </div>
        </div>
        
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
          transition={{ duration: 0.3 }}
          className="absolute -top-3 -right-3 bg-gradient-to-r from-accent to-secondary text-white rounded-full p-2 shadow-lg"
        >
          <Heart className="w-4 h-4" />
        </motion.div>
      </div>
    </motion.div>
  );
};

// Enhanced Animated CTA Button Component
export const AnimatedCTAButton: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'accent';
  onClick?: () => void;
  icon?: React.ReactNode;
  className?: string;
}> = ({ children, variant = 'primary', onClick, icon, className }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  const variants = {
    primary: "bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground shadow-xl hover:shadow-2xl",
    secondary: "bg-gradient-to-r from-secondary via-secondary/90 to-secondary text-secondary-foreground shadow-xl hover:shadow-2xl",
    accent: "bg-gradient-to-r from-accent via-accent/90 to-accent text-accent-foreground shadow-xl hover:shadow-2xl"
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={onClick}
      className={cn(
        "relative px-8 py-4 rounded-2xl font-accent font-semibold text-lg transition-all duration-500 overflow-hidden group border-0",
        variants[variant],
        className
      )}
    >
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: isHovered ? 0 : -100, opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
      />
      
      <div className="relative flex items-center justify-center space-x-3">
        {icon && (
          <motion.div
            animate={{ rotate: isHovered ? 360 : 0 }}
            transition={{ duration: 0.6 }}
          >
            {icon}
          </motion.div>
        )}
        <span>{children}</span>
        <motion.div
          animate={{ x: isHovered ? 8 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ArrowRight className="w-5 h-5" />
        </motion.div>
      </div>
    </motion.button>
  );
};

// Enhanced Gradient Text Component
export const GradientText: React.FC<{
  children: React.ReactNode;
  className?: string;
  variant?: 'primary' | 'secondary' | 'accent' | 'hero';
}> = ({ children, className, variant = 'hero' }) => {
  const gradients = {
    primary: "bg-gradient-to-r from-primary via-primary/80 to-primary bg-clip-text text-transparent",
    secondary: "bg-gradient-to-r from-secondary via-secondary/80 to-secondary bg-clip-text text-transparent",
    accent: "bg-gradient-to-r from-accent via-accent/80 to-accent bg-clip-text text-transparent",
    hero: "bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent"
  };
  
  return (
    <span className={cn(gradients[variant], className)}>
      {children}
    </span>
  );
};

// Animated Feature Icon Component
export const AnimatedFeatureIcon: React.FC<{
  icon: React.ReactNode;
  gradient: string;
  delay: number;
}> = ({ icon, gradient, delay }) => {
  return (
    <motion.div 
      className={`w-20 h-20 bg-gradient-to-br ${gradient} rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
      initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      transition={{ 
        duration: 0.8, 
        delay, 
        ease: [0.25, 0.46, 0.45, 0.94],
        type: "spring",
        stiffness: 100
      }}
      whileHover={{ 
        rotate: 360, 
        scale: 1.1,
        transition: { duration: 0.6, ease: "easeInOut" }
      }}
    >
      <div className="text-white text-2xl">
        {icon}
      </div>
    </motion.div>
  );
};

interface HeroSectionProps {
  className?: string;
}

export default function HeroSection({ className = "" }: HeroSectionProps) {
  const { scrollY } = useScroll();
  
  // Enhanced parallax effects
  const titleY = useTransform(scrollY, [0, 500], [0, -150]);
  const subtitleY = useTransform(scrollY, [0, 500], [0, -75]);
  const backgroundY = useTransform(scrollY, [0, 500], [0, 300]);
  const cardsY = useTransform(scrollY, [0, 500], [0, -100]);

  const floatingCards = [
    {
      title: "Creamy Mushroom Risotto",
      image: "/recipe-1.jpg",
      rating: 4.8,
      time: "45m",
      servings: 4,
      delay: 0.2,
      category: "Italian"
    },
    {
      title: "Spicy Thai Green Curry",
      image: "/recipe-2.jpg", 
      rating: 4.6,
      time: "30m",
      servings: 6,
      delay: 0.4,
      category: "Thai"
    },
    {
      title: "Chocolate Lava Cake",
      image: "/recipe-3.jpg",
      rating: 4.9,
      time: "25m", 
      servings: 2,
      delay: 0.6,
      category: "Dessert"
    }
  ];

  const features = [
    {
      icon: <Zap className="w-8 h-8" />,
      title: "AI-Powered Extraction",
      description: "From URLs, social media, images & notes",
      gradient: "from-blue-500 via-purple-600 to-indigo-700",
      delay: 0.1
    },
    {
      icon: <BookOpen className="w-8 h-8" />,
      title: "Intelligent Meal Planning",
      description: "Personalized with smart repetition",
      gradient: "from-green-500 via-teal-600 to-emerald-700",
      delay: 0.2
    },
    {
      icon: <Camera className="w-8 h-8" />,
      title: "Photo-Based Tracking",
      description: "AI food recognition & macro analysis",
      gradient: "from-orange-500 via-red-600 to-pink-700",
      delay: 0.3
    },
    {
      icon: <ShoppingCart className="w-8 h-8" />,
      title: "Smart Inventory & Shopping",
      description: "AI-powered analysis & auto-lists",
      gradient: "from-purple-500 via-pink-600 to-rose-700",
      delay: 0.4
    }
  ];
  
  return (
    <section className={`relative min-h-screen flex items-center justify-center overflow-hidden pt-24 ${className}`}>
      {/* Enhanced Background Elements with Parallax */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-background via-background/95 to-secondary/10"
        style={{ y: backgroundY }}
      />
      
      {/* Enhanced Floating Background Orbs */}
      <motion.div 
        className="absolute top-20 left-10 w-80 h-80 bg-gradient-to-r from-primary/20 to-accent/20 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.5, 0.2],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div 
        className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-r from-accent/20 to-secondary/20 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.6, 0.3],
          rotate: [360, 180, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      
      {/* Additional Floating Elements */}
      <motion.div 
        className="absolute top-1/3 right-1/4 w-40 h-40 bg-gradient-to-r from-secondary/30 to-accent/30 rounded-full blur-2xl"
        animate={{
          y: [-30, 30, -30],
          x: [-15, 15, -15],
          rotate: [0, 90, 180],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Floating Recipe Cards */}
      <motion.div 
        className="absolute top-1/4 right-10 hidden lg:block"
        style={{ y: cardsY }}
      >
        <div className="space-y-6">
          {floatingCards.map((card, index) => (
            <FloatingRecipeCard key={index} {...card} />
          ))}
        </div>
      </motion.div>
      
      {/* Hero Content */}
      <div className="relative z-10 text-center px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div className="space-y-12">
          {/* Enhanced Main Headline with Sophisticated Typography */}
          <motion.div className="space-y-6" style={{ y: titleY }}>
            <motion.div
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="space-y-4"
            >
              <h1 className="font-display font-bold text-6xl sm:text-7xl lg:text-8xl xl:text-9xl leading-[0.9] tracking-tight">
                <motion.span 
                  className="gradient-text block"
                  initial={{ opacity: 0, x: -100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.2 }}
                >
                  Your Complete
                </motion.span>
                <motion.span 
                  className="text-foreground block"
                  initial={{ opacity: 0, x: 100 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 1, delay: 0.4 }}
                >
                  Food Management
                </motion.span>
                <motion.span 
                  className="gradient-text block"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 0.6 }}
                >
                  Ecosystem
                </motion.span>
              </h1>
            </motion.div>
          </motion.div>
          
          {/* Enhanced Subtitle with Elegant Typography */}
          <motion.p 
            className="text-foreground/80 text-xl sm:text-2xl lg:text-3xl xl:text-4xl font-body font-light max-w-5xl mx-auto leading-relaxed"
            style={{ y: subtitleY }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            AI-powered recipe extraction from anywhere, intelligent meal planning with personalized preferences, 
            photo-based nutrition tracking, and smart inventory management. Your ultimate culinary companion.
          </motion.p>
          
          {/* Enhanced CTA Buttons with Micro-interactions */}
          <motion.div 
            className="flex flex-col sm:flex-row gap-6 justify-center items-center w-full max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1 }}
          >
            <AnimatedCTAButton 
              variant="primary"
              icon={<Sparkles className="w-5 h-5" />}
              className="w-full sm:w-auto"
            >
              Start Extracting Recipes
            </AnimatedCTAButton>
            <AnimatedCTAButton 
              variant="secondary"
              icon={<BookOpen className="w-5 h-5" />}
              className="w-full sm:w-auto"
            >
              Create Meal Plan
            </AnimatedCTAButton>
          </motion.div>

          {/* Enhanced Feature Highlights with Sophisticated Design */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto mt-20"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 1.2 }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                className="glass rounded-2xl p-8 text-center group cursor-pointer border border-white/10"
                whileHover={{ 
                  y: -15,
                  scale: 1.02,
                  transition: { duration: 0.3, ease: "easeOut" }
                }}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: feature.delay + 1.2 }}
              >
                <AnimatedFeatureIcon 
                  icon={feature.icon}
                  gradient={feature.gradient}
                  delay={feature.delay}
                />
                <h3 className="font-display font-bold text-xl mb-3 text-foreground">
                  {feature.title}
                </h3>
                <p className="text-foreground/70 text-base leading-relaxed">
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
        transition={{ duration: 1, delay: 2 }}
      >
        <motion.div 
          className="w-8 h-12 border-2 border-primary/50 rounded-full flex justify-center cursor-pointer backdrop-blur-sm bg-white/10"
          animate={{ y: [0, 15, 0] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
          whileHover={{ scale: 1.1 }}
        >
          <motion.div 
            className="w-2 h-4 bg-gradient-to-b from-primary to-accent rounded-full mt-2"
            animate={{ 
              opacity: [0.5, 1, 0.5],
              scaleY: [1, 1.8, 1]
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
} 