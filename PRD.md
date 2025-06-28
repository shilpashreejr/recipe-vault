# Product Requirements Document (PRD)
## Comprehensive Food Management Ecosystem

### Project Overview
A Next.js web application that creates a complete food management ecosystem, automatically extracting recipe information from various sources (food blogs, recipe websites, social media posts, Instagram Reels, Evernote notes, Apple Notes exports, and images), organizing them into a searchable database, and providing comprehensive meal planning, food logging, macro tracking, and inventory management with photo-based analysis and AI-powered insights.

### Tech Stack
- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel with Vercel Postgres
- **Data Extraction**: Automated scraping with OCR capabilities
- **Integration**: Evernote API, Apple Notes parsing, Social media scraping
- **AI/ML**: Photo-based food recognition, macro estimation, inventory analysis
- **Image Processing**: Advanced photo capture, editing, and analysis
- **Mobile**: PWA with offline capabilities and camera integration

### Core Features

#### 1. Data Extraction System
**Sources Supported:**
- Food blog URLs and recipe websites
- Social media posts (Instagram, Facebook, Twitter, TikTok)
- Instagram Reels (caption/description extraction)
- Images/screenshots with recipe text (OCR)
- Evernote notes and notebooks (API integration)
- Apple Notes exports (.html, .txt files)
- Pinterest recipe pins
- YouTube cooking videos (description extraction)
- WhatsApp recipe messages
- Email recipe forwards

**Extraction Methods:**
- Web scraping for URLs using Puppeteer/Playwright
- OCR (Optical Character Recognition) for images using Tesseract.js
- Evernote API integration for direct note access
- Apple Notes export file parsing
- Social media API integrations where available
- Manual fallback for complex cases
- Rate limiting and robots.txt compliance

**Data Points to Extract:**
- Recipe name and description
- Ingredients list with quantities and units
- Cooking instructions/steps with timing
- Cooking time (prep + cook + total)
- Servings/yield information
- Difficulty level assessment
- Nutritional information/macros (if available)
- Cuisine type and origin
- Dietary restrictions (vegetarian, vegan, gluten-free, etc.)
- Associated images and media
- Source attribution and metadata
- User ratings and reviews (if available)

#### 2. Smart Meal Planning System
**Personalized Meal Planning Features:**
- Generate weekly/monthly plans based on user preferences
- Smart repetition strategies (None/Smart/Aggressive)
- Cooking schedule optimization around availability
- Batch cooking and meal prep planning
- Quick meals (15-minute) for busy days
- No-cook options for zero-cooking days
- Favorite recipe integration with rotation strategies
- Nutritional goal balancing and adherence

**Meal Plan Intelligence:**
- Day type assignment (cooking, quick, leftovers, no-cook)
- Batch cooking optimization for efficiency
- Leftover utilization strategies
- Cooking time and serving size matching
- Favorite recipe rotation to prevent burnout
- Nutritional balancing across the week

#### 3. Food Logging and Macro Tracking
**Photo-Based Food Logging:**
- Mobile-optimized camera interface for meal photos
- AI-powered food recognition from photos
- Manual macro entry with sophisticated forms
- Real-time macro calculation and goal comparison
- Food database integration with autocomplete
- Custom food creation and management

**Comprehensive Tracking:**
- Daily macro summaries and progress visualization
- Meal timeline with photo integration
- Weekly/monthly analytics and trend analysis
- Goal setting and achievement tracking
- Streak tracking and accountability features
- Meal plan execution tracking vs. actual consumption

#### 4. Inventory Management and Smart Shopping
**Photo-Based Inventory Analysis:**
- AI-powered food recognition from fridge/freezer/pantry photos
- Automatic quantity estimation and item categorization
- Expiration date detection from labels
- Manual verification and adjustment interface
- Storage area organization and optimization

**Smart Shopping List Generation:**
- Automatic generation from meal plans with inventory subtraction
- Store-specific organization with aisle mapping
- Price tracking and budget optimization
- Sale detection and bulk buying suggestions
- Grocery delivery service integration
- Shopping list sharing and collaboration

**Inventory Intelligence:**
- Usage tracking and waste reduction insights
- Expiration date management and alerts
- Restocking recommendations and forecasting
- Storage optimization suggestions
- Cost analysis and budget tracking

#### 5. Advanced Analytics and Insights
**Comprehensive Analytics Dashboard:**
- Macro trend analysis and goal achievement
- Meal pattern recognition and optimization
- Inventory turnover and waste tracking
- Shopping efficiency and cost analysis
- Recipe usage and favorite rotation insights

**AI-Powered Recommendations:**
- Smart meal suggestions based on preferences and inventory
- Macro adjustment recommendations
- Meal timing and variety suggestions
- Waste reduction strategies
- Budget optimization tips

#### 6. Mobile-First Experience
**Progressive Web App Features:**
- Offline functionality for all core features
- Mobile-optimized camera interface
- Touch-friendly photo capture and editing
- Push notifications for meals, inventory, and goals
- Native app-like experience with smooth animations

**Mobile-Specific Features:**
- Barcode scanning for packaged foods
- Voice-to-text food logging
- Mobile grocery store navigation
- Price comparison tools
- Offline inventory tracking with sync

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
│   │   ├── meal-plans/
│   │   │   ├── create/
│   │   │   ├── [id]/
│   │   │   └── dashboard/
│   │   ├── preferences/
│   │   ├── shopping-lists/
│   │   ├── progress/
│   │   ├── api/
│   │   │   ├── recipes/
│   │   │   ├── upload/
│   │   │   ├── extract/
│   │   │   ├── meal-plans/
│   │   │   ├── preferences/
│   │   │   └── shopping-lists/
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── ui/
│   │   ├── forms/
│   │   ├── recipe/
│   │   ├── meal-plan/
│   │   └── layout/
│   ├── lib/
│   │   ├── prisma.ts
│   │   ├── utils.ts
│   │   ├── extractors/
│   │   └── meal-planning/
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
    "formidable": "^3.5.0",
    "date-fns": "^2.30.0",
    "react-beautiful-dnd": "^13.1.1",
    "recharts": "^2.8.0",
    "@next/font": "^14.0.0",
    "lucide-react": "^0.294.0",
    "react-intersection-observer": "^9.5.2",
    "react-hot-toast": "^2.4.1",
    "react-dropzone": "^14.2.3",
    "react-image-crop": "^10.1.8",
    "react-syntax-highlighter": "^15.5.0"
  }
}
```

#### 3. Design System Configuration

**Typography Setup (next.config.js):**
```javascript
const { Inter, Playfair_Display, Poppins } = require('@next/font/google');

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-playfair',
});

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-poppins',
});
```

**Tailwind CSS Configuration (tailwind.config.js):**
```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        accent: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      colors: {
        primary: {
          navy: '#1a1a2e',
          cream: '#f8f6f1',
        },
        secondary: {
          sage: '#7c9885',
          terracotta: '#d2691e',
        },
        accent: {
          gold: '#d4af37',
          coral: '#ff6b6b',
        },
        neutral: {
          charcoal: '#2c3e50',
          light: '#ecf0f1',
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'float': 'float 6s ease-in-out infinite',
        'gradient': 'gradient 15s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'hero-pattern': "url('/images/hero-pattern.svg')",
      },
    },
  },
  plugins: [],
};
```

**Global CSS (globals.css):**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96%;
    --secondary-foreground: 222.2 84% 4.9%;
    --muted: 210 40% 96%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96%;
    --accent-foreground: 222.2 84% 4.9%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

@layer components {
  .btn-primary {
    @apply bg-gradient-to-r from-primary-navy to-secondary-sage text-white px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-offset-2;
  }
  
  .btn-secondary {
    @apply bg-white text-primary-navy border-2 border-primary-navy px-6 py-3 rounded-lg font-medium transition-all duration-300 hover:bg-primary-navy hover:text-white focus:outline-none focus:ring-2 focus:ring-accent-gold focus:ring-offset-2;
  }
  
  .card-elegant {
    @apply bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-neutral-light;
  }
  
  .text-gradient {
    @apply bg-gradient-to-r from-primary-navy to-secondary-sage bg-clip-text text-transparent;
  }
  
  .floating-animation {
    @apply animate-float;
  }
  
  .fade-in {
    @apply animate-fade-in;
  }
  
  .slide-up {
    @apply animate-slide-up;
  }
}
```

#### 4. API Endpoints

**Recipe Management:**
- `GET /api/recipes` - List recipes with filters
- `POST /api/recipes` - Create new recipe
- `GET /api/recipes/[id]` - Get single recipe
- `PUT /api/recipes/[id]` - Update recipe
- `DELETE /api/recipes/[id]` - Delete recipe

**Favorites Management:**
- `GET /api/favorites` - List user's favorite recipes
- `POST /api/favorites` - Add recipe to favorites
- `PUT /api/favorites/[id]` - Update favorite recipe (rating, notes, etc.)
- `DELETE /api/favorites/[id]` - Remove recipe from favorites
- `GET /api/favorites/stats` - Get favorite recipe statistics
- `POST /api/favorites/[id]/cook` - Mark favorite recipe as cooked
- `GET /api/favorites/meal-plan-suggestions` - Get favorites for meal planning

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

**User Preferences:**
- `GET /api/preferences` - Get user preferences
- `PUT /api/preferences` - Update user preferences
- `POST /api/preferences/onboarding` - Complete preferences setup
- `PUT /api/preferences/repetition-strategy` - Update repetition strategy

**Meal Plans:**
- `GET /api/meal-plans` - List user's meal plans
- `POST /api/meal-plans` - Create new meal plan
- `GET /api/meal-plans/[id]` - Get single meal plan
- `PUT /api/meal-plans/[id]` - Update meal plan
- `DELETE /api/meal-plans/[id]` - Delete meal plan
- `POST /api/meal-plans/[id]/generate` - Generate meal plan
- `POST /api/meal-plans/[id]/copy` - Copy meal plan
- `POST /api/meal-plans/[id]/optimize-repetition` - Optimize meal repetition

**Meal Plan Days:**
- `GET /api/meal-plans/[id]/days` - Get days in meal plan
- `PUT /api/meal-plans/[id]/days/[date]` - Update meal plan day
- `POST /api/meal-plans/[id]/days/[date]/meals` - Add meal to day
- `PUT /api/meal-plans/[id]/days/[date]/meals/[mealId]` - Update meal
- `DELETE /api/meal-plans/[id]/days/[date]/meals/[mealId]` - Remove meal

**Shopping Lists:**
- `GET /api/shopping-lists` - List user's shopping lists
- `POST /api/shopping-lists` - Create new shopping list
- `GET /api/shopping-lists/[id]` - Get single shopping list
- `PUT /api/shopping-lists/[id]` - Update shopping list
- `DELETE /api/shopping-lists/[id]` - Delete shopping list
- `POST /api/shopping-lists/[id]/generate` - Generate from meal plan
- `POST /api/shopping-lists/[id]/items` - Add item to list
- `PUT /api/shopping-lists/[id]/items/[itemId]` - Update list item
- `DELETE /api/shopping-lists/[id]/items/[itemId]` - Remove list item

**Recipe Integration for Meal Planning:**
- `GET /api/recipes/for-meal-plan` - Get recipes suitable for meal planning
- `GET /api/recipes/suggestions` - Get recipe suggestions
- `POST /api/recipes/[id]/scale` - Scale recipe servings
- `GET /api/recipes/quick-meals` - Get quick meal recipes
- `GET /api/recipes/meal-prep-friendly` - Get meal prep friendly recipes
- `GET /api/recipes/leftover-friendly` - Get leftover friendly recipes

#### 5. Data Extraction Services

**Web Scraper:**
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

#### 6. Meal Planning Services

**Meal Plan Generator:**
```typescript
interface MealPlanGenerator {
  generatePlan(userId: string, preferences: UserPreferences, duration: number): Promise<MealPlan>;
  selectRecipes(recipes: Recipe[], preferences: UserPreferences, dayType: string): Promise<Recipe[]>;
  optimizeRepetition(mealPlan: MealPlan, strategy: string): Promise<MealPlan>;
  assignDayTypes(mealPlan: MealPlan, preferences: UserPreferences): Promise<MealPlan>;
  integrateFavorites(mealPlan: MealPlan, favorites: FavoriteRecipe[], preferences: UserPreferences): Promise<MealPlan>;
  suggestFavoriteRotation(favorites: FavoriteRecipe[], weekCount: number): Promise<FavoriteRecipe[]>;
}
```

**Shopping List Generator:**
```typescript
interface ShoppingListGenerator {
  generateFromMealPlan(mealPlan: MealPlan): Promise<ShoppingList>;
  consolidateIngredients(items: ShoppingListItem[]): Promise<ShoppingListItem[]>;
  categorizeItems(items: ShoppingListItem[]): Promise<ShoppingListItem[]>;
}
```

**Nutritional Calculator:**
```typescript
interface NutritionalCalculator {
  calculateDailyNutrition(meals: MealPlanMeal[]): NutritionalInfo;
  calculateWeeklyNutrition(mealPlan: MealPlan): NutritionalInfo;
  validateNutritionalGoals(mealPlan: MealPlan, preferences: UserPreferences): boolean;
}
```

**Favorites Manager:**
```typescript
interface FavoritesManager {
  addToFavorites(userId: string, recipeId: string, metadata: FavoriteMetadata): Promise<FavoriteRecipe>;
  updateFavorite(favoriteId: string, updates: Partial<FavoriteMetadata>): Promise<FavoriteRecipe>;
  removeFromFavorites(userId: string, recipeId: string): Promise<void>;
  getFavoritesForMealPlanning(userId: string, preferences: UserPreferences): Promise<FavoriteRecipe[]>;
  getFavoriteStats(userId: string): Promise<FavoriteStats>;
  markAsCooked(favoriteId: string): Promise<FavoriteRecipe>;
  suggestFavoritesForWeek(userId: string, weekStart: Date): Promise<FavoriteRecipe[]>;
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
EVERNOTE_CONSUMER_KEY="your-evernote-key"
EVERNOTE_CONSUMER_SECRET="your-evernote-secret"
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

5. **Manage Favorite Recipes**
   - Add recipes to my favorites list
   - Rate my favorite recipes (1-5 stars)
   - Add notes about why I love each recipe
   - Track how many times I've cooked each favorite
   - Mark when I last cooked a favorite recipe
   - Set preferences for when to cook favorites (meal type, day of week, season)
   - View my favorite recipe statistics and usage patterns

6. **Set Up Meal Planning Preferences**
   - Configure dietary restrictions and allergies
   - Set cooking schedule preferences (how many days to cook)
   - Choose repetition comfort level (none/smart/aggressive)
   - Set nutritional goals and targets
   - Specify preferred cuisines and disliked ingredients
   - Choose favorite recipe integration strategy (balanced/heavy/light)
   - Set minimum and maximum favorite recipes per week

7. **Create Personalized Meal Plans**
   - Generate weekly/monthly meal plans based on preferences
   - Choose from my stored recipes or get suggestions
   - Customize meal repetition and batch cooking options
   - Plan around my actual cooking availability
   - Get quick meals for busy days and no-cook options
   - Intelligently include my favorite recipes in meal plans
   - Get suggestions for favorite recipe rotation to avoid burnout

8. **Manage Shopping Lists**
   - Automatically generate shopping lists from meal plans
   - See ingredients organized by store sections
   - Add/remove items and adjust quantities
   - Mark items as purchased
   - Export shopping lists for printing or sharing

9. **Track Progress**
   - Mark meals as completed or skipped
   - See nutritional adherence vs. planned goals
   - Track shopping list completion
   - View weekly/monthly progress reports
   - Monitor cooking efficiency and time savings
   - Track favorite recipe usage and rotation

### Success Metrics
- Successful extraction rate > 80%
- Page load time < 3 seconds
- Search results returned in < 1 second
- Mobile responsiveness score > 95
- User satisfaction with print layout
- **Design & UX Metrics:**
  - User satisfaction with visual design > 90%
  - Animation performance score > 95 (60fps)
  - Typography readability score > 98%
  - Color contrast compliance (WCAG AA) > 99%
  - User engagement with interactive elements > 85%
- **Meal Planning Metrics:**
  - Meal plan adherence rate > 70%
  - User satisfaction with repetition options > 85%
  - Shopping list accuracy > 90%
  - Time saved in meal planning > 2 hours/week

### Future Enhancements
- User accounts and favorites
- Recipe sharing functionality
- **Advanced Design Features:**
  - Advanced animation library with Lottie integration
  - Custom illustration system for recipe categories
  - Advanced micro-interactions and haptic feedback
  - AI-powered design personalization
  - Advanced accessibility features (screen reader optimization)
  - Multi-language typography support
- **Advanced Meal Planning Features:**
  - AI-powered recipe recommendations
  - Meal plan templates for different diets
  - Family meal planning with multiple users
  - Integration with grocery delivery services
  - Recipe scaling (adjust servings)
  - Social features (comments, ratings)
  - Recipe recommendations based on meal plan history
- **Advanced Visual Features:**
  - 3D recipe card interactions
  - Advanced image processing and enhancement
  - Custom recipe visualization tools
  - Advanced print layout customization
  - Recipe video integration and editing

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

#### Phase 4: Meal Planning System (Week 7-8)
- Implement user preferences system
- Create smart meal plan generation engine
- Build meal plan interface with calendar view
- Add shopping list generation
- Implement progress tracking

#### Phase 5: Testing & Polish (Week 9-10)
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
- **Meal Planning Complexity**: Start with basic features and iterate based on user feedback
- **User Adoption**: Provide clear onboarding and tutorials for meal planning features

This PRD provides a comprehensive roadmap for building the recipe extraction and management website with advanced meal planning capabilities. The technical specifications are detailed enough for a junior developer to implement without additional questions. 