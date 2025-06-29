import { NextRequest, NextResponse } from 'next/server';
import { AppleNotesParser } from '@/lib/apple-notes/apple-notes-parser';
import { AppleNotesHtmlParser } from '@/lib/apple-notes/html-parser';
import { AppleNotesMetadataPreservation } from '@/lib/apple-notes/metadata-preservation';
import { AppleNotesFolderParser } from '@/lib/apple-notes/folder-parser';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;
    const options = JSON.parse(formData.get('options') as string || '{}');

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size (max 50MB)
    const maxSize = 50 * 1024 * 1024; // 50MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 50MB.' },
        { status: 400 }
      );
    }

    // Read file content
    const fileContent = await file.text();
    const fileName = file.name;
    const fileSize = file.size;

    // Validate Apple Notes export format
    const validation = AppleNotesParser.validateExport(fileContent);
    if (!validation.isValid) {
      return NextResponse.json(
        { error: validation.error || 'Invalid Apple Notes export file' },
        { status: 400 }
      );
    }

    // Parse the export file
    let notes, folderStructure;
    
    if (validation.format === 'html') {
      const htmlStructure = await AppleNotesHtmlParser.parseHtmlExport(fileContent);
      notes = htmlStructure.notes;
      folderStructure = AppleNotesFolderParser.parseFolderStructure(notes);
    } else if (validation.format === 'txt') {
      const txtStructure = await AppleNotesParser.parseTxtExport(fileContent);
      notes = txtStructure.notes;
      folderStructure = AppleNotesFolderParser.parseFolderStructure(notes);
    } else {
      return NextResponse.json(
        { error: 'Unsupported file format' },
        { status: 400 }
      );
    }

    // Preserve metadata
    const exportMetadata = await AppleNotesMetadataPreservation.preserveMetadata(
      notes,
      folderStructure,
      fileName,
      fileSize,
      validation.format as 'html' | 'txt',
      options.metadata || {}
    );

    // Extract recipes from notes
    const recipes = await extractRecipesFromNotes(notes, options);

    return NextResponse.json({
      success: true,
      data: {
        notes: notes.length,
        folders: folderStructure.totalFolders,
        format: validation.format,
        metadata: exportMetadata,
        recipes
      },
      extractedAt: new Date()
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return NextResponse.json(
      { error: `Failed to process Apple Notes export: ${errorMessage}` },
      { status: 500 }
    );
  }
}

async function extractRecipesFromNotes(notes: any[], options: any = {}) {
  const recipes = [];
  
  for (const note of notes) {
    try {
      // Check if note contains recipe-like content
      if (isRecipeNote(note)) {
        const recipe = await parseRecipeFromNote(note, options);
        if (recipe) {
          recipes.push({
            ...recipe,
            noteId: note.id,
            folder: note.folder,
            metadata: {
              created: note.created,
              modified: note.modified,
              tags: note.tags,
              isPinned: note.isPinned,
              isLocked: note.isLocked
            }
          });
        }
      }
    } catch (error) {
      console.error(`Failed to extract recipe from note ${note.id}:`, error);
    }
  }
  
  return recipes;
}

function isRecipeNote(note: any): boolean {
  const content = (note.content || '').toLowerCase();
  const title = (note.title || '').toLowerCase();
  
  // Recipe indicators
  const recipeKeywords = [
    'recipe', 'ingredients', 'instructions', 'directions', 'prep time', 'cook time',
    'servings', 'cups', 'tablespoons', 'teaspoons', 'ounces', 'pounds', 'grams',
    'preheat', 'bake', 'cook', 'simmer', 'boil', 'fry', 'grill', 'roast'
  ];
  
  const hasRecipeKeywords = recipeKeywords.some(keyword => 
    content.includes(keyword) || title.includes(keyword)
  );
  
  // Check for ingredient list patterns
  const hasIngredientList = /\d+\s+(cup|tbsp|tsp|oz|lb|g|ml|kg)/i.test(content);
  
  // Check for numbered instructions
  const hasNumberedInstructions = /\d+\.\s+[A-Z]/i.test(content);
  
  return hasRecipeKeywords || hasIngredientList || hasNumberedInstructions;
}

async function parseRecipeFromNote(note: any, options: any = {}) {
  const content = note.content || '';
  const title = note.title || 'Untitled Recipe';
  
  // Extract ingredients
  const ingredients = extractIngredients(content);
  
  // Extract instructions
  const instructions = extractInstructions(content);
  
  // Extract metadata
  const recipeMetadata = extractRecipeMetadata(content);
  
  if (ingredients.length === 0 && instructions.length === 0) {
    return null; // Not a valid recipe
  }
  
  return {
    title,
    ingredients,
    instructions,
    ...recipeMetadata,
    source: 'apple_notes'
  };
}

function extractIngredients(content: string): string[] {
  const ingredients: string[] = [];
  
  // Look for ingredient sections
  const ingredientPatterns = [
    /ingredients?:\s*\n([\s\S]*?)(?=\n\s*(?:instructions?|directions?|method|steps?|$))/i,
    /ingredients?:\s*([\s\S]*?)(?=\n\s*(?:instructions?|directions?|method|steps?|$))/i,
    /what you'll need:\s*\n([\s\S]*?)(?=\n\s*(?:instructions?|directions?|method|steps?|$))/i
  ];
  
  for (const pattern of ingredientPatterns) {
    const match = content.match(pattern);
    if (match) {
      const ingredientText = match[1];
      const lines = ingredientText.split('\n').map(line => line.trim()).filter(line => line);
      
      for (const line of lines) {
        if (line && !line.match(/^(instructions?|directions?|method|steps?):/i)) {
          ingredients.push(line);
        }
      }
      break;
    }
  }
  
  // If no structured ingredients found, look for lines with measurements
  if (ingredients.length === 0) {
    const lines = content.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && /\d+\s+(cup|tbsp|tsp|oz|lb|g|ml|kg)/i.test(trimmed)) {
        ingredients.push(trimmed);
      }
    }
  }
  
  return ingredients;
}

function extractInstructions(content: string): string[] {
  const instructions: string[] = [];
  
  // Look for instruction sections
  const instructionPatterns = [
    /instructions?:\s*\n([\s\S]*?)(?=\n\s*(?:notes?|tips?|serves?|$))/i,
    /directions?:\s*\n([\s\S]*?)(?=\n\s*(?:notes?|tips?|serves?|$))/i,
    /method:\s*\n([\s\S]*?)(?=\n\s*(?:notes?|tips?|serves?|$))/i,
    /steps?:\s*\n([\s\S]*?)(?=\n\s*(?:notes?|tips?|serves?|$))/i
  ];
  
  for (const pattern of instructionPatterns) {
    const match = content.match(pattern);
    if (match) {
      const instructionText = match[1];
      const lines = instructionText.split('\n').map(line => line.trim()).filter(line => line);
      
      for (const line of lines) {
        if (line && !line.match(/^(notes?|tips?|serves?):/i)) {
          instructions.push(line);
        }
      }
      break;
    }
  }
  
  // If no structured instructions found, look for numbered steps
  if (instructions.length === 0) {
    const numberedSteps = content.match(/\d+\.\s+([^\n]+)/g);
    if (numberedSteps) {
      instructions.push(...numberedSteps.map(step => step.replace(/^\d+\.\s+/, '')));
    }
  }
  
  return instructions;
}

function extractRecipeMetadata(content: string) {
  const metadata: any = {};
  
  // Extract cooking time
  const timeMatch = content.match(/(?:cook|prep|total)\s*time:\s*(\d+)\s*(?:minutes?|mins?|hours?|hrs?)/i);
  if (timeMatch) {
    metadata.cookingTime = parseInt(timeMatch[1]);
  }
  
  // Extract servings
  const servingsMatch = content.match(/(?:serves?|yields?|makes?):\s*(\d+)/i);
  if (servingsMatch) {
    metadata.servings = parseInt(servingsMatch[1]);
  }
  
  // Extract difficulty
  const difficultyMatch = content.match(/(?:difficulty|level):\s*(easy|medium|hard|beginner|intermediate|advanced)/i);
  if (difficultyMatch) {
    metadata.difficulty = difficultyMatch[1].toLowerCase();
  }
  
  // Extract cuisine type
  const cuisineMatch = content.match(/(?:cuisine|type):\s*([^\n]+)/i);
  if (cuisineMatch) {
    metadata.cuisine = cuisineMatch[1].trim();
  }
  
  return metadata;
} 