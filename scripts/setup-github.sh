#!/bin/bash

echo "Setting up GitHub repository for RecipeVault..."

# Check if git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install git first."
    exit 1
fi

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a git repository. Please initialize git first."
    exit 1
fi

echo "✅ Git is available and we're in a git repository"

# Check if there are any uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  There are uncommitted changes. Please commit them first."
    git status
    exit 1
fi

echo "✅ All changes are committed"

# Check if remote is already configured
if git remote -v | grep -q "origin"; then
    echo "⚠️  Remote 'origin' is already configured:"
    git remote -v
    echo ""
    echo "Do you want to continue with the existing remote? (y/n)"
    read -r response
    if [[ ! "$response" =~ ^[Yy]$ ]]; then
        echo "Please remove the existing remote first: git remote remove origin"
        exit 1
    fi
else
    echo "No remote repository configured yet."
fi

echo ""
echo "📋 Instructions to create GitHub repository:"
echo ""
echo "1. Go to https://github.com/new"
echo "2. Repository name: recipe-vault"
echo "3. Description: Recipe extraction and management website"
echo "4. Make it Public or Private (your choice)"
echo "5. DO NOT initialize with README, .gitignore, or license (we already have these)"
echo "6. Click 'Create repository'"
echo ""
echo "After creating the repository, GitHub will show you commands to push an existing repository."
echo "Copy the URL of your new repository (it will look like: https://github.com/yourusername/recipe-vault.git)"
echo ""
echo "Enter the GitHub repository URL:"
read -r github_url

if [[ -z "$github_url" ]]; then
    echo "❌ No URL provided. Exiting."
    exit 1
fi

echo "Adding remote origin..."
git remote add origin "$github_url"

echo "Pushing to GitHub..."
git branch -M main
git push -u origin main

if [ $? -eq 0 ]; then
    echo ""
    echo "🎉 Successfully pushed RecipeVault to GitHub!"
    echo "Repository URL: $github_url"
    echo ""
    echo "Next steps:"
    echo "1. Visit your repository on GitHub to verify everything is there"
    echo "2. Set up Vercel deployment by connecting your GitHub repository"
    echo "3. Run the Vercel deployment scripts we created earlier"
else
    echo "❌ Failed to push to GitHub. Please check the error message above."
    exit 1
fi 