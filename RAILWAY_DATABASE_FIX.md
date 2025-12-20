# Fix Railway Database Connection

## ⚠️ Issue
Database connection failing with internal hostname: `postgres-qdun.railway.internal:5432`

## ✅ Solution: Use Public DATABASE_URL

Railway's internal hostnames sometimes don't work. Use the **public** `DATABASE_PUBLIC_URL` instead.

### Step 1: Update Railway Variables

1. Go to Railway → Backend Service → Variables
2. **Update or Add** `DATABASE_URL` variable:

**Current (not working):**
```
postgresql://postgres:YnxmzEjgGAVPNyZFlCDDontHnIrEipju@postgres-qdun.railway.internal:5432/railway
```

**Replace with (PUBLIC URL):**
```
postgresql://postgres:YnxmzEjgGAVPNyZFlCDDontHnIrEipju@interchange.proxy.rlwy.net:22914/railway
```

3. Save the variable
4. Railway will auto-redeploy

### Step 2: Verify Connection

After redeploy, check logs. You should see:
```
✅ [PrismaService] Successfully connected to database
```

Instead of:
```
❌ Can't reach database server at postgres-qdun.railway.internal:5432
```

## 🎯 Why This Works

- **Public URL**: Works from any Railway service
- **Internal URL**: Only works if Railway's internal networking is configured correctly
- **Performance**: Public URL is still fast (Railway's proxy is optimized)

## ✅ Final Variables Checklist

Make sure these are set in Backend Service → Variables:

- ✅ `DATABASE_URL` = `postgresql://postgres:YnxmzEjgGAVPNyZFlCDDontHnIrEipju@interchange.proxy.rlwy.net:22914/railway`
- ✅ `JWT_SECRET` = (your generated secret)
- ✅ `NODE_ENV` = `production` (optional)

