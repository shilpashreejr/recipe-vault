"use client";
import React, { useState } from 'react';
import Button from './Button';
import { 
  Heart, 
  Download, 
  Upload, 
  Search, 
  Plus, 
  Trash2, 
  Star,
  ArrowRight,
  Settings
} from 'lucide-react';

export const ButtonShowcase: React.FC = () => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});

  const handleLoadingClick = (buttonId: string) => {
    setLoadingStates(prev => ({ ...prev, [buttonId]: true }));
    setTimeout(() => {
      setLoadingStates(prev => ({ ...prev, [buttonId]: false }));
    }, 2000);
  };

  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-4">Modern Button Styles</h2>
        <p className="text-muted-foreground">
          Sophisticated button components with elegant hover effects and micro-interactions.
        </p>
      </div>

      <div className="space-y-8">
        {/* Button Variants */}
        <div>
          <h3 className="text-lg font-serif font-medium mb-4">Button Variants</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="primary">Primary Button</Button>
            <Button variant="secondary">Secondary Button</Button>
            <Button variant="outline">Outline Button</Button>
            <Button variant="ghost">Ghost Button</Button>
            <Button variant="gradient">Gradient Button</Button>
            <Button variant="glass">Glass Button</Button>
            <Button variant="destructive">Destructive Button</Button>
          </div>
        </div>

        {/* Button Sizes */}
        <div>
          <h3 className="text-lg font-serif font-medium mb-4">Button Sizes</h3>
          <div className="flex flex-wrap items-center gap-4">
            <Button size="sm">Small</Button>
            <Button size="md">Medium</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
          </div>
        </div>

        {/* Buttons with Icons */}
        <div>
          <h3 className="text-lg font-serif font-medium mb-4">Buttons with Icons</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button icon={<Heart className="w-5 h-5" />}>
              Add to Favorites
            </Button>
            <Button icon={<Download className="w-5 h-5" />} variant="secondary">
              Download Recipe
            </Button>
            <Button icon={<Upload className="w-5 h-5" />} variant="outline">
              Upload Image
            </Button>
            <Button icon={<Search className="w-5 h-5" />} variant="ghost">
              Search Recipes
            </Button>
            <Button icon={<Plus className="w-5 h-5" />} variant="gradient">
              Create New
            </Button>
            <Button icon={<Trash2 className="w-5 h-5" />} variant="destructive">
              Delete Recipe
            </Button>
          </div>
        </div>

        {/* Icons on Right */}
        <div>
          <h3 className="text-lg font-serif font-medium mb-4">Icons on Right</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button icon={<ArrowRight className="w-5 h-5" />} iconPosition="right">
              Continue
            </Button>
            <Button icon={<Settings className="w-5 h-5" />} iconPosition="right" variant="secondary">
              Settings
            </Button>
          </div>
        </div>

        {/* Loading States */}
        <div>
          <h3 className="text-lg font-serif font-medium mb-4">Loading States</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button 
              loading={loadingStates['primary-loading']}
              onClick={() => handleLoadingClick('primary-loading')}
            >
              Save Recipe
            </Button>
            <Button 
              variant="gradient"
              loading={loadingStates['gradient-loading']}
              onClick={() => handleLoadingClick('gradient-loading')}
            >
              Process Image
            </Button>
            <Button 
              variant="destructive"
              loading={loadingStates['destructive-loading']}
              onClick={() => handleLoadingClick('destructive-loading')}
            >
              Delete All
            </Button>
          </div>
        </div>

        {/* Interactive Examples */}
        <div>
          <h3 className="text-lg font-serif font-medium mb-4">Interactive Examples</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-lg bg-card border">
              <h4 className="font-medium mb-3">Recipe Actions</h4>
              <div className="space-y-3">
                <Button icon={<Heart className="w-4 h-4" />} size="sm" variant="ghost">
                  Favorite
                </Button>
                <Button icon={<Star className="w-4 h-4" />} size="sm" variant="outline">
                  Rate Recipe
                </Button>
                <Button icon={<Download className="w-4 h-4" />} size="sm" variant="secondary">
                  Print Recipe
                </Button>
              </div>
            </div>
            
            <div className="p-6 rounded-lg bg-card border">
              <h4 className="font-medium mb-3">Upload Actions</h4>
              <div className="space-y-3">
                <Button icon={<Upload className="w-4 h-4" />} size="sm" variant="gradient">
                  Upload Image
                </Button>
                <Button icon={<Search className="w-4 h-4" />} size="sm" variant="primary">
                  Extract Recipe
                </Button>
                <Button icon={<Plus className="w-4 h-4" />} size="sm" variant="glass">
                  Add Manually
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Hover Effects Demo */}
        <div>
          <h3 className="text-lg font-serif font-medium mb-4">Hover Effects Demo</h3>
          <p className="text-muted-foreground mb-4">
            Hover over these buttons to see the sophisticated micro-interactions:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="primary" className="group">
              <span className="group-hover:scale-105 transition-transform">Scale Effect</span>
            </Button>
            <Button variant="gradient" className="group">
              <span className="group-hover:translate-x-1 transition-transform">Slide Effect</span>
            </Button>
            <Button variant="glass" className="group">
              <span className="group-hover:rotate-1 transition-transform">Rotate Effect</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}; 