#!/bin/bash

echo "Testing RecipeVault deployment setup..."

# Check if Vercel CLI is available
if ! command -v npx vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Please install it first: npm install -g vercel"
    exit 1
fi

# Check if user is logged in to Vercel
if ! npx vercel whoami &> /dev/null; then
    echo "❌ Please login to Vercel first: npx vercel login"
    exit 1
fi

echo "✅ Vercel CLI is available and user is logged in"

# Check if project is linked to Vercel
if [ ! -f ".vercel/project.json" ]; then
    echo "⚠️  Project not linked to Vercel. Running initial deployment..."
    npx vercel --yes
else
    echo "✅ Project is linked to Vercel"
fi

# Test build locally
echo "Testing local build..."
if npm run build; then
    echo "✅ Local build successful"
else
    echo "❌ Local build failed"
    exit 1
fi

# Check if Prisma client is generated
if [ -d "src/generated/prisma" ]; then
    echo "✅ Prisma client is generated"
else
    echo "⚠️  Prisma client not found. Generating..."
    npx prisma generate
fi

# Check environment variables
echo "Checking environment variables..."
if npx vercel env ls | grep -q "POSTGRES_PRISMA_URL"; then
    echo "✅ Postgres database environment variables are set"
else
    echo "⚠️  Postgres database environment variables not found"
    echo "Run: ./scripts/setup-vercel-postgres.sh"
fi

if npx vercel env ls | grep -q "NEXTAUTH_SECRET"; then
    echo "✅ NextAuth secret is set"
else
    echo "⚠️  NextAuth secret not set"
    echo "Run: ./scripts/configure-env-vars.sh"
fi

echo ""
echo "🎉 Deployment setup test completed!"
echo ""
echo "Next steps:"
echo "1. Deploy to production: npx vercel --prod"
echo "2. Visit your deployed URL to test the application"
echo "3. Check that the RecipeVault homepage loads correctly"
echo "4. Verify that all navigation links work"
echo ""
echo "If you encounter any issues:"
echo "- Check the Vercel dashboard for deployment logs"
echo "- Verify environment variables are set correctly"
echo "- Ensure the database is properly configured" 