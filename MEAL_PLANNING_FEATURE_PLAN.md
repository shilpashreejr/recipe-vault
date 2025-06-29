# Comprehensive Meal Planning Feature - Implementation Plan

## Overview
A comprehensive meal planning system that creates personalized weekly/monthly meal plans based on user preferences, dietary restrictions, and their stored recipes. The system will intelligently select meals from the user's recipe collection and suggest new recipes that match their preferences, with smart meal repetition options for realistic busy schedules.

## Core Value Propositions

### 1. **"Meal Planning That Fits Your Life"**
- Customize your cooking schedule (cook every day vs. meal prep once a week)
- Choose your repetition comfort level (none/smart/aggressive)
- Plan around your busy days with quick meals and no-cook options

### 2. **"Smart Repetition for Real People"**
- No judgment about meal repetition - it's practical and time-saving
- Batch cooking for efficiency and cost savings
- Leftover-friendly planning to reduce food waste
- Smart variety to prevent burnout

### 3. **"Your Cooking Style, Your Way"**
- From "cook every day" to "meal prep once a week"
- Quick meals for busy weekdays
- No-cook options when you need a break
- Flexible planning that adapts to your lifestyle

## Database Schema Extensions

### New Tables to Add

```prisma
// User Preferences & Dietary Restrictions
model UserPreferences {
  id                String   @id @default(cuid())
  userId            String   @unique
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  // Dietary Restrictions
  isVegetarian      Boolean  @default(false)
  isVegan           Boolean  @default(false)
  isGlutenFree      Boolean  @default(false)
  isDairyFree       Boolean  @default(false)
  isNutFree         Boolean  @default(false)
  isKeto            Boolean  @default(false)
  isPaleo           Boolean  @default(false)
  isLowCarb         Boolean  @default(false)
  
  // Allergies & Intolerances
  allergies         String[] // Array of allergy strings
  intolerances      String[] // Array of intolerance strings
  
  // Cooking Preferences
  preferredCuisines String[] // Array of cuisine types
  dislikedIngredients String[] // Array of disliked ingredients
  maxCookingTime    Int?     // Maximum cooking time in minutes
  preferredServings Int?     // Preferred number of servings
  
  // Nutritional Goals
  targetCalories    Int?     // Daily calorie target
  targetProtein     Int?     // Daily protein target in grams
  targetCarbs       Int?     // Daily carbs target in grams
  targetFat         Int?     // Daily fat target in grams
  
  // Meal Planning Preferences
  mealsPerDay       Int      @default(3) // 2, 3, or 4 meals
  planDuration      Int      @default(7) // Days to plan for (7, 14, 30)
  includeSnacks     Boolean  @default(false)
  leftoversPreference String? // "love", "tolerate", "avoid"
  
  // Smart Meal Repetition Preferences
  allowMealRepetition Boolean @default(true)
  repetitionStrategy  String  @default("smart") // "none", "smart", "aggressive"
  maxRepetitionsPerWeek Int   @default(3) // Maximum times a meal can repeat
  repetitionSpacing   Int     @default(2) // Minimum days between same meal
  batchCookingPreference String @default("moderate") // "none", "moderate", "heavy"
  mealPrepDays        String[] // ["sunday", "wednesday"] - preferred prep days
  
  // Cooking Schedule Preferences
  cookingDaysPerWeek  Int     @default(4) // How many days willing to cook
  quickMealDays       Int     @default(2) // Days for 15-min meals
  noCookDays          Int     @default(1) // Days for leftovers/takeout
  weekendCooking      Boolean @default(true) // Willing to cook on weekends
  
  // Favorite Recipe Integration
  favoriteIntegrationStrategy String @default("balanced") // "balanced", "heavy", "light"
  minFavoritesPerWeek Int     @default(1) // Minimum favorite recipes per week
  maxFavoritesPerWeek Int     @default(3) // Maximum favorite recipes per week
  
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@map("user_preferences")
}

// Meal Plans
model MealPlan {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name        String   // "Week of March 1st", "Summer Meal Plan", etc.
  startDate   DateTime
  endDate     DateTime
  isActive    Boolean  @default(true)
  
  // Plan Settings
  totalCalories    Int?
  totalProtein     Int?
  totalCarbs       Int?
  totalFat         Int?
  
  // Plan Strategy
  repetitionStrategy String @default("smart") // "none", "smart", "aggressive"
  batchCookingEnabled Boolean @default(true)
  mealPrepDays     String[] // Days when batch cooking happens
  
  // Plan Status
  status      String  @default("draft") // "draft", "active", "completed", "archived"
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  days        MealPlanDay[]
  shoppingList ShoppingList?

  @@map("meal_plans")
}

// Individual Days in Meal Plan
model MealPlanDay {
  id          String   @id @default(cuid())
  mealPlanId  String
  mealPlan    MealPlan @relation(fields: [mealPlanId], references: [id], onDelete: Cascade)
  
  date        DateTime
  dayOfWeek   String   // "monday", "tuesday", etc.
  
  // Day Type for Smart Planning
  dayType     String   @default("normal") // "cooking", "quick", "leftovers", "no-cook"
  cookingTime Int?     // Estimated cooking time for the day
  
  // Nutritional totals for the day
  totalCalories    Int?
  totalProtein     Int?
  totalCarbs       Int?
  totalFat         Int?
  
  meals       MealPlanMeal[]
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([mealPlanId, date])
  @@map("meal_plan_days")
}

// Individual Meals in a Day
model MealPlanMeal {
  id            String      @id @default(cuid())
  mealPlanDayId String
  mealPlanDay   MealPlanDay @relation(fields: [mealPlanDayId], references: [id], onDelete: Cascade)
  
  mealType      String      // "breakfast", "lunch", "dinner", "snack"
  mealTime      String?     // "8:00 AM", "12:30 PM", etc.
  
  // Recipe assignment
  recipeId      String?
  recipe        Recipe?     @relation(fields: [recipeId], references: [id])
  
  // Custom meal (if no recipe assigned)
  customMealName    String?
  customIngredients String?
  customInstructions String?
  
  // Meal Planning Strategy
  isBatchCooked     Boolean @default(false) // Made in advance
  isLeftover        Boolean @default(false) // Using leftovers
  isQuickMeal       Boolean @default(false) // 15-min or less
  isNoCook          Boolean @default(false) // No cooking required
  repetitionCount   Int     @default(0) // How many times this meal appears in plan
  
  // Nutritional info
  calories      Int?
  protein       Int?
  carbs         Int?
  fat           Int?
  
  // User notes
  notes         String?
  
  // Meal status
  isCompleted   Boolean     @default(false)
  isSkipped     Boolean     @default(false)
  
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt

  @@map("meal_plan_meals")
}

// Shopping Lists
model ShoppingList {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  name        String   // "Week of March 1st Shopping List"
  mealPlanId  String?
  mealPlan    MealPlan? @relation(fields: [mealPlanId], references: [id])
  
  isActive    Boolean  @default(true)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  items       ShoppingListItem[]

  @@map("shopping_lists")
}

// Shopping List Items
model ShoppingListItem {
  id              String        @id @default(cuid())
  shoppingListId  String
  shoppingList    ShoppingList  @relation(fields: [shoppingListId], references: [id], onDelete: Cascade)
  
  ingredientName  String
  quantity        String        // "2 cups", "1 lb", etc.
  unit            String?
  category        String?       // "produce", "dairy", "meat", "pantry", etc.
  
  isChecked       Boolean       @default(false)
  notes           String?
  
  createdAt       DateTime      @default(now())
  updatedAt       DateTime      @updatedAt

  @@map("shopping_list_items")
}

// Favorite Recipes with Enhanced Metadata
model FavoriteRecipe {
  id          String   @id @default(cuid())
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  recipeId    String
  recipe      Recipe   @relation(fields: [recipeId], references: [id], onDelete: Cascade)
  
  // User Rating & Notes
  rating      Int?     // 1-5 stars
  notes       String?  // Why they love this recipe
  
  // Usage Tracking
  timesCooked Int      @default(0)
  lastCooked  DateTime?
  
  // Meal Planning Preferences
  preferredMealType String? // "breakfast", "lunch", "dinner", "snack"
  preferredDays     String[] // ["monday", "wednesday", "friday"]
  preferredSeasons  String[] // ["spring", "summer", "fall", "winter"]
  
  // Cooking Preferences
  isQuickMeal       Boolean @default(false) // 15-min or less
  isMealPrepFriendly Boolean @default(false) // Good for batch cooking
  isLeftoverFriendly Boolean @default(false) // Reheats well
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  @@unique([userId, recipeId])
  @@map("favorite_recipes")
}
```

### Updates to Existing Tables

```prisma
// Add to User model
model User {
  // ... existing fields ...
  preferences     UserPreferences?
  mealPlans       MealPlan[]
  shoppingLists   ShoppingList[]
  favoriteRecipes FavoriteRecipe[]
}

// Add to Recipe model
model Recipe {
  // ... existing fields ...
  mealPlanMeals   MealPlanMeal[]
  favoriteRecipes FavoriteRecipe[]
  
  // Recipe tags for meal planning
  isQuickMeal       Boolean @default(false) // 15-min or less
  isMealPrepFriendly Boolean @default(false) // Good for batch cooking
  isLeftoverFriendly Boolean @default(false) // Reheats well
  isFreezerFriendly Boolean @default(false) // Can be frozen
}
```

## Smart Repetition Strategies

### 1. **No Repetition** (Traditional)
- Every meal is unique
- Maximum variety
- Higher cooking time and complexity
- Best for: Food enthusiasts, those with lots of time

### 2. **Smart Repetition** (Recommended)
- Strategic meal repetition based on user preferences
- Batch cooking on designated prep days
- Leftovers used 1-2 days later
- Quick meals on busy days
- Balance between variety and practicality
- Best for: Most users, realistic busy schedules

### 3. **Aggressive Repetition** (Time-Saving)
- Heavy batch cooking
- Same meal appears 2-3 times per week
- Maximum time efficiency
- Minimal cooking days
- Best for: Very busy users, meal prep enthusiasts

## Feature Components

### 1. User Preferences Setup
- **Dietary Restrictions Form**: Checkboxes for vegetarian, vegan, gluten-free, etc.
- **Allergies & Intolerances**: Multi-select with common allergens
- **Cooking Preferences**: Cuisine types, cooking time limits, serving sizes
- **Nutritional Goals**: Daily calorie and macro targets
- **Meal Planning Preferences**: Meals per day, plan duration, snack preferences
- **Smart Repetition Preferences**: 
  - Allow meal repetition (Yes/No)
  - Repetition strategy (None/Smart/Aggressive)
  - Maximum repetitions per week
  - Minimum days between same meal
  - Batch cooking preference
  - Preferred meal prep days
- **Cooking Schedule Preferences**:
  - How many days per week willing to cook
  - Days for quick meals (15-min or less)
  - Days for leftovers/no-cook
  - Weekend cooking preference
- **Favorite Recipe Integration**:
  - Integration strategy (balanced/heavy/light)
  - Minimum and maximum favorites per week

### 2. Smart Meal Plan Generation Engine
- **Recipe Selection Algorithm**: 
  - Filter by dietary restrictions
  - Match nutritional goals
  - Consider cooking time preferences
  - Balance variety and user favorites
  - Account for leftovers and meal prep
- **Smart Repetition Logic**:
  - Respect user's repetition preferences
  - Strategic meal placement (batch cooking on prep days)
  - Leftover utilization across multiple days
  - Quick meal distribution on busy days
- **Day Type Assignment**:
  - Cooking days (full recipes)
  - Quick meal days (15-min recipes)
  - Leftover days (reheated meals)
  - No-cook days (salads, sandwiches, etc.)
- **Nutritional Balancing**: Ensure daily/weekly nutritional targets are met
- **Variety Optimization**: Smart variety based on repetition preferences
- **Favorite Recipe Integration**: Intelligent inclusion of user favorites

### 3. Modern Meal Plan Interface
- **Calendar View**: Weekly/monthly calendar with meal assignments
- **List View**: Simple list of planned meals
- **Drag & Drop**: Reorder meals within days or between days
- **Quick Edit**: Change meal types, times, or recipes
- **Bulk Actions**: Copy meals, swap days, clear days
- **Smart Suggestions**: 
  - "Make double batch for leftovers"
  - "This meal works well for meal prep"
  - "Consider this quick alternative"
- **Progress Tracking**: Visual indicators for completed meals
- **Nutritional Overview**: Daily/weekly macro summaries

### 4. Recipe Integration
- **Recipe Browser**: Browse user's recipes with filtering
- **Recipe Suggestions**: AI-powered recipe recommendations
- **Recipe Substitution**: Suggest alternatives for unavailable ingredients
- **Recipe Scaling**: Automatically adjust servings for meal plan
- **Recipe Tags**: 
  - "Quick" (15-min or less)
  - "Meal Prep Friendly"
  - "Leftover Friendly"
  - "Freezer Friendly"

### 5. Shopping List Generation
- **Automatic Generation**: Create shopping list from meal plan
- **Ingredient Consolidation**: Combine similar ingredients
- **Category Organization**: Group by store sections
- **Manual Editing**: Add/remove items, adjust quantities
- **Export Options**: Print, PDF, or share
- **Smart Quantities**: Account for batch cooking and leftovers

### 6. Progress Tracking
- **Meal Completion**: Mark meals as completed or skipped
- **Nutritional Tracking**: Track actual vs. planned nutrition
- **Shopping Progress**: Track shopping list completion
- **Analytics**: Weekly/monthly reports on adherence
- **Cooking Efficiency**: Track time spent cooking vs. planned

## API Endpoints

### User Preferences
```
GET    /api/preferences
PUT    /api/preferences
POST   /api/preferences/onboarding
PUT    /api/preferences/repetition-strategy
```

### Meal Plans
```
GET    /api/meal-plans
POST   /api/meal-plans
GET    /api/meal-plans/[id]
PUT    /api/meal-plans/[id]
DELETE /api/meal-plans/[id]
POST   /api/meal-plans/[id]/generate
POST   /api/meal-plans/[id]/copy
POST   /api/meal-plans/[id]/optimize-repetition
```

### Meal Plan Days
```
GET    /api/meal-plans/[id]/days
PUT    /api/meal-plans/[id]/days/[date]
POST   /api/meal-plans/[id]/days/[date]/meals
PUT    /api/meal-plans/[id]/days/[date]/meals/[mealId]
DELETE /api/meal-plans/[id]/days/[date]/meals/[mealId]
```

### Shopping Lists
```
GET    /api/shopping-lists
POST   /api/shopping-lists
GET    /api/shopping-lists/[id]
PUT    /api/shopping-lists/[id]
DELETE /api/shopping-lists/[id]
POST   /api/shopping-lists/[id]/generate
POST   /api/shopping-lists/[id]/items
PUT    /api/shopping-lists/[id]/items/[itemId]
DELETE /api/shopping-lists/[id]/items/[itemId]
```

### Recipe Integration
```
GET    /api/recipes/for-meal-plan
GET    /api/recipes/suggestions
POST   /api/recipes/[id]/scale
GET    /api/recipes/quick-meals
GET    /api/recipes/meal-prep-friendly
GET    /api/recipes/leftover-friendly
```

### Favorites Management
```
GET    /api/favorites
POST   /api/favorites
PUT    /api/favorites/[id]
DELETE /api/favorites/[id]
GET    /api/favorites/stats
POST   /api/favorites/[id]/cook
GET    /api/favorites/meal-plan-suggestions
```

## Frontend Pages & Components

### Pages
1. **Preferences Setup** (`/preferences`)
2. **Meal Plan Dashboard** (`/meal-plans`)
3. **Create Meal Plan** (`/meal-plans/create`)
4. **Edit Meal Plan** (`/meal-plans/[id]`)
5. **Shopping Lists** (`/shopping-lists`)
6. **Progress Tracking** (`/progress`)
7. **Favorites Management** (`/favorites`)

### Components
1. **PreferencesForm** - Multi-step form for user preferences
2. **RepetitionStrategySelector** - Choose repetition comfort level
3. **CookingScheduleSelector** - Set cooking availability
4. **MealPlanCalendar** - Calendar view with meal assignments
5. **MealPlanList** - List view of planned meals
6. **MealCard** - Individual meal display with recipe info
7. **RecipeSelector** - Modal for selecting recipes
8. **ShoppingListEditor** - Shopping list management
9. **NutritionalSummary** - Daily/weekly nutritional overview
10. **ProgressTracker** - Meal completion tracking
11. **SmartSuggestions** - AI-powered meal planning tips
12. **FavoritesManager** - Manage favorite recipes
13. **FavoriteRecipeCard** - Display favorite recipe with metadata

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema updates and migrations
- [ ] User preferences model and API
- [ ] Basic meal plan CRUD operations
- [ ] Preferences setup page with repetition options
- [ ] Favorites management system

### Phase 2: Core Meal Planning (Week 3-4)
- [ ] Smart meal plan generation algorithm
- [ ] Repetition strategy implementation
- [ ] Calendar and list views
- [ ] Recipe integration and selection
- [ ] Drag & drop functionality
- [ ] Favorite recipe integration

### Phase 3: Shopping & Tracking (Week 5-6)
- [ ] Shopping list generation
- [ ] Progress tracking system
- [ ] Nutritional calculations
- [ ] Export and sharing features
- [ ] Meal completion tracking

### Phase 4: Advanced Features (Week 7-8)
- [ ] AI-powered recipe suggestions
- [ ] Meal plan templates
- [ ] Social features (share meal plans)
- [ ] Mobile optimization
- [ ] Advanced analytics

## Technical Considerations

### Performance
- **Caching**: Cache user preferences and frequently accessed recipes
- **Pagination**: Handle large recipe collections efficiently
- **Background Jobs**: Use queues for meal plan generation
- **Database Indexing**: Optimize queries for meal plan operations

### Scalability
- **Microservices**: Consider separating meal planning logic
- **CDN**: Cache static assets and images
- **Database Sharding**: Plan for user growth
- **API Rate Limiting**: Prevent abuse of generation endpoints

### Security
- **User Isolation**: Ensure users can only access their own data
- **Input Validation**: Validate all meal plan inputs
- **API Authentication**: Secure all meal planning endpoints
- **Data Privacy**: Handle sensitive dietary information properly

## Monetization Integration

### Premium Features
- **Advanced Meal Planning**: AI-powered suggestions, nutritional optimization
- **Recipe Recommendations**: Personalized recipe discovery
- **Meal Plan Templates**: Pre-made plans for different diets and repetition styles
- **Shopping List Optimization**: Smart ingredient consolidation
- **Progress Analytics**: Detailed tracking and insights
- **Social Features**: Share meal plans with family/friends
- **Custom Repetition Strategies**: Advanced repetition algorithms
- **Family Planning**: Multiple users, shared meal plans

### Pricing Tiers
- **Free**: Basic meal planning (7-day plans, limited recipes, basic repetition)
- **Premium** ($8/month): Advanced features, unlimited plans, AI suggestions, smart repetition
- **Family** ($15/month): Multiple users, shared meal plans, family shopping lists, custom repetition strategies

## Success Metrics

### User Engagement
- Meal plan creation rate > 60%
- Meal plan completion rate > 70%
- Shopping list usage > 80%
- User retention after first meal plan > 85%

### Technical Performance
- Meal plan generation time < 5 seconds
- Page load time < 3 seconds
- API response time < 500ms
- Mobile responsiveness score > 95

### Business Metrics
- User satisfaction with repetition options > 85%
- Shopping list accuracy > 90%
- Time saved in meal planning > 2 hours/week
- Feature adoption rate > 70%

## Marketing Messaging

### Primary Value Propositions:
1. **"Meal Planning That Fits Your Life"**
   - Customize your cooking schedule
   - Choose your repetition comfort level
   - Plan around your busy days

2. **"Smart Repetition for Real People"**
   - No judgment about meal repetition
   - Batch cooking for efficiency
   - Leftover-friendly planning

3. **"Your Cooking Style, Your Way"**
   - From "cook every day" to "meal prep once a week"
   - Quick meals for busy days
   - No-cook options when needed

### Feature Highlights:
- **Flexible Repetition**: Choose how often you're okay with repeating meals
- **Smart Scheduling**: Plan cooking around your actual availability
- **Batch Cooking**: Make once, eat multiple times
- **Leftover Strategy**: Turn yesterday's dinner into today's lunch
- **Quick Meal Days**: 15-minute meals for busy weekdays
- **No-Cook Options**: Zero-cooking days when you need a break
- **Favorite Integration**: Intelligently include your favorite recipes
- **Smart Shopping**: Auto-generated lists from your meal plans

This comprehensive meal planning feature will significantly enhance the value proposition of Recipe Vault by providing a complete solution from recipe storage to meal execution, with realistic meal planning that respects busy schedules and cooking preferences. 