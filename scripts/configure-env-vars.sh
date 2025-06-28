#!/bin/bash

echo "Configuring environment variables in Vercel..."

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

echo "Setting up environment variables..."

# Generate a random secret for NextAuth
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Get the project URL (you'll need to replace this with your actual domain)
echo "Please enter your Vercel project domain (e.g., your-project.vercel.app):"
read PROJECT_DOMAIN

NEXTAUTH_URL="https://$PROJECT_DOMAIN"

echo "Adding environment variables to Vercel..."

# Add environment variables
npx vercel env add NEXTAUTH_SECRET production <<< "$NEXTAUTH_SECRET"
npx vercel env add NEXTAUTH_URL production <<< "$NEXTAUTH_URL"
npx vercel env add NODE_ENV production <<< "production"

echo "Environment variables configured successfully!"
echo ""
echo "Added variables:"
echo "- NEXTAUTH_SECRET: $NEXTAUTH_SECRET"
echo "- NEXTAUTH_URL: $NEXTAUTH_URL"
echo "- NODE_ENV: production"
echo ""
echo "Note: The Postgres database variables should be automatically added when you create the database."
echo "If not, you can add them manually in the Vercel dashboard." 