# HenryMo Socials

A unified SaaS platform for Digital Marketing & Social Media Management with Research & Data Analysis.

## Features

- 🎯 **Multi-Platform Publishing**: Connect and schedule posts across Meta (FB/IG), X (Twitter), LinkedIn, TikTok, YouTube, Instagram
- 📊 **Analytics Dashboard**: Real-time engagement metrics, reach, follower growth, and performance insights
- 🔍 **Research Lab**: Hashtag trends, keyword volume, competitor tracking, audience demographics
- 🤖 **AI-Powered**: Content suggestions, sentiment analysis, optimal posting time predictions
- 👥 **Team Collaboration**: Multi-tenant support with role-based access (Admin, Editor, Viewer)
- 📈 **Automated Reporting**: Custom reports with PDF/Google Sheets exports
- 🔄 **Automation Rules**: Triggered actions based on engagement thresholds and keywords

## Tech Stack

### Backend
- **Framework**: NestJS (TypeScript)
- **Database**: PostgreSQL
- **Cache/Queue**: Redis (BullMQ)
- **Auth**: JWT + OAuth 2.0

### Frontend
- **Framework**: React + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: React Query / Zustand

## Getting Started

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Start

1. **Install dependencies:**
```bash
npm run install:all
```

2. **Start services with Docker:**
```bash
docker-compose up -d
```

3. **Configure environment:**
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration
```

4. **Setup database:**
```bash
cd backend
npm run prisma:generate
npm run migration:generate -- --name init
npm run migration:run
```

5. **Start development servers:**
```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

The application will be available at:
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs

## Project Structure

```
.
├── backend/          # NestJS API
│   ├── src/
│   │   ├── auth/     # Authentication module
│   │   ├── users/    # User management
│   │   ├── teams/    # Team management
│   │   ├── social/   # Social media integrations
│   │   ├── content/  # Content studio
│   │   ├── analytics/# Analytics engine
│   │   └── research/ # Research lab
│   └── prisma/       # Database schema & migrations
├── frontend/         # React SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── services/
└── build/            # Specifications & docs
```

## License

MIT

