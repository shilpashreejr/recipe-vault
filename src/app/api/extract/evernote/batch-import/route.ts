import { NextRequest, NextResponse } from 'next/server';
import { EvernoteService } from '@/lib/evernote/evernote-service';
import { RecipeExtractor } from '@/lib/evernote/recipe-extractor';
import { MetadataExtractor } from '@/lib/evernote/metadata-extractor';

const evernoteConfig = {
  consumerKey: process.env.EVERNOTE_CONSUMER_KEY!,
  consumerSecret: process.env.EVERNOTE_CONSUMER_SECRET!,
  sandbox: process.env.EVERNOTE_SANDBOX === 'true',
};

export async function POST(req: NextRequest) {
  try {
    const { 
      accessToken, 
      notebookGuid, 
      maxNotes = 50, 
      includeMetadata = true,
      includeAttachments = true 
    } = await req.json();

    if (!accessToken) {
      return NextResponse.json(
        { error: 'Missing accessToken' },
        { status: 400 }
      );
    }

    const evernote = new EvernoteService(evernoteConfig);
    evernote.setAccessToken(accessToken);

    // Get notes from the specified notebook or all notebooks
    const notes = notebookGuid 
      ? await evernote.getNotesFromNotebook(notebookGuid, maxNotes)
      : await evernote.searchNotes('', undefined, maxNotes);

    const results = {
      totalNotes: notes.length,
      successfulImports: 0,
      failedImports: 0,
      recipes: [] as any[],
      errors: [] as string[],
      summary: {
        totalRecipes: 0,
        totalIngredients: 0,
        totalInstructions: 0,
        cuisines: {} as Record<string, number>,
        difficulties: {} as Record<string, number>,
        dietaryInfo: {
          vegetarian: 0,
          vegan: 0,
          glutenFree: 0,
        },
        averageIngredients: 0,
        averageInstructions: 0,
        successRate: 0,
      },
    };

    // Process each note
    for (let i = 0; i < notes.length; i++) {
      const note = notes[i];
      
      try {
        // Get full note content
        const fullNote = await evernote.getNote(note.guid);
        
        // Extract recipe information
        const recipe = RecipeExtractor.extractFromEvernoteNote(fullNote);
        
        if (recipe) {
          // Extract metadata if requested
          let metadata = null;
          if (includeMetadata) {
            metadata = MetadataExtractor.extractMetadata(fullNote);
            const contentTags = MetadataExtractor.extractTagsFromContent(fullNote.content);
            const sourceInfo = MetadataExtractor.extractSourceInfo(fullNote.content);
            const locationInfo = MetadataExtractor.extractLocationInfo(fullNote.content);
            const dateInfo = MetadataExtractor.extractDateInfo(fullNote.content);
            const authorInfo = MetadataExtractor.extractAuthorInfo(fullNote.content);
            
            metadata = {
              ...metadata,
              contentTags,
              ...sourceInfo,
              ...locationInfo,
              ...dateInfo,
              ...authorInfo,
            };
          }

          // Get attachments if requested
          let attachments = null;
          if (includeAttachments && fullNote.resources && fullNote.resources.length > 0) {
            const imageResources = fullNote.resources.filter(resource => 
              resource.mime && resource.mime.startsWith('image/')
            );
            
            attachments = imageResources.map(resource => ({
              guid: resource.guid,
              mime: resource.mime,
              width: resource.width,
              height: resource.height,
              url: `/api/extract/evernote/attachments?accessToken=${accessToken}&resourceGuid=${resource.guid}`,
            }));
          }

          const recipeWithMetadata = {
            ...recipe,
            metadata,
            attachments,
            evernoteGuid: fullNote.guid,
            importTimestamp: new Date().toISOString(),
          };

          results.recipes.push(recipeWithMetadata);
          results.successfulImports++;

          // Update summary statistics
          results.summary.totalRecipes++;
          results.summary.totalIngredients += recipe.ingredients.length;
          results.summary.totalInstructions += recipe.instructions.length;
          
          if (recipe.cuisine) {
            results.summary.cuisines[recipe.cuisine] = (results.summary.cuisines[recipe.cuisine] || 0) + 1;
          }
          
          if (recipe.difficulty) {
            results.summary.difficulties[recipe.difficulty] = (results.summary.difficulties[recipe.difficulty] || 0) + 1;
          }
          
          if (recipe.isVegetarian) results.summary.dietaryInfo.vegetarian++;
          if (recipe.isVegan) results.summary.dietaryInfo.vegan++;
          if (recipe.isGlutenFree) results.summary.dietaryInfo.glutenFree++;
        } else {
          results.failedImports++;
          results.errors.push(`Note "${note.title}" does not contain recipe information`);
        }
      } catch (error: any) {
        results.failedImports++;
        results.errors.push(`Failed to process note "${note.title}": ${error.message}`);
      }
    }

    // Calculate final summary statistics
    results.summary.averageIngredients = results.summary.totalRecipes > 0 
      ? Math.round(results.summary.totalIngredients / results.summary.totalRecipes) 
      : 0;
    results.summary.averageInstructions = results.summary.totalRecipes > 0 
      ? Math.round(results.summary.totalInstructions / results.summary.totalRecipes) 
      : 0;
    results.summary.successRate = results.totalNotes > 0 
      ? Math.round((results.successfulImports / results.totalNotes) * 100) 
      : 0;

    return NextResponse.json(results);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
} 