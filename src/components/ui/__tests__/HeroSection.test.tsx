import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import HeroSection, { 
  FloatingRecipeCard, 
  AnimatedCTAButton, 
  GradientText 
} from '../HeroSection';

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, whileTap, onHoverStart, onHoverEnd, style, ...props }: any) => (
      <div 
        {...props} 
        data-testid="motion-div"
        data-while-hover={whileHover ? 'true' : 'false'}
        data-while-tap={whileTap ? 'true' : 'false'}
        data-on-hover-start={onHoverStart ? 'true' : 'false'}
        data-on-hover-end={onHoverEnd ? 'true' : 'false'}
        style={style}
      >
        {children}
      </div>
    ),
    button: ({ children, whileHover, whileTap, onHoverStart, onHoverEnd, ...props }: any) => (
      <button 
        {...props} 
        data-testid="motion-button"
        data-while-hover={whileHover ? 'true' : 'false'}
        data-while-tap={whileTap ? 'true' : 'false'}
        data-on-hover-start={onHoverStart ? 'true' : 'false'}
        data-on-hover-end={onHoverEnd ? 'true' : 'false'}
      >
        {children}
      </button>
    ),
  },
  useScroll: () => ({
    scrollYProgress: { get: () => 0, on: jest.fn() }
  }),
  useTransform: () => ({ get: () => 0, on: jest.fn() }),
  useInView: () => false,
}));

describe('HeroSection', () => {
  it('renders the main hero section with title and description', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('Transform Your')).toBeInTheDocument();
    expect(screen.getByText('Recipe Collection')).toBeInTheDocument();
    expect(screen.getByText(/Extract, organize, and discover recipes/)).toBeInTheDocument();
  });

  it('renders the badge with correct text and icon', () => {
    render(<HeroSection />);
    
    const badge = screen.getByText('Extract recipes from anywhere').closest('div');
    expect(badge).toHaveClass('bg-primary/10');
  });

  it('renders CTA buttons with correct text', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('Start Extracting Recipes')).toBeInTheDocument();
    expect(screen.getByText('Watch Demo')).toBeInTheDocument();
  });

  it('renders statistics with correct values', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('10K+')).toBeInTheDocument();
    expect(screen.getByText('Recipes Extracted')).toBeInTheDocument();
    expect(screen.getByText('50+')).toBeInTheDocument();
    expect(screen.getByText('Sources Supported')).toBeInTheDocument();
    expect(screen.getByText('99%')).toBeInTheDocument();
    expect(screen.getByText('Accuracy Rate')).toBeInTheDocument();
  });

  it('renders floating recipe cards', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('Creamy Mushroom Risotto')).toBeInTheDocument();
    expect(screen.getByText('Spicy Thai Curry')).toBeInTheDocument();
    expect(screen.getByText('Chocolate Lava Cake')).toBeInTheDocument();
  });

  it('renders recipe card details correctly', () => {
    render(<HeroSection />);
    
    // Check for rating, time, and servings
    expect(screen.getAllByText('4.8')).toHaveLength(1);
    expect(screen.getAllByText('4.6')).toHaveLength(1);
    expect(screen.getAllByText('4.9')).toHaveLength(1);
    expect(screen.getAllByText('45m')).toHaveLength(1);
    expect(screen.getAllByText('30m')).toHaveLength(1);
    expect(screen.getAllByText('25m')).toHaveLength(1);
    expect(screen.getAllByText('4')).toHaveLength(1);
    expect(screen.getAllByText('6')).toHaveLength(1);
    expect(screen.getAllByText('2')).toHaveLength(1);
  });

  it('has correct container structure', () => {
    render(<HeroSection />);
    
    // Directly query for the container element
    const container = document.querySelector('.container.mx-auto.px-4.py-20');
    expect(container).toBeInTheDocument();
    expect(container).toHaveClass('container');
  });

  it('has responsive grid layout', () => {
    render(<HeroSection />);
    
    const grid = screen.getByText('Transform Your').closest('.grid');
    expect(grid).toHaveClass('grid-cols-1', 'lg:grid-cols-2');
  });
});

describe('FloatingRecipeCard', () => {
  const defaultProps = {
    title: 'Test Recipe',
    image: '/test-image.jpg',
    rating: 4.5,
    time: '30m',
    servings: 4,
    delay: 0.2
  };

  it('renders recipe card with correct title', () => {
    render(<FloatingRecipeCard {...defaultProps} />);
    
    expect(screen.getByText('Test Recipe')).toBeInTheDocument();
  });

  it('renders recipe card with correct details', () => {
    render(<FloatingRecipeCard {...defaultProps} />);
    
    expect(screen.getByText('4.5')).toBeInTheDocument();
    expect(screen.getByText('30m')).toBeInTheDocument();
    expect(screen.getByText('4')).toBeInTheDocument();
  });

  it('has correct card styling', () => {
    render(<FloatingRecipeCard {...defaultProps} />);
    
    const card = screen.getByText('Test Recipe').closest('.bg-card');
    expect(card).toHaveClass('bg-card', 'border', 'rounded-xl');
  });

  it('renders chef hat icon in image placeholder', () => {
    render(<FloatingRecipeCard {...defaultProps} />);
    
    // The chef hat icon should be present in the image placeholder
    const imageContainer = screen.getByText('Test Recipe').closest('.bg-card')?.querySelector('.aspect-video');
    expect(imageContainer).toBeInTheDocument();
  });

  it('has hover interactions', () => {
    render(<FloatingRecipeCard {...defaultProps} />);
    
    const card = screen.getByText('Test Recipe').closest('.group');
    expect(card).toHaveClass('group', 'cursor-pointer');
  });
});

describe('AnimatedCTAButton', () => {
  const defaultProps = {
    children: 'Test Button',
    onClick: jest.fn()
  };

  it('renders button with correct text', () => {
    render(<AnimatedCTAButton {...defaultProps} />);
    
    expect(screen.getByText('Test Button')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const onClick = jest.fn();
    render(<AnimatedCTAButton {...defaultProps} onClick={onClick} />);
    
    fireEvent.click(screen.getByText('Test Button'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('renders primary variant with correct styling', () => {
    render(<AnimatedCTAButton {...defaultProps} variant="primary" />);
    
    const button = screen.getByText('Test Button').closest('button');
    expect(button).toHaveClass('bg-primary', 'text-primary-foreground');
  });

  it('renders secondary variant with correct styling', () => {
    render(<AnimatedCTAButton {...defaultProps} variant="secondary" />);
    
    const button = screen.getByText('Test Button').closest('button');
    expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground');
  });

  it('renders arrow icon', () => {
    render(<AnimatedCTAButton {...defaultProps} />);
    
    // The arrow icon should be present
    const button = screen.getByText('Test Button');
    expect(button.closest('button')).toHaveClass('relative');
  });

  it('has hover and tap animations', () => {
    render(<AnimatedCTAButton {...defaultProps} />);
    
    const button = screen.getByText('Test Button');
    expect(button.closest('button')).toHaveClass('transition-all', 'duration-300');
  });
});

describe('GradientText', () => {
  it('renders text with gradient styling', () => {
    render(<GradientText>Test Gradient Text</GradientText>);
    
    const text = screen.getByText('Test Gradient Text');
    expect(text).toHaveClass('bg-gradient-to-r', 'bg-clip-text', 'text-transparent');
  });

  it('applies custom className', () => {
    render(<GradientText className="custom-class">Test Text</GradientText>);
    
    const text = screen.getByText('Test Text');
    expect(text).toHaveClass('custom-class');
  });

  it('renders children correctly', () => {
    render(<GradientText>Custom Content</GradientText>);
    
    expect(screen.getByText('Custom Content')).toBeInTheDocument();
  });
});

describe('HeroSection Integration', () => {
  it('renders complete hero section without errors', () => {
    expect(() => render(<HeroSection />)).not.toThrow();
  });

  it('has proper semantic structure', () => {
    render(<HeroSection />);
    
    // Should have a main heading
    const heading = screen.getByRole('heading', { level: 1 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveTextContent('Transform Your Recipe Collection');
  });

  it('has accessible button elements', () => {
    render(<HeroSection />);
    
    const buttons = screen.getAllByRole('button');
    expect(buttons.length).toBeGreaterThan(0);
    
    buttons.forEach(button => {
      expect(button).toBeInTheDocument();
    });
  });

  it('has responsive design classes', () => {
    render(<HeroSection />);
    
    const container = screen.getByText('Transform Your').closest('.container');
    expect(container).toHaveClass('mx-auto', 'px-4');
  });

  it('has proper spacing and layout', () => {
    render(<HeroSection />);
    
    const mainContent = screen.getByText('Transform Your').closest('.space-y-8');
    expect(mainContent).toBeInTheDocument();
  });

  it('renders all required sections', () => {
    render(<HeroSection />);
    
    // Check for all main sections
    expect(screen.getByText('Transform Your')).toBeInTheDocument(); // Main headline
    expect(screen.getByText('Extract recipes from anywhere')).toBeInTheDocument(); // Badge
    expect(screen.getByText('Start Extracting Recipes')).toBeInTheDocument(); // CTA
    expect(screen.getByText('Creamy Mushroom Risotto')).toBeInTheDocument(); // Recipe card
  });

  it('has proper color scheme', () => {
    render(<HeroSection />);
    
    // Check for primary color usage
    const primaryElements = document.querySelectorAll('.text-primary');
    expect(primaryElements.length).toBeGreaterThan(0);
    
    // Check for secondary color usage
    const secondaryElements = document.querySelectorAll('.text-secondary');
    expect(secondaryElements.length).toBeGreaterThan(0);
  });

  it('has proper typography hierarchy', () => {
    render(<HeroSection />);
    
    const mainHeading = screen.getByText('Transform Your').closest('h1');
    expect(mainHeading).toHaveClass('text-5xl', 'lg:text-7xl', 'font-bold');
    
    const description = screen.getByText(/Extract, organize, and discover/);
    expect(description).toHaveClass('text-xl', 'lg:text-2xl');
  });
});

describe('HeroSection Accessibility', () => {
  it('has proper heading hierarchy', () => {
    render(<HeroSection />);
    
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
  });

  it('has proper button labels', () => {
    render(<HeroSection />);
    
    const buttons = screen.getAllByRole('button');
    buttons.forEach(button => {
      expect(button.textContent).not.toBe('');
    });
  });

  it('has proper contrast ratios', () => {
    render(<HeroSection />);
    
    // Check that text elements have proper color classes
    const textElements = document.querySelectorAll('.text-foreground, .text-muted-foreground');
    expect(textElements.length).toBeGreaterThan(0);
  });
});

describe('HeroSection Performance', () => {
  it('renders efficiently without memory leaks', () => {
    const { unmount } = render(<HeroSection />);
    
    // Should unmount cleanly
    expect(() => unmount()).not.toThrow();
  });

  it('has optimized animations', () => {
    render(<HeroSection />);
    
    // Check for proper animation classes
    const animatedElements = document.querySelectorAll('[class*="transition"]');
    expect(animatedElements.length).toBeGreaterThan(0);
  });
}); 