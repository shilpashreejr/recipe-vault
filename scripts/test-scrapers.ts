import { 
  WebScraper, 
  InstagramScraper, 
  FoodBlogScraper,
  RateLimiter, 
  RateLimitPresets,
  ScrapingErrorHandler,
  RobotsTxtChecker,
  ManualExtractor
} from '../src/lib/extractors';

async function testGeneralScraper() {
  console.log('🧪 Testing General Web Scraper...');
  
  const scraper = new WebScraper();
  const rateLimiter = new RateLimiter(RateLimitPresets.conservative);
  
  try {
    // Test with a simple recipe site
    const testUrl = 'https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/';
    
    console.log(`Testing URL: ${testUrl}`);
    
    await rateLimiter.waitForPermission();
    const recipe = await scraper.scrapeRecipe(testUrl);
    
    console.log('✅ Recipe extracted successfully!');
    console.log(`Title: ${recipe.title}`);
    console.log(`Ingredients: ${recipe.ingredients.length} found`);
    console.log(`Instructions: ${recipe.instructions.length} steps`);
    console.log(`Images: ${recipe.images.length} found`);
    console.log(`Source: ${recipe.source}`);
    
    return recipe;
  } catch (error) {
    console.error('❌ General scraper test failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  } finally {
    await scraper.close();
  }
}

async function testFoodBlogScraper() {
  console.log('\n🍽️  Testing Food Blog Scraper...');
  
  const scraper = new FoodBlogScraper();
  const rateLimiter = new RateLimiter(RateLimitPresets.moderate);
  
  try {
    // Test with a food blog
    const testUrl = 'https://www.simplyrecipes.com/recipes/homemade_pizza/';
    
    console.log(`Testing URL: ${testUrl}`);
    
    await rateLimiter.waitForPermission();
    const recipe = await scraper.scrapeFoodBlogRecipe(testUrl, {
      extractAuthor: true,
      extractTags: true
    });
    
    console.log('✅ Food blog recipe extracted successfully!');
    console.log(`Title: ${recipe.title}`);
    console.log(`Author: ${recipe.author || 'Not found'}`);
    console.log(`Ingredients: ${recipe.ingredients.length} found`);
    console.log(`Instructions: ${recipe.instructions.length} steps`);
    console.log(`Tags: ${recipe.tags?.length || 0} found`);
    
    return recipe;
  } catch (error) {
    console.error('❌ Food blog scraper test failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  } finally {
    await scraper.close();
  }
}

async function testRobotsTxt() {
  console.log('\n🤖 Testing Robots.txt Compliance...');
  
  const checker = new RobotsTxtChecker();
  
  try {
    const testUrl = 'https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/';
    
    console.log(`Checking robots.txt for: ${testUrl}`);
    
    const result = await checker.checkRobotsTxt(testUrl);
    
    if (result.allowed) {
      console.log('✅ URL is allowed by robots.txt');
      if (result.crawlDelay) {
        console.log(`Crawl delay: ${result.crawlDelay}ms`);
      }
    } else {
      console.log('❌ URL is not allowed by robots.txt');
      console.log(`Reason: ${result.reason}`);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Robots.txt test failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

function testManualExtractor() {
  console.log('\n✍️  Testing Manual Extractor...');
  
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
    // Test validation
    const validation = ManualExtractor.validateInput(testInput);
    
    if (validation.isValid) {
      console.log('✅ Manual input validation passed');
      if (validation.warnings.length > 0) {
        console.log('⚠️  Warnings:', validation.warnings);
      }
    } else {
      console.log('❌ Manual input validation failed');
      console.log('Errors:', validation.errors);
      return null;
    }
    
    // Test recipe creation
    const recipe = ManualExtractor.createRecipe(testInput, 'Manual Test');
    
    console.log('✅ Manual recipe created successfully!');
    console.log(`Title: ${recipe.title}`);
    console.log(`Ingredients: ${recipe.ingredients.length} found`);
    console.log(`Instructions: ${recipe.instructions.length} steps`);
    console.log(`Cooking Time: ${recipe.cookingTime}`);
    console.log(`Servings: ${recipe.servings}`);
    
    // Test name suggestion
    const suggestedName = ManualExtractor.suggestRecipeName(testInput.ingredients);
    console.log(`Suggested name: ${suggestedName}`);
    
    return recipe;
  } catch (error) {
    console.error('❌ Manual extractor test failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

function testErrorHandler() {
  console.log('\n🚨 Testing Error Handler...');
  
  // Test different error types
  const testErrors = [
    new Error('net::ERR_CONNECTION_REFUSED'),
    new Error('TimeoutError: Navigation timeout of 30000 ms exceeded'),
    new Error('429 Too Many Requests'),
    new Error('403 Forbidden'),
    new Error('Invalid URL'),
    new Error('Unexpected error')
  ];
  
  testErrors.forEach((error, index) => {
    const scrapingError = ScrapingErrorHandler.parseError(error, 'https://example.com/test');
    console.log(`Error ${index + 1}: ${scrapingError.type}`);
    console.log(`  Message: ${scrapingError.message}`);
    console.log(`  Retryable: ${scrapingError.retryable}`);
    console.log(`  Retry after: ${scrapingError.retryAfter || 'N/A'}ms`);
  });
  
  console.log('✅ Error handler test completed');
}

async function runAllTests() {
  console.log('🚀 Starting Web Scraping Service Tests\n');
  
  // Test error handler first (doesn't require network)
  testErrorHandler();
  
  // Test manual extractor (doesn't require network)
  testManualExtractor();
  
  // Test robots.txt compliance
  await testRobotsTxt();
  
  // Test scrapers (these require network and may fail due to site changes)
  console.log('\n⚠️  Note: The following tests require internet connection and may fail if sites change their structure');
  
  await testGeneralScraper();
  await testFoodBlogScraper();
  
  console.log('\n✅ All tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runAllTests().catch(console.error);
}

export {
  testGeneralScraper,
  testFoodBlogScraper,
  testRobotsTxt,
  testManualExtractor,
  testErrorHandler,
  runAllTests
}; 