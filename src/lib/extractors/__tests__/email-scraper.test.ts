import { EmailScraper } from '../email-scraper';

describe('EmailScraper', () => {
  let scraper: EmailScraper;

  beforeEach(() => {
    scraper = new EmailScraper();
  });

  describe('Email Content Cleaning', () => {
    it('should clean email headers', () => {
      const content = `From: sender@example.com
To: recipient@example.com
Subject: Amazing Recipe
Date: Mon, 1 Jan 2024 12:00:00 +0000

Amazing Pasta Recipe

Ingredients:
- 200g pasta
- 2 cups tomato sauce`;
      
      const cleaned = scraper['cleanEmailContent'](content);
      expect(cleaned).not.toContain('From: sender@example.com');
      expect(cleaned).not.toContain('To: recipient@example.com');
      expect(cleaned).not.toContain('Subject: Amazing Recipe');
      expect(cleaned).not.toContain('Date: Mon, 1 Jan 2024 12:00:00 +0000');
      expect(cleaned).toContain('Amazing Pasta Recipe');
    });

    it('should clean forwarded email indicators', () => {
      const content = `Forwarded message
Begin forwarded message:
From: original@example.com
Sent: Monday, January 1, 2024
To: forwarder@example.com
Subject: Original Recipe

Amazing Pasta Recipe

Ingredients:
- 200g pasta`;
      
      const cleaned = scraper['cleanEmailContent'](content);
      expect(cleaned).not.toContain('Forwarded message');
      expect(cleaned).not.toContain('Begin forwarded message:');
      expect(cleaned).not.toContain('From: original@example.com');
      expect(cleaned).not.toContain('Sent: Monday, January 1, 2024');
      expect(cleaned).toContain('Amazing Pasta Recipe');
    });

    it('should clean email signatures', () => {
      const content = `Amazing Pasta Recipe

Ingredients:
- 200g pasta

Instructions:
1. Cook pasta

Best regards,
John Doe
Chef at Restaurant

--
Sent from my iPhone`;
      
      const cleaned = scraper['cleanEmailContent'](content);
      expect(cleaned).not.toContain('Best regards,');
      expect(cleaned).not.toContain('John Doe');
      expect(cleaned).not.toContain('Chef at Restaurant');
      expect(cleaned).not.toContain('Sent from my iPhone');
      expect(cleaned).toContain('Amazing Pasta Recipe');
    });

    it('should clean quoted text', () => {
      const content = `Amazing Pasta Recipe

Ingredients:
- 200g pasta

> This is a quoted reply
> from the original email

Instructions:
1. Cook pasta`;
      
      const cleaned = scraper['cleanEmailContent'](content);
      expect(cleaned).not.toContain('> This is a quoted reply');
      expect(cleaned).not.toContain('> from the original email');
      expect(cleaned).toContain('Amazing Pasta Recipe');
      expect(cleaned).toContain('Instructions:');
    });
  });

  describe('Recipe Parsing', () => {
    it('should parse complete recipe from email', () => {
      const email = `Amazing Pasta Recipe 🍝
      
      Ingredients:
      - 200g pasta
      - 2 cups tomato sauce
      - 1 onion
      - 2 cloves garlic
      
      Instructions:
      1. Boil pasta for 10 minutes
      2. Saute onion and garlic
      3. Add tomato sauce
      4. Mix with pasta
      
      Serves 4 people
      Cooking time: 20 minutes
      
      #pasta #recipe #cooking`;
      
      const recipe = scraper['parseRecipeFromEmail'](email);
      
      expect(recipe.title).toBe('Amazing Pasta Recipe 🍝');
      expect(recipe.ingredients).toEqual([
        '200g pasta',
        '2 cups tomato sauce',
        '1 onion',
        '2 cloves garlic'
      ]);
      expect(recipe.instructions).toEqual([
        'Boil pasta for 10 minutes',
        'Saute onion and garlic',
        'Add tomato sauce',
        'Mix with pasta'
      ]);
      expect(recipe.servings).toBe(4);
      expect(recipe.cookingTime).toBe('20 minutes');
      expect(recipe.tags).toContain('pasta');
      expect(recipe.tags).toContain('recipe');
      expect(recipe.tags).toContain('cooking');
      expect(recipe.difficulty).toBe('Medium');
    });

    it('should parse recipe with alternative section headers', () => {
      const email = `Chocolate Cake Recipe
      
      What you'll need:
      - 2 cups flour
      - 1 cup sugar
      - 3 eggs
      
      Method:
      1. Mix dry ingredients
      2. Add wet ingredients
      3. Bake for 30 minutes
      
      Makes 8 servings
      Prep time: 15 minutes`;
      
      const recipe = scraper['parseRecipeFromEmail'](email);
      
      expect(recipe.title).toBe('Chocolate Cake Recipe');
      expect(recipe.ingredients).toEqual([
        '2 cups flour',
        '1 cup sugar',
        '3 eggs'
      ]);
      expect(recipe.instructions).toEqual([
        'Mix dry ingredients',
        'Add wet ingredients',
        'Bake for 30 minutes'
      ]);
      expect(recipe.servings).toBe(8);
      expect(recipe.cookingTime).toBe('15 minutes');
    });

    it('should parse recipe with Spanish headers', () => {
      const email = `Receta de Pasta
      
      Ingredientes:
      - 200g pasta
      - 2 tazas salsa de tomate
      
      Instrucciones:
      1. Hervir pasta
      2. Agregar salsa
      
      Para 2 personas
      Tiempo de cocina: 15 minutos`;
      
      const recipe = scraper['parseRecipeFromEmail'](email);
      
      expect(recipe.title).toBe('Receta de Pasta');
      expect(recipe.ingredients).toEqual([
        '200g pasta',
        '2 tazas salsa de tomate'
      ]);
      expect(recipe.instructions).toEqual([
        'Hervir pasta',
        'Agregar salsa'
      ]);
      expect(recipe.servings).toBe(2);
      expect(recipe.cookingTime).toBe('15 minutos');
    });

    it('should extract dietary restrictions', () => {
      const email = `Vegetarian Pasta Recipe
      
      This is a gluten-free, dairy-free recipe
      
      Ingredients:
      - Gluten-free pasta
      - Dairy-free cheese
      
      Instructions:
      1. Cook pasta
      2. Add cheese
      
      #vegetarian #glutenfree #dairyfree`;
      
      const recipe = scraper['parseRecipeFromEmail'](email);
      
      expect(recipe.dietaryRestrictions).toContain('vegetarian');
      expect(recipe.dietaryRestrictions).toContain('gluten-free');
      expect(recipe.dietaryRestrictions).toContain('dairy-free');
    });

    it('should extract recipe keywords as tags', () => {
      const email = `Breakfast Pancakes Recipe
      
      Ingredients:
      - 2 cups flour
      - 1 cup milk
      
      Instructions:
      1. Mix ingredients
      2. Cook on griddle
      
      Perfect for breakfast or brunch!`;
      
      const recipe = scraper['parseRecipeFromEmail'](email);
      
      expect(recipe.tags).toContain('recipe');
      expect(recipe.tags).toContain('breakfast');
      expect(recipe.tags).toContain('food');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for empty email content', async () => {
      await expect(scraper.scrapeEmailRecipe('')).rejects.toThrow('Empty email content');
    });

    it('should throw error for whitespace-only content', async () => {
      await expect(scraper.scrapeEmailRecipe('   ')).rejects.toThrow('Empty email content');
    });

    it('should throw error for insufficient recipe data', async () => {
      await expect(scraper.scrapeEmailRecipe('Just a regular email with no recipe')).rejects.toThrow('Insufficient recipe data found in email');
    });

    it('should accept valid recipe email', async () => {
      const email = `Test Recipe
      
      Ingredients:
      - Item 1
      - Item 2
      
      Instructions:
      1. Step 1
      2. Step 2`;
      
      const result = await scraper.scrapeEmailRecipe(email, {
        sender: 'test@example.com',
        subject: 'Recipe Email',
        isForwarded: false
      });
      
      expect(result.title).toBe('Test Recipe');
      expect(result.ingredients).toHaveLength(2);
      expect(result.instructions).toHaveLength(2);
      expect(result.sourceType).toBe('email');
      expect(result.metadata.sender).toBe('test@example.com');
      expect(result.metadata.subject).toBe('Recipe Email');
      expect(result.metadata.isForwarded).toBe(false);
    });
  });

  describe('Difficulty Estimation', () => {
    it('should estimate difficulty correctly', () => {
      expect(scraper['estimateDifficulty'](2, 3)).toBe('Easy');
      expect(scraper['estimateDifficulty'](5, 5)).toBe('Medium');
      expect(scraper['estimateDifficulty'](8, 7)).toBe('Hard');
    });
  });

  describe('Email ID Generation', () => {
    it('should generate unique email IDs', () => {
      const id1 = scraper['generateEmailId']();
      const id2 = scraper['generateEmailId']();
      
      expect(id1).toMatch(/^email_\d+_[a-z0-9]{9}$/);
      expect(id2).toMatch(/^email_\d+_[a-z0-9]{9}$/);
      expect(id1).not.toBe(id2);
    });
  });
}); 