# Vercel Setup Guide

## Prerequisites

1. **Vercel Account**: Create an account at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Ensure your project is pushed to GitHub
3. **Vercel CLI**: Install globally or use `npx vercel`

## Step 1: Deploy to Vercel

```bash
# Login to Vercel (if not already logged in)
npx vercel login

# Deploy the project
npx vercel --yes
```

## Step 2: Set up Vercel Postgres Database

### Option A: Using the Setup Script

```bash
# Run the setup script
./scripts/setup-vercel-postgres.sh
```

### Option B: Manual Setup

1. **Create Postgres Database**:
   ```bash
   npx vercel storage create postgres
   ```

2. **Environment Variables**: The following variables will be automatically added to your Vercel project:
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL` (used by Prisma)
   - `POSTGRES_URL_NON_POOLING`
   - `POSTGRES_USER`
   - `POSTGRES_HOST`
   - `POSTGRES_PASSWORD`
   - `POSTGRES_DATABASE`

3. **Push Database Schema**:
   ```bash
   npx prisma db push
   ```

4. **Generate Prisma Client**:
   ```bash
   npx prisma generate
   ```

## Step 3: Configure Environment Variables

Add the following environment variables to your Vercel project:

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add the following variables:

```
NEXTAUTH_SECRET=your-secret-key-here
NEXTAUTH_URL=https://your-domain.vercel.app
NODE_ENV=production
```

## Step 4: Build Settings

The project is already configured for Vercel deployment with:

- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

## Step 5: Test Deployment

1. **Deploy**: Push changes to your GitHub repository
2. **Verify**: Check that the deployment is successful
3. **Test**: Visit your deployed URL and test the application

## Troubleshooting

### Common Issues

1. **Database Connection**: Ensure `POSTGRES_PRISMA_URL` is set correctly
2. **Build Failures**: Check that all dependencies are in `package.json`
3. **Environment Variables**: Verify all required variables are set in Vercel

### Useful Commands

```bash
# Check Vercel status
npx vercel ls

# View deployment logs
npx vercel logs

# Pull environment variables
npx vercel env pull .env.local

# Deploy to production
npx vercel --prod
```

## Next Steps

After successful deployment:

1. Set up custom domain (optional)
2. Configure monitoring and analytics
3. Set up CI/CD pipeline
4. Configure backup strategies for the database 