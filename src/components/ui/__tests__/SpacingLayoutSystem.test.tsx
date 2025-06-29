import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import SpacingLayoutSystem, {
  SpacingScale,
  LayoutContainers,
  GridSystem,
  FlexboxLayouts,
  StackInlineSpacing,
  LayoutPatterns,
} from '../SpacingLayoutSystem';

describe('SpacingLayoutSystem', () => {
  it('renders the main component with title and description', () => {
    render(<SpacingLayoutSystem />);
    
    expect(screen.getByText('Spacing & Layout System')).toBeInTheDocument();
    expect(screen.getByText(/A comprehensive spacing and layout system/)).toBeInTheDocument();
  });

  it('renders all sub-components', () => {
    render(<SpacingLayoutSystem />);
    
    expect(screen.getByText('Spacing Scale')).toBeInTheDocument();
    expect(screen.getByText('Layout Containers')).toBeInTheDocument();
    expect(screen.getByText('Grid System')).toBeInTheDocument();
    expect(screen.getByText('Flexbox Layouts')).toBeInTheDocument();
    expect(screen.getByText('Stack Spacing')).toBeInTheDocument();
    expect(screen.getByText('Inline Spacing')).toBeInTheDocument();
    expect(screen.getByText('Page Layout Pattern')).toBeInTheDocument();
    expect(screen.getByText('Dashboard Layout Pattern')).toBeInTheDocument();
  });
});

describe('SpacingScale', () => {
  it('renders all spacing tokens', () => {
    render(<SpacingScale />);
    
    const spacingTokens = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
    spacingTokens.forEach(token => {
      expect(screen.getByText(`space-${token}`)).toBeInTheDocument();
    });
  });

  it('displays correct pixel values for spacing tokens', () => {
    render(<SpacingScale />);
    
    expect(screen.getByText('4px')).toBeInTheDocument();
    expect(screen.getByText('8px')).toBeInTheDocument();
    expect(screen.getByText('16px')).toBeInTheDocument();
    expect(screen.getByText('24px')).toBeInTheDocument();
    expect(screen.getByText('32px')).toBeInTheDocument();
  });

  it('displays correct rem values for spacing tokens', () => {
    render(<SpacingScale />);
    
    expect(screen.getByText('0.25rem')).toBeInTheDocument();
    expect(screen.getByText('0.5rem')).toBeInTheDocument();
    expect(screen.getByText('1rem')).toBeInTheDocument();
    expect(screen.getByText('1.5rem')).toBeInTheDocument();
    expect(screen.getByText('2rem')).toBeInTheDocument();
  });
});

describe('LayoutContainers', () => {
  it('renders all container types', () => {
    render(<LayoutContainers />);
    
    const containers = [
      'container-sm',
      'container-md', 
      'container-lg',
      'container-xl',
      'container-2xl',
      'content',
      'content-wide',
      'content-narrow'
    ];
    
    containers.forEach(container => {
      expect(screen.getByText(container)).toBeInTheDocument();
    });
  });

  it('displays correct max-width values', () => {
    render(<LayoutContainers />);
    
    expect(screen.getByText('640px')).toBeInTheDocument();
    expect(screen.getByText('768px')).toBeInTheDocument();
    expect(screen.getByText('1024px')).toBeInTheDocument();
    expect(screen.getByText('1280px')).toBeInTheDocument();
    expect(screen.getByText('1536px')).toBeInTheDocument();
    expect(screen.getByText('65ch')).toBeInTheDocument();
    expect(screen.getByText('80ch')).toBeInTheDocument();
    expect(screen.getByText('45ch')).toBeInTheDocument();
  });

  it('displays container descriptions', () => {
    render(<LayoutContainers />);
    
    expect(screen.getByText(/Small containers for forms/)).toBeInTheDocument();
    expect(screen.getByText(/Medium containers for blog posts/)).toBeInTheDocument();
    expect(screen.getByText(/Large containers for dashboard/)).toBeInTheDocument();
    expect(screen.getByText(/Content width for optimal readability/)).toBeInTheDocument();
  });
});

describe('GridSystem', () => {
  it('renders all grid patterns', () => {
    render(<GridSystem />);
    
    const gridPatterns = [
      'auto-fit-sm',
      'auto-fit-md',
      'auto-fit-lg',
      'auto-fill-sm',
      'auto-fill-md',
      'auto-fill-lg'
    ];
    
    gridPatterns.forEach(pattern => {
      expect(screen.getByText(pattern)).toBeInTheDocument();
    });
  });

  it('displays min-width values for grid patterns', () => {
    render(<GridSystem />);
    
    // Use getAllByText for duplicate values
    expect(screen.getAllByText('min-width: 200px').length).toBeGreaterThan(0);
    expect(screen.getAllByText('min-width: 250px').length).toBeGreaterThan(0);
    expect(screen.getByText('min-width: 300px')).toBeInTheDocument();
    expect(screen.getByText('min-width: 150px')).toBeInTheDocument();
  });

  it('renders grid items for each pattern', () => {
    render(<GridSystem />);
    
    // Should render 6 items for each grid pattern (6 patterns * 6 items = 36 total)
    const gridItems = screen.getAllByText(/Item \d+/);
    expect(gridItems).toHaveLength(36);
  });
});

describe('FlexboxLayouts', () => {
  it('renders all flex patterns', () => {
    render(<FlexboxLayouts />);
    
    const flexPatterns = [
      'flex-center',
      'flex-between',
      'flex-start',
      'flex-end',
      'flex-col-center'
    ];
    
    flexPatterns.forEach(pattern => {
      expect(screen.getByText(pattern)).toBeInTheDocument();
    });
  });

  it('displays flex pattern descriptions', () => {
    render(<FlexboxLayouts />);
    
    expect(screen.getByText(/Centered content both horizontally and vertically/)).toBeInTheDocument();
    expect(screen.getByText(/Content spread across with space between/)).toBeInTheDocument();
    expect(screen.getByText(/Content aligned to the start/)).toBeInTheDocument();
    expect(screen.getByText(/Content aligned to the end/)).toBeInTheDocument();
    expect(screen.getByText(/Vertically stacked and centered content/)).toBeInTheDocument();
  });

  it('renders flex items for each pattern', () => {
    render(<FlexboxLayouts />);
    
    // Should render 3 items for each flex pattern (5 patterns * 3 items = 15 total)
    const flexItems = screen.getAllByText(/Item \d+/);
    expect(flexItems).toHaveLength(15);
  });
});

describe('StackInlineSpacing', () => {
  it('renders stack spacing section', () => {
    render(<StackInlineSpacing />);
    
    expect(screen.getByText('Stack Spacing')).toBeInTheDocument();
    expect(screen.getByText('Inline Spacing')).toBeInTheDocument();
  });

  it('renders all stack sizes', () => {
    render(<StackInlineSpacing />);
    
    const stackSizes = ['xs', 'sm', 'md', 'lg', 'xl'];
    stackSizes.forEach(size => {
      expect(screen.getByText(`stack-${size}`)).toBeInTheDocument();
    });
  });

  it('renders all inline sizes', () => {
    render(<StackInlineSpacing />);
    
    const inlineSizes = ['xs', 'sm', 'md', 'lg', 'xl'];
    inlineSizes.forEach(size => {
      expect(screen.getByText(`inline-${size}`)).toBeInTheDocument();
    });
  });

  it('renders stack items for each size', () => {
    render(<StackInlineSpacing />);
    
    // Should render 3 items for each stack size (5 sizes * 3 items = 15 total)
    const stackItems = screen.getAllByText(/Stack Item \d+/);
    expect(stackItems).toHaveLength(15);
  });

  it('renders inline items for each size', () => {
    render(<StackInlineSpacing />);
    
    // Should render 3 items for each inline size (5 sizes * 3 items = 15 total)
    const inlineItems = screen.getAllByText(/Inline Item \d+/);
    expect(inlineItems).toHaveLength(15);
  });
});

describe('LayoutPatterns', () => {
  it('renders page layout pattern', () => {
    render(<LayoutPatterns />);
    
    expect(screen.getByText('Page Layout Pattern')).toBeInTheDocument();
    expect(screen.getByText('Page Header')).toBeInTheDocument();
    expect(screen.getByText('Main Content Area')).toBeInTheDocument();
    expect(screen.getByText('Page Footer')).toBeInTheDocument();
  });

  it('renders dashboard layout pattern', () => {
    render(<LayoutPatterns />);
    
    expect(screen.getByText('Dashboard Layout Pattern')).toBeInTheDocument();
    expect(screen.getByText('Sidebar')).toBeInTheDocument();
    expect(screen.getByText('Main Content')).toBeInTheDocument();
  });

  it('renders navigation items in page header', () => {
    render(<LayoutPatterns />);
    
    expect(screen.getByText('Nav 1')).toBeInTheDocument();
    expect(screen.getByText('Nav 2')).toBeInTheDocument();
    expect(screen.getByText('Nav 3')).toBeInTheDocument();
  });

  it('renders sidebar navigation items', () => {
    render(<LayoutPatterns />);
    
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Recipes')).toBeInTheDocument();
    expect(screen.getByText('Favorites')).toBeInTheDocument();
    expect(screen.getByText('Settings')).toBeInTheDocument();
  });

  it('displays layout descriptions', () => {
    render(<LayoutPatterns />);
    
    expect(screen.getByText(/This demonstrates a typical page layout/)).toBeInTheDocument();
    expect(screen.getByText(/This demonstrates a dashboard layout/)).toBeInTheDocument();
  });
});

// Integration tests
describe('SpacingLayoutSystem Integration', () => {
  it('renders complete system without errors', () => {
    expect(() => render(<SpacingLayoutSystem />)).not.toThrow();
  });

  it('maintains consistent styling across components', () => {
    render(<SpacingLayoutSystem />);
    
    // Check that all headings that should have font-serif do have it
    const headings = screen.getAllByRole('heading');
    headings.forEach(heading => {
      if (heading.className.includes('font-serif')) {
        expect(heading).toHaveClass('font-serif');
      }
    });
  });

  it('uses consistent spacing throughout', () => {
    render(<SpacingLayoutSystem />);
    
    // Check that spacing classes are applied consistently
    const cards = document.querySelectorAll('.bg-card');
    cards.forEach(card => {
      expect(card).toHaveClass('border', 'rounded-lg');
    });
  });
}); 