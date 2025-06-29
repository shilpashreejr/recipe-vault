import React from 'react';
import { cn } from '@/lib/utils';

interface ColorSwatchProps {
  name: string;
  color: string;
  className?: string;
  description?: string;
}

const ColorSwatch: React.FC<ColorSwatchProps> = ({ name, color, className, description }) => (
  <div className={cn('flex flex-col space-y-2', className)}>
    <div 
      className="w-16 h-16 rounded-lg border-2 border-gray-200 shadow-sm"
      style={{ backgroundColor: color }}
    />
    <div className="text-sm">
      <div className="font-medium text-foreground">{name}</div>
      <div className="text-muted-foreground font-mono text-xs">{color}</div>
      {description && (
        <div className="text-muted-foreground text-xs mt-1">{description}</div>
      )}
    </div>
  </div>
);

export const ColorPalette: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-4">RecipeVault Color Palette</h2>
        <p className="text-muted-foreground">
          A sophisticated color system designed for culinary applications.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-lg bg-[#1a1a2e] border-2 border-gray-200"></div>
          <div className="text-sm">
            <div className="font-medium">Deep Navy</div>
            <div className="text-muted-foreground font-mono text-xs">#1a1a2e</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-lg bg-[#f8f6f1] border-2 border-gray-200"></div>
          <div className="text-sm">
            <div className="font-medium">Warm Cream</div>
            <div className="text-muted-foreground font-mono text-xs">#f8f6f1</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-lg bg-[#7c9885] border-2 border-gray-200"></div>
          <div className="text-sm">
            <div className="font-medium">Sage Green</div>
            <div className="text-muted-foreground font-mono text-xs">#7c9885</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-lg bg-[#d2691e] border-2 border-gray-200"></div>
          <div className="text-sm">
            <div className="font-medium">Terracotta</div>
            <div className="text-muted-foreground font-mono text-xs">#d2691e</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-lg bg-[#d4af37] border-2 border-gray-200"></div>
          <div className="text-sm">
            <div className="font-medium">Gold</div>
            <div className="text-muted-foreground font-mono text-xs">#d4af37</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-lg bg-[#ff6b6b] border-2 border-gray-200"></div>
          <div className="text-sm">
            <div className="font-medium">Soft Coral</div>
            <div className="text-muted-foreground font-mono text-xs">#ff6b6b</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-lg bg-[#2c3e50] border-2 border-gray-200"></div>
          <div className="text-sm">
            <div className="font-medium">Charcoal</div>
            <div className="text-muted-foreground font-mono text-xs">#2c3e50</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="w-16 h-16 rounded-lg bg-[#ecf0f1] border-2 border-gray-200"></div>
          <div className="text-sm">
            <div className="font-medium">Light Gray</div>
            <div className="text-muted-foreground font-mono text-xs">#ecf0f1</div>
          </div>
        </div>
      </div>
    </div>
  );
}; 