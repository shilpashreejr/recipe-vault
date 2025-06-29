import React from 'react';
import Button from './Button';
import FormInput from './FormInput';
import { Heart, Star, Download, Share } from 'lucide-react';

export const LayoutShowcase: React.FC = () => {
  return (
    <div className="space-y-8 p-8">
      <div>
        <h2 className="text-2xl font-serif font-semibold mb-4">Spacing & Layout System</h2>
        <p className="text-muted-foreground">
          Consistent spacing scales, layout patterns, and responsive design utilities.
        </p>
      </div>

      <div className="space-y-12">
        {/* Spacing Scale */}
        <section>
          <h3 className="text-lg font-serif font-medium mb-6">Spacing Scale</h3>
          <div className="space-y-4">
            <div className="space-xs bg-primary/10 p-2 rounded">
              <span className="text-sm font-medium">space-xs (0.25rem)</span>
            </div>
            <div className="space-sm bg-secondary/10 p-2 rounded">
              <span className="text-sm font-medium">space-sm (0.5rem)</span>
            </div>
            <div className="space-md bg-accent/10 p-2 rounded">
              <span className="text-sm font-medium">space-md (1rem)</span>
            </div>
            <div className="space-lg bg-primary/10 p-2 rounded">
              <span className="text-sm font-medium">space-lg (1.5rem)</span>
            </div>
            <div className="space-xl bg-secondary/10 p-2 rounded">
              <span className="text-sm font-medium">space-xl (2rem)</span>
            </div>
          </div>
        </section>

        {/* Layout Containers */}
        <section>
          <h3 className="text-lg font-serif font-medium mb-6">Layout Containers</h3>
          <div className="space-y-4">
            <div className="container-sm bg-card-layout">
              <h4 className="font-medium mb-2">Container Small (640px)</h4>
              <p className="text-muted-foreground">Perfect for forms and focused content.</p>
            </div>
            <div className="container-md bg-card-layout">
              <h4 className="font-medium mb-2">Container Medium (768px)</h4>
              <p className="text-muted-foreground">Great for blog posts and articles.</p>
            </div>
            <div className="container-lg bg-card-layout">
              <h4 className="font-medium mb-2">Container Large (1024px)</h4>
              <p className="text-muted-foreground">Ideal for dashboard content.</p>
            </div>
          </div>
        </section>

        {/* Grid Layouts */}
        <section>
          <h3 className="text-lg font-serif font-medium mb-6">Grid Layouts</h3>
          <div className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Auto-fit Grid</h4>
              <div className="grid-auto-fit">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="card-layout">
                    <h5 className="font-medium">Card {i}</h5>
                    <p className="text-muted-foreground text-sm">Auto-fit grid item</p>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Auto-fill Grid</h4>
              <div className="grid-auto-fill">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className="card-layout">
                    <h5 className="font-medium">Item {i}</h5>
                    <p className="text-muted-foreground text-sm">Auto-fill grid item</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Flexbox Layouts */}
        <section>
          <h3 className="text-lg font-serif font-medium mb-6">Flexbox Layouts</h3>
          <div className="space-y-4">
            <div className="flex-between bg-card-layout p-4">
              <span>Left Content</span>
              <span>Right Content</span>
            </div>
            <div className="flex-center bg-card-layout p-4">
              <span>Centered Content</span>
            </div>
            <div className="flex-col-center bg-card-layout p-4">
              <span>Vertical Centered</span>
              <span>Content</span>
            </div>
          </div>
        </section>

        {/* Stack and Inline Spacing */}
        <section>
          <h3 className="text-lg font-serif font-medium mb-6">Stack & Inline Spacing</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Stack Spacing</h4>
              <div className="stack-md bg-card-layout p-4">
                <div className="bg-primary/10 p-2 rounded">Item 1</div>
                <div className="bg-secondary/10 p-2 rounded">Item 2</div>
                <div className="bg-accent/10 p-2 rounded">Item 3</div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Inline Spacing</h4>
              <div className="inline-md bg-card-layout p-4">
                <Button size="sm">Button 1</Button>
                <Button size="sm" variant="secondary">Button 2</Button>
                <Button size="sm" variant="outline">Button 3</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Page Layout Example */}
        <section>
          <h3 className="text-lg font-serif font-medium mb-6">Page Layout Pattern</h3>
          <div className="border rounded-lg overflow-hidden">
            <div className="page-header">
              <div className="nav-layout">
                <h4 className="font-medium">Page Header</h4>
                <div className="nav-menu">
                  <Button size="sm" variant="ghost">Home</Button>
                  <Button size="sm" variant="ghost">About</Button>
                  <Button size="sm" variant="ghost">Contact</Button>
                </div>
              </div>
            </div>
            
            <div className="page-main">
              <div className="container-md">
                <h4 className="font-medium mb-4">Main Content Area</h4>
                <p className="text-muted-foreground">
                  This demonstrates a typical page layout with header, main content, and footer sections.
                </p>
              </div>
            </div>
            
            <div className="page-footer">
              <div className="container-md text-center">
                <p className="text-muted-foreground">Page Footer</p>
              </div>
            </div>
          </div>
        </section>

        {/* Form Layout Example */}
        <section>
          <h3 className="text-lg font-serif font-medium mb-6">Form Layout Pattern</h3>
          <div className="form-layout bg-card-layout">
            <h4 className="font-medium mb-4">Contact Form</h4>
            <div className="form-group">
              <FormInput label="First Name" placeholder="Enter your first name" />
            </div>
            <div className="form-group">
              <FormInput label="Last Name" placeholder="Enter your last name" />
            </div>
            <div className="form-group">
              <FormInput label="Email" type="email" placeholder="Enter your email" />
            </div>
            <div className="form-group">
              <FormInput label="Message" placeholder="Enter your message" />
            </div>
            <div className="flex-end">
              <Button>Submit</Button>
            </div>
          </div>
        </section>

        {/* Dashboard Layout Example */}
        <section>
          <h3 className="text-lg font-serif font-medium mb-6">Dashboard Layout Pattern</h3>
          <div className="dashboard-layout">
            <div className="dashboard-sidebar">
              <h4 className="font-medium mb-4">Sidebar</h4>
              <div className="stack-sm">
                <Button variant="ghost" className="w-full justify-start">Dashboard</Button>
                <Button variant="ghost" className="w-full justify-start">Recipes</Button>
                <Button variant="ghost" className="w-full justify-start">Favorites</Button>
                <Button variant="ghost" className="w-full justify-start">Settings</Button>
              </div>
            </div>
            
            <div className="dashboard-main">
              <h4 className="font-medium mb-4">Main Content</h4>
              <div className="card-grid-compact">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="card-layout">
                    <h5 className="font-medium">Card {i}</h5>
                    <p className="text-muted-foreground text-sm">Dashboard content</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Hero Layout Example */}
        <section>
          <h3 className="text-lg font-serif font-medium mb-6">Hero Layout Pattern</h3>
          <div className="hero-layout bg-gradient-primary text-white">
            <div className="content-narrow">
              <h2 className="text-3xl font-serif font-bold mb-4">Hero Section</h2>
              <p className="text-lg mb-6 opacity-90">
                This demonstrates a hero layout with centered content and gradient background.
              </p>
              <div className="inline-md">
                <Button variant="glass">Get Started</Button>
                <Button variant="outline" className="text-white border-white">Learn More</Button>
              </div>
            </div>
          </div>
        </section>

        {/* Content Widths */}
        <section>
          <h3 className="text-lg font-serif font-medium mb-6">Content Widths</h3>
          <div className="space-y-6">
            <div className="content-narrow bg-card-layout p-4">
              <h4 className="font-medium mb-2">Narrow Content (65ch)</h4>
              <p className="text-muted-foreground">
                Perfect for reading long-form content like articles and blog posts. This width ensures optimal readability and reduces eye strain.
              </p>
            </div>
            
            <div className="content-medium bg-card-layout p-4">
              <h4 className="font-medium mb-2">Medium Content (80ch)</h4>
              <p className="text-muted-foreground">
                Great for general content that needs a bit more space while still maintaining good readability. Ideal for documentation and guides.
              </p>
            </div>
            
            <div className="content-wide bg-card-layout p-4">
              <h4 className="font-medium mb-2">Wide Content (100ch)</h4>
              <p className="text-muted-foreground">
                Suitable for content that needs more horizontal space, such as code examples, tables, or complex layouts that benefit from extra width.
              </p>
            </div>
          </div>
        </section>

        {/* Aspect Ratios */}
        <section>
          <h3 className="text-lg font-serif font-medium mb-6">Aspect Ratios</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="aspect-square bg-primary/10 flex-center rounded">
              <span className="text-sm font-medium">Square (1:1)</span>
            </div>
            <div className="aspect-video bg-secondary/10 flex-center rounded">
              <span className="text-sm font-medium">Video (16:9)</span>
            </div>
            <div className="aspect-photo bg-accent/10 flex-center rounded">
              <span className="text-sm font-medium">Photo (4:3)</span>
            </div>
            <div className="aspect-banner bg-primary/10 flex-center rounded">
              <span className="text-sm font-medium">Banner (21:9)</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}; 