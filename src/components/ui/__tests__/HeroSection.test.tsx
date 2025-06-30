import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { motion } from 'framer-motion';
import HeroSection, { 
  AnimatedCTAButton, 
  GradientText, 
  AnimatedFeatureIcon 
} from '../HeroSection';
import { ChefHat, ArrowRight, Zap, BookOpen, Camera, ShoppingCart } from 'lucide-react';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
    button: ({ children, ...props }: any) => <button {...props}>{children}</button>,
  },
  useScroll: () => ({ scrollY: { get: () => 0 } }),
  useTransform: () => 0,
  AnimatePresence: ({ children }: any) => <div>{children}</div>,
}));

// Mock next/link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

describe('HeroSection', () => {
  beforeEach(() => {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      })),
    });
  });

  describe('HeroSection Component', () => {
    it('renders the main hero section', () => {
      render(<HeroSection />);
      
      expect(screen.getByText('Your Complete')).toBeInTheDocument();
      expect(screen.getByText('Food Management')).toBeInTheDocument();
      expect(screen.getByText('Ecosystem')).toBeInTheDocument();
    });

    it('renders the subtitle text', () => {
      render(<HeroSection />);
      
      expect(screen.getByText(/AI-powered recipe extraction from anywhere/)).toBeInTheDocument();
    });

    it('renders CTA buttons', () => {
      render(<HeroSection />);
      
      expect(screen.getByText('Start Extracting Recipes')).toBeInTheDocument();
      expect(screen.getByText('Create Meal Plan')).toBeInTheDocument();
    });

    it('renders feature highlights', () => {
      render(<HeroSection />);
      
      expect(screen.getByText('AI-Powered Extraction')).toBeInTheDocument();
      expect(screen.getByText('Intelligent Meal Planning')).toBeInTheDocument();
      expect(screen.getByText('Photo-Based Tracking')).toBeInTheDocument();
      expect(screen.getByText('Smart Inventory & Shopping')).toBeInTheDocument();
    });

    it('renders feature descriptions', () => {
      render(<HeroSection />);
      
      expect(screen.getByText('From URLs, social media, images & notes')).toBeInTheDocument();
      expect(screen.getByText('Personalized with smart repetition')).toBeInTheDocument();
      expect(screen.getByText('AI food recognition & macro analysis')).toBeInTheDocument();
      expect(screen.getByText('AI-powered analysis & auto-lists')).toBeInTheDocument();
    });

    it('applies custom className prop', () => {
      const { container } = render(<HeroSection className="custom-class" />);
      
      expect(container.firstChild).toHaveClass('custom-class');
    });
  });

  describe('AnimatedCTAButton Component', () => {
    const defaultProps = {
      children: 'Test Button',
      onClick: jest.fn()
    };

    it('renders button with text', () => {
      render(<AnimatedCTAButton {...defaultProps} />);
      
      expect(screen.getByText('Test Button')).toBeInTheDocument();
    });

    it('renders button with icon', () => {
      render(
        <AnimatedCTAButton {...defaultProps} icon={<Zap data-testid="zap-icon" />} />
      );
      
      expect(screen.getByTestId('zap-icon')).toBeInTheDocument();
    });

    it('applies primary variant styles', () => {
      const { container } = render(<AnimatedCTAButton {...defaultProps} variant="primary" />);
      
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-gradient-to-r', 'from-primary', 'via-primary/90', 'to-primary');
    });

    it('applies secondary variant styles', () => {
      const { container } = render(<AnimatedCTAButton {...defaultProps} variant="secondary" />);
      
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-gradient-to-r', 'from-secondary', 'via-secondary/90', 'to-secondary');
    });

    it('applies accent variant styles', () => {
      const { container } = render(<AnimatedCTAButton {...defaultProps} variant="accent" />);
      
      const button = container.querySelector('button');
      expect(button).toHaveClass('bg-gradient-to-r', 'from-accent', 'via-accent/90', 'to-accent');
    });

    it('applies custom className', () => {
      const { container } = render(<AnimatedCTAButton {...defaultProps} className="custom-class" />);
      
      const button = container.querySelector('button');
      expect(button).toHaveClass('custom-class');
    });

    it('calls onClick when clicked', () => {
      const onClick = jest.fn();
      render(<AnimatedCTAButton {...defaultProps} onClick={onClick} />);
      
      fireEvent.click(screen.getByText('Test Button'));
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it('renders arrow icon', () => {
      render(<AnimatedCTAButton {...defaultProps} />);
      
      const arrowIcon = document.querySelector('svg');
      expect(arrowIcon).toBeInTheDocument();
    });
  });

  describe('GradientText Component', () => {
    const defaultProps = {
      children: 'Gradient Text'
    };

    it('renders text content', () => {
      render(<GradientText {...defaultProps} />);
      
      expect(screen.getByText('Gradient Text')).toBeInTheDocument();
    });

    it('applies hero variant by default', () => {
      const { container } = render(<GradientText {...defaultProps} />);
      
      const span = container.querySelector('span');
      expect(span).toHaveClass('bg-gradient-to-r', 'from-primary', 'via-accent', 'to-secondary');
    });

    it('applies primary variant styles', () => {
      const { container } = render(<GradientText {...defaultProps} variant="primary" />);
      
      const span = container.querySelector('span');
      expect(span).toHaveClass('bg-gradient-to-r', 'from-primary', 'via-primary/80', 'to-primary');
    });

    it('applies secondary variant styles', () => {
      const { container } = render(<GradientText {...defaultProps} variant="secondary" />);
      
      const span = container.querySelector('span');
      expect(span).toHaveClass('bg-gradient-to-r', 'from-secondary', 'via-secondary/80', 'to-secondary');
    });

    it('applies accent variant styles', () => {
      const { container } = render(<GradientText {...defaultProps} variant="accent" />);
      
      const span = container.querySelector('span');
      expect(span).toHaveClass('bg-gradient-to-r', 'from-accent', 'via-accent/80', 'to-accent');
    });

    it('applies custom className', () => {
      const { container } = render(<GradientText {...defaultProps} className="custom-class" />);
      
      const span = container.querySelector('span');
      expect(span).toHaveClass('custom-class');
    });
  });

  describe('AnimatedFeatureIcon Component', () => {
    const defaultProps = {
      icon: <Zap data-testid="test-icon" />,
      gradient: 'from-blue-500 via-purple-600 to-indigo-700',
      delay: 0.1
    };

    it('renders icon', () => {
      render(<AnimatedFeatureIcon {...defaultProps} />);
      
      expect(screen.getByTestId('test-icon')).toBeInTheDocument();
    });

    it('applies gradient classes', () => {
      const { container } = render(<AnimatedFeatureIcon {...defaultProps} />);
      
      const div = container.querySelector('div');
      expect(div).toHaveClass('from-blue-500', 'via-purple-600', 'to-indigo-700');
    });

    it('applies correct sizing classes', () => {
      const { container } = render(<AnimatedFeatureIcon {...defaultProps} />);
      
      const div = container.querySelector('div');
      expect(div).toHaveClass('w-20', 'h-20');
    });

    it('applies rounded corners', () => {
      const { container } = render(<AnimatedFeatureIcon {...defaultProps} />);
      
      const div = container.querySelector('div');
      expect(div).toHaveClass('rounded-2xl');
    });

    it('applies shadow', () => {
      const { container } = render(<AnimatedFeatureIcon {...defaultProps} />);
      
      const div = container.querySelector('div');
      expect(div).toHaveClass('shadow-lg');
    });

    it('applies flex layout', () => {
      const { container } = render(<AnimatedFeatureIcon {...defaultProps} />);
      
      const div = container.querySelector('div');
      expect(div).toHaveClass('flex', 'items-center', 'justify-center');
    });

    it('applies margin bottom', () => {
      const { container } = render(<AnimatedFeatureIcon {...defaultProps} />);
      
      const div = container.querySelector('div');
      expect(div).toHaveClass('mb-6');
    });

    it('applies margin auto for horizontal centering', () => {
      const { container } = render(<AnimatedFeatureIcon {...defaultProps} />);
      
      const div = container.querySelector('div');
      expect(div).toHaveClass('mx-auto');
    });

    it('renders icon with white text color', () => {
      const { container } = render(<AnimatedFeatureIcon {...defaultProps} />);
      
      const iconContainer = container.querySelector('.text-white');
      expect(iconContainer).toBeInTheDocument();
    });

    it('applies text size to icon container', () => {
      const { container } = render(<AnimatedFeatureIcon {...defaultProps} />);
      
      const iconContainer = container.querySelector('.text-2xl');
      expect(iconContainer).toBeInTheDocument();
    });
  });
}); 