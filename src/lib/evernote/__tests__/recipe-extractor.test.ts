import { RecipeExtractor, ExtractedRecipe } from '../recipe-extractor';
import { EvernoteNote } from '../evernote-service';

describe('RecipeExtractor', () => {
  describe('extractFromEvernoteNote', () => {
    it('should extract recipe from well-formatted note', () => {
      const note: EvernoteNote = {
        guid: 'test-note-1',
        title: 'Chocolate Chip Cookies',
        content: `
          <en-note>
            <h1>Chocolate Chip Cookies</h1>
            <h2>Ingredients:</h2>
            <ul>
              <li>2 cups all-purpose flour</li>
              <li>1 cup butter</li>
              <li>1 cup sugar</li>
              <li>2 eggs</li>
              <li>1 cup chocolate chips</li>
            </ul>
            <h2>Instructions:</h2>
            <ol>
              <li>Preheat oven to 350°F</li>
              <li>Mix flour, butter, and sugar</li>
              <li>Add eggs and chocolate chips</li>
              <li>Bake for 12 minutes</li>
            </ol>
            <p>Serves 24 cookies</p>
          </en-note>
        `,
        created: 1234567890,
        updated: 1234567890,
      };

      const result = RecipeExtractor.extractFromEvernoteNote(note);

      expect(result).not.toBeNull();
      expect(result!.title).toBe('Chocolate Chip Cookies');
      expect(result!.ingredients.length).toBeGreaterThan(0);
      expect(result!.instructions.length).toBeGreaterThan(0);
      expect(result!.servings).toBe(24);
      expect(result!.sourceType).toBe('evernote');
    });

    it('should return null for non-recipe notes', () => {
      const note: EvernoteNote = {
        guid: 'test-note-2',
        title: 'Meeting Notes',
        content: '<en-note>Discuss project timeline and budget</en-note>',
        created: 1234567890,
        updated: 1234567890,
      };

      const result = RecipeExtractor.extractFromEvernoteNote(note);
      expect(result).toBeNull();
    });

    it('should extract recipe from plain text content', () => {
      const note: EvernoteNote = {
        guid: 'test-note-3',
        title: 'Pasta Recipe',
        content: `
          Ingredients:
          - 1 pound pasta
          - 2 cups tomato sauce
          - 1/2 cup parmesan cheese
          
          Instructions:
          1. Boil pasta for 10 minutes
          2. Heat sauce in pan
          3. Combine and serve
          
          Serves 4 people
        `,
        created: 1234567890,
        updated: 1234567890,
      };

      const result = RecipeExtractor.extractFromEvernoteNote(note);

      expect(result).not.toBeNull();
      expect(result!.title).toBe('Pasta Recipe');
      expect(result!.ingredients.length).toBeGreaterThan(0);
      expect(result!.instructions.length).toBeGreaterThan(0);
      expect(result!.servings).toBe(4);
    });

    it('should extract cooking time from content', () => {
      const note: EvernoteNote = {
        guid: 'test-note-4',
        title: 'Slow Cooker Beef Stew',
        content: `
          Ingredients:
          - 2 pounds beef
          - 4 carrots
          
          Instructions:
          1. Brown beef
          2. Cook for 8 hours on low
          
          Serves 6
        `,
        created: 1234567890,
        updated: 1234567890,
      };

      const result = RecipeExtractor.extractFromEvernoteNote(note);

      expect(result).not.toBeNull();
      expect(result!.cookingTime).toBe(8);
    });

    it('should extract difficulty level', () => {
      const note: EvernoteNote = {
        guid: 'test-note-5',
        title: 'Easy Pancakes',
        content: `
          This is an easy recipe for beginners.
          
          Ingredients:
          - 1 cup flour
          
          Instructions:
          1. Mix ingredients
        `,
        created: 1234567890,
        updated: 1234567890,
      };

      const result = RecipeExtractor.extractFromEvernoteNote(note);

      expect(result).not.toBeNull();
      expect(result!.difficulty).toBe('easy');
    });

    it('should extract cuisine type', () => {
      const note: EvernoteNote = {
        guid: 'test-note-6',
        title: 'Italian Pizza',
        content: `
          Traditional Italian pizza recipe
          
          Ingredients:
          - 2 cups flour
          
          Instructions:
          1. Make dough
        `,
        created: 1234567890,
        updated: 1234567890,
      };

      const result = RecipeExtractor.extractFromEvernoteNote(note);

      expect(result).not.toBeNull();
      expect(result!.cuisine).toBe('Italian');
    });

    it('should extract dietary information', () => {
      const note: EvernoteNote = {
        guid: 'test-note-7',
        title: 'Vegan Gluten-Free Brownies',
        content: `
          Vegan and gluten-free brownie recipe
          
          Ingredients:
          - 1 cup almond flour
          
          Instructions:
          1. Mix ingredients
        `,
        created: 1234567890,
        updated: 1234567890,
      };

      const result = RecipeExtractor.extractFromEvernoteNote(note);

      expect(result).not.toBeNull();
      expect(result!.isVegan).toBe(true);
      expect(result!.isGlutenFree).toBe(true);
    });

    it('should extract images from note resources', () => {
      const note: EvernoteNote = {
        guid: 'test-note-8',
        title: 'Recipe with Image',
        content: `
          <en-note>
            <h2>Ingredients:</h2>
            <ul>
              <li>2 cups flour</li>
              <li>1 cup sugar</li>
            </ul>
            <h2>Instructions:</h2>
            <ol>
              <li>Mix flour and sugar</li>
              <li>Bake at 350°F</li>
            </ol>
          </en-note>
        `,
        created: 1234567890,
        updated: 1234567890,
        resources: [
          {
            guid: 'resource-1',
            noteGuid: 'test-note-8',
            mime: 'image/jpeg',
            width: 800,
            height: 600,
          },
          {
            guid: 'resource-2',
            noteGuid: 'test-note-8',
            mime: 'text/plain',
          },
        ],
      };

      const result = RecipeExtractor.extractFromEvernoteNote(note);

      expect(result).not.toBeNull();
      expect(result!.images).toContain('evernote-resource:resource-1');
      expect(result!.images).not.toContain('evernote-resource:resource-2');
    });

    it('should handle HTML entities in content', () => {
      const note: EvernoteNote = {
        guid: 'test-note-9',
        title: 'Recipe with HTML',
        content: `
          <en-note>
            <h2>Ingredients:</h2>
            <ul>
              <li>2 cups flour&amp;1 cup sugar</li>
            </ul>
            <h2>Instructions:</h2>
            <ol>
              <li>&lt;b&gt;Bake at 350°F&lt;/b&gt;</li>
            </ol>
          </en-note>
        `,
        created: 1234567890,
        updated: 1234567890,
      };

      const result = RecipeExtractor.extractFromEvernoteNote(note);

      expect(result).not.toBeNull();
      expect(result!.ingredients.length).toBeGreaterThan(0);
      expect(result!.instructions.length).toBeGreaterThan(0);
    });
  });
}); 