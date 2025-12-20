# Admin Dashboard Setup Guide

## ✅ What's Been Created

An admin system that allows you (Henry Ugochukwu) to view all users, teams, and app activity.

### Backend Features:
- ✅ `isAdmin` field added to User model
- ✅ AdminGuard to protect admin-only routes
- ✅ AdminController with endpoints:
  - `GET /api/admin/dashboard` - Dashboard statistics
  - `GET /api/admin/users` - All users list
  - `GET /api/admin/users/:id` - User details
  - `GET /api/admin/teams` - All teams list
  - `PATCH /api/admin/users/:id/role` - Update user admin role

### Frontend Features:
- ✅ Admin Dashboard page with:
  - Overview statistics (total users, teams, posts, accounts)
  - Recent users table
  - Recent teams table
  - All users view
  - All teams view
- ✅ Admin link in sidebar (only visible to admins)
- ✅ Automatic redirect if non-admin tries to access

---

## 🚀 Setup Instructions

### Step 1: Run Database Migration

```bash
cd backend
npx prisma migrate dev --name add_is_admin_field
```

This will add the `isAdmin` field to your users table.

### Step 2: Set Yourself as Admin

**Option A: Using the Script (Recommended)**

```bash
cd backend
npx ts-node scripts/set-admin.ts your-email@example.com
```

Replace `your-email@example.com` with your actual email address (the one you use to login).

**Option B: Using Prisma Studio**

```bash
cd backend
npx prisma studio
```

1. Open the `User` table
2. Find your user record
3. Click to edit
4. Set `isAdmin` to `true`
5. Save

**Option C: Using SQL directly**

```sql
UPDATE users 
SET is_admin = true 
WHERE email = 'your-email@example.com';
```

### Step 3: Refresh Your Session

After setting yourself as admin, you need to refresh your session:

1. **Logout** from the application
2. **Login again** (this refreshes your JWT token with the new `isAdmin` field)
3. You should now see the **"Admin"** link in the sidebar

---

## 📊 Using the Admin Dashboard

### Accessing the Dashboard

1. After logging in as admin, click **"Admin"** in the sidebar
2. You'll see the Admin Dashboard with:

#### Overview Tab:
- **Statistics Cards**: Total users, teams, posts, social accounts
- **Recent Users**: Last 10 registered users
- **Recent Teams**: Last 10 created teams

#### All Users Tab:
- Complete list of all users
- Shows: Name, Email, Teams count, Posts count, Verification status, Join date
- Admin users have a shield icon next to their name

#### All Teams Tab:
- Complete list of all teams
- Shows: Team name, Owner, Member count, Posts count, Social accounts count, Created date

---

## 🔒 Security

- Admin routes are protected by `AdminGuard`
- Only users with `isAdmin: true` can access admin endpoints
- Non-admin users trying to access `/admin` are redirected to dashboard
- All admin endpoints require valid JWT authentication

---

## 🛠️ Making Other Users Admin

To grant admin access to another user:

```bash
cd backend
npx ts-node scripts/set-admin.ts other-user@example.com
```

Or use Prisma Studio/SQL as shown in Step 2.

---

## 📝 Admin Endpoints

All endpoints are prefixed with `/api/admin` and require:
- Valid JWT token
- User must have `isAdmin: true`

### Endpoints:

- `GET /api/admin/dashboard` - Dashboard stats
- `GET /api/admin/users` - All users
- `GET /api/admin/users/:id` - User details
- `GET /api/admin/teams` - All teams
- `PATCH /api/admin/users/:id/role` - Update user admin role

---

## 🎯 What You Can See

As the admin, you can monitor:

1. **User Activity**:
   - Total number of users
   - New users (last 30 days)
   - User registration dates
   - User verification status

2. **Team Activity**:
   - Total teams created
   - Team owners
   - Team member counts
   - Team creation dates

3. **Content Activity**:
   - Total posts created
   - Total social accounts connected

4. **Individual User Details**:
   - User's teams
   - User's posts
   - User's social accounts
   - User activity statistics

---

## 🐛 Troubleshooting

### Admin link not showing in sidebar

**Solution**: 
1. Make sure you ran the migration
2. Make sure your user has `isAdmin: true` in database
3. Logout and login again to refresh token

### Getting 403 Forbidden on admin routes

**Solution**: 
1. Check your user has `isAdmin: true` in database
2. Logout and login again
3. Check backend logs for errors

### Can't see all users/teams

**Solution**: 
1. Make sure you're accessing `/admin` route
2. Check browser console for errors
3. Verify API is returning data (check Network tab)

---

## 🎉 You're All Set!

Once you complete the setup, you'll have full visibility into:
- ✅ All users using your app
- ✅ All teams created
- ✅ App activity and statistics
- ✅ User engagement metrics

**Happy monitoring!** 📊

