# Railway Database Connection Setup

## ✅ Database Connection Strings

You have two connection strings:

1. **DATABASE_URL** (Internal - Use This)
   ```
   postgresql://postgres:YnxmzEjgGAVPNyZFlCDDontHnIrEipju@postgres-qdun.railway.internal:5432/railway
   ```
   - Use this for backend service (both on Railway internal network)
   - Faster and more secure (internal routing)

2. **DATABASE_PUBLIC_URL** (External)
   ```
   postgresql://postgres:YnxmzEjgGAVPNyZFlCDDontHnIrEipju@interchange.proxy.rlwy.net:22914/railway
   ```
   - Use this for external tools (local development, database clients)

## 🔧 Setup Steps in Railway

### Step 1: Add DATABASE_URL to Backend Service

1. Go to Railway Dashboard
2. Click on your **Backend** service (not the PostgreSQL service)
3. Go to **"Variables"** tab
4. Click **"+ New Variable"**
5. Add:
   - **Variable Name**: `DATABASE_URL`
   - **Value**: 
     ```
     postgresql://postgres:YnxmzEjgGAVPNyZFlCDDontHnIrEipju@postgres-qdun.railway.internal:5432/railway
     ```
6. Click **"Add"**

### Step 2: Add JWT_SECRET

1. Still in Backend service → Variables
2. Click **"+ New Variable"**
3. Add:
   - **Variable Name**: `JWT_SECRET`
   - **Value**: Generate a new secure secret:
     ```bash
     node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
     ```
4. Copy and paste the generated value

### Step 3: Optional - Add Other Variables

Add these for production:

- **NODE_ENV**: `production`
- **FRONTEND_URL**: Your frontend URL (if deployed)

### Step 4: Railway Will Auto-Redeploy

Once you add `DATABASE_URL`, Railway will automatically:
- ✅ Detect the variable change
- ✅ Trigger a new deployment
- ✅ Restart your backend service

### Step 5: Run Database Migrations

After the deployment completes:

1. Go to Backend service → **"Deployments"**
2. Find the latest deployment
3. Click **"..."** (three dots) → **"Open Shell"**
4. Run:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

This will create all your database tables!

## ✅ Verification

After deployment, check the logs. You should see:

```
✅ [PrismaService] Successfully connected to database
```

Instead of:
```
❌ [PrismaService] Database connection attempt failed: Environment variable not found: DATABASE_URL
```

## 🎯 Quick Checklist

- [ ] Add `DATABASE_URL` to backend service variables
- [ ] Add `JWT_SECRET` to backend service variables
- [ ] Wait for Railway to redeploy (automatic)
- [ ] Run `npx prisma migrate deploy` in Railway shell
- [ ] Verify connection in deployment logs

## 🔍 Troubleshooting

**If migrations fail:**
- Make sure `DATABASE_URL` is correctly set
- Check that PostgreSQL service is running
- Verify the connection string is exactly as shown

**If connection still fails:**
- Try using `DATABASE_PUBLIC_URL` instead (for testing)
- Check Railway service logs for detailed error messages

