# Product Requirements Document (PRD)
## Recipe Extraction and Management Website

### Project Overview
A Next.js web application that automatically extracts recipe information from various sources (food blogs, recipe websites, social media posts, Instagram Reels, Evernote notes, Apple Notes exports, and images) and organizes them into a searchable database with categorization, print functionality, and personalized meal planning with smart repetition strategies.

### Tech Stack
- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel with Vercel Postgres
- **Data Extraction**: Automated scraping with OCR capabilities
- **Integration**: Evernote API, Apple Notes parsing, Social media scraping

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

-- User Preferences table
CREATE TABLE user_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Dietary Restrictions
  is_vegetarian BOOLEAN DEFAULT FALSE,
  is_vegan BOOLEAN DEFAULT FALSE,
  is_gluten_free BOOLEAN DEFAULT FALSE,
  is_dairy_free BOOLEAN DEFAULT FALSE,
  is_nut_free BOOLEAN DEFAULT FALSE,
  is_keto BOOLEAN DEFAULT FALSE,
  is_paleo BOOLEAN DEFAULT FALSE,
  is_low_carb BOOLEAN DEFAULT FALSE,
  
  -- Allergies & Intolerances
  allergies TEXT[], -- Array of allergy strings
  intolerances TEXT[], -- Array of intolerance strings
  
  -- Cooking Preferences
  preferred_cuisines TEXT[], -- Array of cuisine types
  disliked_ingredients TEXT[], -- Array of disliked ingredients
  max_cooking_time INTEGER, -- Maximum cooking time in minutes
  preferred_servings INTEGER, -- Preferred number of servings
  
  -- Nutritional Goals
  target_calories INTEGER, -- Daily calorie target
  target_protein INTEGER, -- Daily protein target in grams
  target_carbs INTEGER, -- Daily carbs target in grams
  target_fat INTEGER, -- Daily fat target in grams
  
  -- Meal Planning Preferences
  meals_per_day INTEGER DEFAULT 3, -- 2, 3, or 4 meals
  plan_duration INTEGER DEFAULT 7, -- Days to plan for (7, 14, 30)
  include_snacks BOOLEAN DEFAULT FALSE,
  leftovers_preference VARCHAR(50), -- "love", "tolerate", "avoid"
  
  -- Smart Meal Repetition Preferences
  allow_meal_repetition BOOLEAN DEFAULT TRUE,
  repetition_strategy VARCHAR(50) DEFAULT 'smart', -- "none", "smart", "aggressive"
  max_repetitions_per_week INTEGER DEFAULT 3, -- Maximum times a meal can repeat
  repetition_spacing INTEGER DEFAULT 2, -- Minimum days between same meal
  batch_cooking_preference VARCHAR(50) DEFAULT 'moderate', -- "none", "moderate", "heavy"
  meal_prep_days TEXT[], -- ["sunday", "wednesday"] - preferred prep days
  
  -- Cooking Schedule Preferences
  cooking_days_per_week INTEGER DEFAULT 4, -- How many days willing to cook
  quick_meal_days INTEGER DEFAULT 2, -- Days for 15-min meals
  no_cook_days INTEGER DEFAULT 1, -- Days for leftovers/takeout
  weekend_cooking BOOLEAN DEFAULT TRUE, -- Willing to cook on weekends
  
  -- Favorite Recipe Preferences
  prefer_favorites_in_meal_plan BOOLEAN DEFAULT TRUE, -- Use favorites when planning
  min_favorites_per_week INTEGER DEFAULT 3, -- Minimum favorite recipes per week
  max_favorites_per_week INTEGER DEFAULT 7, -- Maximum favorite recipes per week
  favorite_rotation_strategy VARCHAR(50) DEFAULT 'balanced', -- "balanced", "heavy", "light"
  
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

-- Favorite Recipes table
CREATE TABLE favorite_recipes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  
  -- Favorite metadata
  favorite_notes TEXT, -- User notes about why they love this recipe
  favorite_rating INTEGER CHECK (favorite_rating >= 1 AND favorite_rating <= 5), -- 1-5 star rating
  last_cooked_date DATE, -- When they last made this recipe
  cook_count INTEGER DEFAULT 0, -- How many times they've cooked this recipe
  is_meal_plan_favorite BOOLEAN DEFAULT TRUE, -- Include in meal planning suggestions
  
  -- Usage preferences
  preferred_meal_type VARCHAR(50), -- "breakfast", "lunch", "dinner", "snack"
  preferred_day_of_week VARCHAR(50), -- "monday", "tuesday", etc.
  preferred_season VARCHAR(50), -- "spring", "summer", "fall", "winter", "any"
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(user_id, recipe_id)
);

-- Meal Plans table
CREATE TABLE meal_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- "Week of March 1st", "Summer Meal Plan", etc.
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  
  -- Plan Settings
  total_calories INTEGER,
  total_protein INTEGER,
  total_carbs INTEGER,
  total_fat INTEGER,
  
  -- Plan Strategy
  repetition_strategy VARCHAR(50) DEFAULT 'smart', -- "none", "smart", "aggressive"
  batch_cooking_enabled BOOLEAN DEFAULT TRUE,
  meal_prep_days TEXT[], -- Days when batch cooking happens
  
  -- Plan Status
  status VARCHAR(50) DEFAULT 'draft', -- "draft", "active", "completed", "archived"
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Meal Plan Days table
CREATE TABLE meal_plan_days (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_id UUID REFERENCES meal_plans(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  day_of_week VARCHAR(50) NOT NULL, -- "monday", "tuesday", etc.
  
  -- Day Type for Smart Planning
  day_type VARCHAR(50) DEFAULT 'normal', -- "cooking", "quick", "leftovers", "no-cook"
  cooking_time INTEGER, -- Estimated cooking time for the day
  
  -- Nutritional totals for the day
  total_calories INTEGER,
  total_protein INTEGER,
  total_carbs INTEGER,
  total_fat INTEGER,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  UNIQUE(meal_plan_id, date)
);

-- Meal Plan Meals table
CREATE TABLE meal_plan_meals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  meal_plan_day_id UUID REFERENCES meal_plan_days(id) ON DELETE CASCADE,
  meal_type VARCHAR(50) NOT NULL, -- "breakfast", "lunch", "dinner", "snack"
  meal_time VARCHAR(50), -- "8:00 AM", "12:30 PM", etc.
  
  -- Recipe assignment
  recipe_id UUID REFERENCES recipes(id),
  
  -- Custom meal (if no recipe assigned)
  custom_meal_name VARCHAR(255),
  custom_ingredients TEXT,
  custom_instructions TEXT,
  
  -- Meal Planning Strategy
  is_batch_cooked BOOLEAN DEFAULT FALSE, -- Made in advance
  is_leftover BOOLEAN DEFAULT FALSE, -- Using leftovers
  is_quick_meal BOOLEAN DEFAULT FALSE, -- 15-min or less
  is_no_cook BOOLEAN DEFAULT FALSE, -- No cooking required
  repetition_count INTEGER DEFAULT 0, -- How many times this meal appears in plan
  
  -- Nutritional info
  calories INTEGER,
  protein INTEGER,
  carbs INTEGER,
  fat INTEGER,
  
  -- User notes
  notes TEXT,
  
  -- Meal status
  is_completed BOOLEAN DEFAULT FALSE,
  is_skipped BOOLEAN DEFAULT FALSE,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Shopping Lists table
CREATE TABLE shopping_lists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL, -- "Week of March 1st Shopping List"
  meal_plan_id UUID REFERENCES meal_plans(id),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Shopping List Items table
CREATE TABLE shopping_list_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shopping_list_id UUID REFERENCES shopping_lists(id) ON DELETE CASCADE,
  ingredient_name VARCHAR(255) NOT NULL,
  quantity VARCHAR(100) NOT NULL, -- "2 cups", "1 lb", etc.
  unit VARCHAR(50),
  category VARCHAR(100), -- "produce", "dairy", "meat", "pantry", etc.
  is_checked BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

#### 3. User Interface Layout & Design

**Homepage Hero Section:**
- **Dynamic Hero Banner**: Showcase the app's core value proposition with animated elements
- **Feature Highlights**: Prominent display of key capabilities:
  - "Extract from Any Source" - URL, social media, images, notes
  - "Smart Meal Planning" - Personalized plans with repetition strategies
  - "Organize & Share" - Categories, favorites, print functionality
- **Quick Action Buttons**: Upload recipe, browse recipes, start meal planning
- **Social Proof**: User statistics and testimonials
- **Visual Elements**: Recipe imagery, cooking animations, gradient backgrounds

**Navigation & Header:**
- **Responsive Navigation**: Works seamlessly on iPhone, iPad, and Mac
- **Main Menu Items**:
  - Browse Recipes (with search)
  - Upload Recipe (multi-source)
  - Meal Planning (dashboard)
  - Favorites (management)
  - Categories (organization)
  - User Profile (preferences)
- **Search Bar**: Global search with autocomplete
- **User Actions**: Login/Register, profile menu, notifications
- **Mobile Menu**: Hamburger menu with smooth animations

**Recipe Upload Interface:**
- **Multi-Source Upload Tabs**:
  - URL Input (blogs, social media, websites)
  - Image Upload (drag & drop, OCR processing)
  - Evernote Integration (connect account, select notebooks)
  - Apple Notes Import (file upload, folder parsing)
  - Social Media Links (Instagram, TikTok, Pinterest)
- **Upload Progress**: Real-time extraction status with visual indicators
- **Preview & Edit**: Review extracted data before saving
- **Batch Upload**: Multiple sources at once
- **Source Attribution**: Automatic tracking of recipe origins

**Recipe Browser & Cards:**
- **Grid/List View**: Toggle between layout options
- **Enhanced Recipe Cards**:
  - High-quality images with fallback generation
  - Recipe name and key details
  - Cooking time and difficulty indicators
  - Dietary restriction badges
  - Source attribution (Evernote, Instagram, etc.)
  - Favorite status and ratings
  - Quick actions (view, favorite, add to meal plan)
- **Advanced Filtering**:
  - Text search (name, ingredients, instructions)
  - Category filters (starters, entrees, desserts)
  - Dietary restrictions (vegetarian, gluten-free, etc.)
  - Cooking time ranges
  - Source type (Evernote, social media, web, etc.)
  - Difficulty levels
  - Cuisine types
  - Meal planning filters (quick meals, meal prep friendly)

**Meal Planning Dashboard:**
- **Calendar View**: Weekly/monthly calendar with drag-and-drop
- **Smart Plan Generation**: AI-powered meal suggestions
- **Repetition Controls**: Choose comfort level (None/Smart/Aggressive)
- **Day Type Management**: Cooking, quick, leftovers, no-cook days
- **Favorite Integration**: Automatic inclusion of favorite recipes
- **Nutritional Tracking**: Daily/weekly nutritional goals
- **Shopping List Generation**: Automatic from meal plans
- **Progress Tracking**: Meal completion and adherence metrics

**Recipe Detail Page:**
- **Comprehensive Recipe View**:
  - High-resolution images with gallery
  - Detailed ingredients with quantities
  - Step-by-step instructions with timing
  - Nutritional information display
  - Cooking time and servings
  - Source attribution and metadata
  - User ratings and reviews
- **Interactive Features**:
  - Edit recipe name and details
  - Add to favorites with rating
  - Add to meal plan
  - Scale recipe servings
  - Print-friendly layout
  - Share functionality
- **Related Recipes**: Suggestions based on ingredients or cuisine

**Favorites Management:**
- **Favorite Recipe Cards**: Enhanced cards with ratings and notes
- **Rating System**: 1-5 star ratings with review notes
- **Usage Tracking**: Cook count and last cooked date
- **Organization**: Filter by rating, cuisine, meal type
- **Meal Planning Integration**: Automatic suggestions for meal plans
- **Statistics Dashboard**: Usage patterns and preferences
- **Bulk Actions**: Manage multiple favorites at once

**Categories & Organization:**
- **Category Pages**: Dedicated pages for each cuisine type
- **Visual Category Cards**: Images and descriptions
- **Hierarchical Organization**: Main categories with subcategories
- **Smart Categorization**: Automatic assignment based on content
- **Custom Categories**: User-defined organization
- **Cross-Category Navigation**: Related categories and cuisines

**User Preferences & Settings:**
- **Multi-Step Setup**: Guided preferences configuration
- **Dietary Restrictions**: Comprehensive allergy and preference management
- **Cooking Preferences**: Schedule, time constraints, skill level
- **Meal Planning Settings**: Repetition strategies, nutritional goals
- **Favorite Recipe Preferences**: Integration and rotation strategies
- **Notification Settings**: Email and in-app notifications
- **Privacy Controls**: Data sharing and visibility options

**Print & Share Functionality:**
- **Print-Friendly Layout**: Clean, printer-optimized design
- **Customizable Print Options**: Single recipe, multiple recipes, meal plans
- **PDF Export**: High-quality PDF generation
- **Share Features**: Social media, email, messaging apps
- **QR Code Integration**: Link back to online version
- **Recipe Cards**: Compact, shareable recipe summaries

**Mobile Optimization:**
- **Responsive Design**: Optimized for all screen sizes
- **Touch-Friendly Interface**: Large buttons and intuitive gestures
- **Offline Capabilities**: Access saved recipes without internet
- **Camera Integration**: Direct photo upload for recipe extraction
- **Progressive Web App**: Install as native app on mobile devices
- **Push Notifications**: Meal reminders and updates

**Advanced Features Display:**
- **Integration Status**: Show connected accounts (Evernote, etc.)
- **Extraction Statistics**: Success rates and processing times
- **Meal Planning Analytics**: Adherence rates and time savings
- **Favorite Recipe Insights**: Usage patterns and recommendations
- **Social Features**: Recipe sharing and community features
- **AI Recommendations**: Personalized recipe suggestions

**Visual Design Elements:**
- **Modern Aesthetic**: Clean, minimalist design with culinary themes
- **Color Scheme**: Warm, appetizing colors with good contrast
- **Typography**: Readable fonts optimized for recipe content
- **Animations**: Smooth transitions and micro-interactions
- **Icons**: Intuitive iconography for cooking and food
- **Loading States**: Engaging loading animations
- **Error Handling**: User-friendly error messages and recovery

#### 4. Meal Planning System

**Smart Meal Planning Features:**
- **Personalized Meal Plans**: Generate weekly/monthly plans based on user preferences
- **Smart Repetition**: Choose repetition comfort level (None/Smart/Aggressive)
- **Cooking Schedule**: Plan around actual availability and cooking preferences
- **Batch Cooking**: Strategic meal prep and leftover utilization
- **Quick Meals**: 15-minute meals for busy days
- **No-Cook Options**: Zero-cooking days when needed
- **Favorite Recipe Integration**: Intelligently include favorite recipes in meal plans
- **Favorite Recipe Management**: Add, rate, and organize favorite recipes

**Repetition Strategies:**
1. **No Repetition** - Every meal is unique (traditional approach)
2. **Smart Repetition** - Balanced approach with strategic repetition
3. **Aggressive Repetition** - Heavy batch cooking for maximum efficiency

**Favorite Recipe Strategies:**
1. **Balanced** - Mix of favorites and new recipes
2. **Heavy Favorites** - Primarily use favorite recipes
3. **Light Favorites** - Use favorites sparingly, focus on variety

**Day Type Assignment:**
- **Cooking Days** - Full recipes with normal prep time
- **Quick Meal Days** - 15-minute or less recipes
- **Leftover Days** - Reheated meals from previous days
- **No-Cook Days** - Salads, sandwiches, takeout

**Shopping List Generation:**
- Automatic generation from meal plans
- Ingredient consolidation and categorization
- Smart quantities for batch cooking
- Manual editing and customization
- Export to PDF or print

**Progress Tracking:**
- Meal completion tracking
- Nutritional adherence monitoring
- Shopping list completion
- Cooking efficiency analytics
- Weekly/monthly progress reports
- Favorite recipe usage tracking

#### 5. Data Extraction Workflow

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

#### 8. Print Functionality

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
    "recharts": "^2.8.0"
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

#### 4. Data Extraction Services

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

#### 5. Meal Planning Services

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
- **Meal Planning Metrics:**
  - Meal plan adherence rate > 70%
  - User satisfaction with repetition options > 85%
  - Shopping list accuracy > 90%
  - Time saved in meal planning > 2 hours/week

### Future Enhancements
- User accounts and favorites
- Recipe sharing functionality
- **Advanced Meal Planning Features:**
  - AI-powered recipe recommendations
  - Meal plan templates for different diets
  - Family meal planning with multiple users
  - Integration with grocery delivery services
  - Recipe scaling (adjust servings)
  - Social features (comments, ratings)
  - Recipe recommendations based on meal plan history

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