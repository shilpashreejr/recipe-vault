# Database Setup Guide

This guide will help you set up the PostgreSQL database for the Recipe Management System.

## Option 1: Local PostgreSQL Installation

### macOS (using Homebrew)
```bash
# Install Homebrew if not already installed
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@14

# Start PostgreSQL service
brew services start postgresql@14

# Create database
createdb recipe_db
```

### Using Docker
```bash
# Pull and run PostgreSQL container
docker run --name recipe-postgres \
  -e POSTGRES_PASSWORD=yourpassword \
  -e POSTGRES_DB=recipe_db \
  -p 5432:5432 \
  -d postgres:14
```

## Option 2: Cloud PostgreSQL Services

### Vercel Postgres (Recommended for deployment)
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Create a new project or select existing project
3. Go to Storage tab and create a new Postgres database
4. Copy the connection string to your `.env` file

### Supabase (Free tier available)
1. Go to [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings > Database
4. Copy the connection string to your `.env` file

### Railway
1. Go to [Railway](https://railway.app)
2. Create a new project
3. Add PostgreSQL service
4. Copy the connection string to your `.env` file

## Environment Setup

1. Create a `.env` file in the root directory:
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/recipe_db"

# Environment
NODE_ENV="development"
```

2. Replace the DATABASE_URL with your actual connection string.

## Database Migration and Seeding

Once your database is set up and the DATABASE_URL is configured:

```bash
# Create and apply migrations
npx prisma migrate dev --name init

# Generate Prisma client
npx prisma generate

# Seed the database with initial categories
npx prisma db seed
```

Or use the setup script:
```bash
chmod +x scripts/setup-database.sh
./scripts/setup-database.sh
```

## Verify Setup

To verify everything is working:

```bash
# Open Prisma Studio to view your database
npx prisma studio
```

This will open a web interface at http://localhost:5555 where you can view and manage your database.

## Troubleshooting

### Connection Issues
- Make sure PostgreSQL is running
- Verify the DATABASE_URL format
- Check if the database exists
- Ensure the user has proper permissions

### Migration Issues
- If you get schema drift errors, reset the database:
  ```bash
  npx prisma migrate reset
  ```

### Seed Issues
- Make sure tsx is installed: `npm install --save-dev tsx`
- Check that the seed script path is correct in package.json 