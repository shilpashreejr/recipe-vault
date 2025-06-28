# RecipeVault 🍳

A modern recipe extraction and management website built with Next.js 14, TypeScript, and AI-powered data extraction. Extract recipes from URLs, Instagram Reels, and images with intelligent parsing, meal planning, photo-based food logging, and smart grocery shopping lists.

## ✨ Features

### Recipe Management ✅
- **Smart Recipe Extraction**: Automatically extract recipes from URLs, Instagram Reels, and images
- **OCR Technology**: Extract recipe text from screenshots and food photos using Tesseract.js
- **Multi-Source Support**: Social media, notes apps, web blogs, and handwritten recipes
- **Organized Categories**: Browse recipes by starters, entrees, desserts, and dietary restrictions
- **Print & Share**: Print-friendly layouts and social media sharing

### Smart Meal Planning (In Development)
- **Personalized Meal Plans**: AI-powered meal planning with smart repetition strategies
- **Dietary Preferences**: Customize plans for restrictions, allergies, and taste preferences
- **Time Management**: Plan meals around your schedule with prep time optimization
- **Smart Repetition**: Intelligent meal rotation to reduce food waste and save time

### Photo-Based Food Logging (Planned)
- **AI-Powered Recognition**: Snap photos of meals for automatic ingredient identification
- **Macro Tracking**: Monitor protein, carbs, and fat intake with detailed breakdowns
- **Progress Insights**: Get personalized recommendations based on eating patterns
- **Nutritional Goals**: Set and track macro targets with visual progress indicators

### Smart Grocery Shopping (Planned)
- **Auto-Generated Lists**: Shopping lists automatically created from meal plans
- **Inventory Management**: Track pantry and fridge contents to avoid duplicates
- **Budget Optimization**: Price comparisons, sale alerts, and budget-friendly alternatives
- **Waste Reduction**: Smart suggestions to minimize food waste and save money

### User Experience ✅
- **Responsive Design**: Works perfectly on iPhone, iPad, and Mac
- **Modern UI**: Built with shadcn/ui, Tailwind CSS, and Framer Motion
- **Database Management**: PostgreSQL with Prisma ORM for reliable data storage
- **Mobile-First**: Optimized for mobile food logging and grocery management

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel with Vercel Postgres
- **Web Scraping**: Puppeteer/Playwright
- **OCR**: Tesseract.js
- **AI/ML**: Photo recognition and meal planning algorithms
- **Authentication**: NextAuth.js (planned)

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/recipe-vault.git
   cd recipe-vault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   # Edit .env.local with your database URL and other settings
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Push schema to database
   npx prisma db push
   
   # Seed the database with initial categories
   npm run prisma:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🚀 Deployment

### Vercel Deployment (Recommended)

1. **Create Vercel account** at [vercel.com](https://vercel.com)

2. **Deploy to Vercel**
   ```bash
   npx vercel login
   npx vercel --yes
   ```

3. **Set up Vercel Postgres**
   ```bash
   ./scripts/setup-vercel-postgres.sh
   ```

4. **Configure environment variables**
   ```bash
   ./scripts/configure-env-vars.sh
   ```

5. **Deploy to production**
   ```bash
   npx vercel --prod
   ```

For detailed deployment instructions, see [VERCEL_SETUP.md](./VERCEL_SETUP.md).

## 📁 Project Structure

```
recipe-vault/
├── src/
│   ├── app/                 # Next.js app directory
│   │   ├── api/            # API routes
│   │   │   ├── extract/    # Recipe extraction endpoints
│   │   │   │   ├── evernote/ # Evernote integration
│   │   │   │   ├── image/  # OCR and image processing
│   │   │   │   └── social-media/ # Social media scrapers
│   │   │   ├── recipes/    # Recipe management endpoints
│   │   │   └── upload/     # File upload endpoints
│   │   ├── recipes/        # Recipe pages
│   │   │   ├── upload/     # Recipe upload interface
│   │   │   ├── search/     # Recipe search and filtering
│   │   │   └── [id]/       # Individual recipe pages
│   │   ├── categories/     # Recipe category pages
│   │   └── test-scrapers/  # Testing interface for scrapers
│   ├── components/          # React components
│   │   ├── forms/          # Form components (ImageUpload, AppleNotesUpload)
│   │   ├── layout/         # Layout components (Navigation)
│   │   ├── recipe/         # Recipe-specific components (RecipeCard)
│   │   └── ui/             # shadcn/ui components
│   ├── lib/                # Utility functions and services
│   │   ├── extractors/     # Recipe extraction logic
│   │   │   ├── web-scraper.ts
│   │   │   ├── social-media/ # Social media scrapers
│   │   │   ├── rate-limiter.ts
│   │   │   └── error-handler.ts
│   │   ├── evernote/       # Evernote integration
│   │   ├── apple-notes/    # Apple Notes integration
│   │   ├── ocr/            # OCR service with Tesseract.js
│   │   └── recipe-parser/  # Recipe parsing logic
│   └── types/              # TypeScript type definitions
├── prisma/                 # Database schema and migrations
├── scripts/                # Setup and deployment scripts
└── public/                 # Static assets
```

## 🔧 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run prisma:seed` - Seed database with initial data

## 📋 Development Roadmap

### Phase 1: Core Infrastructure ✅
- [x] Next.js 14 project setup
- [x] Database setup with Prisma
- [x] Vercel deployment configuration
- [x] Basic project structure

### Phase 2: Data Extraction System ✅
- [x] Web scraping service
- [x] OCR service for images
- [x] Recipe parsing logic
- [x] API endpoints for extraction
- [x] Social media integration
- [x] Notes app integration

### Phase 3: User Interface Development ✅
- [x] Navigation and layout
- [x] Recipe upload interface
- [x] Recipe browser and cards
- [x] Search and filter system
- [x] Modern design system
- [x] Homepage background images update
  - [x] Added food-related background images inspired by Wix restaurant templates
  - [x] Recipe extraction section with beautiful food preparation imagery
  - [x] Food logging section with healthy meal tracking visuals
  - [x] Smart grocery section with fresh produce shopping scenes
  - [x] Meal planning section with organized meal prep imagery
  - [x] All images blend seamlessly with proper opacity and gradient overlays

### Phase 4: Meal Planning System (In Progress)
- [ ] Smart meal plan generation
- [ ] User preferences system
- [ ] Meal plan interface
- [ ] Shopping list generation
- [ ] Progress tracking

### Phase 5: Food Logging System (Planned)
- [ ] Photo-based food recognition
- [ ] Macro tracking interface
- [ ] Nutritional goal setting
- [ ] Progress analytics
- [ ] Mobile-optimized logging

### Phase 6: Grocery Management System (Planned)
- [ ] Inventory tracking
- [ ] Smart shopping lists
- [ ] Budget optimization
- [ ] Waste reduction features
- [ ] Store integration

### Phase 7: Advanced Features (Planned)
- [ ] AI-powered meal suggestions
- [ ] Social features and sharing
- [ ] Integration with fitness trackers
- [ ] Restaurant meal logging
- [ ] Voice-to-text food logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Prisma](https://prisma.io/) for the excellent ORM
- [Vercel](https://vercel.com/) for seamless deployment
- [Tesseract.js](https://tesseract.projectnaptha.com/) for OCR capabilities

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
