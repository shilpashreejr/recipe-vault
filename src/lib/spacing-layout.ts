// Spacing and Layout System Utilities

// Spacing tokens (in rem)
export const SPACING_TOKENS = {
  xs: '0.25rem',    // 4px
  sm: '0.5rem',     // 8px
  md: '1rem',       // 16px
  lg: '1.5rem',     // 24px
  xl: '2rem',       // 32px
  '2xl': '3rem',    // 48px
  '3xl': '4rem',    // 64px
  '4xl': '6rem',    // 96px
  '5xl': '8rem',    // 128px
} as const;

// Component-specific spacing
export const COMPONENT_SPACING = {
  section: '6rem',   // Section padding
  container: '1rem', // Container padding
  card: '1.5rem',    // Card padding
  form: '1.25rem',   // Form spacing
  nav: '1rem',       // Navigation spacing
  sidebar: '1.5rem', // Sidebar spacing
  header: '1rem',    // Header spacing
  footer: '2rem',    // Footer spacing
  content: '2rem',   // Content spacing
} as const;

// Container max-widths
export const CONTAINER_SIZES = {
  'container-sm': '640px',
  'container-md': '768px',
  'container-lg': '1024px',
  'container-xl': '1280px',
  'container-2xl': '1536px',
  'content': '65ch',
  'content-wide': '80ch',
  'content-narrow': '45ch',
} as const;

// Grid patterns
export const GRID_PATTERNS = {
  'auto-fit-sm': 'repeat(auto-fit, minmax(200px, 1fr))',
  'auto-fit-md': 'repeat(auto-fit, minmax(250px, 1fr))',
  'auto-fit-lg': 'repeat(auto-fit, minmax(300px, 1fr))',
  'auto-fill-sm': 'repeat(auto-fill, minmax(150px, 1fr))',
  'auto-fill-md': 'repeat(auto-fill, minmax(200px, 1fr))',
  'auto-fill-lg': 'repeat(auto-fill, minmax(250px, 1fr))',
  'sidebar': '250px 1fr',
  'sidebar-wide': '300px 1fr',
  'sidebar-narrow': '200px 1fr',
} as const;

// Aspect ratios
export const ASPECT_RATIOS = {
  square: '1 / 1',
  video: '16 / 9',
  photo: '4 / 3',
  banner: '21 / 9',
  card: '3 / 4',
  hero: '2 / 1',
} as const;

// Z-index scale
export const Z_INDEX = {
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  'modal-backdrop': 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
  toast: 1080,
} as const;

// Animation durations
export const ANIMATION_DURATIONS = {
  fast: '0.15s',
  normal: '0.3s',
  slow: '0.5s',
  slower: '0.8s',
} as const;

// Breakpoints
export const BREAKPOINTS = {
  sm: '640px',
  md: '768px',
  lg: '1024px',
  xl: '1280px',
  '2xl': '1536px',
} as const;

// Layout patterns
export const LAYOUT_PATTERNS = {
  // Page layouts
  page: {
    header: 'flex items-center justify-between p-4 border-b',
    main: 'flex-1 p-6',
    footer: 'p-4 border-t text-center',
  },
  
  // Form layouts
  form: {
    container: 'space-y-6 max-w-md mx-auto',
    group: 'space-y-2',
    row: 'grid grid-cols-1 sm:grid-cols-2 gap-4',
    actions: 'flex justify-end space-x-3',
  },
  
  // Card layouts
  card: {
    container: 'bg-card border rounded-lg p-6',
    header: 'flex items-center justify-between mb-4',
    content: 'space-y-4',
    footer: 'flex items-center justify-between pt-4 border-t',
  },
  
  // Dashboard layouts
  dashboard: {
    container: 'grid grid-cols-1 lg:grid-cols-sidebar gap-6',
    sidebar: 'bg-card border rounded-lg p-4',
    main: 'bg-card border rounded-lg p-6',
  },
  
  // Navigation layouts
  nav: {
    container: 'flex items-center justify-between p-4',
    menu: 'flex items-center space-x-4',
    mobile: 'lg:hidden',
    desktop: 'hidden lg:flex',
  },
} as const;

// Utility functions
export const getSpacingClass = (size: keyof typeof SPACING_TOKENS): string => {
  return `space-${size}`;
};

export const getContainerClass = (size: keyof typeof CONTAINER_SIZES): string => {
  return `max-w-${size}`;
};

export const getGridClass = (pattern: keyof typeof GRID_PATTERNS): string => {
  return `grid-cols-${pattern}`;
};

export const getAspectClass = (ratio: keyof typeof ASPECT_RATIOS): string => {
  return `aspect-${ratio}`;
};

export const getZIndexClass = (level: keyof typeof Z_INDEX): string => {
  return `z-${level}`;
};

// Responsive utilities
export const responsiveClasses = {
  // Hide/show based on breakpoint
  hide: {
    sm: 'hidden sm:block',
    md: 'hidden md:block',
    lg: 'hidden lg:block',
    xl: 'hidden xl:block',
  },
  show: {
    sm: 'block sm:hidden',
    md: 'block md:hidden',
    lg: 'block lg:hidden',
    xl: 'block xl:hidden',
  },
  
  // Grid columns based on breakpoint
  grid: {
    '1-2-3': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    '1-2-4': 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    '1-3-6': 'grid-cols-1 md:grid-cols-3 lg:grid-cols-6',
  },
  
  // Text alignment based on breakpoint
  text: {
    'left-center': 'text-left md:text-center',
    'center-left': 'text-center md:text-left',
    'center-right': 'text-center md:text-right',
  },
} as const;

// Spacing utilities for common patterns
export const spacingPatterns = {
  // Section spacing
  section: {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16',
    xl: 'py-20',
  },
  
  // Container spacing
  container: {
    sm: 'px-4',
    md: 'px-6',
    lg: 'px-8',
    xl: 'px-12',
  },
  
  // Card spacing
  card: {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  },
  
  // Form spacing
  form: {
    group: 'space-y-2',
    row: 'space-y-4 sm:space-y-0 sm:space-x-4',
    actions: 'space-x-3',
  },
} as const;

// Layout composition helpers
export const composeLayout = {
  // Page layout with header, main, footer
  page: (header?: React.ReactNode, main?: React.ReactNode, footer?: React.ReactNode) => ({
    className: 'min-h-screen flex flex-col',
    children: [
      header && { className: LAYOUT_PATTERNS.page.header, children: header },
      main && { className: LAYOUT_PATTERNS.page.main, children: main },
      footer && { className: LAYOUT_PATTERNS.page.footer, children: footer },
    ].filter(Boolean),
  }),
  
  // Card layout with header, content, footer
  card: (header?: React.ReactNode, content?: React.ReactNode, footer?: React.ReactNode) => ({
    className: LAYOUT_PATTERNS.card.container,
    children: [
      header && { className: LAYOUT_PATTERNS.card.header, children: header },
      content && { className: LAYOUT_PATTERNS.card.content, children: content },
      footer && { className: LAYOUT_PATTERNS.card.footer, children: footer },
    ].filter(Boolean),
  }),
  
  // Form layout with groups
  form: (groups: React.ReactNode[]) => ({
    className: LAYOUT_PATTERNS.form.container,
    children: groups.map((group, index) => ({
      key: index,
      className: LAYOUT_PATTERNS.form.group,
      children: group,
    })),
  }),
} as const;

// Type definitions
export type SpacingToken = keyof typeof SPACING_TOKENS;
export type ContainerSize = keyof typeof CONTAINER_SIZES;
export type GridPattern = keyof typeof GRID_PATTERNS;
export type AspectRatio = keyof typeof ASPECT_RATIOS;
export type ZIndexLevel = keyof typeof Z_INDEX;
export type Breakpoint = keyof typeof BREAKPOINTS; 