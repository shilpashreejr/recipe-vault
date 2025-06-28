#!/bin/bash

echo "Setting up Vercel Postgres database..."

# Check if Vercel CLI is available
if ! command -v npx vercel &> /dev/null; then
    echo "Vercel CLI not found. Please install it first: npm install -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! npx vercel whoami &> /dev/null; then
    echo "Please login to Vercel first: npx vercel login"
    exit 1
fi

echo "Creating Vercel Postgres database..."
echo "This will create a new Postgres database in your Vercel project."
echo "Make sure you have a Vercel project set up first."

# Create Postgres database
npx vercel storage create postgres

echo "Postgres database created successfully!"
echo "The following environment variables will be automatically added to your Vercel project:"
echo "- POSTGRES_URL"
echo "- POSTGRES_PRISMA_URL" 
echo "- POSTGRES_URL_NON_POOLING"
echo "- POSTGRES_USER"
echo "- POSTGRES_HOST"
echo "- POSTGRES_PASSWORD"
echo "- POSTGRES_DATABASE"

echo ""
echo "Next steps:"
echo "1. Update your Prisma schema to use POSTGRES_PRISMA_URL instead of DATABASE_URL"
echo "2. Run 'npx prisma db push' to push the schema to the database"
echo "3. Run 'npx prisma generate' to generate the Prisma client" 