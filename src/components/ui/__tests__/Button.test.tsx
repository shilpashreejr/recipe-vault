import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Button from '../Button';
import { Heart, Download } from 'lucide-react';

describe('Button Component', () => {
  describe('Button Variants', () => {
    test('renders primary variant by default', () => {
      render(<Button>Test Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-primary');
    });

    test('renders secondary variant', () => {
      render(<Button variant="secondary">Secondary Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-secondary');
    });

    test('renders outline variant', () => {
      render(<Button variant="outline">Outline Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('border-primary');
    });

    test('renders ghost variant', () => {
      render(<Button variant="ghost">Ghost Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('text-foreground/80');
    });

    test('renders gradient variant', () => {
      render(<Button variant="gradient">Gradient Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-gradient-to-r');
    });

    test('renders glass variant', () => {
      render(<Button variant="glass">Glass Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('glass-gradient');
    });

    test('renders destructive variant', () => {
      render(<Button variant="destructive">Destructive Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('bg-destructive');
    });
  });

  describe('Button Sizes', () => {
    test('renders small size', () => {
      render(<Button size="sm">Small Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-4', 'py-2', 'text-sm');
    });

    test('renders medium size by default', () => {
      render(<Button>Medium Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-6', 'py-3', 'text-base');
    });

    test('renders large size', () => {
      render(<Button size="lg">Large Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-8', 'py-4', 'text-lg');
    });

    test('renders extra large size', () => {
      render(<Button size="xl">Extra Large Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('px-10', 'py-5', 'text-xl');
    });
  });

  describe('Button with Icons', () => {
    test('renders button with left icon', () => {
      render(
        <Button icon={<Heart data-testid="heart-icon" />}>
          With Icon
        </Button>
      );
      expect(screen.getByTestId('heart-icon')).toBeInTheDocument();
    });

    test('renders button with right icon', () => {
      render(
        <Button icon={<Download data-testid="download-icon" />} iconPosition="right">
          With Right Icon
        </Button>
      );
      expect(screen.getByTestId('download-icon')).toBeInTheDocument();
    });

    test('icon scales on hover', () => {
      render(
        <Button icon={<Heart data-testid="heart-icon" />}>
          With Icon
        </Button>
      );
      const icon = screen.getByTestId('heart-icon');
      expect(icon.parentElement).toHaveClass('group-hover:scale-110');
    });
  });

  describe('Loading State', () => {
    test('shows loading spinner when loading is true', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button.querySelector('.animate-spin')).toBeInTheDocument();
    });

    test('hides button text when loading', () => {
      render(<Button loading>Loading Button</Button>);
      const textSpan = screen.getByText('Loading Button');
      expect(textSpan).toHaveClass('opacity-0');
    });

    test('button is disabled when loading', () => {
      render(<Button loading>Loading Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
    });
  });

  describe('Button Interactions', () => {
    test('handles click events', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Clickable Button</Button>);
      
      const button = screen.getByRole('button');
      await userEvent.click(button);
      
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('applies hover effects', () => {
      render(<Button>Hover Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('hover:scale-[1.02]');
    });

    test('applies active effects', () => {
      render(<Button>Active Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('active:scale-[0.98]');
    });

    test('applies focus effects', () => {
      render(<Button>Focus Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('focus:ring-2');
    });
  });

  describe('Accessibility', () => {
    test('forwards ref correctly', () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });

    test('applies disabled state correctly', () => {
      render(<Button disabled>Disabled Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toBeDisabled();
      expect(button).toHaveClass('disabled:opacity-50');
    });

    test('forwards additional props', () => {
      render(<Button data-testid="custom-button" aria-label="Custom button">Custom Button</Button>);
      const button = screen.getByTestId('custom-button');
      expect(button).toHaveAttribute('aria-label', 'Custom button');
    });
  });

  describe('Custom Styling', () => {
    test('applies custom className', () => {
      render(<Button className="custom-class">Custom Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class');
    });

    test('combines custom className with default styles', () => {
      render(<Button className="custom-class" variant="primary">Custom Button</Button>);
      const button = screen.getByRole('button');
      expect(button).toHaveClass('custom-class', 'bg-primary');
    });
  });
}); 