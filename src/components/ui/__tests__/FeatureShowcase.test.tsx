import React from 'react';
import { render, screen } from '@testing-library/react';
import FeatureShowcase from '../FeatureShowcase';

// Mock framer-motion to avoid animation-related issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, variants, initial, animate, whileInView, viewport, ...props }: any) => (
      <div className={className} data-testid="motion-div" {...props}>
        {children}
      </div>
    ),
  },
}));

// Mock AnimatedIcon component
jest.mock('../AnimatedIcon', () => {
  return function MockAnimatedIcon({ children, delay, rotation, bgGradient }: any) {
    return (
      <div 
        data-testid="animated-icon" 
        data-delay={delay} 
        data-rotation={rotation} 
        data-bg-gradient={bgGradient}
      >
        {children}
      </div>
    );
  };
});

describe('FeatureShowcase', () => {
  test('renders the main heading', () => {
    render(<FeatureShowcase />);
    
    const heading = screen.getByText('AI-Powered Recipe Extraction');
    expect(heading).toBeInTheDocument();
  });

  test('renders the description text', () => {
    render(<FeatureShowcase />);
    
    const description = screen.getByText(/Our advanced AI technology extracts recipes/);
    expect(description).toBeInTheDocument();
  });

  test('renders all four feature cards', () => {
    render(<FeatureShowcase />);
    
    expect(screen.getByText('Social Media')).toBeInTheDocument();
    expect(screen.getByText('Notes Apps')).toBeInTheDocument();
    expect(screen.getByText('Web & Blogs')).toBeInTheDocument();
    expect(screen.getByText('Images & OCR')).toBeInTheDocument();
  });

  test('renders feature descriptions', () => {
    render(<FeatureShowcase />);
    
    expect(screen.getByText('Instagram, TikTok, Pinterest, Facebook, Twitter, YouTube')).toBeInTheDocument();
    expect(screen.getByText('Evernote, Apple Notes, and more')).toBeInTheDocument();
    expect(screen.getByText('Any recipe website or food blog')).toBeInTheDocument();
    expect(screen.getByText('Screenshots, photos, handwritten notes')).toBeInTheDocument();
  });

  test('renders feature lists for each card', () => {
    render(<FeatureShowcase />);
    
    // Check for specific feature items
    expect(screen.getByText('Instagram Reels & Posts')).toBeInTheDocument();
    expect(screen.getByText('Evernote API Integration')).toBeInTheDocument();
    expect(screen.getByText('Food Blog URLs')).toBeInTheDocument();
    expect(screen.getByText('Photo Screenshots')).toBeInTheDocument();
  });

  test('renders animated icons for each feature', () => {
    render(<FeatureShowcase />);
    
    const animatedIcons = screen.getAllByTestId('animated-icon');
    expect(animatedIcons.length).toBe(4);
  });

  test('applies correct background gradients to icons', () => {
    render(<FeatureShowcase />);
    
    const animatedIcons = screen.getAllByTestId('animated-icon');
    
    // Check that each icon has the correct gradient
    expect(animatedIcons[0]).toHaveAttribute('data-bg-gradient', 'from-pink-500 to-purple-600');
    expect(animatedIcons[1]).toHaveAttribute('data-bg-gradient', 'from-green-500 to-emerald-600');
    expect(animatedIcons[2]).toHaveAttribute('data-bg-gradient', 'from-blue-500 to-indigo-600');
    expect(animatedIcons[3]).toHaveAttribute('data-bg-gradient', 'from-orange-500 to-red-600');
  });

  test('applies correct delays to icons', () => {
    render(<FeatureShowcase />);
    
    const animatedIcons = screen.getAllByTestId('animated-icon');
    
    expect(animatedIcons[0]).toHaveAttribute('data-delay', '0.1');
    expect(animatedIcons[1]).toHaveAttribute('data-delay', '0.2');
    expect(animatedIcons[2]).toHaveAttribute('data-delay', '0.3');
    expect(animatedIcons[3]).toHaveAttribute('data-delay', '0.4');
  });

  test('applies correct rotations to icons', () => {
    render(<FeatureShowcase />);
    
    const animatedIcons = screen.getAllByTestId('animated-icon');
    
    expect(animatedIcons[0]).toHaveAttribute('data-rotation', '5');
    expect(animatedIcons[1]).toHaveAttribute('data-rotation', '-3');
    expect(animatedIcons[2]).toHaveAttribute('data-rotation', '8');
    expect(animatedIcons[3]).toHaveAttribute('data-rotation', '-5');
  });

  test('renders section with correct structure', () => {
    render(<FeatureShowcase />);
    
    const section = screen.getByText('AI-Powered Recipe Extraction').closest('section');
    expect(section).toBeInTheDocument();
  });

  test('renders all feature bullet points', () => {
    render(<FeatureShowcase />);
    
    const bulletPoints = screen.getAllByText(/•/);
    expect(bulletPoints.length).toBeGreaterThan(0);
  });
}); 