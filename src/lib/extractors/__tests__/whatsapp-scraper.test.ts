import { WhatsAppScraper } from '../whatsapp-scraper';

describe('WhatsAppScraper', () => {
  let scraper: WhatsAppScraper;

  beforeEach(() => {
    scraper = new WhatsAppScraper();
  });

  describe('Message Content Cleaning', () => {
    it('should clean forwarded message indicators', () => {
      const content = `Forwarded message
      
      Amazing Pasta Recipe
      
      Ingredients:
      - 200g pasta
      - 2 cups tomato sauce`;
      
      const cleaned = scraper['cleanMessageContent'](content);
      expect(cleaned).not.toContain('Forwarded message');
      expect(cleaned).toContain('Amazing Pasta Recipe');
    });

    it('should clean Spanish forwarded message indicators', () => {
      const content = `Mensaje reenviado
      
      Receta de Pasta
      
      Ingredientes:
      - 200g pasta`;
      
      const cleaned = scraper['cleanMessageContent'](content);
      expect(cleaned).not.toContain('Mensaje reenviado');
      expect(cleaned).toContain('Receta de Pasta');
    });

    it('should clean Portuguese forwarded message indicators', () => {
      const content = `Mensagem encaminhada
      
      Receita de Macarrão
      
      Ingredientes:
      - 200g macarrão`;
      
      const cleaned = scraper['cleanMessageContent'](content);
      expect(cleaned).not.toContain('Mensagem encaminhada');
      expect(cleaned).toContain('Receita de Macarrão');
    });

    it('should clean timestamps and phone numbers', () => {
      const content = `You: 2:30 PM
      +1 555 123 4567
      
      Recipe Title
      
      Ingredients:
      - Item 1`;
      
      const cleaned = scraper['cleanMessageContent'](content);
      expect(cleaned).not.toContain('2:30 PM');
      expect(cleaned).not.toContain('+1 555 123 4567');
      expect(cleaned).not.toContain('You:');
      expect(cleaned).toContain('Recipe Title');
    });
  });

  describe('Recipe Parsing', () => {
    it('should parse complete recipe from message', () => {
      const message = `Amazing Pasta Recipe 🍝
      
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
      
      const recipe = scraper['parseRecipeFromMessage'](message);
      
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

    it('should parse Spanish recipe', () => {
      const message = `Receta de Pasta
      
      Ingredientes:
      - 200g pasta
      - 2 tazas salsa de tomate
      
      Instrucciones:
      1. Hervir pasta
      2. Agregar salsa
      
      Para 2 personas
      Tiempo de cocina: 15 minutos`;
      
      const recipe = scraper['parseRecipeFromMessage'](message);
      
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

    it('should parse Portuguese recipe', () => {
      const message = `Receita de Macarrão
      
      Ingredientes:
      - 200g macarrão
      - 2 xícaras molho de tomate
      
      Instruções:
      1. Cozinhar macarrão
      2. Adicionar molho
      
      Para 2 pessoas
      Tempo de cozinhar: 15 minutos`;
      
      const recipe = scraper['parseRecipeFromMessage'](message);
      
      expect(recipe.title).toBe('Receita de Macarrão');
      expect(recipe.ingredients).toEqual([
        '200g macarrão',
        '2 xícaras molho de tomate'
      ]);
      expect(recipe.instructions).toEqual([
        'Cozinhar macarrão',
        'Adicionar molho'
      ]);
      expect(recipe.servings).toBe(2);
      expect(recipe.cookingTime).toBe('15 minutos');
    });

    it('should extract emoji tags', () => {
      const message = `Pizza Recipe 🍕
      
      Ingredients:
      - Dough 🍞
      - Cheese 🧀
      - Tomato sauce 🍅
      
      Instructions:
      1. Make dough
      2. Add toppings
      3. Bake 🍕
      
      #pizza #homemade`;
      
      const recipe = scraper['parseRecipeFromMessage'](message);
      
      expect(recipe.tags).toContain('pizza');
      expect(recipe.tags).toContain('bread');
      expect(recipe.tags).toContain('tomato');
      expect(recipe.tags).toContain('homemade');
    });

    it('should extract dietary restrictions', () => {
      const message = `Vegetarian Pasta Recipe
      
      This is a gluten-free, dairy-free recipe
      
      Ingredients:
      - Gluten-free pasta
      - Dairy-free cheese
      
      Instructions:
      1. Cook pasta
      2. Add cheese
      
      #vegetarian #glutenfree #dairyfree`;
      
      const recipe = scraper['parseRecipeFromMessage'](message);
      
      expect(recipe.dietaryRestrictions).toContain('vegetarian');
      expect(recipe.dietaryRestrictions).toContain('gluten-free');
      expect(recipe.dietaryRestrictions).toContain('dairy-free');
    });
  });

  describe('Error Handling', () => {
    it('should throw error for empty message content', async () => {
      await expect(scraper.scrapeWhatsAppRecipe('')).rejects.toThrow('Empty WhatsApp message content');
    });

    it('should throw error for whitespace-only content', async () => {
      await expect(scraper.scrapeWhatsAppRecipe('   ')).rejects.toThrow('Empty WhatsApp message content');
    });

    it('should throw error for insufficient recipe data', async () => {
      await expect(scraper.scrapeWhatsAppRecipe('Just a regular message with no recipe')).rejects.toThrow('Insufficient recipe data found in WhatsApp message');
    });

    it('should accept valid recipe message', async () => {
      const message = `Test Recipe
      
      Ingredients:
      - Item 1
      - Item 2
      
      Instructions:
      1. Step 1
      2. Step 2`;
      
      const result = await scraper.scrapeWhatsAppRecipe(message, {
        sender: 'Test User',
        isForwarded: false
      });
      
      expect(result.title).toBe('Test Recipe');
      expect(result.ingredients).toHaveLength(2);
      expect(result.instructions).toHaveLength(2);
      expect(result.sourceType).toBe('whatsapp');
      expect(result.metadata.sender).toBe('Test User');
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

  describe('Message ID Generation', () => {
    it('should generate unique message IDs', () => {
      const id1 = scraper['generateMessageId']();
      const id2 = scraper['generateMessageId']();
      
      expect(id1).toMatch(/^whatsapp_\d+_[a-z0-9]{9}$/);
      expect(id2).toMatch(/^whatsapp_\d+_[a-z0-9]{9}$/);
      expect(id1).not.toBe(id2);
    });
  });
}); 