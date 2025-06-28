# Personalized Meal Planning Feature - Implementation Plan

## Overview
A comprehensive meal planning system that creates personalized weekly/monthly meal plans based on user preferences, dietary restrictions, and their stored recipes. The system will intelligently select meals from the user's recipe collection and suggest new recipes that match their preferences.

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
  
  // Plan Status
  status      String  @default("draft") // "draft", "active", "completed", "archived"
  
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  days        MealPlanDay[]

  @@map("meal_plans")
}

// Individual Days in Meal Plan
model MealPlanDay {
  id          String   @id @default(cuid())
  mealPlanId  String
  mealPlan    MealPlan @relation(fields: [mealPlanId], references: [id], onDelete: Cascade)
  
  date        DateTime
  dayOfWeek   String   // "monday", "tuesday", etc.
  
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
```

### Updates to Existing Tables

```prisma
// Add to User model
model User {
  // ... existing fields ...
  preferences     UserPreferences?
  mealPlans       MealPlan[]
  shoppingLists   ShoppingList[]
}

// Add to Recipe model
model Recipe {
  // ... existing fields ...
  mealPlanMeals   MealPlanMeal[]
}

// Add to MealPlan model
model MealPlan {
  // ... existing fields ...
  shoppingList    ShoppingList?
}
```

## Feature Components

### 1. User Preferences Setup
- **Dietary Restrictions Form**: Checkboxes for vegetarian, vegan, gluten-free, etc.
- **Allergies & Intolerances**: Multi-select with common allergens
- **Cooking Preferences**: Cuisine types, cooking time limits, serving sizes
- **Nutritional Goals**: Daily calorie and macro targets
- **Meal Planning Preferences**: Meals per day, plan duration, snack preferences

### 2. Meal Plan Generation Engine
- **Recipe Selection Algorithm**: 
  - Filter by dietary restrictions
  - Match nutritional goals
  - Consider cooking time preferences
  - Balance variety and user favorites
  - Account for leftovers and meal prep
- **Nutritional Balancing**: Ensure daily/weekly nutritional targets are met
- **Variety Optimization**: Avoid repetitive meals and ingredients

### 3. Meal Plan Interface
- **Calendar View**: Weekly/monthly calendar with meal assignments
- **List View**: Simple list of planned meals
- **Drag & Drop**: Reorder meals within days or between days
- **Quick Edit**: Change meal types, times, or recipes
- **Bulk Actions**: Copy meals, swap days, clear days

### 4. Recipe Integration
- **Recipe Browser**: Browse user's recipes with filtering
- **Recipe Suggestions**: AI-powered recipe recommendations
- **Recipe Substitution**: Suggest alternatives for unavailable ingredients
- **Recipe Scaling**: Automatically adjust servings for meal plan

### 5. Shopping List Generation
- **Automatic Generation**: Create shopping list from meal plan
- **Ingredient Consolidation**: Combine similar ingredients
- **Category Organization**: Group by store sections
- **Manual Editing**: Add/remove items, adjust quantities
- **Export Options**: Print, PDF, or share

### 6. Progress Tracking
- **Meal Completion**: Mark meals as completed or skipped
- **Nutritional Tracking**: Track actual vs. planned nutrition
- **Shopping Progress**: Track shopping list completion
- **Analytics**: Weekly/monthly reports on adherence

## API Endpoints

### User Preferences
```
GET    /api/preferences
PUT    /api/preferences
POST   /api/preferences/onboarding
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
```

## Frontend Pages & Components

### Pages
1. **Preferences Setup** (`/preferences`)
2. **Meal Plan Dashboard** (`/meal-plans`)
3. **Create Meal Plan** (`/meal-plans/create`)
4. **Edit Meal Plan** (`/meal-plans/[id]`)
5. **Shopping Lists** (`/shopping-lists`)
6. **Progress Tracking** (`/progress`)

### Components
1. **PreferencesForm** - Multi-step form for user preferences
2. **MealPlanCalendar** - Calendar view with meal assignments
3. **MealPlanList** - List view of planned meals
4. **MealCard** - Individual meal display with recipe info
5. **RecipeSelector** - Modal for selecting recipes
6. **ShoppingListEditor** - Shopping list management
7. **NutritionalSummary** - Daily/weekly nutritional overview
8. **ProgressTracker** - Meal completion tracking

## Implementation Phases

### Phase 1: Foundation (Week 1-2)
- [ ] Database schema updates and migrations
- [ ] User preferences model and API
- [ ] Basic meal plan CRUD operations
- [ ] Preferences setup page

### Phase 2: Core Meal Planning (Week 3-4)
- [ ] Meal plan generation algorithm
- [ ] Calendar and list views
- [ ] Recipe integration and selection
- [ ] Drag & drop functionality

### Phase 3: Shopping & Tracking (Week 5-6)
- [ ] Shopping list generation
- [ ] Progress tracking system
- [ ] Nutritional calculations
- [ ] Export and sharing features

### Phase 4: Advanced Features (Week 7-8)
- [ ] AI-powered recipe suggestions
- [ ] Meal plan templates
- [ ] Social features (share meal plans)
- [ ] Mobile optimization

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
- **Meal Plan Templates**: Pre-made plans for different diets
- **Shopping List Optimization**: Smart ingredient consolidation
- **Progress Analytics**: Detailed tracking and insights
- **Social Features**: Share meal plans with family/friends

### Pricing Tiers
- **Free**: Basic meal planning (7-day plans, limited recipes)
- **Premium** ($8/month): Advanced features, unlimited plans, AI suggestions
- **Family** ($15/month): Multiple users, shared meal plans, family shopping lists

This meal planning feature will significantly enhance the value proposition of Recipe Vault by providing a complete solution from recipe storage to meal execution, making it an essential tool for home cooks and families. 