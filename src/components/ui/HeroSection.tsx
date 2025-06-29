import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
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

// Main Hero Section Component
export const HeroSection: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  });
  
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "50%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  
  const [isInView, setIsInView] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.1 }
    );
    
    if (heroRef.current) {
      observer.observe(heroRef.current);
    }
    
    return () => observer.disconnect();
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
    <div ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
      <div className="absolute inset-0 pattern-dots opacity-5" />
      
      {/* Parallax Background Elements */}
      <motion.div
        style={{ y }}
        className="absolute inset-0"
      >
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-xl" />
        <div className="absolute top-40 right-20 w-24 h-24 bg-secondary/10 rounded-full blur-xl" />
        <div className="absolute bottom-20 left-1/4 w-40 h-40 bg-accent/10 rounded-full blur-xl" />
        <div className="absolute bottom-40 right-1/3 w-28 h-28 bg-primary/10 rounded-full blur-xl" />
      </motion.div>
      
      {/* Main Content */}
      <motion.div
        ref={heroRef}
        style={{ opacity }}
        className="relative z-10 container mx-auto px-4 py-20"
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Column - Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="space-y-8"
            >
              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center space-x-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium"
              >
                <BookOpen className="w-4 h-4" />
                <span>Extract recipes from anywhere</span>
              </motion.div>
              
              {/* Main Headline */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="space-y-4"
              >
                <h1 className="text-5xl lg:text-7xl font-bold leading-tight">
                  Transform Your{' '}
                  <GradientText className="text-6xl lg:text-8xl">
                    Recipe Collection
                  </GradientText>
                </h1>
                <p className="text-xl lg:text-2xl text-muted-foreground leading-relaxed">
                  Extract, organize, and discover recipes from social media, blogs, and your favorite apps with our intelligent recipe management platform.
                </p>
              </motion.div>
              
              {/* CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.5 }}
                className="flex flex-col sm:flex-row gap-4"
              >
                <AnimatedCTAButton variant="primary">
                  Start Extracting Recipes
                </AnimatedCTAButton>
                <AnimatedCTAButton variant="secondary">
                  Watch Demo
                </AnimatedCTAButton>
              </motion.div>
              
              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, delay: 0.7 }}
                className="flex items-center space-x-8 pt-8"
              >
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">10K+</div>
                  <div className="text-sm text-muted-foreground">Recipes Extracted</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-secondary">50+</div>
                  <div className="text-sm text-muted-foreground">Sources Supported</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-accent">99%</div>
                  <div className="text-sm text-muted-foreground">Accuracy Rate</div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Right Column - Floating Cards */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
              className="relative"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-6">
                {floatingCards.map((card, index) => (
                  <div
                    key={index}
                    className={cn(
                      "flex justify-center",
                      index === 1 ? "lg:translate-x-8" : "",
                      index === 2 ? "lg:-translate-x-4" : ""
                    )}
                  >
                    <FloatingRecipeCard {...card} />
                  </div>
                ))}
              </div>
              
              {/* Decorative Elements */}
              <motion.div
                animate={{ 
                  rotate: [0, 360],
                  scale: [1, 1.1, 1]
                }}
                transition={{ 
                  duration: 20,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -top-10 -right-10 w-20 h-20 bg-accent/20 rounded-full blur-sm"
              />
              <motion.div
                animate={{ 
                  rotate: [360, 0],
                  scale: [1, 1.2, 1]
                }}
                transition={{ 
                  duration: 15,
                  repeat: Infinity,
                  ease: "linear"
                }}
                className="absolute -bottom-8 -left-8 w-16 h-16 bg-secondary/20 rounded-full blur-sm"
              />
            </motion.div>
          </div>
        </div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-6 h-10 border-2 border-muted-foreground rounded-full flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-1 h-3 bg-muted-foreground rounded-full mt-2"
          />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HeroSection; 