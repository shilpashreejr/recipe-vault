import { RecipeParser, ParsedRecipeData } from '../recipe-parser';

describe('RecipeParser', () => {
  describe('parseRecipe', () => {
    it('should parse a complete recipe with all fields', () => {
      const rawText = `
        Classic Spaghetti Carbonara
        
        A traditional Italian pasta dish with eggs, cheese, and pancetta.
        
        Ingredients:
        - 1 pound spaghetti
        - 4 large eggs
        - 1 cup grated Pecorino Romano cheese
        - 4 ounces pancetta, diced
        - 4 cloves garlic, minced
        - Salt and black pepper to taste
        - 1/4 cup reserved pasta water
        
        Instructions:
        1. Bring a large pot of salted water to boil and cook spaghetti according to package directions.
        2. In a large skillet, cook pancetta over medium heat until crispy, about 8 minutes.
        3. Add garlic and cook for 1 minute until fragrant.
        4. In a bowl, whisk together eggs, cheese, and black pepper.
        5. Drain pasta, reserving 1/4 cup of pasta water.
        6. Add hot pasta to skillet with pancetta and toss to combine.
        7. Remove from heat and quickly stir in egg mixture, adding pasta water as needed.
        8. Serve immediately with extra cheese and black pepper.
        
        Prep time: 10 minutes
        Cook time: 20 minutes
        Serves 4 people
        Difficulty: Medium
        Calories: 450 per serving
        Protein: 25g
        Carbs: 45g
        Fat: 18g
      `;

      const result = RecipeParser.parseRecipe(rawText);

      expect(result.title).toBe('Classic Spaghetti Carbonara');
      expect(result.description).toBe('A traditional Italian pasta dish with eggs, cheese, and pancetta.');
      expect(result.ingredients).toHaveLength(7);
      expect(result.ingredients[0]).toEqual({
        quantity: '1',
        unit: 'pound',
        name: 'spaghetti'
      });
      expect(result.instructions).toHaveLength(8);
      expect(result.prepTime).toBe(10);
      expect(result.cookTime).toBe(20);
      expect(result.servings).toBe(4);
      expect(result.difficulty).toBe('medium');
      expect(result.cuisineType).toBe('Italian');
      expect(result.dietaryTags).toContain('vegetarian');
      expect(result.macros).toEqual({
        calories: 450,
        protein: 25,
        carbs: 45,
        fat: 18
      });
      expect(result.categories).toContain('Dinner');
    });

    it('should parse recipe with minimal information', () => {
      const rawText = `
        Simple Toast
        
        Ingredients:
        - 2 slices bread
        - 1 tablespoon butter
        
        Instructions:
        1. Toast bread until golden brown
        2. Spread butter on toast
        3. Serve hot
      `;

      const result = RecipeParser.parseRecipe(rawText);

      expect(result.title).toBe('Simple Toast');
      expect(result.ingredients).toHaveLength(2);
      expect(result.instructions).toHaveLength(3);
      expect(result.dietaryTags).toContain('vegetarian');
      expect(result.categories).toContain('Breakfast');
    });

    it('should detect dietary restrictions correctly', () => {
      const rawText = `
        Vegan Chocolate Cake
        
        Ingredients:
        - 2 cups all-purpose flour
        - 1 cup sugar
        - 1/2 cup cocoa powder
        - 1/2 cup vegetable oil
        - 1 cup almond milk
        - 1 teaspoon vanilla extract
        
        Instructions:
        1. Mix dry ingredients
        2. Add wet ingredients
        3. Bake at 350°F for 30 minutes
      `;

      const result = RecipeParser.parseRecipe(rawText);

      expect(result.dietaryTags).toContain('vegan');
      expect(result.dietaryTags).toContain('vegetarian');
      expect(result.categories).toContain('Dessert');
    });

    it('should parse ingredients with various formats', () => {
      const rawText = `
        Test Recipe
        
        Ingredients:
        - 2 cups flour
        - 1/2 cup sugar
        - 3 large eggs
        - 1/4 teaspoon salt
        - 2 tablespoons olive oil
        - 1-2 cloves garlic
        - 1 to 2 cups milk
        - Fresh basil leaves
        - Salt and pepper to taste
        
        Instructions:
        1. Mix ingredients
        2. Cook
      `;

      const result = RecipeParser.parseRecipe(rawText);

      expect(result.ingredients).toHaveLength(9);
      expect(result.ingredients[0]).toEqual({
        quantity: '2',
        unit: 'cup',
        name: 'flour'
      });
      expect(result.ingredients[1]).toEqual({
        quantity: '0.50',
        unit: 'cup',
        name: 'sugar'
      });
      expect(result.ingredients[5]).toEqual({
        quantity: '1.50',
        unit: 'clove',
        name: 'garlic'
      });
      expect(result.ingredients[6]).toEqual({
        quantity: '1.50',
        unit: 'cup',
        name: 'milk'
      });
    });

    it('should extract cooking times correctly', () => {
      const rawText = `
        Slow Cooker Beef Stew
        
        Prep time: 15 minutes
        Cook time: 8 hours
        
        Ingredients:
        - 2 pounds beef chuck
        
        Instructions:
        1. Cook beef for 8 hours
      `;

      const result = RecipeParser.parseRecipe(rawText);

      expect(result.prepTime).toBe(15);
      expect(result.cookTime).toBe(480); // 8 hours in minutes
    });

    it('should categorize recipes based on content', () => {
      const breakfastText = `
        Blueberry Pancakes
        
        Ingredients:
        - 2 cups flour
        - 1 cup milk
        - 1 cup blueberries
        
        Instructions:
        1. Make pancakes
      `;

      const dessertText = `
        Chocolate Cake
        
        Ingredients:
        - 2 cups flour
        - 1 cup sugar
        
        Instructions:
        1. Bake cake
      `;

      const breakfastResult = RecipeParser.parseRecipe(breakfastText);
      const dessertResult = RecipeParser.parseRecipe(dessertText);

      expect(breakfastResult.categories).toContain('Breakfast');
      expect(dessertResult.categories).toContain('Dessert');
    });

    it('should handle edge cases gracefully', () => {
      const emptyText = '';
      const minimalText = 'Recipe';

      const emptyResult = RecipeParser.parseRecipe(emptyText);
      const minimalResult = RecipeParser.parseRecipe(minimalText);

      expect(emptyResult.title).toBe('Untitled Recipe');
      expect(minimalResult.title).toBe('Recipe');
      expect(emptyResult.ingredients).toHaveLength(0);
      expect(emptyResult.instructions).toHaveLength(0);
    });

    it('should respect parsing options', () => {
      const rawText = `
        Test Recipe
        
        Ingredients:
        - 2 cups flour
        
        Instructions:
        1. Mix flour
        
        Calories: 200
        Protein: 5g
      `;

      const resultWithNutrition = RecipeParser.parseRecipe(rawText, { extractNutrition: true });
      const resultWithoutNutrition = RecipeParser.parseRecipe(rawText, { extractNutrition: false });

      expect(resultWithNutrition.macros).toBeDefined();
      expect(resultWithoutNutrition.macros).toBeUndefined();
    });
  });

  describe('parseIngredients', () => {
    it('should parse ingredients with various quantity formats', () => {
      const ingredientsText = `
        Ingredients:
        - 1/2 cup sugar
        - 2 tablespoons olive oil
        - 3 large eggs
        - 1/4 teaspoon salt
        - 1-2 cloves garlic
        - Fresh basil
        - Salt and pepper to taste
      `;

      const result = RecipeParser.parseRecipe(ingredientsText);
      
      expect(result.ingredients).toHaveLength(7);
      expect(result.ingredients[0].quantity).toBe('0.50');
      expect(result.ingredients[4].quantity).toBe('1.50');
      expect(result.ingredients[5].quantity).toBe('1');
      expect(result.ingredients[5].name).toBe('fresh basil');
    });
  });

  describe('parseInstructions', () => {
    it('should parse numbered instructions', () => {
      const instructionsText = `
        Instructions:
        1. Preheat oven to 350°F
        2. Mix ingredients in a bowl
        3. Pour into pan
        4. Bake for 30 minutes
      `;

      const result = RecipeParser.parseRecipe(instructionsText);
      
      expect(result.instructions).toHaveLength(4);
      expect(result.instructions[0]).toBe('Preheat oven to 350°F');
      expect(result.instructions[3]).toBe('Bake for 30 minutes');
    });

    it('should parse bulleted instructions', () => {
      const instructionsText = `
        Instructions:
        • Preheat oven to 350°F
        • Mix ingredients in a bowl
        • Pour into pan
        • Bake for 30 minutes
      `;

      const result = RecipeParser.parseRecipe(instructionsText);
      
      expect(result.instructions).toHaveLength(4);
      expect(result.instructions[0]).toBe('Preheat oven to 350°F');
    });
  });

  describe('dietary restrictions detection', () => {
    it('should detect vegetarian recipes', () => {
      const vegetarianText = `
        Vegetarian Pasta
        
        Ingredients:
        - 2 cups pasta
        - 1 cup tomato sauce
        - 1/2 cup cheese
      `;

      const result = RecipeParser.parseRecipe(vegetarianText);
      expect(result.dietaryTags).toContain('vegetarian');
    });

    it('should detect vegan recipes', () => {
      const veganText = `
        Vegan Smoothie
        
        Ingredients:
        - 1 cup almond milk
        - 1 banana
        - 1 cup berries
      `;

      const result = RecipeParser.parseRecipe(veganText);
      expect(result.dietaryTags).toContain('vegan');
    });

    it('should detect gluten-free recipes', () => {
      const glutenFreeText = `
        Gluten-Free Brownies
        
        Ingredients:
        - 2 cups almond flour
        - 1 cup sugar
      `;

      const result = RecipeParser.parseRecipe(glutenFreeText);
      expect(result.dietaryTags).toContain('gluten-free');
    });
  });

  describe('nutritional information extraction', () => {
    it('should extract macros from text', () => {
      const nutritionText = `
        Recipe
        
        Ingredients:
        - 1 cup flour
        
        Instructions:
        1. Mix
        
        Calories: 250 per serving
        Protein: 8g
        Carbs: 45g
        Fat: 5g
        Fiber: 3g
        Sugar: 12g
        Sodium: 300mg
      `;

      const result = RecipeParser.parseRecipe(nutritionText);
      
      expect(result.macros).toEqual({
        calories: 250,
        protein: 8,
        carbs: 45,
        fat: 5,
        fiber: 3,
        sugar: 12,
        sodium: 300
      });
    });
  });

  describe('recipe categorization', () => {
    it('should categorize breakfast recipes', () => {
      const breakfastText = `
        Breakfast Omelette
        
        Ingredients:
        - 3 eggs
        - 1/4 cup cheese
      `;

      const result = RecipeParser.parseRecipe(breakfastText);
      expect(result.categories).toContain('Breakfast');
    });

    it('should categorize dessert recipes', () => {
      const dessertText = `
        Chocolate Cake
        
        Ingredients:
        - 2 cups flour
        - 1 cup sugar
      `;

      const result = RecipeParser.parseRecipe(dessertText);
      expect(result.categories).toContain('Dessert');
    });

    it('should categorize soup recipes', () => {
      const soupText = `
        Chicken Soup
        
        Ingredients:
        - 1 chicken
        - 2 carrots
        - 1 onion
      `;

      const result = RecipeParser.parseRecipe(soupText);
      expect(result.categories).toContain('Soups & Stews');
    });
  });
}); 