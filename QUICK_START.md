# Quick Start Guide

## 🚀 Running the Application

### Prerequisites

1. **Start Docker services** (PostgreSQL & Redis):
   ```bash
   docker-compose up -d
   ```

2. **Install dependencies** (if not done):
   ```bash
   npm run install:all
   ```

---

## 📍 Running from Root Directory

**Always run these commands from the project root** (`C:\Users\user\Documents\Henrymo_Socials`):

### Start Backend (Development)
```bash
npm run dev:backend
```

### Start Frontend (Development)
```bash
npm run dev:frontend
```

### Build Everything
```bash
npm run build
```

### Start Production
```bash
npm start
```

---

## 📍 Running from Subdirectories

### From `backend/` folder:
```bash
cd backend
npm run start:dev    # Development mode
npm run start:prod   # Production mode
npm run build        # Build only
```

### From `frontend/` folder:
```bash
cd frontend
npm run dev          # Development mode
npm run build        # Build only
```

---

## ✅ Verifying Everything Works

### 1. Check Backend is Running
```bash
curl http://localhost:3000/api/health
```

Expected response:
```json
{
  "message": "HenryMo Socials API is running!",
  "timestamp": "...",
  "redis": "connected"
}
```

### 2. Check Frontend is Running
Open browser: `http://localhost:5173`

### 3. Check Redis Connection
Look for in backend logs:
```
✅ Redis connected
```

### 4. Check Database Connection
Look for in backend logs:
```
Successfully connected to database
```

---

## 🐛 Common Issues

### Issue: "Missing script: dev:backend"
**Solution:** Run from root directory, not from `backend/` folder

### Issue: "Cannot find module"
**Solution:** Run `npm run install:all` from root

### Issue: "Port already in use"
**Solution:** 
- Backend: Change `PORT` in `backend/.env`
- Frontend: Change port in `frontend/vite.config.ts`

---

## 📝 Quick Commands Reference

| Command | Location | Description |
|---------|----------|-------------|
| `npm run dev:backend` | Root | Start backend dev server |
| `npm run dev:frontend` | Root | Start frontend dev server |
| `npm run build` | Root | Build both frontend & backend |
| `npm start` | Root | Start production server |
| `npm run start:dev` | backend/ | Start backend dev (alternative) |
| `npm run start:prod` | backend/ | Start backend prod (alternative) |

---

## 🎯 Testing Checklist

- [ ] Docker containers running (`docker ps`)
- [ ] Backend starts without errors
- [ ] Health check returns `"redis": "connected"`
- [ ] Frontend loads in browser
- [ ] Can create scheduled posts
- [ ] Logs show "Scheduled X publishing jobs"

---

**Remember:** Always run workspace commands (`dev:backend`, `dev:frontend`) from the **root directory**! 🎉

