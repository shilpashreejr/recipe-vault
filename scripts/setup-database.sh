#!/bin/bash

# Database Setup Script for Recipe Management System

echo "Setting up database for Recipe Management System..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
    echo "Error: DATABASE_URL environment variable is not set."
    echo "Please set it in your .env file:"
    echo "DATABASE_URL=\"postgresql://username:password@localhost:5432/recipe_db\""
    exit 1
fi

# Create and apply migrations
echo "Creating database migration..."
npx prisma migrate dev --name init

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Seed the database
echo "Seeding database with initial data..."
npx prisma db seed

echo "Database setup complete!" 