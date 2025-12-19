# Railway Quick Start Guide

## Deploy Backend to Railway

### Step 1: Create Project
1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose **`ugochukwu16henry/Henrymo_Socials`**
5. Railway will auto-detect configuration

### Step 2: Add PostgreSQL Database
1. In your Railway project, click **"+ New"**
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway creates the database automatically
4. Go to the PostgreSQL service → **"Variables"** tab
5. Copy the **`DATABASE_URL`** value

### Step 3: Configure Backend Service
1. Go to your backend service in Railway
2. Click **"Variables"** tab
3. Add these environment variables:

```
DATABASE_URL=<paste from PostgreSQL service>
JWT_SECRET=<generate a secure random string>
NODE_ENV=production
PORT=3000
```

**To generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 4: Run Migrations
After first deployment, you need to run database migrations:

**Option A: Railway CLI**
```bash
railway run --service backend "cd backend && npx prisma migrate deploy"
```

**Option B: Railway UI**
1. Go to your backend service
2. Click **"Deployments"**
3. Click **"..."** on latest deployment
4. Select **"Open Shell"**
5. Run: `cd backend && npx prisma migrate deploy`

### Step 5: Deploy!
Railway will automatically:
- ✅ Install dependencies
- ✅ Generate Prisma client
- ✅ Build the application
- ✅ Start the server

### Step 6: Get Your URL
1. Go to your backend service
2. Click **"Settings"** → **"Generate Domain"**
3. Your API will be available at: `https://your-app.railway.app`

## Testing Deployment

Once deployed, test:
- Health check: `https://your-app.railway.app/api`
- API Docs: `https://your-app.railway.app/api/docs`
- Root: `https://your-app.railway.app/`

## Environment Variables Summary

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | Connection string | PostgreSQL service |
| `JWT_SECRET` | Random hex string | Generate new |
| `NODE_ENV` | `production` | Set manually |
| `PORT` | `3000` | Auto-set by Railway |

## Troubleshooting

**Build fails?**
- Check build logs in Railway
- Ensure all files are pushed to GitHub
- Verify `nixpacks.toml` is correct

**Database connection fails?**
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running
- Run migrations: `npx prisma migrate deploy`

**App won't start?**
- Check deployment logs
- Verify `PORT` environment variable
- Ensure `dist/main.js` exists after build

## Next: Deploy Frontend

After backend is deployed, you can:
1. Deploy frontend separately (Vercel/Netlify recommended)
2. Update frontend API URL to your Railway backend URL
3. Or deploy frontend as separate Railway service

