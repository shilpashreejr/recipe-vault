import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import '@testing-library/jest-dom';
import HeroSection from '../HeroSection';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: any) => <span {...props}>{children}</span>,
  },
  AnimatePresence: ({ children }: any) => <div data-testid="animate-presence">{children}</div>,
}));

// Mock Next.js Link
jest.mock('next/link', () => {
  return ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  );
});

describe('HeroSection', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('renders the hero section with main headline', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('Your Complete')).toBeInTheDocument();
    expect(screen.getByText('Food Management')).toBeInTheDocument();
    expect(screen.getByText('Ecosystem')).toBeInTheDocument();
  });

  it('renders the subtitle with correct text', () => {
    render(<HeroSection />);
    
    const subtitle = screen.getByText(/AI-powered recipe extraction from anywhere/);
    expect(subtitle).toBeInTheDocument();
  });

  it('renders CTA buttons with correct links', () => {
    render(<HeroSection />);
    
    const extractButton = screen.getByRole('link', { name: /Start Extracting Recipes/ });
    const mealPlanButton = screen.getByRole('link', { name: /Create Meal Plan/ });
    
    expect(extractButton).toHaveAttribute('href', '/recipes/upload');
    expect(mealPlanButton).toHaveAttribute('href', '/meal-plans');
  });

  it('renders all feature highlights', () => {
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

  it('renders animated action words section', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('We help you')).toBeInTheDocument();
    expect(screen.getByText('recipes')).toBeInTheDocument();
  });

  it('cycles through action words', async () => {
    render(<HeroSection />);
    
    // Initially should show "Extract"
    expect(screen.getByText('Extract')).toBeInTheDocument();
    
    // Fast-forward time to trigger word change
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Organize')).toBeInTheDocument();
    });
  });

  it('renders scroll indicator', () => {
    render(<HeroSection />);
    
    const scrollIndicator = document.querySelector('.absolute.bottom-8');
    expect(scrollIndicator).toBeInTheDocument();
  });

  it('applies correct CSS classes for styling', () => {
    render(<HeroSection />);
    
    const heroSection = document.querySelector('section');
    expect(heroSection).toHaveClass('relative', 'min-h-screen', 'flex', 'items-center', 'justify-center', 'overflow-hidden', 'pt-24');
  });

  it('renders background elements', () => {
    render(<HeroSection />);
    
    // Check for background gradient
    const backgroundElements = document.querySelectorAll('.absolute.inset-0');
    expect(backgroundElements.length).toBeGreaterThan(0);
  });

  it('renders floating animated elements', () => {
    render(<HeroSection />);
    
    // Check for floating elements with blur effects
    const floatingElements = document.querySelectorAll('.blur-3xl, .blur-2xl');
    expect(floatingElements.length).toBeGreaterThan(0);
  });

  it('renders pattern overlay', () => {
    render(<HeroSection />);
    
    const patternOverlay = document.querySelector('.opacity-5');
    expect(patternOverlay).toBeInTheDocument();
  });

  it('applies gradient text effects to headline', () => {
    render(<HeroSection />);
    
    const gradientTexts = document.querySelectorAll('.gradient-text');
    expect(gradientTexts.length).toBeGreaterThan(0);
  });

  it('renders feature icons', () => {
    render(<HeroSection />);
    
    expect(screen.getByText('⚡')).toBeInTheDocument();
    expect(screen.getByText('🧠')).toBeInTheDocument();
    expect(screen.getByText('📸')).toBeInTheDocument();
    expect(screen.getByText('🛒')).toBeInTheDocument();
  });

  it('applies glass effect to feature cards', () => {
    render(<HeroSection />);
    
    const glassCards = document.querySelectorAll('.glass');
    expect(glassCards.length).toBeGreaterThan(0);
  });

  it('renders with proper accessibility attributes', () => {
    render(<HeroSection />);
    
    // Check that buttons have proper roles
    const buttons = screen.getAllByRole('link');
    expect(buttons.length).toBeGreaterThan(0);
    
    // Check that headings are properly structured
    const mainHeading = screen.getByRole('heading', { level: 1 });
    expect(mainHeading).toBeInTheDocument();
  });

  it('handles component unmounting gracefully', () => {
    const { unmount } = render(<HeroSection />);
    
    // Should not throw any errors when unmounting
    expect(() => unmount()).not.toThrow();
  });

  it('renders with responsive design classes', () => {
    render(<HeroSection />);
    
    const responsiveElements = document.querySelectorAll('.sm\\:text-6xl, .lg\\:text-7xl, .xl\\:text-8xl');
    expect(responsiveElements.length).toBeGreaterThan(0);
  });

  it('applies hover effects to interactive elements', () => {
    render(<HeroSection />);
    
    const hoverElements = document.querySelectorAll('.hover\\:scale-105, .hover\\:bg-white\\/10');
    expect(hoverElements.length).toBeGreaterThan(0);
  });
}); 