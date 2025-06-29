import React from 'react';
import { render, screen } from '@testing-library/react';
import AnimatedIcon from '../AnimatedIcon';

// Mock framer-motion to avoid animation-related issues in tests
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, className, ...props }: any) => (
      <div className={className} data-testid="animated-icon" {...props}>
        {children}
      </div>
    ),
  },
}));

describe('AnimatedIcon', () => {
  const defaultProps = {
    children: <span data-testid="icon-content">Test Icon</span>,
  };

  test('renders with default props', () => {
    render(<AnimatedIcon {...defaultProps} />);
    
    const animatedIcons = screen.getAllByTestId('animated-icon');
    const iconContent = screen.getByTestId('icon-content');
    
    expect(animatedIcons.length).toBeGreaterThan(0);
    expect(iconContent).toBeInTheDocument();
    expect(animatedIcons[0]).toHaveClass('w-16', 'h-16', 'bg-gradient-to-br', 'from-blue-500', 'to-indigo-600', 'rounded-xl', 'flex', 'items-center', 'justify-center');
  });

  test('applies custom className', () => {
    const customClass = 'custom-class';
    render(<AnimatedIcon {...defaultProps} className={customClass} />);
    
    const animatedIcons = screen.getAllByTestId('animated-icon');
    expect(animatedIcons[0]).toHaveClass(customClass);
  });

  test('applies custom background gradient', () => {
    const customGradient = 'from-red-500 to-pink-600';
    render(<AnimatedIcon {...defaultProps} bgGradient={customGradient} />);
    
    const animatedIcons = screen.getAllByTestId('animated-icon');
    expect(animatedIcons[0]).toHaveClass('from-red-500', 'to-pink-600');
    expect(animatedIcons[0]).not.toHaveClass('from-blue-500', 'to-indigo-600');
  });

  test('renders children correctly', () => {
    const customChildren = (
      <svg data-testid="custom-svg" className="w-8 h-8 text-white">
        <path d="M10 10h4v4h-4z" />
      </svg>
    );
    
    render(<AnimatedIcon>{customChildren}</AnimatedIcon>);
    
    const customSvg = screen.getByTestId('custom-svg');
    expect(customSvg).toBeInTheDocument();
    expect(customSvg).toHaveClass('w-8', 'h-8', 'text-white');
  });

  test('handles empty children gracefully', () => {
    render(<AnimatedIcon>{null}</AnimatedIcon>);
    
    const animatedIcons = screen.getAllByTestId('animated-icon');
    expect(animatedIcons.length).toBeGreaterThan(0);
    expect(animatedIcons[0]).toBeInTheDocument();
  });

  test('applies all default classes correctly', () => {
    render(<AnimatedIcon {...defaultProps} />);
    
    const animatedIcons = screen.getAllByTestId('animated-icon');
    const expectedClasses = [
      'w-16', 'h-16', 'bg-gradient-to-br', 'from-blue-500', 'to-indigo-600',
      'rounded-xl', 'flex', 'items-center', 'justify-center'
    ];
    
    expectedClasses.forEach(className => {
      expect(animatedIcons[0]).toHaveClass(className);
    });
  });

  test('combines custom and default classes', () => {
    const customClass = 'custom-class';
    render(<AnimatedIcon {...defaultProps} className={customClass} />);
    
    const animatedIcons = screen.getAllByTestId('animated-icon');
    expect(animatedIcons[0]).toHaveClass('w-16', 'h-16', 'custom-class');
  });
}); 