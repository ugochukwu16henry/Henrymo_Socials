# OAuth Setup Guide - Meta (Facebook/Instagram)

This guide will help you set up OAuth for Meta (Facebook/Instagram) integration.

## 📋 Prerequisites

1. A Facebook Developer account
2. A Facebook App created in the [Facebook Developers Console](https://developers.facebook.com/)
3. Access to your application's environment variables

---

## 🔧 Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click **"My Apps"** → **"Create App"**
3. Select **"Business"** as the app type
4. Fill in:
   - **App Name**: Your app name (e.g., "HenryMo Socials")
   - **App Contact Email**: Your email
   - Click **"Create App"**

---

## 🔐 Step 2: Configure OAuth Settings

1. In your Facebook App dashboard, go to **Settings** → **Basic**
2. Note down:
   - **App ID** → This is your `META_APP_ID`
   - **App Secret** → Click "Show" to reveal, this is your `META_APP_SECRET`

3. Go to **Settings** → **Basic** → Add platform:
   - **Website**: Add your website URL
     - Site URL: `http://localhost:5173` (for development)
     - Or your production URL (e.g., `https://henrymosocials-production.up.railway.app`)

4. Go to **Products** → **Facebook Login** → **Settings**
   - **Valid OAuth Redirect URIs**: Add:
     ```
     http://localhost:3000/api/oauth/meta/callback
     https://your-production-domain.com/api/oauth/meta/callback
     ```
     Replace `your-production-domain.com` with your actual production domain

---

## 📱 Step 3: Request Required Permissions

1. Go to **App Review** → **Permissions and Features**
2. Request the following permissions:

### For Facebook Pages:
- `pages_manage_posts` - To publish posts to Facebook Pages
- `pages_read_engagement` - To read engagement metrics
- `pages_show_list` - To list pages the user manages

### For Instagram:
- `instagram_basic` - Basic Instagram access
- `instagram_content_publish` - To publish posts to Instagram
- `pages_show_list` - To list Instagram Business accounts linked to pages
- `pages_read_engagement` - To read engagement metrics

**Note:** Some permissions require App Review for production use. For development, you can use them in Development Mode.

---

## 🔗 Step 4: Link Instagram Business Account (For Instagram)

1. Go to [Facebook Business](https://business.facebook.com/)
2. Create a Facebook Page (if you don't have one)
3. Create an Instagram Business Account (if you don't have one)
4. Link the Instagram Business Account to your Facebook Page:
   - Go to your Facebook Page Settings
   - Click **"Instagram"** in the left sidebar
   - Connect your Instagram Business Account

---

## ⚙️ Step 5: Configure Environment Variables

Add these to your `backend/.env` file:

```env
# Meta OAuth Configuration
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here
META_REDIRECT_URI=http://localhost:3000/api/oauth/meta/callback

# For production, update META_REDIRECT_URI to:
# META_REDIRECT_URI=https://your-production-domain.com/api/oauth/meta/callback

# Frontend URL (for OAuth redirects)
FRONTEND_URL=http://localhost:5173

# API URL (for OAuth callback)
API_URL=http://localhost:3000
```

**For Railway/Production:**

Add these to Railway environment variables:
- `META_APP_ID`: Your Facebook App ID
- `META_APP_SECRET`: Your Facebook App Secret
- `META_REDIRECT_URI`: `https://your-production-domain.com/api/oauth/meta/callback`
- `FRONTEND_URL`: Your production frontend URL
- `API_URL`: Your production API URL (usually same as frontend if served together)

---

## ✅ Step 6: Test the Integration

1. Start your backend:
   ```bash
   npm run dev:backend
   ```

2. Start your frontend:
   ```bash
   npm run dev:frontend
   ```

3. Navigate to `/social-accounts` in your app
4. Click **"Connect"** on Facebook or Instagram
5. You should be redirected to Facebook's OAuth consent screen
6. After authorization, you'll be redirected back to your app
7. Check that the account appears in the "Connected Accounts" section

---

## 🔍 Troubleshooting

### Issue: "META_APP_ID is not configured"
**Solution:** Make sure `META_APP_ID` and `META_APP_SECRET` are set in your `.env` file

### Issue: "Invalid OAuth Redirect URI"
**Solution:** 
1. Check that your redirect URI in `.env` matches exactly what's configured in Facebook App Settings
2. Make sure the URL is added to **Valid OAuth Redirect URIs** in Facebook App settings

### Issue: "Instagram Business account not linked to Facebook Page"
**Solution:**
1. Create a Facebook Page
2. Create an Instagram Business Account
3. Link them in Facebook Page Settings → Instagram

### Issue: "Insufficient Permissions"
**Solution:**
1. Request the required permissions in App Review
2. For development, add yourself as a Test User in App Settings → Roles → Test Users

### Issue: Token expires quickly
**Solution:** 
- The code automatically exchanges short-lived tokens for long-lived tokens (60 days)
- You can call the refresh endpoint: `GET /api/oauth/meta/refresh/:accountId`

---

## 🔒 Security Best Practices

1. **Never commit `.env` files** - Use environment variables in production
2. **Use HTTPS in production** - OAuth requires HTTPS for production redirects
3. **Keep App Secret secure** - Never expose it in client-side code
4. **Rotate secrets regularly** - Update App Secret if compromised
5. **Monitor token expiration** - Implement automatic token refresh

---

## 📚 Additional Resources

- [Facebook Login Documentation](https://developers.facebook.com/docs/facebook-login)
- [Instagram Graph API](https://developers.facebook.com/docs/instagram-api)
- [Meta App Review](https://developers.facebook.com/docs/app-review)

---

## 🎯 Next Steps

Once OAuth is working:
1. Test creating a scheduled post
2. Test publishing to Facebook/Instagram
3. Implement token refresh mechanism
4. Add error handling for expired tokens
5. Set up webhooks for real-time updates (optional)

---

**Ready to connect!** Follow these steps and you'll have Meta OAuth working in no time! 🚀

