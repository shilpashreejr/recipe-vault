import { RecipeParser } from '../recipe-parser';

describe('Debug RecipeParser', () => {
  it('should debug ingredient parsing', () => {
    const rawText = `
      Test Recipe
      
      Ingredients:
      - 2 cups flour
      - 1/2 cup sugar
      
      Instructions:
      1. Mix ingredients
    `;

    const result = RecipeParser.parseRecipe(rawText);
    console.log('Result:', JSON.stringify(result, null, 2));
    
    expect(result.ingredients).toHaveLength(2);
  });

  it('should debug instruction parsing', () => {
    const rawText = `
      Test Recipe
      
      Ingredients:
      - 1 cup flour
      
      Instructions:
      1. Preheat oven to 350°F
      2. Mix ingredients in a bowl
      3. Pour into pan
      4. Bake for 30 minutes
    `;

    const result = RecipeParser.parseRecipe(rawText);
    console.log('Instructions:', result.instructions);
    
    expect(result.instructions).toHaveLength(4);
  });

  it('should debug time extraction', () => {
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
    console.log('Prep time:', result.prepTime);
    console.log('Cook time:', result.cookTime);
    
    expect(result.prepTime).toBe(15);
    expect(result.cookTime).toBe(480);
  });

  it('should debug single ingredient parsing', () => {
    const rawText = `
      Test Recipe
      
      Ingredients:
      - 2 cups flour
      
      Instructions:
      1. Mix
    `;

    const result = RecipeParser.parseRecipe(rawText);
    console.log('First ingredient:', JSON.stringify(result.ingredients[0], null, 2));
    
    expect(result.ingredients[0]).toEqual({
      quantity: '2',
      unit: 'cup',
      name: 'flour'
    });
  });
}); 