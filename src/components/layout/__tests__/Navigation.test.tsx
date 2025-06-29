import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Navigation from '../Navigation';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
  }),
  usePathname: () => '/',
}));

// Mock window.scrollY
Object.defineProperty(window, 'scrollY', {
  value: 0,
  writable: true,
});

describe('Navigation Component', () => {
  beforeEach(() => {
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', {
      value: 0,
      writable: true,
    });
  });

  describe('Logo and Branding', () => {
    it('renders the logo with correct styling', () => {
      render(<Navigation />);
      
      const logo = screen.getByText('R');
      const brandName = screen.getByText('RecipeVault');
      
      expect(logo).toBeInTheDocument();
      expect(brandName).toBeInTheDocument();
      expect(logo.closest('div')).toHaveClass('w-12', 'h-12', 'bg-gradient-to-br', 'from-primary', 'to-accent');
      expect(brandName).toHaveClass('font-display', 'font-bold', 'text-2xl');
    });

    it('logo links to home page', () => {
      render(<Navigation />);
      
      const logoLink = screen.getByRole('link', { name: /recipevault/i });
      expect(logoLink).toHaveAttribute('href', '/');
    });

    it('logo has hover animation', () => {
      render(<Navigation />);
      
      const logoContainer = screen.getByText('R').closest('div');
      expect(logoContainer).toHaveClass('group-hover:scale-110', 'transition-all', 'duration-300');
    });

    it('renders tagline', () => {
      render(<Navigation />);
      
      const tagline = screen.getByText('Smart Recipe Management');
      expect(tagline).toBeInTheDocument();
      expect(tagline).toHaveClass('text-xs', 'text-muted-foreground', 'font-accent');
    });
  });

  describe('Desktop Navigation', () => {
    it('renders all desktop navigation links', () => {
      render(<Navigation />);
      
      // Only check the first instance for each link (desktop)
      expect(screen.getAllByText('Browse Recipes')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Upload Recipe')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Meal Planning')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Favorites')[0]).toBeInTheDocument();
      expect(screen.getAllByText('Categories')[0]).toBeInTheDocument();
    });

    it('navigation links have correct hover effects', () => {
      render(<Navigation />);
      
      const browseLink = screen.getAllByText('Browse Recipes')[0].closest('a');
      expect(browseLink).toHaveClass('hover:text-primary', 'hover:bg-primary/5', 'transition-all', 'duration-300');
    });

    it('navigation links have underline hover effect', () => {
      render(<Navigation />);
      
      const browseLink = screen.getAllByText('Browse Recipes')[0].closest('a');
      const underline = browseLink?.querySelector('span');
      expect(underline).toHaveClass('absolute', '-bottom-1', 'left-1/2', 'w-0', 'h-0.5', 'bg-gradient-to-r');
    });

    it('sign up button has special styling', () => {
      render(<Navigation />);
      
      const signUpButton = screen.getByText('Get Started').closest('a');
      expect(signUpButton).toHaveClass('bg-gradient-to-r', 'from-primary', 'to-accent', 'text-primary-foreground', 'px-6', 'py-2.5', 'rounded-full');
    });

    it('sign up button has hover animation', () => {
      render(<Navigation />);
      
      const signUpButton = screen.getByText('Get Started').closest('a');
      expect(signUpButton).toHaveClass('hover:scale-105', 'transition-all', 'duration-300');
    });
  });

  describe('User Actions', () => {
    it('renders search button', () => {
      render(<Navigation />);
      
      const searchButton = screen.getByRole('button', { name: /search/i });
      expect(searchButton).toBeInTheDocument();
      expect(searchButton).toHaveClass('p-2', 'rounded-lg', 'text-foreground/70');
    });

    it('renders user menu button', () => {
      render(<Navigation />);
      
      const userMenuButton = screen.getByRole('button', { name: /user menu/i });
      expect(userMenuButton).toBeInTheDocument();
    });

    it('user menu button has avatar', () => {
      render(<Navigation />);
      
      const avatar = screen.getByText('U');
      expect(avatar).toBeInTheDocument();
      expect(avatar.closest('div')).toHaveClass('w-8', 'h-8', 'bg-gradient-to-br', 'rounded-full');
    });
  });

  describe('Tablet Navigation', () => {
    it('renders simplified tablet navigation', () => {
      render(<Navigation />);
      
      expect(screen.getByText('Recipes')).toBeInTheDocument();
      expect(screen.getByText('Meal Plans')).toBeInTheDocument();
      expect(screen.getByText('Upload')).toBeInTheDocument();
    });

    it('tablet navigation is hidden on desktop', () => {
      render(<Navigation />);
      
      const tabletNav = screen.getByText('Recipes').closest('div');
      expect(tabletNav).toHaveClass('hidden', 'md:flex', 'lg:hidden');
    });
  });

  describe('Mobile Navigation', () => {
    it('renders mobile menu button', () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
      expect(menuButton).toBeInTheDocument();
      expect(menuButton).toHaveClass('md:hidden');
    });

    it('mobile menu button has hamburger icon', () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
      const spans = menuButton.querySelectorAll('span');
      expect(spans).toHaveLength(3);
    });

    it('toggles mobile menu when button is clicked', async () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
      // The mobile menu container is the parent of the p-4 container
      const mobileMenuContainer = menuButton.parentElement?.parentElement?.querySelector('div.md\\:hidden');
      
      // Initially menu should be closed
      expect(mobileMenuContainer).toHaveClass('max-h-0', 'opacity-0');
      
      // Click to open
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        expect(mobileMenuContainer).toHaveClass('max-h-96', 'opacity-100');
      });
      
      // Click to close
      fireEvent.click(menuButton);
      
      await waitFor(() => {
        expect(mobileMenuContainer).toHaveClass('max-h-0', 'opacity-0');
      });
    });

    it('mobile menu has glass effect styling', () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
      fireEvent.click(menuButton);
      // The mobile menu glass effect is on the first child of the md:hidden container
      const mobileMenuContainer = menuButton.parentElement?.parentElement?.querySelector('div.md\\:hidden');
      const glassDiv = mobileMenuContainer?.firstElementChild;
      expect(glassDiv).toHaveClass('bg-white/95', 'dark:bg-gray-900/95', 'backdrop-blur-xl');
    });

    it('mobile menu links close menu when clicked', async () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
      fireEvent.click(menuButton);
      
      const browseLink = screen.getAllByText('Browse Recipes')[1];
      fireEvent.click(browseLink);
      
      // The mobile menu container is the parent of the p-4 container
      const mobileMenuContainer = menuButton.parentElement?.parentElement?.querySelector('div.md\\:hidden');
      await waitFor(() => {
        expect(mobileMenuContainer).toHaveClass('max-h-0', 'opacity-0');
      });
    });

    it('mobile menu has icons for each link', () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
      fireEvent.click(menuButton);
      
      const svgElements = document.querySelectorAll('svg');
      expect(svgElements.length).toBeGreaterThan(0);
    });
  });

  describe('Scroll Behavior', () => {
    it('changes styling when scrolled', async () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      
      // Initially should have backdrop blur
      expect(nav).toHaveClass('bg-white/80', 'dark:bg-gray-900/80', 'backdrop-blur-md', 'py-5');
      
      // Simulate scroll
      Object.defineProperty(window, 'scrollY', {
        value: 100,
        writable: true,
      });
      
      fireEvent.scroll(window);
      
      await waitFor(() => {
        expect(nav).toHaveClass('bg-white/95', 'dark:bg-gray-900/95', 'backdrop-blur-xl', 'py-3');
      });
    });

    it('has smooth transitions for scroll changes', () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('transition-all', 'duration-500', 'ease-out');
    });
  });

  describe('Responsive Design', () => {
    it('desktop navigation is hidden on mobile', () => {
      render(<Navigation />);
      
      const desktopNav = screen.getAllByText('Browse Recipes')[0].closest('div');
      expect(desktopNav).toHaveClass('hidden', 'lg:flex');
    });

    it('mobile menu button is only visible on mobile', () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
      expect(menuButton).toHaveClass('md:hidden');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels', () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toBeInTheDocument();
    });

    it('mobile menu button has proper aria-label', () => {
      render(<Navigation />);
      
      const menuButton = screen.getByRole('button', { name: /toggle mobile menu/i });
      expect(menuButton).toHaveAttribute('aria-label', 'Toggle mobile menu');
    });

    it('all links have proper href attributes', () => {
      render(<Navigation />);
      
      const links = screen.getAllByRole('link');
      links.forEach(link => {
        expect(link).toHaveAttribute('href');
      });
    });
  });

  describe('Visual Effects', () => {
    it('has glass morphism effect', () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('backdrop-blur-md');
    });

    it('has subtle border', () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('border-b', 'border-gray-200/50', 'dark:border-gray-700/50');
    });

    it('has fixed positioning', () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      expect(nav).toHaveClass('fixed', 'top-0', 'left-0', 'right-0', 'z-50');
    });

    it('has shadow when scrolled', async () => {
      render(<Navigation />);
      
      const nav = screen.getByRole('navigation');
      
      // Simulate scroll
      Object.defineProperty(window, 'scrollY', {
        value: 100,
        writable: true,
      });
      
      fireEvent.scroll(window);
      
      await waitFor(() => {
        expect(nav).toHaveClass('shadow-lg', 'shadow-black/5', 'dark:shadow-black/20');
      });
    });
  });

  describe('Typography', () => {
    it('uses correct font classes', () => {
      render(<Navigation />);
      
      const brandName = screen.getByText('RecipeVault');
      const navLinks = screen.getAllByText('Browse Recipes')[0];
      
      expect(brandName).toHaveClass('font-display');
      expect(navLinks).toHaveClass('font-body');
    });

    it('has proper font weights', () => {
      render(<Navigation />);
      
      const brandName = screen.getByText('RecipeVault');
      const signUpButton = screen.getByText('Get Started').closest('a');
      
      expect(brandName).toHaveClass('font-bold');
      expect(signUpButton).toHaveClass('font-medium');
    });

    it('has gradient text for brand name', () => {
      render(<Navigation />);
      
      const brandName = screen.getByText('RecipeVault');
      expect(brandName).toHaveClass('bg-gradient-to-r', 'from-primary', 'to-accent', 'bg-clip-text', 'text-transparent');
    });
  });

  describe('User Menu Dropdown', () => {
    it('toggles user menu when clicked', async () => {
      render(<Navigation />);
      
      const userMenuButton = screen.getByRole('button', { name: /user menu/i });
      // The dropdown container is always present, but hidden by opacity-0 when closed
      const dropdown = document.querySelector('.absolute.right-0.top-full');
      expect(dropdown).toHaveClass('opacity-0');
      // Click to open
      fireEvent.click(userMenuButton);
      await waitFor(() => {
        expect(dropdown).toHaveClass('opacity-100');
      });
      // Click to close
      fireEvent.click(userMenuButton);
      await waitFor(() => {
        expect(dropdown).toHaveClass('opacity-0');
      });
    });

    it('user dropdown has backdrop blur', async () => {
      render(<Navigation />);
      
      const userMenuButton = screen.getByRole('button', { name: /user menu/i });
      fireEvent.click(userMenuButton);
      
      await waitFor(() => {
        const dropdown = screen.getAllByText('Login')[0].closest('div');
        expect(dropdown?.parentElement).toHaveClass('bg-white/95', 'dark:bg-gray-900/95', 'backdrop-blur-xl');
      });
    });
  });
}); 