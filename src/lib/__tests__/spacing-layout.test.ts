import {
  SPACING_TOKENS,
  COMPONENT_SPACING,
  CONTAINER_SIZES,
  GRID_PATTERNS,
  ASPECT_RATIOS,
  Z_INDEX,
  ANIMATION_DURATIONS,
  BREAKPOINTS,
  LAYOUT_PATTERNS,
  getSpacingClass,
  getContainerClass,
  getGridClass,
  getAspectClass,
  getZIndexClass,
  responsiveClasses,
  spacingPatterns,
  composeLayout,
} from '../spacing-layout';

describe('Spacing and Layout System', () => {
  describe('SPACING_TOKENS', () => {
    it('should have all required spacing tokens', () => {
      const expectedTokens = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];
      
      expectedTokens.forEach(token => {
        expect(SPACING_TOKENS).toHaveProperty(token);
      });
    });

    it('should have correct rem values', () => {
      expect(SPACING_TOKENS.xs).toBe('0.25rem');
      expect(SPACING_TOKENS.sm).toBe('0.5rem');
      expect(SPACING_TOKENS.md).toBe('1rem');
      expect(SPACING_TOKENS.lg).toBe('1.5rem');
      expect(SPACING_TOKENS.xl).toBe('2rem');
      expect(SPACING_TOKENS['2xl']).toBe('3rem');
      expect(SPACING_TOKENS['3xl']).toBe('4rem');
      expect(SPACING_TOKENS['4xl']).toBe('6rem');
      expect(SPACING_TOKENS['5xl']).toBe('8rem');
    });
  });

  describe('COMPONENT_SPACING', () => {
    it('should have all required component spacing tokens', () => {
      const expectedTokens = [
        'section', 'container', 'card', 'form', 'nav',
        'sidebar', 'header', 'footer', 'content'
      ];
      
      expectedTokens.forEach(token => {
        expect(COMPONENT_SPACING).toHaveProperty(token);
      });
    });

    it('should have appropriate spacing values', () => {
      expect(COMPONENT_SPACING.section).toBe('6rem');
      expect(COMPONENT_SPACING.container).toBe('1rem');
      expect(COMPONENT_SPACING.card).toBe('1.5rem');
      expect(COMPONENT_SPACING.form).toBe('1.25rem');
      expect(COMPONENT_SPACING.nav).toBe('1rem');
    });
  });

  describe('CONTAINER_SIZES', () => {
    it('should have all required container sizes', () => {
      const expectedSizes = [
        'container-sm', 'container-md', 'container-lg', 'container-xl', 'container-2xl',
        'content', 'content-wide', 'content-narrow'
      ];
      
      expectedSizes.forEach(size => {
        expect(CONTAINER_SIZES).toHaveProperty(size);
      });
    });

    it('should have correct pixel values', () => {
      expect(CONTAINER_SIZES['container-sm']).toBe('640px');
      expect(CONTAINER_SIZES['container-md']).toBe('768px');
      expect(CONTAINER_SIZES['container-lg']).toBe('1024px');
      expect(CONTAINER_SIZES['container-xl']).toBe('1280px');
      expect(CONTAINER_SIZES['container-2xl']).toBe('1536px');
    });

    it('should have correct character widths', () => {
      expect(CONTAINER_SIZES.content).toBe('65ch');
      expect(CONTAINER_SIZES['content-wide']).toBe('80ch');
      expect(CONTAINER_SIZES['content-narrow']).toBe('45ch');
    });
  });

  describe('GRID_PATTERNS', () => {
    it('should have all required grid patterns', () => {
      const expectedPatterns = [
        'auto-fit-sm', 'auto-fit-md', 'auto-fit-lg',
        'auto-fill-sm', 'auto-fill-md', 'auto-fill-lg',
        'sidebar', 'sidebar-wide', 'sidebar-narrow'
      ];
      
      expectedPatterns.forEach(pattern => {
        expect(GRID_PATTERNS).toHaveProperty(pattern);
      });
    });

    it('should have correct grid template values', () => {
      expect(GRID_PATTERNS['auto-fit-sm']).toBe('repeat(auto-fit, minmax(200px, 1fr))');
      expect(GRID_PATTERNS['auto-fit-md']).toBe('repeat(auto-fit, minmax(250px, 1fr))');
      expect(GRID_PATTERNS['auto-fit-lg']).toBe('repeat(auto-fit, minmax(300px, 1fr))');
      expect(GRID_PATTERNS.sidebar).toBe('250px 1fr');
      expect(GRID_PATTERNS['sidebar-wide']).toBe('300px 1fr');
      expect(GRID_PATTERNS['sidebar-narrow']).toBe('200px 1fr');
    });
  });

  describe('ASPECT_RATIOS', () => {
    it('should have all required aspect ratios', () => {
      const expectedRatios = ['square', 'video', 'photo', 'banner', 'card', 'hero'];
      
      expectedRatios.forEach(ratio => {
        expect(ASPECT_RATIOS).toHaveProperty(ratio);
      });
    });

    it('should have correct aspect ratio values', () => {
      expect(ASPECT_RATIOS.square).toBe('1 / 1');
      expect(ASPECT_RATIOS.video).toBe('16 / 9');
      expect(ASPECT_RATIOS.photo).toBe('4 / 3');
      expect(ASPECT_RATIOS.banner).toBe('21 / 9');
      expect(ASPECT_RATIOS.card).toBe('3 / 4');
      expect(ASPECT_RATIOS.hero).toBe('2 / 1');
    });
  });

  describe('Z_INDEX', () => {
    it('should have all required z-index levels', () => {
      const expectedLevels = [
        'dropdown', 'sticky', 'fixed', 'modal-backdrop',
        'modal', 'popover', 'tooltip', 'toast'
      ];
      
      expectedLevels.forEach(level => {
        expect(Z_INDEX).toHaveProperty(level);
      });
    });

    it('should have ascending z-index values', () => {
      expect(Z_INDEX.dropdown).toBe(1000);
      expect(Z_INDEX.sticky).toBe(1020);
      expect(Z_INDEX.fixed).toBe(1030);
      expect(Z_INDEX['modal-backdrop']).toBe(1040);
      expect(Z_INDEX.modal).toBe(1050);
      expect(Z_INDEX.popover).toBe(1060);
      expect(Z_INDEX.tooltip).toBe(1070);
      expect(Z_INDEX.toast).toBe(1080);
    });
  });

  describe('ANIMATION_DURATIONS', () => {
    it('should have all required animation durations', () => {
      const expectedDurations = ['fast', 'normal', 'slow', 'slower'];
      
      expectedDurations.forEach(duration => {
        expect(ANIMATION_DURATIONS).toHaveProperty(duration);
      });
    });

    it('should have appropriate duration values', () => {
      expect(ANIMATION_DURATIONS.fast).toBe('0.15s');
      expect(ANIMATION_DURATIONS.normal).toBe('0.3s');
      expect(ANIMATION_DURATIONS.slow).toBe('0.5s');
      expect(ANIMATION_DURATIONS.slower).toBe('0.8s');
    });
  });

  describe('BREAKPOINTS', () => {
    it('should have all required breakpoints', () => {
      const expectedBreakpoints = ['sm', 'md', 'lg', 'xl', '2xl'];
      
      expectedBreakpoints.forEach(breakpoint => {
        expect(BREAKPOINTS).toHaveProperty(breakpoint);
      });
    });

    it('should have correct pixel values', () => {
      expect(BREAKPOINTS.sm).toBe('640px');
      expect(BREAKPOINTS.md).toBe('768px');
      expect(BREAKPOINTS.lg).toBe('1024px');
      expect(BREAKPOINTS.xl).toBe('1280px');
      expect(BREAKPOINTS['2xl']).toBe('1536px');
    });
  });

  describe('LAYOUT_PATTERNS', () => {
    it('should have all required layout pattern categories', () => {
      const expectedCategories = ['page', 'form', 'card', 'dashboard', 'nav'];
      
      expectedCategories.forEach(category => {
        expect(LAYOUT_PATTERNS).toHaveProperty(category);
      });
    });

    it('should have page layout patterns', () => {
      expect(LAYOUT_PATTERNS.page).toHaveProperty('header');
      expect(LAYOUT_PATTERNS.page).toHaveProperty('main');
      expect(LAYOUT_PATTERNS.page).toHaveProperty('footer');
    });

    it('should have form layout patterns', () => {
      expect(LAYOUT_PATTERNS.form).toHaveProperty('container');
      expect(LAYOUT_PATTERNS.form).toHaveProperty('group');
      expect(LAYOUT_PATTERNS.form).toHaveProperty('row');
      expect(LAYOUT_PATTERNS.form).toHaveProperty('actions');
    });

    it('should have card layout patterns', () => {
      expect(LAYOUT_PATTERNS.card).toHaveProperty('container');
      expect(LAYOUT_PATTERNS.card).toHaveProperty('header');
      expect(LAYOUT_PATTERNS.card).toHaveProperty('content');
      expect(LAYOUT_PATTERNS.card).toHaveProperty('footer');
    });

    it('should have dashboard layout patterns', () => {
      expect(LAYOUT_PATTERNS.dashboard).toHaveProperty('container');
      expect(LAYOUT_PATTERNS.dashboard).toHaveProperty('sidebar');
      expect(LAYOUT_PATTERNS.dashboard).toHaveProperty('main');
    });

    it('should have navigation layout patterns', () => {
      expect(LAYOUT_PATTERNS.nav).toHaveProperty('container');
      expect(LAYOUT_PATTERNS.nav).toHaveProperty('menu');
      expect(LAYOUT_PATTERNS.nav).toHaveProperty('mobile');
      expect(LAYOUT_PATTERNS.nav).toHaveProperty('desktop');
    });
  });

  describe('Utility Functions', () => {
    describe('getSpacingClass', () => {
      it('should return correct spacing class names', () => {
        expect(getSpacingClass('xs')).toBe('space-xs');
        expect(getSpacingClass('sm')).toBe('space-sm');
        expect(getSpacingClass('md')).toBe('space-md');
        expect(getSpacingClass('lg')).toBe('space-lg');
        expect(getSpacingClass('xl')).toBe('space-xl');
      });
    });

    describe('getContainerClass', () => {
      it('should return correct container class names', () => {
        expect(getContainerClass('container-sm')).toBe('max-w-container-sm');
        expect(getContainerClass('container-md')).toBe('max-w-container-md');
        expect(getContainerClass('container-lg')).toBe('max-w-container-lg');
        expect(getContainerClass('content')).toBe('max-w-content');
      });
    });

    describe('getGridClass', () => {
      it('should return correct grid class names', () => {
        expect(getGridClass('auto-fit-sm')).toBe('grid-cols-auto-fit-sm');
        expect(getGridClass('auto-fit-md')).toBe('grid-cols-auto-fit-md');
        expect(getGridClass('sidebar')).toBe('grid-cols-sidebar');
        expect(getGridClass('sidebar-wide')).toBe('grid-cols-sidebar-wide');
      });
    });

    describe('getAspectClass', () => {
      it('should return correct aspect ratio class names', () => {
        expect(getAspectClass('square')).toBe('aspect-square');
        expect(getAspectClass('video')).toBe('aspect-video');
        expect(getAspectClass('photo')).toBe('aspect-photo');
        expect(getAspectClass('banner')).toBe('aspect-banner');
      });
    });

    describe('getZIndexClass', () => {
      it('should return correct z-index class names', () => {
        expect(getZIndexClass('dropdown')).toBe('z-dropdown');
        expect(getZIndexClass('modal')).toBe('z-modal');
        expect(getZIndexClass('tooltip')).toBe('z-tooltip');
        expect(getZIndexClass('toast')).toBe('z-toast');
      });
    });
  });

  describe('responsiveClasses', () => {
    it('should have hide/show utilities', () => {
      expect(responsiveClasses.hide).toHaveProperty('sm');
      expect(responsiveClasses.hide).toHaveProperty('md');
      expect(responsiveClasses.hide).toHaveProperty('lg');
      expect(responsiveClasses.hide).toHaveProperty('xl');
      
      expect(responsiveClasses.show).toHaveProperty('sm');
      expect(responsiveClasses.show).toHaveProperty('md');
      expect(responsiveClasses.show).toHaveProperty('lg');
      expect(responsiveClasses.show).toHaveProperty('xl');
    });

    it('should have grid utilities', () => {
      expect(responsiveClasses.grid).toHaveProperty('1-2-3');
      expect(responsiveClasses.grid).toHaveProperty('1-2-4');
      expect(responsiveClasses.grid).toHaveProperty('1-3-6');
    });

    it('should have text alignment utilities', () => {
      expect(responsiveClasses.text).toHaveProperty('left-center');
      expect(responsiveClasses.text).toHaveProperty('center-left');
      expect(responsiveClasses.text).toHaveProperty('center-right');
    });
  });

  describe('spacingPatterns', () => {
    it('should have section spacing patterns', () => {
      expect(spacingPatterns.section).toHaveProperty('sm');
      expect(spacingPatterns.section).toHaveProperty('md');
      expect(spacingPatterns.section).toHaveProperty('lg');
      expect(spacingPatterns.section).toHaveProperty('xl');
    });

    it('should have container spacing patterns', () => {
      expect(spacingPatterns.container).toHaveProperty('sm');
      expect(spacingPatterns.container).toHaveProperty('md');
      expect(spacingPatterns.container).toHaveProperty('lg');
      expect(spacingPatterns.container).toHaveProperty('xl');
    });

    it('should have card spacing patterns', () => {
      expect(spacingPatterns.card).toHaveProperty('sm');
      expect(spacingPatterns.card).toHaveProperty('md');
      expect(spacingPatterns.card).toHaveProperty('lg');
      expect(spacingPatterns.card).toHaveProperty('xl');
    });

    it('should have form spacing patterns', () => {
      expect(spacingPatterns.form).toHaveProperty('group');
      expect(spacingPatterns.form).toHaveProperty('row');
      expect(spacingPatterns.form).toHaveProperty('actions');
    });
  });

  describe('composeLayout', () => {
    it('should have page composition function', () => {
      expect(composeLayout).toHaveProperty('page');
      expect(typeof composeLayout.page).toBe('function');
    });

    it('should have card composition function', () => {
      expect(composeLayout).toHaveProperty('card');
      expect(typeof composeLayout.card).toBe('function');
    });

    it('should have form composition function', () => {
      expect(composeLayout).toHaveProperty('form');
      expect(typeof composeLayout.form).toBe('function');
    });

    it('should return correct page layout structure', () => {
      const result = composeLayout.page('Header', 'Main', 'Footer');
      
      expect(result.className).toBe('min-h-screen flex flex-col');
      expect(result.children).toHaveLength(3);
      expect(result.children[0]).toEqual({
        className: LAYOUT_PATTERNS.page.header,
        children: 'Header'
      });
      expect(result.children[1]).toEqual({
        className: LAYOUT_PATTERNS.page.main,
        children: 'Main'
      });
      expect(result.children[2]).toEqual({
        className: LAYOUT_PATTERNS.page.footer,
        children: 'Footer'
      });
    });

    it('should return correct card layout structure', () => {
      const result = composeLayout.card('Header', 'Content', 'Footer');
      
      expect(result.className).toBe(LAYOUT_PATTERNS.card.container);
      expect(result.children).toHaveLength(3);
      expect(result.children[0]).toEqual({
        className: LAYOUT_PATTERNS.card.header,
        children: 'Header'
      });
      expect(result.children[1]).toEqual({
        className: LAYOUT_PATTERNS.card.content,
        children: 'Content'
      });
      expect(result.children[2]).toEqual({
        className: LAYOUT_PATTERNS.card.footer,
        children: 'Footer'
      });
    });

    it('should return correct form layout structure', () => {
      const groups = ['Group 1', 'Group 2', 'Group 3'];
      const result = composeLayout.form(groups);
      
      expect(result.className).toBe(LAYOUT_PATTERNS.form.container);
      expect(result.children).toHaveLength(3);
      result.children.forEach((child, index) => {
        expect(child.key).toBe(index);
        expect(child.className).toBe(LAYOUT_PATTERNS.form.group);
        expect(child.children).toBe(groups[index]);
      });
    });

    it('should filter out undefined children', () => {
      const result = composeLayout.page(undefined, 'Main', undefined);
      
      expect(result.children).toHaveLength(1);
      expect(result.children[0]).toEqual({
        className: LAYOUT_PATTERNS.page.main,
        children: 'Main'
      });
    });
  });
}); 