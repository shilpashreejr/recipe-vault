# Product Requirements Document (PRD)
## Recipe Extraction and Management Website

### Project Overview
A Next.js web application that automatically extracts recipe information from various sources (food blogs, recipe websites, social media posts, Instagram Reels, and images) and organizes them into a searchable database with categorization and print functionality.

### Tech Stack
- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel with Vercel Postgres
- **Data Extraction**: Automated scraping with OCR capabilities

### Core Features

#### 1. Data Extraction System
**Sources Supported:**
- Food blog URLs
- Recipe website URLs
- Social media posts (Instagram, Facebook, Twitter)
- Instagram Reels (caption/description extraction)
- Images/screenshots with recipe text
- Evernote notes and notebooks
- Apple Notes exports (.html, .txt files)

**Extraction Methods:**
- Web scraping for URLs using Puppeteer/Playwright
- OCR (Optical Character Recognition) for images using Tesseract.js
- Evernote API integration for direct note access
- Apple Notes export file parsing
- API integrations where available
- Manual fallback for complex cases

**Data Points to Extract:**
- Recipe name
- Ingredients list with quantities
- Cooking instructions/steps
- Cooking time (prep + cook)
- Servings/yield
- Difficulty level (if available)
- Nutritional information/macros (if available)
- Cuisine type
- Dietary restrictions (vegetarian, gluten-free, etc.)
- Associated images

#### 2. Database Schema

```sql
-- Users table
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recipes table
CREATE TABLE recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  prep_time INTEGER, -- in minutes
  cook_time INTEGER, -- in minutes
  servings INTEGER,
  difficulty VARCHAR(50),
  cuisine_type VARCHAR(100),
  dietary_tags TEXT[], -- ['vegetarian', 'gluten-free', etc.]
  macros JSONB, -- {calories, protein, carbs, fat}
  source_url TEXT,
  source_type VARCHAR(50), -- 'blog', 'instagram', 'image', 'evernote', 'apple_notes', etc.
  source_metadata JSONB, -- {notebook_name, note_id, folder_path, etc.}
  extracted_at TIMESTAMP DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Recipe images table
CREATE TABLE recipe_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  alt_text VARCHAR(255),
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Categories table
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Recipe categories junction table
CREATE TABLE recipe_categories (
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE CASCADE,
  PRIMARY KEY (recipe_id, category_id)
);
```

#### 3. User Interface Features

**Main Pages:**
1. **Homepage** - Featured recipes, search bar, category navigation
2. **Recipe Upload** - Form to submit URLs or upload images
3. **Recipe Browser** - Grid/list view of all recipes with filters
4. **Recipe Detail** - Full recipe view with print option
5. **Search Results** - Filtered recipe listings
6. **Categories** - Recipes organized by category

**Key UI Components:**
- Responsive navigation with search so that it works on all devices like iphones, ipads and mac
- Recipe cards with images and key info, if the image is not available generate one or look up on the internet
- Advanced search/filter sidebar
- website layout should be fancy looking, but also have a print/share button to get to a Print-friendly recipe layout and print it from there or share it
- Upload progress indicators
- Loading states and error handling
- Mobile-optimized interface
- I should also have an option to edit the recipe name

**Search & Filter Options:**
- Text search (recipe name, ingredients, instructions)
- Category filter (starters, entrees, desserts, etc.)
- Dietary restrictions (vegetarian, gluten-free, etc.)
- Cooking time range
- Difficulty level
- Cuisine type
- Servings size

#### 4. Data Extraction Workflow

**URL Processing:**
1. User submits URL
2. System validates URL format
3. Web scraper extracts content
4. AI/ML model identifies recipe components
5. Data is structured and validated
6. Recipe is saved to database
7. User receives confirmation

**Image Processing:**
1. User uploads image
2. Image is processed for OCR
3. Text is extracted and cleaned
4. Recipe data is parsed and structured
5. Data is validated and saved
6. User receives confirmation

**Error Handling:**
- Invalid URLs/images
- Failed extractions
- Duplicate recipes
- Malformed data
- Rate limiting for external APIs

#### 6. Evernote Integration

**Authentication & Setup:**
- OAuth 2.0 authentication with Evernote API
- User authorization for note access
- Secure token storage and refresh handling
- Notebook permission management

**Data Extraction Process:**
1. User connects Evernote account
2. System fetches available notebooks
3. User selects notebooks to import from
4. System searches for recipe-related notes
5. Notes are parsed for recipe content
6. Recipe data is extracted and structured
7. Notes are imported with metadata preservation

**Supported Evernote Features:**
- Note content extraction (text, rich text)
- Note attachments (images, PDFs)
- Notebook organization
- Note tags and metadata
- Creation and modification dates
- Note sharing and collaboration data

**API Endpoints:**
- `POST /api/extract/evernote/auth` - Initialize Evernote OAuth
- `GET /api/extract/evernote/notebooks` - List user notebooks
- `POST /api/extract/evernote/sync` - Sync selected notebooks
- `GET /api/extract/evernote/status/[jobId]` - Check sync status

#### 7. Apple Notes Integration

**Import Process:**
- File upload for Apple Notes exports
- Support for .html and .txt export formats
- Batch processing of multiple notes
- Folder structure preservation

**Data Extraction Process:**
1. User uploads Apple Notes export file
2. System parses HTML/TXT structure
3. Notes are identified and categorized
4. Recipe content is extracted from notes
5. Images and attachments are processed
6. Recipe data is structured and validated
7. Notes are imported with folder organization

**Supported Apple Notes Features:**
- Rich text formatting preservation
- Image and attachment extraction
- Folder hierarchy maintenance
- Note creation dates
- Note titles and content
- Checkbox and list formatting

**API Endpoints:**
- `POST /api/extract/apple-notes` - Process Apple Notes export
- `GET /api/extract/apple-notes/status/[jobId]` - Check processing status
- `GET /api/extract/apple-notes/folders` - List folder structure

#### 5. Print Functionality

**Print Layout Features:**
- Clean, printer-friendly design
- Recipe name prominently displayed
- Ingredients list with checkboxes
- Numbered cooking instructions
- Nutritional information (if available)
- Cooking time and servings
- Optional: QR code linking back to online version

**Print Options:**
- Print single recipe
- Print multiple recipes
- Custom print layouts
- PDF export option

### Technical Implementation

#### 1. Project Structure
```
test-nextjs/
├── src/
│   ├── app/
│   │   ├── (auth)/
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── recipes/
│   │   │   ├── [id]/
│   │   │   ├── upload/
│   │   │   └── search/
│   │   ├── categories/
│   │   │   └── [slug]/
│   │   ├── api/
│   │   │   ├── recipes/
│   │   │   ├── upload/
│   │   │   └── extract/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── recipe/
│   │   └── layout/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── utils.ts
│   │   └── extractors/
│   ├── types/
│   └── hooks/
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── public/
├── package.json
├── tailwind.config.js
├── next.config.js
└── README.md
```

#### 2. Key Dependencies
```json
{
  "dependencies": {
    "next": "^14.0.0",
    "react": "^18.0.0",
    "typescript": "^5.0.0",
    "@prisma/client": "^5.0.0",
    "prisma": "^5.0.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "framer-motion": "^10.0.0",
    "react-hook-form": "^7.0.0",
    "zod": "^3.0.0",
    "puppeteer": "^21.0.0",
    "tesseract.js": "^4.0.0",
    "cheerio": "^1.0.0",
    "axios": "^1.0.0",
    "react-query": "^3.0.0",
    "evernote": "^2.0.0",
    "jsdom": "^22.0.0",
    "multer": "^1.4.5",
    "formidable": "^3.5.0"
  }
}
```

#### 3. API Endpoints

**Recipe Management:**
- `GET /api/recipes` - List recipes with filters
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/[id]` - Get single recipe
- `PUT /api/recipes/[id]` - Update recipe
- `DELETE /api/recipes/[id]` - Delete recipe

**Data Extraction:**
- `POST /api/extract/url` - Extract recipe from URL
- `POST /api/extract/image` - Extract recipe from image
- `POST /api/extract/evernote` - Extract recipes from Evernote
- `POST /api/extract/apple-notes` - Extract recipes from Apple Notes export
- `GET /api/extract/status/[jobId]` - Check extraction status
- `POST /api/extract/evernote/auth` - Initialize Evernote OAuth
- `GET /api/extract/evernote/notebooks` - List Evernote notebooks
- `POST /api/extract/evernote/sync` - Sync Evernote notebooks
- `GET /api/extract/evernote/status/[jobId]` - Check Evernote sync status
- `GET /api/extract/apple-notes/status/[jobId]` - Check Apple Notes processing status
- `GET /api/extract/apple-notes/folders` - List Apple Notes folder structure

**Categories:**
- `GET /api/categories` - List all categories
- `GET /api/categories/[slug]/recipes` - Get recipes by category

**Search:**
- `GET /api/search` - Search recipes with filters

#### 4. Data Extraction Services

**Web Scraping Service:**
```typescript
interface WebScraper {
  extractFromUrl(url: string): Promise<RecipeData>;
  extractFromInstagram(url: string): Promise<RecipeData>;
  extractFromBlog(url: string): Promise<RecipeData>;
}
```

**OCR Service:**
```typescript
interface OCRService {
  extractFromImage(imageBuffer: Buffer): Promise<string>;
  parseRecipeText(text: string): Promise<RecipeData>;
}
```

**Recipe Parser:**
```typescript
interface RecipeParser {
  parseIngredients(text: string): Ingredient[];
  parseInstructions(text: string): string[];
  extractCookingTime(text: string): CookingTime;
  extractNutritionalInfo(text: string): NutritionalInfo;
  categorizeRecipe(recipe: RecipeData): string[];
}
```

**Evernote Service:**
```typescript
interface EvernoteService {
  authenticateUser(): Promise<AuthResult>;
  getNotebooks(): Promise<Notebook[]>;
  searchNotes(query: string, notebookIds?: string[]): Promise<Note[]>;
  extractRecipeFromNote(note: Note): Promise<RecipeData>;
  syncNotebooks(notebookIds: string[]): Promise<SyncResult>;
}
```

**Apple Notes Service:**
```typescript
interface AppleNotesService {
  parseExportFile(fileBuffer: Buffer): Promise<NoteExport>;
  extractRecipesFromNotes(notes: Note[]): Promise<RecipeData[]>;
  processFolderStructure(exportData: NoteExport): Promise<FolderStructure>;
  extractImagesFromNotes(notes: Note[]): Promise<ImageData[]>;
}
```

### Deployment Configuration

#### 1. Vercel Setup
- Connect GitHub repository to Vercel
- Configure environment variables
- Set up Vercel Postgres database
- Configure build settings

#### 2. Environment Variables
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"
EXTRACTION_API_KEY="your-api-key"
```

#### 3. Database Migration
```bash
npx prisma migrate dev
npx prisma generate
npx prisma db push
```

### User Stories

#### As a User, I want to:
1. **Upload Recipe Sources**
   - Submit a URL to extract recipe data
   - Upload an image/screenshot to extract recipe
   - Connect my Evernote account to import recipe notes
   - Upload Apple Notes export files to import recipes
   - See progress of extraction process
   - Receive confirmation when extraction is complete

2. **Browse Recipes**
   - View all recipes in a grid/list layout
   - Filter recipes by category, dietary restrictions, cooking time
   - Search recipes by name, ingredients, or instructions
   - Sort recipes by various criteria
   - Filter recipes by source (Evernote, Apple Notes, web, etc.)

3. **View Recipe Details**
   - See complete recipe information
   - View nutritional information if available
   - See recipe images
   - Print recipe in a clean format
   - View source information (Evernote notebook, Apple Notes folder, etc.)

4. **Organize Recipes**
   - Browse recipes by category (starters, entrees, desserts, etc.)
   - Filter by dietary restrictions (vegetarian, gluten-free, etc.)
   - Save favorite recipes (future enhancement)
   - View recipes by original source organization

### Success Metrics
- Successful extraction rate > 80%
- Page load time < 3 seconds
- Search results returned in < 1 second
- Mobile responsiveness score > 95
- User satisfaction with print layout

### Future Enhancements
- User accounts and favorites
- Recipe sharing functionality
- Meal planning features
- Recipe scaling (adjust servings)
- Integration with grocery delivery services
- Recipe recommendations
- Social features (comments, ratings)

### Development Phases

#### Phase 1: Core Infrastructure (Week 1-2)
- Set up Next.js project with TypeScript
- Configure Prisma with PostgreSQL
- Set up shadcn/ui and Tailwind CSS
- Create basic database schema
- Deploy to Vercel

#### Phase 2: Data Extraction (Week 3-4)
- Implement web scraping service
- Implement OCR for images
- Create recipe parsing logic
- Build extraction API endpoints
- Add error handling and validation

#### Phase 3: User Interface (Week 5-6)
- Create recipe upload forms
- Build recipe browser and detail pages
- Implement search and filter functionality
- Add print functionality
- Mobile optimization

#### Phase 4: Testing & Polish (Week 7-8)
- End-to-end testing
- Performance optimization
- Bug fixes and refinements
- Documentation
- Final deployment

### Risk Mitigation
- **Extraction Accuracy**: Implement manual review process for failed extractions
- **Rate Limiting**: Add delays and respect robots.txt for web scraping
- **Data Quality**: Validate extracted data before saving
- **Performance**: Implement caching and pagination
- **Legal Compliance**: Ensure scraping complies with website terms of service

This PRD provides a comprehensive roadmap for building the recipe extraction and management website. The technical specifications are detailed enough for a junior developer to implement without additional questions. 