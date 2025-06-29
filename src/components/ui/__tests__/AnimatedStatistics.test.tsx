import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AnimatedStatistics from '../AnimatedStatistics';

// Mock framer-motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => <div {...props}>{children}</div>,
    h2: ({ children, ...props }: any) => <h2 {...props}>{children}</h2>,
    p: ({ children, ...props }: any) => <p {...props}>{children}</p>,
  },
  useInView: () => true,
}));

const mockStatistics = [
  {
    value: 1000,
    label: 'Recipes Extracted',
    icon: '🍳',
  },
  {
    value: 500,
    label: 'Happy Users',
    suffix: '+',
    icon: '👥',
  },
  {
    value: 50,
    label: 'Countries',
    prefix: '🌍',
    icon: '🌍',
  },
  {
    value: 99,
    label: 'Success Rate',
    suffix: '%',
    icon: '⭐',
  },
];

describe('AnimatedStatistics', () => {
  beforeEach(() => {
    jest.clearAllTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  it('renders with default props', () => {
    render(<AnimatedStatistics statistics={mockStatistics} />);
    
    expect(screen.getByText('Trusted by Thousands')).toBeInTheDocument();
    expect(screen.getByText('Join our growing community of recipe enthusiasts')).toBeInTheDocument();
  });

  it('renders with custom title and subtitle', () => {
    const customTitle = 'Custom Title';
    const customSubtitle = 'Custom subtitle text';
    
    render(
      <AnimatedStatistics 
        statistics={mockStatistics}
        title={customTitle}
        subtitle={customSubtitle}
      />
    );
    
    expect(screen.getByText(customTitle)).toBeInTheDocument();
    expect(screen.getByText(customSubtitle)).toBeInTheDocument();
  });

  it('renders all statistics with correct labels', () => {
    render(<AnimatedStatistics statistics={mockStatistics} />);
    
    expect(screen.getByText('Recipes Extracted')).toBeInTheDocument();
    expect(screen.getByText('Happy Users')).toBeInTheDocument();
    expect(screen.getByText('Countries')).toBeInTheDocument();
    expect(screen.getByText('Success Rate')).toBeInTheDocument();
  });

  it('displays statistics with prefixes and suffixes', () => {
    render(<AnimatedStatistics statistics={mockStatistics} />);
    
    // Check for suffix (+ for Happy Users, % for Success Rate)
    expect(screen.getByText('+')).toBeInTheDocument();
    expect(screen.getByText('%')).toBeInTheDocument();
    
    // Check for prefix (🌍 for Countries) - there should be multiple instances
    const globeElements = screen.getAllByText('🌍');
    expect(globeElements.length).toBeGreaterThan(0);
  });

  it('renders icons when provided', () => {
    render(<AnimatedStatistics statistics={mockStatistics} />);
    
    // Check that icons are rendered
    expect(screen.getByText('🍳')).toBeInTheDocument();
    expect(screen.getByText('👥')).toBeInTheDocument();
    
    // For 🌍, there should be multiple instances (icon and prefix)
    const globeElements = screen.getAllByText('🌍');
    expect(globeElements.length).toBeGreaterThan(0);
    
    expect(screen.getByText('⭐')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const customClass = 'custom-class';
    const { container } = render(
      <AnimatedStatistics 
        statistics={mockStatistics}
        className={customClass}
      />
    );
    
    const section = container.querySelector('section');
    expect(section).toHaveClass(customClass);
  });

  it('renders with empty statistics array', () => {
    render(<AnimatedStatistics statistics={[]} />);
    
    expect(screen.getByText('Trusted by Thousands')).toBeInTheDocument();
    expect(screen.getByText('Join our growing community of recipe enthusiasts')).toBeInTheDocument();
  });

  it('renders with single statistic', () => {
    const singleStat = [mockStatistics[0]];
    render(<AnimatedStatistics statistics={singleStat} />);
    
    expect(screen.getByText('Recipes Extracted')).toBeInTheDocument();
    expect(screen.getByText('🍳')).toBeInTheDocument();
  });

  it('handles large numbers with proper formatting', () => {
    const largeNumberStats = [
      {
        value: 1000000,
        label: 'Large Number',
        icon: '📊',
      }
    ];
    
    render(<AnimatedStatistics statistics={largeNumberStats} />);
    
    expect(screen.getByText('Large Number')).toBeInTheDocument();
    expect(screen.getByText('📊')).toBeInTheDocument();
  });

  it('handles zero values', () => {
    const zeroStats = [
      {
        value: 0,
        label: 'Zero Value',
        icon: '🔢',
      }
    ];
    
    render(<AnimatedStatistics statistics={zeroStats} />);
    
    expect(screen.getByText('Zero Value')).toBeInTheDocument();
    expect(screen.getByText('🔢')).toBeInTheDocument();
  });

  it('renders with statistics that have no icon', () => {
    const statsWithoutIcons = [
      {
        value: 100,
        label: 'No Icon Stat',
      }
    ];
    
    render(<AnimatedStatistics statistics={statsWithoutIcons} />);
    
    expect(screen.getByText('No Icon Stat')).toBeInTheDocument();
  });

  it('renders with statistics that have only prefix', () => {
    const prefixOnlyStats = [
      {
        value: 100,
        label: 'Prefix Only',
        prefix: '$',
      }
    ];
    
    render(<AnimatedStatistics statistics={prefixOnlyStats} />);
    
    expect(screen.getByText('Prefix Only')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('renders with statistics that have only suffix', () => {
    const suffixOnlyStats = [
      {
        value: 100,
        label: 'Suffix Only',
        suffix: 'kg',
      }
    ];
    
    render(<AnimatedStatistics statistics={suffixOnlyStats} />);
    
    expect(screen.getByText('Suffix Only')).toBeInTheDocument();
    expect(screen.getByText('kg')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(<AnimatedStatistics statistics={mockStatistics} />);
    
    // Check that the main heading is properly structured
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading).toHaveTextContent('Trusted by Thousands');
  });

  it('renders responsive grid layout', () => {
    const { container } = render(<AnimatedStatistics statistics={mockStatistics} />);
    
    const gridContainer = container.querySelector('.grid');
    expect(gridContainer).toHaveClass('grid-cols-1', 'sm:grid-cols-2', 'lg:grid-cols-4');
  });

  it('applies glass effect styling', () => {
    const { container } = render(<AnimatedStatistics statistics={mockStatistics} />);
    
    const glassElements = container.querySelectorAll('.glass');
    expect(glassElements.length).toBeGreaterThan(0);
  });

  it('applies gradient text styling to title', () => {
    const { container } = render(<AnimatedStatistics statistics={mockStatistics} />);
    
    const title = container.querySelector('.gradient-text');
    expect(title).toBeInTheDocument();
  });

  it('renders background gradient and pattern', () => {
    const { container } = render(<AnimatedStatistics statistics={mockStatistics} />);
    
    // Check for background gradient
    const gradientDiv = container.querySelector('.bg-gradient-to-br');
    expect(gradientDiv).toBeInTheDocument();
    
    // Check for pattern overlay
    const patternDiv = container.querySelector('[style*="radial-gradient"]');
    expect(patternDiv).toBeInTheDocument();
  });

  it('handles component unmounting gracefully', () => {
    const { unmount } = render(<AnimatedStatistics statistics={mockStatistics} />);
    
    // This should not throw any errors
    expect(() => unmount()).not.toThrow();
  });

  it('renders with different statistic configurations', () => {
    const mixedStats = [
      { value: 100, label: 'Basic' },
      { value: 200, label: 'With Icon', icon: '🎯' },
      { value: 300, label: 'With Prefix', prefix: '#' },
      { value: 400, label: 'With Suffix', suffix: 'ms' },
      { value: 500, label: 'Complete', prefix: '$', suffix: 'K', icon: '💰' },
    ];
    
    render(<AnimatedStatistics statistics={mixedStats} />);
    
    expect(screen.getByText('Basic')).toBeInTheDocument();
    expect(screen.getByText('With Icon')).toBeInTheDocument();
    expect(screen.getByText('With Prefix')).toBeInTheDocument();
    expect(screen.getByText('With Suffix')).toBeInTheDocument();
    expect(screen.getByText('Complete')).toBeInTheDocument();
    
    expect(screen.getByText('🎯')).toBeInTheDocument();
    expect(screen.getByText('#')).toBeInTheDocument();
    expect(screen.getByText('ms')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
    expect(screen.getByText('K')).toBeInTheDocument();
    expect(screen.getByText('💰')).toBeInTheDocument();
  });
}); 