# Railway - Copy & Paste Values

## 🔧 Quick Setup - Copy These Values

### Step 1: Add to Backend Service → Variables

#### Variable 1: DATABASE_URL
```
postgresql://postgres:YnxmzEjgGAVPNyZFlCDDontHnIrEipju@postgres-qdun.railway.internal:5432/railway
```

#### Variable 2: JWT_SECRET
```
1c91b323892bb75681a920421ab193518712f9484b5ba2f686cc0d172485f6eecb3a61057444878260caa8cb33058cf10cc6641d8f4bfba3687b2140aa55fc97
```

#### Variable 3: NODE_ENV (Optional)
```
production
```

## 📝 Instructions

1. Railway Dashboard → Your Backend Service
2. Click **"Variables"** tab
3. Click **"+ New Variable"** for each:

   **Variable 1:**
   - Name: `DATABASE_URL`
   - Value: (paste the connection string above)

   **Variable 2:**
   - Name: `JWT_SECRET`
   - Value: (paste the JWT_SECRET above)

   **Variable 3:**
   - Name: `NODE_ENV`
   - Value: `production`

4. Railway will automatically redeploy after adding variables

5. After deployment completes:
   - Go to Backend → Deployments → Latest → Open Shell
   - Run: `cd backend && npx prisma migrate deploy`

## ✅ Done!

After migrations run, your database will be fully connected and ready!

