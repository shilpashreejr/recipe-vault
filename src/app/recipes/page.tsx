"use client";

import React, { useState } from 'react';
import Navigation from '@/components/layout/Navigation';
import RecipeCard from '@/components/recipe/RecipeCard';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

// Mock data for demonstration
const mockRecipes = [
  {
    id: '1',
    title: 'Classic Beef Bourguignon',
    description: 'A rich and hearty French stew with tender beef, red wine, and pearl onions.',
    imageUrl: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d?w=400&h=300&fit=crop',
    cookingTime: 180,
    servings: 6,
    category: 'Main Course',
    difficulty: 'Medium' as const
  },
  {
    id: '2',
    title: 'Fresh Spring Rolls',
    description: 'Light and refreshing Vietnamese spring rolls with shrimp and fresh herbs.',
    imageUrl: 'https://images.unsplash.com/photo-1625944525533-473f1cdc2c8a?w=400&h=300&fit=crop',
    cookingTime: 30,
    servings: 4,
    category: 'Appetizer',
    difficulty: 'Easy' as const
  },
  {
    id: '3',
    title: 'Chocolate Lava Cake',
    description: 'Decadent chocolate cake with a molten center, served warm with vanilla ice cream.',
    imageUrl: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop',
    cookingTime: 25,
    servings: 2,
    category: 'Dessert',
    difficulty: 'Medium' as const
  },
  {
    id: '4',
    title: 'Mediterranean Quinoa Bowl',
    description: 'Healthy quinoa bowl with roasted vegetables, feta cheese, and lemon herb dressing.',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
    cookingTime: 45,
    servings: 4,
    category: 'Healthy',
    difficulty: 'Easy' as const
  },
  {
    id: '5',
    title: 'Spicy Thai Curry',
    description: 'Aromatic Thai curry with coconut milk, vegetables, and your choice of protein.',
    imageUrl: 'https://images.unsplash.com/photo-1455619452474-d2be8b1e70cd?w=400&h=300&fit=crop',
    cookingTime: 60,
    servings: 4,
    category: 'Main Course',
    difficulty: 'Medium' as const
  },
  {
    id: '6',
    title: 'Artisan Sourdough Bread',
    description: 'Traditional sourdough bread with a crispy crust and tangy flavor.',
    imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&h=300&fit=crop',
    cookingTime: 480,
    servings: 8,
    category: 'Bread',
    difficulty: 'Hard' as const
  }
];

const categories = ['All', 'Main Course', 'Appetizer', 'Dessert', 'Healthy', 'Bread'];
const difficulties = ['All', 'Easy', 'Medium', 'Hard'];

export default function RecipesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');

  const filteredRecipes = mockRecipes.filter(recipe => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || recipe.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || recipe.difficulty === selectedDifficulty;
    
    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display font-bold text-4xl sm:text-5xl lg:text-6xl mb-6 gradient-text">
              Discover Amazing Recipes
            </h1>
            <p className="text-foreground/70 text-lg font-body font-light max-w-2xl mx-auto">
              Explore our curated collection of recipes from around the world. From quick weeknight meals to elaborate weekend feasts.
            </p>
          </div>

          {/* Search and Filters */}
          <Card variant="glass" className="max-w-4xl mx-auto mb-12">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search recipes by name or ingredients..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-3 pl-12 bg-background/50 border border-border rounded-full text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent font-body"
                  />
                  <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                {/* Filters */}
                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-body font-medium text-foreground/80 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent font-body"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex-1 min-w-0">
                    <label className="block text-sm font-body font-medium text-foreground/80 mb-2">Difficulty</label>
                    <select
                      value={selectedDifficulty}
                      onChange={(e) => setSelectedDifficulty(e.target.value)}
                      className="w-full px-4 py-2 bg-background/50 border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent font-body"
                    >
                      {difficulties.map(difficulty => (
                        <option key={difficulty} value={difficulty}>{difficulty}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="flex justify-between items-center mb-8">
            <p className="text-foreground/70 font-body">
              Showing {filteredRecipes.length} recipe{filteredRecipes.length !== 1 ? 's' : ''}
            </p>
            <Button variant="outline" size="sm">
              Sort by: Popular
            </Button>
          </div>

          {/* Recipe Grid */}
          {filteredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  {...recipe}
                />
              ))}
            </div>
          ) : (
            <Card variant="glass" className="text-center py-16">
              <CardContent>
                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-12 h-12 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="font-display font-semibold text-xl mb-2 text-foreground">No recipes found</h3>
                <p className="text-foreground/70 font-body mb-6">
                  Try adjusting your search terms or filters to find what you're looking for.
                </p>
                <Button 
                  onClick={() => {
                    setSearchTerm('');
                    setSelectedCategory('All');
                    setSelectedDifficulty('All');
                  }}
                >
                  Clear Filters
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20"></div>
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <h2 className="font-display font-bold text-4xl sm:text-5xl mb-6 text-foreground">
            Can't Find What You're Looking For?
          </h2>
          <p className="text-foreground/70 text-lg font-body font-light mb-8 max-w-2xl mx-auto">
            Upload your own recipe or extract one from any website, Instagram Reel, or image.
          </p>
          <Button size="lg" className="mr-4">
            Upload Recipe
          </Button>
          <Button variant="secondary" size="lg">
            Browse Categories
          </Button>
        </div>
      </section>
    </div>
  );
} 