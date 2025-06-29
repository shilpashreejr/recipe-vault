import React from 'react';
import { cn } from '@/lib/utils';

// Spacing Scale Component
export const SpacingScale: React.FC = () => {
  const spacingTokens = [
    { name: 'xs', value: '0.25rem', size: '4px', class: 'space-xs' },
    { name: 'sm', value: '0.5rem', size: '8px', class: 'space-sm' },
    { name: 'md', value: '1rem', size: '16px', class: 'space-md' },
    { name: 'lg', value: '1.5rem', size: '24px', class: 'space-lg' },
    { name: 'xl', value: '2rem', size: '32px', class: 'space-xl' },
    { name: '2xl', value: '3rem', size: '48px', class: 'space-2xl' },
    { name: '3xl', value: '4rem', size: '64px', class: 'space-3xl' },
    { name: '4xl', value: '6rem', size: '96px', class: 'space-4xl' },
    { name: '5xl', value: '8rem', size: '128px', class: 'space-5xl' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-serif font-medium">Spacing Scale</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spacingTokens.map((token) => (
          <div key={token.name} className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">space-{token.name}</span>
              <span className="text-xs text-muted-foreground">{token.size}</span>
            </div>
            <div className={cn('bg-primary/10 rounded', token.class)}>
              <div className="h-4 bg-primary/20 rounded"></div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">{token.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Layout Containers Component
export const LayoutContainers: React.FC = () => {
  const containers = [
    { name: 'container-sm', maxWidth: '640px', description: 'Small containers for forms and focused content' },
    { name: 'container-md', maxWidth: '768px', description: 'Medium containers for blog posts and articles' },
    { name: 'container-lg', maxWidth: '1024px', description: 'Large containers for dashboard content' },
    { name: 'container-xl', maxWidth: '1280px', description: 'Extra large containers for wide layouts' },
    { name: 'container-2xl', maxWidth: '1536px', description: '2XL containers for maximum width layouts' },
    { name: 'content', maxWidth: '65ch', description: 'Content width for optimal readability' },
    { name: 'content-wide', maxWidth: '80ch', description: 'Wide content for detailed articles' },
    { name: 'content-narrow', maxWidth: '45ch', description: 'Narrow content for focused reading' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-serif font-medium">Layout Containers</h3>
      <div className="space-y-4">
        {containers.map((container) => (
          <div key={container.name} className="bg-card border rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">{container.name}</span>
              <span className="text-sm text-muted-foreground">{container.maxWidth}</span>
            </div>
            <p className="text-sm text-muted-foreground">{container.description}</p>
            <div className="mt-3 h-8 bg-gradient-to-r from-primary/20 to-secondary/20 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Grid System Component
export const GridSystem: React.FC = () => {
  const gridPatterns = [
    { name: 'auto-fit-sm', minWidth: '200px', description: 'Small auto-fit grid' },
    { name: 'auto-fit-md', minWidth: '250px', description: 'Medium auto-fit grid' },
    { name: 'auto-fit-lg', minWidth: '300px', description: 'Large auto-fit grid' },
    { name: 'auto-fill-sm', minWidth: '150px', description: 'Small auto-fill grid' },
    { name: 'auto-fill-md', minWidth: '200px', description: 'Medium auto-fill grid' },
    { name: 'auto-fill-lg', minWidth: '250px', description: 'Large auto-fill grid' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-serif font-medium">Grid System</h3>
      <div className="space-y-8">
        {gridPatterns.map((pattern) => (
          <div key={pattern.name} className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-medium">{pattern.name}</span>
              <span className="text-sm text-muted-foreground">min-width: {pattern.minWidth}</span>
            </div>
            <p className="text-sm text-muted-foreground">{pattern.description}</p>
            <div className={cn('grid gap-4', {
              'grid-cols-auto-fit-sm': pattern.name.includes('auto-fit-sm'),
              'grid-cols-auto-fit-md': pattern.name.includes('auto-fit-md'),
              'grid-cols-auto-fit-lg': pattern.name.includes('auto-fit-lg'),
              'grid-cols-auto-fill-sm': pattern.name.includes('auto-fill-sm'),
              'grid-cols-auto-fill-md': pattern.name.includes('auto-fill-md'),
              'grid-cols-auto-fill-lg': pattern.name.includes('auto-fill-lg'),
            })}>
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card border rounded-lg p-4 h-20 flex items-center justify-center">
                  <span className="text-sm font-medium">Item {i}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Flexbox Layouts Component
export const FlexboxLayouts: React.FC = () => {
  const flexPatterns = [
    { name: 'flex-center', description: 'Centered content both horizontally and vertically' },
    { name: 'flex-between', description: 'Content spread across with space between' },
    { name: 'flex-start', description: 'Content aligned to the start' },
    { name: 'flex-end', description: 'Content aligned to the end' },
    { name: 'flex-col-center', description: 'Vertically stacked and centered content' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-serif font-medium">Flexbox Layouts</h3>
      <div className="space-y-4">
        {flexPatterns.map((pattern) => (
          <div key={pattern.name} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium">{pattern.name}</span>
              <span className="text-sm text-muted-foreground">{pattern.description}</span>
            </div>
            <div className={cn('bg-card border rounded-lg p-4 h-16', {
              'flex-center': pattern.name === 'flex-center',
              'flex-between': pattern.name === 'flex-between',
              'flex-start': pattern.name === 'flex-start',
              'flex-end': pattern.name === 'flex-end',
              'flex-col-center': pattern.name === 'flex-col-center',
            })}>
              <div className="bg-primary/20 rounded px-3 py-1 text-sm">Item 1</div>
              <div className="bg-secondary/20 rounded px-3 py-1 text-sm">Item 2</div>
              <div className="bg-accent/20 rounded px-3 py-1 text-sm">Item 3</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Stack and Inline Spacing Component
export const StackInlineSpacing: React.FC = () => {
  const stackSizes = ['xs', 'sm', 'md', 'lg', 'xl'];
  const inlineSizes = ['xs', 'sm', 'md', 'lg', 'xl'];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-serif font-medium mb-4">Stack Spacing</h3>
        <div className="space-y-4">
          {stackSizes.map((size) => (
            <div key={size} className="space-y-2">
              <span className="font-medium text-sm">stack-{size}</span>
              <div className={cn('bg-card border rounded-lg p-4', {
                'stack-xs': size === 'xs',
                'stack-sm': size === 'sm',
                'stack-md': size === 'md',
                'stack-lg': size === 'lg',
                'stack-xl': size === 'xl',
              })}>
                <div className="bg-primary/20 rounded px-3 py-2 text-sm">Stack Item 1</div>
                <div className="bg-secondary/20 rounded px-3 py-2 text-sm">Stack Item 2</div>
                <div className="bg-accent/20 rounded px-3 py-2 text-sm">Stack Item 3</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-serif font-medium mb-4">Inline Spacing</h3>
        <div className="space-y-4">
          {inlineSizes.map((size) => (
            <div key={size} className="space-y-2">
              <span className="font-medium text-sm">inline-{size}</span>
              <div className={cn('bg-card border rounded-lg p-4', {
                'inline-xs': size === 'xs',
                'inline-sm': size === 'sm',
                'inline-md': size === 'md',
                'inline-lg': size === 'lg',
                'inline-xl': size === 'xl',
              })}>
                <div className="bg-primary/20 rounded px-3 py-2 text-sm">Inline Item 1</div>
                <div className="bg-secondary/20 rounded px-3 py-2 text-sm">Inline Item 2</div>
                <div className="bg-accent/20 rounded px-3 py-2 text-sm">Inline Item 3</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Layout Patterns Component
export const LayoutPatterns: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-serif font-medium mb-4">Page Layout Pattern</h3>
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-primary/10 p-4 border-b">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Page Header</h4>
              <div className="flex space-x-2">
                <div className="bg-primary/20 rounded px-3 py-1 text-sm">Nav 1</div>
                <div className="bg-primary/20 rounded px-3 py-1 text-sm">Nav 2</div>
                <div className="bg-primary/20 rounded px-3 py-1 text-sm">Nav 3</div>
              </div>
            </div>
          </div>
          
          <div className="p-6 bg-background">
            <div className="max-w-content mx-auto">
              <h4 className="font-medium mb-4">Main Content Area</h4>
              <p className="text-muted-foreground">
                This demonstrates a typical page layout with header, main content, and footer sections.
                The content is constrained to optimal reading width for better readability.
              </p>
            </div>
          </div>
          
          <div className="bg-muted/50 p-4 border-t">
            <div className="text-center">
              <p className="text-muted-foreground text-sm">Page Footer</p>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-lg font-serif font-medium mb-4">Dashboard Layout Pattern</h3>
        <div className="grid grid-cols-1 lg:grid-cols-sidebar gap-6">
          <div className="bg-card border rounded-lg p-4">
            <h4 className="font-medium mb-4">Sidebar</h4>
            <div className="space-y-2">
              <div className="bg-primary/10 rounded px-3 py-2 text-sm">Dashboard</div>
              <div className="bg-primary/10 rounded px-3 py-2 text-sm">Recipes</div>
              <div className="bg-primary/10 rounded px-3 py-2 text-sm">Favorites</div>
              <div className="bg-primary/10 rounded px-3 py-2 text-sm">Settings</div>
            </div>
          </div>
          
          <div className="bg-card border rounded-lg p-4">
            <h4 className="font-medium mb-4">Main Content</h4>
            <p className="text-muted-foreground">
              This demonstrates a dashboard layout with a sidebar and main content area.
              The layout is responsive and adapts to different screen sizes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main SpacingLayoutSystem Component
export const SpacingLayoutSystem: React.FC = () => {
  return (
    <div className="space-y-12 p-8">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-4">Spacing & Layout System</h2>
        <p className="text-muted-foreground">
          A comprehensive spacing and layout system with consistent tokens, responsive patterns, and modern design utilities.
        </p>
      </div>

      <SpacingScale />
      <LayoutContainers />
      <GridSystem />
      <FlexboxLayouts />
      <StackInlineSpacing />
      <LayoutPatterns />
    </div>
  );
};

export default SpacingLayoutSystem; 