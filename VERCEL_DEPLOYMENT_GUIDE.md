# Vercel Deployment Guide

## Step 1: Set Up Environment Variables on Vercel

Before deploying, you need to add these environment variables to your Vercel project:

### In Vercel Dashboard:
1. Go to your project settings
2. Click **Environment Variables**
3. Add the following variables:

```
DATABASE_URL=postgresql://[your-database-url]
SESSION_SECRET=[generate-a-random-secret]
NODE_ENV=production
```

### How to get DATABASE_URL:
- Use **Neon PostgreSQL** (recommended for Vercel): https://neon.tech
- Or use any PostgreSQL provider
- Format: `postgresql://user:password@host:port/database`

### How to generate SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 2: Deploy to Vercel

### Option A: Using Vercel CLI
```bash
npm install -g vercel
vercel
```

### Option B: Using GitHub
1. Push your code to GitHub
2. Connect your GitHub repo to Vercel
3. Vercel will auto-deploy on each push

## Step 3: Verify Deployment

Once deployed:
1. Check the Vercel dashboard for build logs
2. Test the app at your Vercel URL
3. API endpoints should work at: `https://your-app.vercel.app/api/...`

## Troubleshooting

### Error: "DATABASE_URL references Secret that does not exist"
- Solution: Add DATABASE_URL to Environment Variables in Vercel Settings

### Error: "Cannot find module"
- Solution: Make sure all dependencies are in package.json
- Run: `npm install` locally to verify

### Error: "Database connection failed"
- Solution: Check your DATABASE_URL is correct
- Ensure database server allows connections from Vercel IPs

## Database Configuration

For production, use **Neon PostgreSQL**:
1. Create account: https://neon.tech
2. Create a database
3. Copy connection string (DATABASE_URL)
4. Add to Vercel Environment Variables

## Local Testing Before Deploy

Test locally first:
```bash
# Development (Replit)
npm run dev

# Production build (local)
npm run build
npm run start
```

## API Endpoints (After Deploy)

All endpoints available at:
- `https://your-app.vercel.app/api/auth/...`
- `https://your-app.vercel.app/api/profile/...`
- `https://your-app.vercel.app/api/shop-items/...`
- `https://your-app.vercel.app/api/messages/...`
- etc.

## Security Notes

- Keep DATABASE_URL and SESSION_SECRET private
- Never commit secrets to GitHub
- Use Vercel's Environment Variables feature
- Enable HTTPS (automatic with Vercel)

## Support

For issues:
1. Check Vercel deployment logs
2. Verify environment variables are set
3. Test API endpoints with curl or Postman
4. Check browser DevTools for frontend errors
