# RecipeVault 🍳

A modern recipe extraction and management website built with Next.js 14, TypeScript, and AI-powered data extraction. Extract recipes from URLs, Instagram Reels, and images with intelligent parsing and organization.

## ✨ Features

- **Smart Recipe Extraction**: Automatically extract recipes from URLs, Instagram Reels, and images
- **OCR Technology**: Extract recipe text from screenshots and food photos using Tesseract.js
- **Organized Categories**: Browse recipes by starters, entrees, desserts, and dietary restrictions
- **Print & Share**: Print-friendly layouts and social media sharing
- **Responsive Design**: Works perfectly on iPhone, iPad, and Mac
- **Modern UI**: Built with shadcn/ui, Tailwind CSS, and Framer Motion
- **Database Management**: PostgreSQL with Prisma ORM for reliable data storage

## 🛠 Tech Stack

- **Frontend**: Next.js 14 with TypeScript
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Vercel with Vercel Postgres
- **Web Scraping**: Puppeteer/Playwright
- **OCR**: Tesseract.js
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
│   ├── components/          # React components
│   │   ├── forms/          # Form components
│   │   ├── layout/         # Layout components
│   │   ├── recipe/         # Recipe-specific components
│   │   └── ui/             # shadcn/ui components
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   │   └── extractors/     # Recipe extraction logic
│   └── types/              # TypeScript type definitions
├── prisma/                 # Database schema and migrations
├── scripts/                # Setup and deployment scripts
├── public/                 # Static assets
└── docs/                   # Documentation
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

### Phase 2: Data Extraction System (In Progress)
- [ ] Web scraping service
- [ ] OCR service for images
- [ ] Recipe parsing logic
- [ ] API endpoints for extraction

### Phase 3: User Interface Development
- [ ] Navigation and layout
- [ ] Recipe upload interface
- [ ] Recipe browser and cards
- [ ] Search and filter system

### Phase 4: Print and Share Functionality
- [ ] Print-friendly layouts
- [ ] Social media sharing
- [ ] Modern website design

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

## 📞 Support

If you have any questions or need help, please open an issue on GitHub or contact the maintainers.

---

Built with ❤️ using Next.js, TypeScript, and modern web technologies.
