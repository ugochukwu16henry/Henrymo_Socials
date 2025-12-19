# Railway Environment Variables Setup

## ⚠️ Current Issue
Your backend is running but can't connect to the database because `DATABASE_URL` is not set.

## ✅ Quick Fix

### Step 1: Add PostgreSQL Database
1. In Railway dashboard, click **"+ New"** in your project
2. Select **"Database"** → **"Add PostgreSQL"**
3. Railway will create a PostgreSQL database automatically

### Step 2: Get DATABASE_URL
1. Click on the **PostgreSQL** service you just created
2. Go to **"Variables"** tab
3. You'll see `DATABASE_URL` listed - **COPY THIS VALUE**

### Step 3: Add to Backend Service
1. Go to your **Backend** service (the one running the app)
2. Click **"Variables"** tab
3. Click **"+ New Variable"**
4. Add these variables:

| Variable Name | Value | Notes |
|---------------|-------|-------|
| `DATABASE_URL` | *(paste from PostgreSQL service)* | **REQUIRED** |
| `JWT_SECRET` | *(generate new random string)* | **REQUIRED** |
| `NODE_ENV` | `production` | Optional but recommended |
| `PORT` | `8080` | Auto-set by Railway (don't override) |

### Step 4: Generate JWT_SECRET
Run this command locally or use Railway's shell:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```
Copy the output and paste it as `JWT_SECRET` value.

### Step 5: Run Migrations
After setting DATABASE_URL, run migrations:
1. Go to your backend service → **"Deployments"**
2. Click **"..."** on latest deployment → **"Open Shell"**
3. Run:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

## 🎯 Quick Reference

**Where to find DATABASE_URL:**
- PostgreSQL service → Variables tab → Copy `DATABASE_URL`

**Where to set it:**
- Backend service → Variables tab → Add new variable

**After adding variables:**
- Railway will automatically redeploy
- Wait for deployment to complete
- Check logs to verify database connection

## ✅ Verification

Once DATABASE_URL is set, you should see in logs:
```
[PrismaService] Successfully connected to database
```

Instead of connection errors.

