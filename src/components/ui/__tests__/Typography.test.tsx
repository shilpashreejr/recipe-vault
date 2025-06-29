import React from 'react';
import { render, screen } from '@testing-library/react';
import {
  H1, H2, H3, H4, H5, H6,
  P, PSmall, PLarge,
  AccentText, AccentTextSmall, AccentTextLarge,
  GradientText, MutedText, Code,
  TypographyShowcase
} from '../Typography';

describe('Typography Components', () => {
  describe('Heading Components', () => {
    test('H1 renders with correct font and styling', () => {
      render(<H1>Test Heading 1</H1>);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveTextContent('Test Heading 1');
      expect(heading).toHaveClass('font-serif');
    });

    test('H2 renders with correct font and styling', () => {
      render(<H2>Test Heading 2</H2>);
      const heading = screen.getByRole('heading', { level: 2 });
      expect(heading).toHaveTextContent('Test Heading 2');
      expect(heading).toHaveClass('font-serif');
    });

    test('H3 renders with correct font and styling', () => {
      render(<H3>Test Heading 3</H3>);
      const heading = screen.getByRole('heading', { level: 3 });
      expect(heading).toHaveTextContent('Test Heading 3');
      expect(heading).toHaveClass('font-serif');
    });

    test('H4 renders with correct font and styling', () => {
      render(<H4>Test Heading 4</H4>);
      const heading = screen.getByRole('heading', { level: 4 });
      expect(heading).toHaveTextContent('Test Heading 4');
      expect(heading).toHaveClass('font-serif');
    });

    test('H5 renders with correct font and styling', () => {
      render(<H5>Test Heading 5</H5>);
      const heading = screen.getByRole('heading', { level: 5 });
      expect(heading).toHaveTextContent('Test Heading 5');
      expect(heading).toHaveClass('font-serif');
    });

    test('H6 renders with correct font and styling', () => {
      render(<H6>Test Heading 6</H6>);
      const heading = screen.getByRole('heading', { level: 6 });
      expect(heading).toHaveTextContent('Test Heading 6');
      expect(heading).toHaveClass('font-serif');
    });
  });

  describe('Body Text Components', () => {
    test('P renders with correct font and styling', () => {
      render(<P>Test paragraph text</P>);
      const paragraph = screen.getByText('Test paragraph text');
      expect(paragraph).toHaveClass('font-sans');
    });

    test('PSmall renders with correct font and styling', () => {
      render(<PSmall>Test small paragraph text</PSmall>);
      const paragraph = screen.getByText('Test small paragraph text');
      expect(paragraph).toHaveClass('font-sans');
    });

    test('PLarge renders with correct font and styling', () => {
      render(<PLarge>Test large paragraph text</PLarge>);
      const paragraph = screen.getByText('Test large paragraph text');
      expect(paragraph).toHaveClass('font-sans');
    });
  });

  describe('Accent Text Components', () => {
    test('AccentText renders with correct font and styling', () => {
      render(<AccentText>Test accent text</AccentText>);
      const accent = screen.getByText('Test accent text');
      expect(accent).toHaveClass('font-accent');
    });

    test('AccentTextSmall renders with correct font and styling', () => {
      render(<AccentTextSmall>Test small accent text</AccentTextSmall>);
      const accent = screen.getByText('Test small accent text');
      expect(accent).toHaveClass('font-accent');
    });

    test('AccentTextLarge renders with correct font and styling', () => {
      render(<AccentTextLarge>Test large accent text</AccentTextLarge>);
      const accent = screen.getByText('Test large accent text');
      expect(accent).toHaveClass('font-accent');
    });
  });

  describe('Special Text Components', () => {
    test('GradientText renders with correct styling', () => {
      render(<GradientText>Test gradient text</GradientText>);
      const gradient = screen.getByText('Test gradient text');
      expect(gradient).toHaveClass('gradient-text', 'font-serif', 'font-bold');
    });

    test('MutedText renders with correct styling', () => {
      render(<MutedText>Test muted text</MutedText>);
      const muted = screen.getByText('Test muted text');
      expect(muted).toHaveClass('font-sans', 'text-muted-foreground');
    });

    test('Code renders with correct styling', () => {
      render(<Code>test code</Code>);
      const code = screen.getByText('test code');
      expect(code).toHaveClass('font-mono');
    });
  });

  describe('TypographyShowcase Component', () => {
    test('renders all typography examples', () => {
      render(<TypographyShowcase />);
      
      // Check for main headings
      expect(screen.getByText('RecipeVault Typography System')).toBeInTheDocument();
      expect(screen.getByText('Elegant Font Hierarchy')).toBeInTheDocument();
      expect(screen.getByText('Three Distinct Font Families')).toBeInTheDocument();
      
      // Check for body text examples
      expect(screen.getByText(/This is large body text using Inter font/)).toBeInTheDocument();
      expect(screen.getByText(/This is standard body text using Inter font/)).toBeInTheDocument();
      expect(screen.getByText(/This is small body text using Inter font/)).toBeInTheDocument();
      
      // Check for accent text examples
      expect(screen.getByText('Large accent text using Poppins font')).toBeInTheDocument();
      expect(screen.getByText('Standard accent text using Poppins font')).toBeInTheDocument();
      expect(screen.getByText('Small accent text using Poppins font')).toBeInTheDocument();
      
      // Check for special text examples
      expect(screen.getByText('Gradient text with Playfair Display')).toBeInTheDocument();
      expect(screen.getByText('Muted text for secondary information')).toBeInTheDocument();
      expect(screen.getByText('Code text with monospace font')).toBeInTheDocument();
      
      // Check for font family examples
      expect(screen.getByText(/font-sans \(Inter\) - Clean, modern sans-serif/)).toBeInTheDocument();
      expect(screen.getByText(/font-serif \(Playfair Display\) - Elegant serif/)).toBeInTheDocument();
      expect(screen.getByText(/font-accent \(Poppins\) - Modern accent font/)).toBeInTheDocument();
      expect(screen.getByText(/font-mono - Monospace for code/)).toBeInTheDocument();
    });
  });

  describe('Custom className prop', () => {
    test('applies custom className to H1', () => {
      render(<H1 className="custom-class">Test</H1>);
      const heading = screen.getByRole('heading', { level: 1 });
      expect(heading).toHaveClass('custom-class');
    });

    test('applies custom className to P', () => {
      render(<P className="custom-class">Test</P>);
      const paragraph = screen.getByText('Test');
      expect(paragraph).toHaveClass('custom-class');
    });

    test('applies custom className to AccentText', () => {
      render(<AccentText className="custom-class">Test</AccentText>);
      const accent = screen.getByText('Test');
      expect(accent).toHaveClass('custom-class');
    });
  });
}); 