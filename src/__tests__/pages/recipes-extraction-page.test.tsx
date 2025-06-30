import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from '@jest/globals';
import RecipesExtractionPage from '../page';

// Mock the Navigation component
jest.mock('@/components/layout/Navigation', () => {
  return function MockNavigation() {
    return React.createElement('div', { 'data-testid': 'navigation' }, 'Navigation');
  };
});

describe('RecipesExtractionPage', () => {
  it('renders the page title correctly', () => {
    render(<RecipesExtractionPage />);
    
    expect(screen.getByText('AI-Powered')).toBeInTheDocument();
    expect(screen.getByText('Recipe Extraction')).toBeInTheDocument();
  });

  it('renders the page description', () => {
    render(<RecipesExtractionPage />);
    
    expect(screen.getByText(/Extract recipes from anywhere/)).toBeInTheDocument();
  });

  it('renders all extraction method cards', () => {
    render(<RecipesExtractionPage />);
    
    expect(screen.getByText('URL Extraction')).toBeInTheDocument();
    expect(screen.getByText('Image & OCR')).toBeInTheDocument();
    expect(screen.getByText('Evernote Sync')).toBeInTheDocument();
    expect(screen.getByText('Apple Notes')).toBeInTheDocument();
    expect(screen.getByText('Social Media')).toBeInTheDocument();
    expect(screen.getByText('Manual Entry')).toBeInTheDocument();
  });

  it('renders navigation component', () => {
    render(<RecipesExtractionPage />);
    
    expect(screen.getByTestId('navigation')).toBeInTheDocument();
  });

  it('renders back to home link', () => {
    render(<RecipesExtractionPage />);
    
    expect(screen.getByText('Back to Home')).toBeInTheDocument();
  });

  it('has proper links to extraction methods', () => {
    render(<RecipesExtractionPage />);
    
    // Check that the cards are wrapped in Link components
    const urlExtractionCard = screen.getByText('URL Extraction').closest('a');
    expect(urlExtractionCard).toHaveAttribute('href', '/recipes/upload');
    
    const imageCard = screen.getByText('Image & OCR').closest('a');
    expect(imageCard).toHaveAttribute('href', '/api/extract/image');
    
    const evernoteCard = screen.getByText('Evernote Sync').closest('a');
    expect(evernoteCard).toHaveAttribute('href', '/api/extract/evernote');
  });
}); 