"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnimatedIconProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  hoverScale?: number;
  rotation?: number;
  bgGradient?: string;
}

export default function AnimatedIcon({
  children,
  className = "",
  delay = 0,
  duration = 0.6,
  hoverScale = 1.1,
  rotation = 0,
  bgGradient = "from-blue-500 to-indigo-600"
}: AnimatedIconProps) {
  return (
    <motion.div
      className={`w-16 h-16 bg-gradient-to-br ${bgGradient} rounded-xl flex items-center justify-center ${className}`}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay,
        duration
      }}
      whileHover={{
        scale: hoverScale,
        rotate: rotation,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 10
        }
      }}
      whileTap={{
        scale: 0.95,
        transition: {
          type: "spring",
          stiffness: 400,
          damping: 10
        }
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.5 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          delay: delay + 0.2,
          duration: 0.3
        }}
        whileHover={{
          scale: 1.1,
          transition: {
            type: "spring",
            stiffness: 400,
            damping: 10
          }
        }}
      >
        {children}
      </motion.div>
    </motion.div>
  );
} 