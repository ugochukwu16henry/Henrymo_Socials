# Update DATABASE_URL in Railway - Step by Step

## 🎯 Current Issue

Your Railway deployment is still using the **internal** database hostname:

```
postgres-qdun.railway.internal:5432
```

This needs to be changed to the **public** hostname:

```
interchange.proxy.rlwy.net:22914
```

## ⚠️ Important Note

**Railway environment variables are SEPARATE from your local `.env` file!**

Even though your local `backend/.env` has the correct URL, Railway uses its own environment variables that you must update in the Railway dashboard.

## 📋 Step-by-Step Instructions

### Step 1: Open Railway Dashboard

1. Go to [railway.app](https://railway.app)
2. Log in and select your project

### Step 2: Navigate to Variables

1. Click on your **Backend Service** (the one running NestJS)
2. Click on the **"Variables"** tab
3. You'll see a list of environment variables

### Step 3: Find DATABASE_URL

1. Look for a variable named `DATABASE_URL`
2. Check what it's currently set to (it should show the internal hostname)

### Step 4: Update DATABASE_URL

1. Click on the `DATABASE_URL` variable (or click "Edit" if available)
2. **Replace the entire value** with:

```
postgresql://postgres:YnxmzEjgGAVPNyZFlCDDontHnIrEipju@interchange.proxy.rlwy.net:22914/railway
```

3. Click **"Save"** or **"Update"**

### Step 5: Verify Update

After saving, check that `DATABASE_URL` now shows:

- Host: `interchange.proxy.rlwy.net:22914` (not `postgres-qdun.railway.internal:5432`)

### Step 6: Wait for Redeploy

- Railway will **automatically detect** the variable change
- It will trigger a **new deployment** automatically
- Wait for the deployment to complete (1-2 minutes)

### Step 7: Verify Success

After deployment, check the logs. You should see:

```
✅ [PrismaService] Successfully connected to database
```

Instead of:

```
❌ Can't reach database server at postgres-qdun.railway.internal:5432
```

## 🔍 Alternative: Railway's Variable Reference

If Railway shows a "Reference" button when adding/editing variables:

1. Click on `DATABASE_URL` variable
2. Look for a **"Reference"** button
3. Select your **PostgreSQL service**
4. Select `DATABASE_PUBLIC_URL` (instead of `DATABASE_URL`)
5. This automatically uses the public URL from PostgreSQL service

## ✅ Expected Result

After updating:

- ✅ Database connection will succeed
- ✅ Healthcheck will pass
- ✅ Application will be fully functional
- ✅ Frontend will load correctly

## 🚀 Your App Status

Currently working:

- ✅ Build process
- ✅ Frontend detection
- ✅ Application startup
- ✅ All routes registered

Waiting for:

- ⏳ Database connection (needs DATABASE_URL update in Railway)
