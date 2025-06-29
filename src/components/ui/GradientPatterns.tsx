import React from 'react';

export const GradientPatterns: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-4">Gradients & Patterns</h2>
        <p className="text-muted-foreground">
          Sophisticated gradient backgrounds and subtle patterns for visual depth.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-serif font-medium mb-3">Gradient Backgrounds</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="h-32 rounded-lg gradient-primary flex items-center justify-center">
              <span className="text-white font-medium">Primary Gradient</span>
            </div>
            <div className="h-32 rounded-lg gradient-secondary flex items-center justify-center">
              <span className="text-white font-medium">Secondary Gradient</span>
            </div>
            <div className="h-32 rounded-lg gradient-accent flex items-center justify-center">
              <span className="text-white font-medium">Accent Gradient</span>
            </div>
            <div className="h-32 rounded-lg gradient-warm flex items-center justify-center">
              <span className="text-foreground font-medium">Warm Gradient</span>
            </div>
            <div className="h-32 rounded-lg gradient-hero flex items-center justify-center">
              <span className="text-white font-medium">Hero Gradient</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-serif font-medium mb-3">Subtle Patterns</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 rounded-lg pattern-dots bg-background flex items-center justify-center">
              <span className="text-foreground font-medium">Dot Pattern</span>
            </div>
            <div className="h-32 rounded-lg pattern-lines bg-background flex items-center justify-center">
              <span className="text-foreground font-medium">Line Pattern</span>
            </div>
            <div className="h-32 rounded-lg pattern-grid bg-background flex items-center justify-center">
              <span className="text-foreground font-medium">Grid Pattern</span>
            </div>
            <div className="h-32 rounded-lg pattern-circles bg-background flex items-center justify-center">
              <span className="text-foreground font-medium">Circle Pattern</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-serif font-medium mb-3">Glass Morphism</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="h-32 rounded-lg glass-gradient flex items-center justify-center">
              <span className="text-foreground font-medium">Light Glass</span>
            </div>
            <div className="h-32 rounded-lg glass-gradient-dark flex items-center justify-center">
              <span className="text-white font-medium">Dark Glass</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 