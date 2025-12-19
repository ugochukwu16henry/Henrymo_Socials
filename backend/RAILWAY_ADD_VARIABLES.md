# Add Environment Variables to Railway - Step by Step

## 🎯 Quick Action Required

Your backend is running but missing `DATABASE_URL`. Follow these steps:

## 📋 Variables to Add

### 1. DATABASE_URL (Required)
```
postgresql://postgres:YnxmzEjgGAVPNyZFlCDDontHnIrEipju@postgres-qdun.railway.internal:5432/railway
```

### 2. JWT_SECRET (Required)
```
1c91b323892bb75681a920421ab193518712f9484b5ba2f686cc0d172485f6eecb3a61057444878260caa8cb33058cf10cc6641d8f4bfba3687b2140aa55fc97
```

### 3. NODE_ENV (Optional but recommended)
```
production
```

## 🔧 Step-by-Step Instructions

### Step 1: Open Railway Dashboard
1. Go to [railway.app](https://railway.app)
2. Select your project: **Henrymo_Socials** (or your project name)
3. Click on your **Backend Service** (the one running the NestJS app)

### Step 2: Navigate to Variables
1. In your backend service, look for the **"Variables"** tab
2. Click on **"Variables"**

### Step 3: Add DATABASE_URL
1. Click **"+ New Variable"** button
2. In the **"Name"** field, type: `DATABASE_URL`
3. In the **"Value"** field, paste:
   ```
   postgresql://postgres:YnxmzEjgGAVPNyZFlCDDontHnIrEipju@postgres-qdun.railway.internal:5432/railway
   ```
4. Click **"Add"** or **"Save"**

### Step 4: Add JWT_SECRET
1. Click **"+ New Variable"** again
2. **Name**: `JWT_SECRET`
3. **Value**: 
   ```
   1c91b323892bb75681a920421ab193518712f9484b5ba2f686cc0d172485f6eecb3a61057444878260caa8cb33058cf10cc6641d8f4bfba3687b2140aa55fc97
   ```
4. Click **"Add"** or **"Save"**

### Step 5: Add NODE_ENV (Optional)
1. Click **"+ New Variable"** again
2. **Name**: `NODE_ENV`
3. **Value**: `production`
4. Click **"Add"** or **"Save"**

## ⚡ What Happens Next

Once you add these variables:
1. ✅ Railway **automatically detects** the change
2. ✅ Railway **triggers a new deployment**
3. ✅ Your backend will **restart with the new variables**
4. ✅ Database connection will **succeed**

## ✅ Verification

After Railway redeploys (takes ~1-2 minutes), check the logs. You should see:

```
✅ [PrismaService] Successfully connected to database
```

Instead of:
```
❌ [PrismaService] Database connection attempt failed: Environment variable not found: DATABASE_URL
```

## 🎯 Alternative: Using Railway's Variable Reference

If Railway shows a "Reference" button, you can:

1. Click **"+ New Variable"**
2. Name: `DATABASE_URL`
3. Click **"Reference"** button (if available)
4. Select your **PostgreSQL service**
5. Select `DATABASE_URL` from the dropdown

This automatically links the variable from the PostgreSQL service.

## 📸 Visual Guide

```
Railway Dashboard
└── Your Project
    └── Backend Service
        └── Variables Tab
            ├── + New Variable → DATABASE_URL
            ├── + New Variable → JWT_SECRET
            └── + New Variable → NODE_ENV (optional)
```

## ⚠️ Important Notes

- Use the **internal** `DATABASE_URL` (with `.railway.internal`) for better performance
- The `JWT_SECRET` should be kept **secret** - never commit it to Git
- After adding variables, wait for Railway to redeploy automatically
- Check deployment logs to verify the connection

