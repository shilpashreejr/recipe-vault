import React from 'react';
import { cn } from '@/lib/utils';

interface TypographyProps {
  children: React.ReactNode;
  className?: string;
}

// Heading components with Playfair Display (serif)
export const H1: React.FC<TypographyProps> = ({ children, className }) => (
  <h1 className={cn('font-serif text-4xl md:text-5xl lg:text-6xl font-bold leading-tight tracking-tight', className)}>
    {children}
  </h1>
);

export const H2: React.FC<TypographyProps> = ({ children, className }) => (
  <h2 className={cn('font-serif text-3xl md:text-4xl lg:text-5xl font-semibold leading-tight tracking-tight', className)}>
    {children}
  </h2>
);

export const H3: React.FC<TypographyProps> = ({ children, className }) => (
  <h3 className={cn('font-serif text-2xl md:text-3xl lg:text-4xl font-semibold leading-tight', className)}>
    {children}
  </h3>
);

export const H4: React.FC<TypographyProps> = ({ children, className }) => (
  <h4 className={cn('font-serif text-xl md:text-2xl lg:text-3xl font-medium leading-tight', className)}>
    {children}
  </h4>
);

export const H5: React.FC<TypographyProps> = ({ children, className }) => (
  <h5 className={cn('font-serif text-lg md:text-xl lg:text-2xl font-medium leading-tight', className)}>
    {children}
  </h5>
);

export const H6: React.FC<TypographyProps> = ({ children, className }) => (
  <h6 className={cn('font-serif text-base md:text-lg lg:text-xl font-medium leading-tight', className)}>
    {children}
  </h6>
);

// Body text components with Inter (sans-serif)
export const P: React.FC<TypographyProps> = ({ children, className }) => (
  <p className={cn('font-sans text-base leading-relaxed', className)}>
    {children}
  </p>
);

export const PSmall: React.FC<TypographyProps> = ({ children, className }) => (
  <p className={cn('font-sans text-sm leading-relaxed', className)}>
    {children}
  </p>
);

export const PLarge: React.FC<TypographyProps> = ({ children, className }) => (
  <p className={cn('font-sans text-lg leading-relaxed', className)}>
    {children}
  </p>
);

// Accent text components with Poppins
export const AccentText: React.FC<TypographyProps> = ({ children, className }) => (
  <span className={cn('font-accent text-base font-medium', className)}>
    {children}
  </span>
);

export const AccentTextSmall: React.FC<TypographyProps> = ({ children, className }) => (
  <span className={cn('font-accent text-sm font-medium', className)}>
    {children}
  </span>
);

export const AccentTextLarge: React.FC<TypographyProps> = ({ children, className }) => (
  <span className={cn('font-accent text-lg font-medium', className)}>
    {children}
  </span>
);

// Special text styles
export const GradientText: React.FC<TypographyProps> = ({ children, className }) => (
  <span className={cn('gradient-text font-serif font-bold', className)}>
    {children}
  </span>
);

export const MutedText: React.FC<TypographyProps> = ({ children, className }) => (
  <span className={cn('font-sans text-muted-foreground', className)}>
    {children}
  </span>
);

export const Code: React.FC<TypographyProps> = ({ children, className }) => (
  <code className={cn('font-mono text-sm bg-muted px-1.5 py-0.5 rounded', className)}>
    {children}
  </code>
);

// Typography showcase component for testing
export const TypographyShowcase: React.FC = () => (
  <div className="space-y-8 p-8">
    <div className="space-y-4">
      <H1>RecipeVault Typography System</H1>
      <H2>Elegant Font Hierarchy</H2>
      <H3>Three Distinct Font Families</H3>
      <H4>Inter - Primary Sans Serif</H4>
      <H5>Playfair Display - Serif Headings</H5>
      <H6>Poppins - Accent Font</H6>
    </div>

    <div className="space-y-4">
      <H3>Body Text Examples</H3>
      <PLarge>
        This is large body text using Inter font. It provides excellent readability for longer content and maintains a clean, modern appearance across all devices.
      </PLarge>
      <P>
        This is standard body text using Inter font. It's optimized for readability and provides a comfortable reading experience for users.
      </P>
      <PSmall>
        This is small body text using Inter font. It's perfect for captions, metadata, and secondary information.
      </PSmall>
    </div>

    <div className="space-y-4">
      <H3>Accent Text Examples</H3>
      <AccentTextLarge>Large accent text using Poppins font</AccentTextLarge>
      <AccentText>Standard accent text using Poppins font</AccentText>
      <AccentTextSmall>Small accent text using Poppins font</AccentTextSmall>
    </div>

    <div className="space-y-4">
      <H3>Special Text Styles</H3>
      <GradientText>Gradient text with Playfair Display</GradientText>
      <MutedText>Muted text for secondary information</MutedText>
      <Code>Code text with monospace font</Code>
    </div>

    <div className="space-y-4">
      <H3>Font Family Classes</H3>
      <p className="font-sans">font-sans (Inter) - Clean, modern sans-serif</p>
      <p className="font-serif">font-serif (Playfair Display) - Elegant serif</p>
      <p className="font-accent">font-accent (Poppins) - Modern accent font</p>
      <p className="font-mono">font-mono - Monospace for code</p>
    </div>
  </div>
); 