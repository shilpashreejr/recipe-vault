"use client";

import { motion } from "framer-motion";
import AnimatedIcon from "./AnimatedIcon";

interface FeatureCard {
  id: string;
  title: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  bgGradient: string;
  delay: number;
  rotation?: number;
}

const features: FeatureCard[] = [
  {
    id: "social-media",
    title: "Social Media",
    description: "Instagram, TikTok, Pinterest, Facebook, Twitter, YouTube",
    features: [
      "Instagram Reels & Posts",
      "TikTok Video Descriptions", 
      "Pinterest Recipe Pins",
      "Facebook Recipe Posts"
    ],
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m-9 0h10m-10 0a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V6a2 2 0 00-2-2" />
      </svg>
    ),
    bgGradient: "from-pink-500 to-purple-600",
    delay: 0.1,
    rotation: 5
  },
  {
    id: "notes-apps",
    title: "Notes Apps",
    description: "Evernote, Apple Notes, and more",
    features: [
      "Evernote API Integration",
      "Apple Notes Export",
      "Notebook Organization", 
      "Rich Text Support"
    ],
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    bgGradient: "from-green-500 to-emerald-600",
    delay: 0.2,
    rotation: -3
  },
  {
    id: "web-blogs",
    title: "Web & Blogs",
    description: "Any recipe website or food blog",
    features: [
      "Food Blog URLs",
      "Recipe Websites",
      "Cooking Blogs",
      "Restaurant Sites"
    ],
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0-9H3" />
      </svg>
    ),
    bgGradient: "from-blue-500 to-indigo-600",
    delay: 0.3,
    rotation: 8
  },
  {
    id: "images-ocr",
    title: "Images & OCR",
    description: "Screenshots, photos, handwritten notes",
    features: [
      "Photo Screenshots",
      "Handwritten Recipes",
      "Recipe Cards",
      "Menu Photos"
    ],
    icon: (
      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    bgGradient: "from-orange-500 to-red-600",
    delay: 0.4,
    rotation: -5
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const cardVariants = {
  hidden: { 
    opacity: 0, 
    y: 50,
    scale: 0.9
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};

export default function FeatureShowcase() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-6 gradient-text">
            AI-Powered Recipe Extraction
          </h2>
          <p className="text-foreground/70 text-lg font-body font-light max-w-3xl mx-auto">
            Our advanced AI technology extracts recipes from all your favorite sources with intelligent parsing, 
            OCR capabilities, and smart data organization.
          </p>
        </motion.div>

        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {features.map((feature) => (
            <motion.div
              key={feature.id}
              className="group glass rounded-2xl p-8 hover:bg-white/10 transition-all duration-500 hover:scale-105"
              variants={cardVariants}
              whileHover={{
                y: -10,
                transition: {
                  type: "spring",
                  stiffness: 300,
                  damping: 20
                }
              }}
            >
              <div className="mb-6">
                <AnimatedIcon
                  delay={feature.delay}
                  rotation={feature.rotation}
                  bgGradient={feature.bgGradient}
                >
                  {feature.icon}
                </AnimatedIcon>
              </div>
              
              <motion.h3 
                className="font-display font-semibold text-xl mb-4 text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: feature.delay + 0.3, duration: 0.5 }}
              >
                {feature.title}
              </motion.h3>
              
              <motion.p 
                className="text-foreground/70 font-body leading-relaxed mb-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: feature.delay + 0.4, duration: 0.5 }}
              >
                {feature.description}
              </motion.p>
              
              <motion.ul 
                className="text-foreground/60 text-sm space-y-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: feature.delay + 0.5, duration: 0.5 }}
              >
                {feature.features.map((item, index) => (
                  <motion.li
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ 
                      delay: feature.delay + 0.6 + (index * 0.1), 
                      duration: 0.3 
                    }}
                    className="flex items-center"
                  >
                    <span className="mr-2 text-accent">•</span>
                    {item}
                  </motion.li>
                ))}
              </motion.ul>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
} 