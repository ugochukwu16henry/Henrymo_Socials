# Team Creation Debugging Guide

## ✅ Improvements Made

1. **Error Display**: Errors now show in a red alert box in the modal
2. **Loading State**: Button shows "Creating..." and is disabled during submission
3. **Better Token Handling**: API service ensures latest auth token is used on each request

---

## 🔍 How to Debug Team Creation Issues

### Step 1: Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try creating a team
4. Look for any error messages

### Step 2: Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try creating a team
4. Look for the `/api/teams` POST request
5. Check:
   - **Status Code**: Should be 200 or 201
   - **Request Headers**: Should include `Authorization: Bearer <token>`
   - **Response**: Should show team data or error message

### Step 3: Common Issues & Solutions

#### Issue: 401 Unauthorized
**Symptoms**: 
- Status code 401
- Error: "Unauthorized" or "Invalid token"

**Solutions**:
1. **Check if you're logged in**: Make sure you see your user info in the sidebar
2. **Try logging out and back in**: This refreshes the token
3. **Check token in localStorage**:
   - Open DevTools → Application → Local Storage
   - Look for `auth-storage` key
   - Should contain `token` and `user` data

#### Issue: 400 Bad Request
**Symptoms**:
- Status code 400
- Error about validation

**Solutions**:
1. **Check team name**: Must be at least 2 characters
2. **Check error message**: It will tell you what's wrong
3. **Try a different name**: Avoid special characters

#### Issue: 500 Internal Server Error
**Symptoms**:
- Status code 500
- Generic error message

**Solutions**:
1. **Check backend logs**: Look for error messages in backend console
2. **Check database connection**: Make sure PostgreSQL is running
3. **Try again**: Sometimes it's a temporary issue

#### Issue: Network Error / CORS Error
**Symptoms**:
- Request fails before reaching server
- CORS error in console

**Solutions**:
1. **Check backend is running**: `npm run dev:backend` should be running
2. **Check API URL**: Should be `http://localhost:3000/api` (development)
3. **Check CORS settings**: Backend should allow frontend origin

---

## 🧪 Test Steps

1. **Verify Authentication**:
   ```
   ✅ Are you logged in? (Check sidebar shows your name/email)
   ✅ Can you see the dashboard?
   ✅ Can you see teams page?
   ```

2. **Try Creating Team**:
   ```
   1. Click "Create Team" button
   2. Enter team name (at least 2 characters)
   3. Click "Create"
   4. Watch for error message in modal
   5. Check browser console for errors
   6. Check Network tab for API response
   ```

3. **Expected Behavior**:
   ```
   ✅ Modal shows "Creating..." button
   ✅ After success: Modal closes, team appears in list
   ✅ After error: Red error box appears with message
   ```

---

## 📋 Quick Debug Checklist

- [ ] Backend is running (`npm run dev:backend`)
- [ ] Frontend is running (`npm run dev:frontend`)
- [ ] You are logged in (see user info in sidebar)
- [ ] Browser console shows no errors
- [ ] Network tab shows `/api/teams` request
- [ ] Request includes `Authorization` header
- [ ] Team name is at least 2 characters
- [ ] No special characters in team name (try simple name first)

---

## 🐛 If Still Not Working

### Get More Details

1. **Check Backend Logs**:
   ```bash
   # In backend terminal, look for:
   - Request logs
   - Error stack traces
   - Database errors
   ```

2. **Check Database**:
   ```bash
   # Make sure PostgreSQL is running
   docker-compose ps
   
   # Check if migrations ran
   cd backend && npx prisma migrate status
   ```

3. **Test API Directly**:
   ```bash
   # Get your token from localStorage or login
   curl -X POST http://localhost:3000/api/teams \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"name":"Test Team"}'
   ```

---

## 💡 What Changed

The improvements I made will:
- ✅ Show you the exact error message from the API
- ✅ Prevent double-submissions with loading state
- ✅ Ensure auth token is always up-to-date

**Try creating a team now and let me know what error message you see!**

The error message will help us identify the exact issue. 🎯

