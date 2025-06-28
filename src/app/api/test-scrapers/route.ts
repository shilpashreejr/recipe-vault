import { NextRequest, NextResponse } from 'next/server';
import { 
  WebScraper, 
  FoodBlogScraper,
  RateLimiter, 
  RateLimitPresets,
  ManualExtractor
} from '@/lib/extractors';

export async function POST(request: NextRequest) {
  try {
    const { testType, url } = await request.json();

    switch (testType) {
      case 'general':
        return await testGeneralScraper(url);
      case 'food-blog':
        return await testFoodBlogScraper(url);
      case 'manual':
        return await testManualExtractor();
      default:
        return NextResponse.json({ error: 'Invalid test type' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json(
      { error: 'Test failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function testGeneralScraper(url: string) {
  const scraper = new WebScraper();
  const rateLimiter = new RateLimiter(RateLimitPresets.conservative);
  
  try {
    await rateLimiter.waitForPermission();
    const recipe = await scraper.scrapeRecipe(url);
    
    return NextResponse.json({
      success: true,
      recipe: {
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        images: recipe.images,
        source: recipe.source
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await scraper.close();
  }
}

async function testFoodBlogScraper(url: string) {
  const scraper = new FoodBlogScraper();
  const rateLimiter = new RateLimiter(RateLimitPresets.moderate);
  
  try {
    await rateLimiter.waitForPermission();
    const recipe = await scraper.scrapeFoodBlogRecipe(url, {
      extractAuthor: true,
      extractTags: true
    });
    
    return NextResponse.json({
      success: true,
      recipe: {
        title: recipe.title,
        author: recipe.author,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        tags: recipe.tags,
        images: recipe.images,
        source: recipe.source
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  } finally {
    await scraper.close();
  }
}

function testManualExtractor() {
  const testInput = {
    title: 'Chocolate Chip Cookies',
    ingredients: [
      '2 cups all-purpose flour',
      '1 cup butter, softened',
      '1 cup white sugar',
      '2 eggs',
      '1 tsp vanilla extract',
      '1 tsp baking soda',
      '1/2 tsp salt',
      '2 cups chocolate chips'
    ],
    instructions: [
      'Preheat oven to 375°F (190°C)',
      'Cream together butter and sugar until smooth',
      'Beat in eggs and vanilla',
      'Mix in flour, baking soda, and salt',
      'Stir in chocolate chips',
      'Drop by rounded tablespoons onto ungreased baking sheets',
      'Bake for 10 minutes or until golden brown'
    ],
    cookingTime: '30 minutes',
    servings: '4 dozen cookies',
    difficulty: 'Easy'
  };
  
  try {
    const validation = ManualExtractor.validateInput(testInput);
    const recipe = ManualExtractor.createRecipe(testInput, 'Manual Test');
    const suggestedName = ManualExtractor.suggestRecipeName(testInput.ingredients);
    
    return NextResponse.json({
      success: true,
      validation,
      recipe: {
        title: recipe.title,
        ingredients: recipe.ingredients,
        instructions: recipe.instructions,
        cookingTime: recipe.cookingTime,
        servings: recipe.servings,
        source: recipe.source
      },
      suggestedName
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 