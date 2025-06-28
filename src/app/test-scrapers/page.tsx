'use client';

import { useState } from 'react';

export default function TestScrapersPage() {
  const [url, setUrl] = useState('');
  const [testType, setTestType] = useState('general');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runTest = async () => {
    if (!url && testType !== 'manual') {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/test-scrapers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testType, url }),
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Test failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">🧪 Web Scraping Service Test</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Configuration</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Test Type</label>
            <select
              value={testType}
              onChange={(e) => setTestType(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="general">General Web Scraper</option>
              <option value="food-blog">Food Blog Scraper</option>
              <option value="manual">Manual Extractor</option>
            </select>
          </div>

          {testType !== 'manual' && (
            <div>
              <label className="block text-sm font-medium mb-2">Recipe URL</label>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/recipe"
                className="w-full p-2 border border-gray-300 rounded-md"
              />
            </div>
          )}

          <button
            onClick={runTest}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Running Test...' : 'Run Test'}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <h3 className="text-red-800 font-semibold">Error</h3>
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-green-800 font-semibold text-lg mb-4">✅ Test Results</h3>
          
          {testType === 'manual' && result.validation && (
            <div className="mb-4">
              <h4 className="font-semibold mb-2">Validation Results:</h4>
              <div className="text-sm">
                <p>Valid: {result.validation.isValid ? '✅ Yes' : '❌ No'}</p>
                {result.validation.errors.length > 0 && (
                  <div>
                    <p className="font-medium text-red-600">Errors:</p>
                    <ul className="list-disc list-inside text-red-600">
                      {result.validation.errors.map((error: string, index: number) => (
                        <li key={index}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {result.validation.warnings.length > 0 && (
                  <div>
                    <p className="font-medium text-yellow-600">Warnings:</p>
                    <ul className="list-disc list-inside text-yellow-600">
                      {result.validation.warnings.map((warning: string, index: number) => (
                        <li key={index}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}

          {result.recipe && (
            <div className="space-y-4">
              <div>
                <h4 className="font-semibold">Recipe Title:</h4>
                <p className="text-lg">{result.recipe.title}</p>
              </div>

              {result.recipe.author && (
                <div>
                  <h4 className="font-semibold">Author:</h4>
                  <p>{result.recipe.author}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold">Ingredients ({result.recipe.ingredients.length}):</h4>
                <ul className="list-disc list-inside space-y-1">
                  {result.recipe.ingredients.map((ingredient: string, index: number) => (
                    <li key={index}>{ingredient}</li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold">Instructions ({result.recipe.instructions.length} steps):</h4>
                <ol className="list-decimal list-inside space-y-1">
                  {result.recipe.instructions.map((instruction: string, index: number) => (
                    <li key={index}>{instruction}</li>
                  ))}
                </ol>
              </div>

              {result.recipe.cookingTime && (
                <div>
                  <h4 className="font-semibold">Cooking Time:</h4>
                  <p>{result.recipe.cookingTime}</p>
                </div>
              )}

              {result.recipe.servings && (
                <div>
                  <h4 className="font-semibold">Servings:</h4>
                  <p>{result.recipe.servings}</p>
                </div>
              )}

              {result.recipe.tags && result.recipe.tags.length > 0 && (
                <div>
                  <h4 className="font-semibold">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.recipe.tags.map((tag: string, index: number) => (
                      <span key={index} className="bg-gray-200 px-2 py-1 rounded text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.recipe.images && result.recipe.images.length > 0 && (
                <div>
                  <h4 className="font-semibold">Images ({result.recipe.images.length}):</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {result.recipe.images.slice(0, 6).map((image: string, index: number) => (
                      <img
                        key={index}
                        src={image}
                        alt={`Recipe image ${index + 1}`}
                        className="w-full h-24 object-cover rounded"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {result.suggestedName && (
                <div>
                  <h4 className="font-semibold">Suggested Name:</h4>
                  <p>{result.suggestedName}</p>
                </div>
              )}

              <div>
                <h4 className="font-semibold">Source:</h4>
                <p className="text-sm text-gray-600">{result.recipe.source}</p>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="font-semibold mb-4">Test URLs to Try:</h3>
        <div className="space-y-2 text-sm">
          <p><strong>General Scraper:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-blue-600">
            <li>https://www.allrecipes.com/recipe/10813/best-chocolate-chip-cookies/</li>
            <li>https://www.foodnetwork.com/recipes/food-network-kitchen/pancakes-recipe-1913844</li>
          </ul>
          <p><strong>Food Blog Scraper:</strong></p>
          <ul className="list-disc list-inside space-y-1 text-blue-600">
            <li>https://www.simplyrecipes.com/recipes/homemade_pizza/</li>
            <li>https://www.loveandlemons.com/vegan-pasta/</li>
          </ul>
        </div>
      </div>
    </div>
  );
} 