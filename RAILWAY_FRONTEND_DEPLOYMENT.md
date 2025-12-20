# Frontend Deployment on Railway

## ✅ Changes Made

The backend is now configured to serve the frontend static files. This means:
- Frontend and backend are deployed together
- Single Railway URL serves both frontend and API
- Frontend at: `https://henrymosocials-production.up.railway.app/`
- API at: `https://henrymosocials-production.up.railway.app/api/*`

## 🔧 What Was Updated

1. **Backend (`backend/src/main.ts`)**:
   - Added static file serving from `frontend/dist`
   - Added catch-all route for SPA routing
   - Frontend build is served automatically if it exists

2. **Frontend API Config (`frontend/src/services/api.ts`)**:
   - Updated to use relative `/api` path (works with same-origin)
   - Supports environment variable override if needed

3. **Build Process (`package.json`, `nixpacks.toml`)**:
   - Root `build` script now builds both frontend and backend
   - `nixpacks.toml` updated to build frontend during Railway deployment

## 📋 Next Steps

### 1. Push Changes to GitHub
```bash
git add .
git commit -m "Configure backend to serve frontend static files"
git push
```

### 2. Railway Will Auto-Deploy
- Railway detects the push
- Runs `npm run build` (builds frontend + backend)
- Starts the backend server
- Frontend will be served automatically

### 3. Verify Deployment
After Railway redeploys:
- Visit: `https://henrymosocials-production.up.railway.app/`
- You should see the **frontend React app** (not the JSON API response)
- API endpoints still work at `/api/*`

## 🎯 How It Works

```
User visits: https://henrymosocials-production.up.railway.app/
↓
NestJS serves index.html from frontend/dist
↓
React app loads and makes API calls to /api/*
↓
NestJS handles /api/* routes with controllers
```

## 🔍 Troubleshooting

**If you still see JSON response:**
- Check Railway build logs - frontend should build successfully
- Verify `frontend/dist` folder exists in the build
- Check that build script runs: `npm run build:frontend`

**If API calls fail:**
- Frontend uses relative `/api` path (same origin)
- This should work automatically
- Check browser console for errors

**If static assets don't load:**
- Verify `app.useStaticAssets()` is configured
- Check file paths in `index.html` (should be relative)

## 📝 Environment Variables

No additional environment variables needed for frontend! The frontend automatically uses:
- Relative `/api` path (same origin as frontend)
- Works seamlessly with backend serving both

## ✅ Success Indicators

After deployment, you should see:
1. ✅ Frontend React app loads at root URL
2. ✅ Login/Register pages work
3. ✅ API calls to `/api/*` work correctly
4. ✅ Client-side routing works (no 404s on page refresh)

