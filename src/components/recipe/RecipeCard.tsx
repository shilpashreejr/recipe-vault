"use client";

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { formatCookingTime, formatServings } from '@/lib/utils';

interface RecipeCardProps {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  cookingTime?: number;
  servings?: number;
  category?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  className?: string;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
  id,
  title,
  description,
  imageUrl,
  cookingTime,
  servings,
  category,
  difficulty,
  className
}) => {
  const difficultyColors = {
    Easy: 'text-green-400',
    Medium: 'text-yellow-400',
    Hard: 'text-red-400'
  };

  return (
    <Link href={`/recipes/${id}`} className="group block">
      <Card 
        variant="elevated" 
        className={`overflow-hidden group-hover:scale-105 transition-all duration-500 ${className}`}
      >
        {/* Image Container */}
        <div className="relative h-48 overflow-hidden">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={title}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
              <svg className="w-16 h-16 text-primary/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
          )}
          
          {/* Overlay with category */}
          {category && (
            <div className="absolute top-4 left-4">
              <span className="bg-primary/90 text-primary-foreground px-3 py-1 rounded-full text-xs font-body font-medium">
                {category}
              </span>
            </div>
          )}
          
          {/* Difficulty badge */}
          {difficulty && (
            <div className="absolute top-4 right-4">
              <span className={`bg-background/90 text-foreground px-3 py-1 rounded-full text-xs font-body font-medium ${difficultyColors[difficulty]}`}>
                {difficulty}
              </span>
            </div>
          )}
          
          {/* Hover overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center">
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <span className="bg-primary text-primary-foreground px-4 py-2 rounded-full font-body font-medium">
                View Recipe
              </span>
            </div>
          </div>
        </div>

        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-display font-semibold line-clamp-2 group-hover:text-primary transition-colors duration-300">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="line-clamp-2 text-sm">
              {description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="pt-0">
          <div className="flex items-center justify-between text-sm text-muted-foreground font-body">
            <div className="flex items-center space-x-4">
              {cookingTime && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{formatCookingTime(cookingTime)}</span>
                </div>
              )}
              {servings && (
                <div className="flex items-center space-x-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <span>{formatServings(servings)}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
};

export default RecipeCard; 