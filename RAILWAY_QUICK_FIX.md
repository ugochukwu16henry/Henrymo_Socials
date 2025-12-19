# Railway Quick Fix - Missing DATABASE_URL

## ✅ Good News
Your backend **IS running** on Railway! The only issue is the missing `DATABASE_URL`.

## 🔧 Fix in 3 Steps

### Step 1: Add PostgreSQL Database
1. Railway Dashboard → Your Project
2. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
3. Wait for it to provision (takes ~30 seconds)

### Step 2: Link DATABASE_URL (Railway Auto-Reference)
Railway has a feature to automatically reference variables from other services:

1. Go to your **Backend** service
2. Click **"Variables"** tab
3. Click **"+ New Variable"**
4. For **Variable Name**: Type `DATABASE_URL`
5. For **Value**: Click the **"Reference"** button (or use `${{PostgreSQL.DATABASE_URL}}`)
6. Select your **PostgreSQL** service → `DATABASE_URL`
7. This creates an automatic reference - Railway will inject it automatically!

### Step 3: Add JWT_SECRET
1. Still in Backend service → Variables
2. Click **"+ New Variable"**
3. Name: `JWT_SECRET`
4. Value: Generate using:
   ```bash
   # Run this locally or in Railway shell:
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```
5. Paste the generated value

### Step 4: Run Migrations
1. Backend service → **"Deployments"** → Latest deployment
2. Click **"..."** → **"Open Shell"**
3. Run:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

## ✅ After Setup

Railway will automatically:
- ✅ Redeploy with new variables
- ✅ Connect to database
- ✅ Application will be fully functional

## 🎯 Alternative: Manual DATABASE_URL

If Railway's auto-reference doesn't work:

1. PostgreSQL service → **"Variables"** tab
2. Copy the `DATABASE_URL` value (it's a long connection string)
3. Backend service → **"Variables"** tab
4. Add new variable: `DATABASE_URL` = (paste the connection string)

## Verify It's Working

Check deployment logs - you should see:
```
✅ [PrismaService] Successfully connected to database
```

Instead of connection errors!

