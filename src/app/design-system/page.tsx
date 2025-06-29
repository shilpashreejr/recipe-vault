import React from 'react';
import { TypographyShowcase } from '@/components/ui/Typography';
import { ColorPalette } from '@/components/ui/ColorPalette';
import { GradientPatterns } from '@/components/ui/GradientPatterns';
import { ButtonShowcase } from '@/components/ui/ButtonShowcase';

export default function DesignSystemPage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-serif font-bold text-center mb-8">
          RecipeVault Design System
        </h1>
        
        <div className="space-y-16">
          <section>
            <TypographyShowcase />
          </section>
          
          <section>
            <ColorPalette />
          </section>
          
          <section>
            <GradientPatterns />
          </section>
          
          <section>
            <ButtonShowcase />
          </section>
        </div>
      </div>
    </div>
  );
} 