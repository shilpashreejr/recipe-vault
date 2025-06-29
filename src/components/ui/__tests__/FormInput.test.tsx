import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FormInput from '../FormInput';
import { User, Mail } from 'lucide-react';

describe('FormInput Component', () => {
  describe('Basic Rendering', () => {
    test('renders input with label', () => {
      render(<FormInput label="Test Input" />);
      expect(screen.getByText('Test Input')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toBeInTheDocument();
    });

    test('renders with placeholder', () => {
      render(<FormInput label="Test Input" placeholder="Enter text" />);
      expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
    });

    test('forwards ref correctly', () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<FormInput ref={ref} label="Test Input" />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe('Input Variants', () => {
    test('renders default variant', () => {
      render(<FormInput label="Default Input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-input', 'bg-background');
    });

    test('renders filled variant', () => {
      render(<FormInput label="Filled Input" variant="filled" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('bg-muted/50');
    });

    test('renders outlined variant', () => {
      render(<FormInput label="Outlined Input" variant="outlined" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('bg-transparent');
    });
  });

  describe('Input Sizes', () => {
    test('renders small size', () => {
      render(<FormInput label="Small Input" size="sm" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-3', 'py-2', 'text-sm');
    });

    test('renders medium size by default', () => {
      render(<FormInput label="Medium Input" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-4', 'py-3', 'text-base');
    });

    test('renders large size', () => {
      render(<FormInput label="Large Input" size="lg" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('px-5', 'py-4', 'text-lg');
    });
  });

  describe('Floating Label', () => {
    test('label floats when input is focused', async () => {
      render(<FormInput label="Test Label" />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Label');
      
      await userEvent.click(input);
      
      expect(label).toHaveClass('top-0', '-translate-y-1/2', 'text-primary');
    });

    test('label floats when input has value', async () => {
      render(<FormInput label="Test Label" />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Label');
      
      await userEvent.type(input, 'test value');
      
      expect(label).toHaveClass('top-0', '-translate-y-1/2', 'text-primary');
    });

    test('label returns to original position when input is empty and not focused', async () => {
      render(<FormInput label="Test Label" />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Label');
      
      await userEvent.click(input);
      await userEvent.tab();
      
      expect(label).toHaveClass('top-1/2', '-translate-y-1/2', 'text-muted-foreground');
    });
  });

  describe('Icons', () => {
    test('renders left icon', () => {
      render(<FormInput label="Input with Icon" icon={<User data-testid="user-icon" />} />);
      expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    });

    test('adjusts padding when icon is present', () => {
      render(<FormInput label="Input with Icon" icon={<User />} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('pl-12');
    });
  });

  describe('Password Input', () => {
    test('renders password toggle button', () => {
      render(<FormInput label="Password" type="password" />);
      expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('toggles password visibility', async () => {
      render(<FormInput label="Password" type="password" />);
      const input = screen.getByDisplayValue('');
      const toggleButton = screen.getByRole('button');
      
      expect(input).toHaveAttribute('type', 'password');
      
      await userEvent.click(toggleButton);
      expect(input).toHaveAttribute('type', 'text');
      
      await userEvent.click(toggleButton);
      expect(input).toHaveAttribute('type', 'password');
    });
  });

  describe('Error States', () => {
    test('renders error message', () => {
      render(<FormInput label="Test Input" error="This field is required" />);
      expect(screen.getByText('This field is required')).toBeInTheDocument();
      expect(screen.getByText('This field is required')).toHaveClass('text-destructive');
    });

    test('applies error styling to input', () => {
      render(<FormInput label="Test Input" error="Error message" />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-destructive');
    });

    test('shows error icon', () => {
      render(<FormInput label="Test Input" error="Error message" />);
      // The AlertCircle icon should be present
      expect(screen.getByRole('textbox').parentElement?.querySelector('.text-destructive')).toBeInTheDocument();
    });
  });

  describe('Success States', () => {
    test('renders success styling', () => {
      render(<FormInput label="Test Input" success={true} />);
      const input = screen.getByRole('textbox');
      expect(input).toHaveClass('border-green-500');
    });

    test('shows success icon', () => {
      render(<FormInput label="Test Input" success={true} />);
      // The CheckCircle icon should be present
      expect(screen.getByRole('textbox').parentElement?.querySelector('.text-green-500')).toBeInTheDocument();
    });
  });

  describe('Helper Text', () => {
    test('renders helper text', () => {
      render(<FormInput label="Test Input" helperText="This is helper text" />);
      expect(screen.getByText('This is helper text')).toBeInTheDocument();
      expect(screen.getByText('This is helper text')).toHaveClass('text-muted-foreground');
    });

    test('error message overrides helper text', () => {
      render(
        <FormInput 
          label="Test Input" 
          helperText="Helper text" 
          error="Error message" 
        />
      );
      expect(screen.getByText('Error message')).toBeInTheDocument();
      expect(screen.queryByText('Helper text')).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    test('handles input changes', async () => {
      const handleChange = jest.fn();
      render(<FormInput label="Test Input" onChange={handleChange} />);
      
      const input = screen.getByRole('textbox');
      await userEvent.type(input, 'test');
      
      expect(handleChange).toHaveBeenCalled();
      expect(input).toHaveValue('test');
    });

    test('handles focus and blur events', async () => {
      const handleFocus = jest.fn();
      const handleBlur = jest.fn();
      
      render(
        <FormInput 
          label="Test Input" 
          onFocus={handleFocus}
          onBlur={handleBlur}
        />
      );
      
      const input = screen.getByRole('textbox');
      
      await userEvent.click(input);
      expect(handleFocus).toHaveBeenCalled();
      
      await userEvent.tab();
      expect(handleBlur).toHaveBeenCalled();
    });

    test('applies focus styling', async () => {
      render(<FormInput label="Test Input" />);
      const input = screen.getByRole('textbox');
      
      await userEvent.click(input);
      expect(input).toHaveClass('focus:border-primary', 'focus:ring-2');
    });
  });

  describe('Accessibility', () => {
    test('associates label with input', () => {
      render(<FormInput label="Test Input" id="test-input" />);
      const input = screen.getByRole('textbox');
      const label = screen.getByText('Test Input');
      
      expect(input).toHaveAttribute('id', 'test-input');
      expect(label).toHaveAttribute('for', 'test-input');
    });

    test('forwards additional props', () => {
      render(
        <FormInput 
          label="Test Input" 
          data-testid="custom-input"
          aria-label="Custom input"
        />
      );
      const input = screen.getByTestId('custom-input');
      expect(input).toHaveAttribute('aria-label', 'Custom input');
    });
  });
}); 