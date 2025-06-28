import { DataCleaner } from '../data-cleaner';
import { CreateRecipe } from '../recipe-schemas';

describe('DataCleaner', () => {
  describe('cleanRecipe', () => {
    it('should clean a complete recipe', () => {
      const rawRecipe: Partial<CreateRecipe> = {
        title: '  chocolate   cake  ',
        description: '  A delicious   chocolate cake recipe  ',
        ingredients: [
          { name: '  all-purpose flour  ', quantity: 2, unit: '  cups  ', notes: '  sifted  ' },
          { name: '  ap flour  ', quantity: 1, unit: '  cup  ' },
          { name: '  tsp  ', quantity: 1, unit: '  tsp  ' },
        ],
        instructions: [
          { step: 1, instruction: '  mix dry ingredients  ', notes: '  until combined  ' },
          { step: 3, instruction: '  add wet ingredients  ' },
        ],
        source: 'example.com/recipe',
        images: [
          { url: 'example.com/image.jpg', alt: '  cake image  ', isPrimary: true },
        ],
      };

      const cleaned = DataCleaner.cleanRecipe(rawRecipe);

      expect(cleaned.title).toBe('Chocolate Cake');
      expect(cleaned.description).toBe('A delicious chocolate cake recipe');
      expect(cleaned.ingredients).toEqual([
        { name: 'All Purpose Flour', quantity: 2, unit: 'cup', notes: 'sifted' },
        { name: 'All Purpose Flour', quantity: 1, unit: 'cup' },
        { name: 'Tsp', quantity: 1, unit: 'teaspoon' },
      ]);
      expect(cleaned.instructions).toEqual([
        { step: 1, instruction: 'Mix dry ingredients', notes: 'until combined' },
        { step: 2, instruction: 'Add wet ingredients' },
      ]);
      expect(cleaned.source).toBe('https://example.com/recipe');
      expect(cleaned.images).toEqual([
        { url: 'https://example.com/image.jpg', alt: 'cake image', isPrimary: true },
      ]);
    });

    it('should handle missing optional fields', () => {
      const minimalRecipe: Partial<CreateRecipe> = {
        title: 'Simple Recipe',
        ingredients: [{ name: 'Flour' }],
        instructions: [{ step: 1, instruction: 'Mix' }],
      };

      const cleaned = DataCleaner.cleanRecipe(minimalRecipe);

      expect(cleaned.title).toBe('Simple Recipe');
      expect(cleaned.ingredients).toEqual([{ name: 'Flour' }]);
      expect(cleaned.instructions).toEqual([{ step: 1, instruction: 'Mix' }]);
    });

    it('should truncate long titles and descriptions', () => {
      const longRecipe: Partial<CreateRecipe> = {
        title: 'A'.repeat(250),
        description: 'B'.repeat(1200),
        ingredients: [{ name: 'Flour' }],
        instructions: [{ step: 1, instruction: 'Mix' }],
      };

      const cleaned = DataCleaner.cleanRecipe(longRecipe, {
        maxTitleLength: 50,
        maxDescriptionLength: 100,
      });

      expect(cleaned.title).toBe('A'.repeat(47) + '...');
      expect(cleaned.description).toBe('B'.repeat(97) + '...');
    });

    it('should normalize ingredient names', () => {
      const recipe: Partial<CreateRecipe> = {
        title: 'Test',
        ingredients: [
          { name: 'all-purpose flour' },
          { name: 'ap flour' },
          { name: 'plain flour' },
          { name: 'butter' },
          { name: 'unsalted butter' },
          { name: 'vanilla' },
          { name: 'vanilla extract' },
        ],
        instructions: [{ step: 1, instruction: 'Mix' }],
      };

      const cleaned = DataCleaner.cleanRecipe(recipe);

      expect(cleaned.ingredients).toEqual([
        { name: 'All Purpose Flour' },
        { name: 'All Purpose Flour' },
        { name: 'All Purpose Flour' },
        { name: 'Unsalted Butter' },
        { name: 'Unsalted Butter' },
        { name: 'Vanilla Extract' },
        { name: 'Vanilla Extract' },
      ]);
    });

    it('should normalize units', () => {
      const recipe: Partial<CreateRecipe> = {
        title: 'Test',
        ingredients: [
          { name: 'Flour', unit: 'tsp' },
          { name: 'Sugar', unit: 'tbsp' },
          { name: 'Milk', unit: 'ml' },
          { name: 'Oil', unit: 'fl oz' },
        ],
        instructions: [{ step: 1, instruction: 'Mix' }],
      };

      const cleaned = DataCleaner.cleanRecipe(recipe);

      expect(cleaned.ingredients).toEqual([
        { name: 'Flour', unit: 'teaspoon' },
        { name: 'Sugar', unit: 'tablespoon' },
        { name: 'Milk', unit: 'milliliter' },
        { name: 'Oil', unit: 'fluid ounce' },
      ]);
    });

    it('should fix instruction step numbers', () => {
      const recipe: Partial<CreateRecipe> = {
        title: 'Test',
        ingredients: [{ name: 'Flour' }],
        instructions: [
          { step: 5, instruction: 'First step' },
          { step: 2, instruction: 'Second step' },
          { step: 8, instruction: 'Third step' },
        ],
      };

      const cleaned = DataCleaner.cleanRecipe(recipe);

      expect(cleaned.instructions).toEqual([
        { step: 1, instruction: 'First step' },
        { step: 2, instruction: 'Second step' },
        { step: 3, instruction: 'Third step' },
      ]);
    });
  });

  describe('validateNutritionalInfo', () => {
    it('should ensure all values are non-negative', () => {
      const nutritionalInfo = {
        calories: -100,
        protein: 10,
        carbohydrates: -5,
        fat: 0,
        fiber: 3,
      };

      const validated = DataCleaner.validateNutritionalInfo(nutritionalInfo);

      expect(validated.calories).toBe(0);
      expect(validated.protein).toBe(10);
      expect(validated.carbohydrates).toBe(0);
      expect(validated.fat).toBe(0);
      expect(validated.fiber).toBe(3);
    });

    it('should preserve valid values', () => {
      const nutritionalInfo = {
        calories: 250,
        protein: 10,
        carbohydrates: 30,
        fat: 8,
      };

      const validated = DataCleaner.validateNutritionalInfo(nutritionalInfo);

      expect(validated).toEqual(nutritionalInfo);
    });
  });

  describe('sanitizeHtml', () => {
    it('should remove script tags', () => {
      const html = '<p>Hello</p><script>alert("xss")</script><div>World</div>';
      const sanitized = DataCleaner.sanitizeHtml(html);
      expect(sanitized).toBe('<p>Hello</p><div>World</div>');
    });

    it('should remove style tags', () => {
      const html = '<p>Hello</p><style>body { color: red; }</style><div>World</div>';
      const sanitized = DataCleaner.sanitizeHtml(html);
      expect(sanitized).toBe('<p>Hello</p><div>World</div>');
    });

    it('should remove event handlers', () => {
      const html = '<p>Hello</p><div onclick="alert(\'xss\')" onmouseover="evil()">World</div>';
      const sanitized = DataCleaner.sanitizeHtml(html);
      expect(sanitized).toBe('<p>Hello</p><div>World</div>');
    });

    it('should remove javascript: URLs', () => {
      const html = '<p>Hello</p><a href="javascript:alert(\'xss\')">Click me</a><div>World</div>';
      const sanitized = DataCleaner.sanitizeHtml(html);
      expect(sanitized).toBe('<p>Hello</p><a href="">Click me</a><div>World</div>');
    });
  });

  describe('extractTextFromHtml', () => {
    it('should remove HTML tags', () => {
      const html = '<h1>Title</h1><p>This is a <strong>paragraph</strong> with <em>emphasis</em>.</p>';
      const text = DataCleaner.extractTextFromHtml(html);
      expect(text).toBe('Title This is a paragraph with emphasis.');
    });

    it('should decode HTML entities', () => {
      const html = '<p>Hello &amp; World &lt;3 &gt;2 &quot;quoted&quot; &#39;apos&#39;</p>';
      const text = DataCleaner.extractTextFromHtml(html);
      expect(text).toBe('Hello & World <3 >2 "quoted" \'apos\'');
    });

    it('should handle empty HTML', () => {
      const html = '';
      const text = DataCleaner.extractTextFromHtml(html);
      expect(text).toBe('');
    });

    it('should remove extra whitespace', () => {
      const html = '<p>  Multiple    spaces  and\n\nnewlines  </p>';
      const text = DataCleaner.extractTextFromHtml(html);
      expect(text).toBe('Multiple spaces and newlines');
    });
  });

  describe('cleanUrl', () => {
    it('should add https protocol if missing', () => {
      const url = 'example.com/recipe';
      const cleaned = DataCleaner['cleanUrl'](url);
      expect(cleaned).toBe('https://example.com/recipe');
    });

    it('should preserve existing protocols', () => {
      const url = 'http://example.com/recipe';
      const cleaned = DataCleaner['cleanUrl'](url);
      expect(cleaned).toBe('http://example.com/recipe');
    });

    it('should remove trailing slash', () => {
      const url = 'https://example.com/recipe/';
      const cleaned = DataCleaner['cleanUrl'](url);
      expect(cleaned).toBe('https://example.com/recipe');
    });

    it('should handle URLs with query parameters', () => {
      const url = 'example.com/recipe?id=123&type=cake';
      const cleaned = DataCleaner['cleanUrl'](url);
      expect(cleaned).toBe('https://example.com/recipe?id=123&type=cake');
    });
  });

  describe('cleanTitle', () => {
    it('should capitalize first letter of each word', () => {
      const title = 'chocolate cake recipe';
      const cleaned = DataCleaner['cleanTitle'](title, 100);
      expect(cleaned).toBe('Chocolate Cake Recipe');
    });

    it('should remove extra whitespace', () => {
      const title = '  chocolate   cake  recipe  ';
      const cleaned = DataCleaner['cleanTitle'](title, 100);
      expect(cleaned).toBe('Chocolate Cake Recipe');
    });

    it('should truncate long titles', () => {
      const title = 'A'.repeat(50);
      const cleaned = DataCleaner['cleanTitle'](title, 20);
      expect(cleaned).toBe('A'.repeat(17) + '...');
    });
  });

  describe('cleanDescription', () => {
    it('should remove extra whitespace', () => {
      const description = '  This is a   description  with  extra  spaces  ';
      const cleaned = DataCleaner['cleanDescription'](description, 100);
      expect(cleaned).toBe('This is a description with extra spaces');
    });

    it('should truncate long descriptions', () => {
      const description = 'B'.repeat(50);
      const cleaned = DataCleaner['cleanDescription'](description, 20);
      expect(cleaned).toBe('B'.repeat(17) + '...');
    });
  });
}); 