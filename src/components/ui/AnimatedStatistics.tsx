"use client";

import { useEffect, useState, useRef } from "react";
import { motion, useInView } from "framer-motion";

interface Statistic {
  value: number;
  label: string;
  suffix?: string;
  prefix?: string;
  icon?: React.ReactNode;
}

interface AnimatedStatisticsProps {
  statistics: Statistic[];
  className?: string;
  title?: string;
  subtitle?: string;
}

const AnimatedStatistics: React.FC<AnimatedStatisticsProps> = ({
  statistics,
  className = "",
  title = "Trusted by Thousands",
  subtitle = "Join our growing community of recipe enthusiasts"
}) => {
  const [counts, setCounts] = useState<number[]>(statistics.map(() => 0));
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  useEffect(() => {
    if (isInView) {
      const duration = 2000; // 2 seconds
      const steps = 60;
      const stepDuration = duration / steps;

      const intervals = statistics.map((stat, index) => {
        const target = stat.value;
        const increment = target / steps;
        let current = 0;

        return setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(intervals[index]);
          }

          setCounts(prev => {
            const newCounts = [...prev];
            newCounts[index] = Math.floor(current);
            return newCounts;
          });
        }, stepDuration);
      });

      return () => {
        intervals.forEach(interval => clearInterval(interval));
      };
    }
  }, [isInView, statistics]);

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.8,
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  };

  const numberVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  };

  return (
    <section className={`py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden ${className}`}>
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent/5 to-secondary/5"></div>
      
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, currentColor 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
        }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="text-center mb-16"
        >
          <motion.h2 
            variants={itemVariants}
            className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl mb-6 gradient-text"
          >
            {title}
          </motion.h2>
          <motion.p 
            variants={itemVariants}
            className="text-foreground/70 text-lg sm:text-xl font-body font-light max-w-3xl mx-auto leading-relaxed"
          >
            {subtitle}
          </motion.p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
        >
          {statistics.map((stat, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-center group"
            >
              <div className="glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105 relative overflow-hidden">
                {/* Hover effect background */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  {/* Icon */}
                  {stat.icon && (
                    <motion.div
                      variants={numberVariants}
                      className="w-16 h-16 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300"
                    >
                      <div className="text-white text-2xl">
                        {stat.icon}
                      </div>
                    </motion.div>
                  )}

                  {/* Animated Number */}
                  <motion.div
                    variants={numberVariants}
                    className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl mb-4 gradient-text"
                  >
                    {stat.prefix && <span className="text-foreground/70">{stat.prefix}</span>}
                    <span className="inline-block min-w-[1ch]">
                      {counts[index].toLocaleString()}
                    </span>
                    {stat.suffix && <span className="text-foreground/70">{stat.suffix}</span>}
                  </motion.div>

                  {/* Label */}
                  <motion.p
                    variants={numberVariants}
                    className="text-foreground/70 font-body text-lg font-medium leading-relaxed"
                  >
                    {stat.label}
                  </motion.p>
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default AnimatedStatistics; 