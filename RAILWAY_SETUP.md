# Railway Deployment Guide

## Quick Setup

### 1. Connect Repository
1. Go to [Railway Dashboard](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"
4. Choose `ugochukwu16henry/Henrymo_Socials`
5. Railway will detect the project automatically

### 2. Configure Build Settings
Railway should auto-detect the configuration from `nixpacks.toml`:
- **Root Directory**: Leave empty (or set to `backend` if deploying only backend)
- **Build Command**: Will use `npm run build`
- **Start Command**: Will use `npm start`

### 3. Add PostgreSQL Database
1. In Railway project, click "+ New"
2. Select "Database" → "Add PostgreSQL"
3. Railway will create a PostgreSQL database automatically
4. Copy the `DATABASE_URL` from the PostgreSQL service variables

### 4. Set Environment Variables
In Railway, go to your service → Variables tab and add:

#### Required Variables:
```
DATABASE_URL=<from PostgreSQL service>
JWT_SECRET=<generate a new secure secret>
PORT=3000
NODE_ENV=production
```

#### Optional Variables:
```
FRONTEND_URL=https://your-frontend-domain.com
REDIS_HOST=<if using Railway Redis>
REDIS_PORT=6379
```

### 5. Run Migrations
After first deployment, run migrations:
1. Go to service → "Deployments"
2. Click on latest deployment → "View Logs"
3. Check if migrations ran (they should run via postinstall script)
4. If needed, run manually via Railway CLI or add a separate service

### 6. Deploy Frontend (Optional)
For frontend deployment:
1. Create a new service in Railway
2. Set root directory to `frontend`
3. Use build command: `npm run build`
4. Use start command: `npx vite preview --port $PORT --host`
5. Or use Vercel/Netlify for frontend (recommended)

## Railway Configuration Files

### `railway.json`
Main Railway configuration - specifies build and deploy settings

### `nixpacks.toml`
Nixpacks build configuration - tells Railway how to build the app

### Build Process
1. Install dependencies (root + backend)
2. Generate Prisma client
3. Build TypeScript to JavaScript
4. Start production server

## Troubleshooting

### Build Fails
- Check Railway logs for specific errors
- Ensure all dependencies are in `package.json`
- Verify Prisma schema is correct

### Database Connection Issues
- Verify `DATABASE_URL` is set correctly
- Check PostgreSQL service is running
- Ensure migrations have run

### Port Issues
- Railway automatically sets `PORT` environment variable
- Backend listens on `process.env.PORT || 3000`
- No manual port configuration needed

## Environment Variables Checklist

Make sure these are set in Railway:
- ✅ `DATABASE_URL` (from PostgreSQL service)
- ✅ `JWT_SECRET` (generate new for production)
- ✅ `NODE_ENV=production`
- ✅ `PORT` (automatically set by Railway)

## Health Check
Railway will check `/api` endpoint to verify deployment health.

