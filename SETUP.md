# Setup Guide

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed (or use Docker)
- Redis 6+ installed (or use Docker)
- npm or yarn package manager

## Quick Start

### 1. Install Dependencies

```bash
npm run install:all
```

This will install dependencies for the root, backend, and frontend.

### 2. Setup Database with Docker (Recommended)

```bash
docker-compose up -d
```

This will start PostgreSQL and Redis containers.

### 3. Configure Environment Variables

Copy the example environment file and configure it:

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` and update:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - A secure random string for JWT tokens
- `REDIS_HOST` and `REDIS_PORT` - Redis connection details
- Social media API keys (when ready to integrate)

### 4. Setup Database Schema

```bash
cd backend
npm run prisma:generate
npm run migration:generate -- --name init
npm run migration:run
```

### 5. Start Development Servers

**Terminal 1 - Backend:**

```bash
npm run dev:backend
```

**Terminal 2 - Frontend:**

```bash
npm run dev:frontend
```

The application will be available at:

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Documentation: http://localhost:3000/api/docs

## Database Setup (Without Docker)

1. Create a PostgreSQL database:

```sql
CREATE DATABASE henrymo_socials;
```

2. Update `DATABASE_URL` in `backend/.env`:

```
DATABASE_URL="postgresql://username:password@localhost:5432/henrymo_socials?schema=public"
```

3. Run migrations as shown in step 4 above.

## Project Structure

```
.
├── backend/              # NestJS API
│   ├── src/
│   │   ├── auth/        # Authentication module
│   │   ├── users/       # User management
│   │   ├── teams/       # Team management
│   │   ├── social-accounts/  # Social media integrations
│   │   ├── content/     # Content studio
│   │   ├── analytics/   # Analytics engine
│   │   └── research/    # Research lab
│   └── prisma/          # Database schema
├── frontend/            # React SPA
│   └── src/
│       ├── components/  # React components
│       ├── pages/       # Page components
│       ├── stores/      # State management
│       └── services/    # API services
└── build/              # Specifications
```

## Next Steps

1. **Social Media Integrations**: Set up OAuth flows for Meta, X, LinkedIn, etc.
2. **Content Scheduling**: Implement BullMQ queue for scheduled posts
3. **Analytics**: Connect to social media APIs to fetch metrics
4. **AI Features**: Integrate OpenAI or other AI services for content generation
5. **Deployment**: Set up production deployment on AWS/GCP/Vercel

## Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests (when configured)
cd frontend
npm test
```

## Troubleshooting

### Database Connection Issues

- Ensure PostgreSQL is running
- Check DATABASE_URL in `.env` file
- Verify database exists: `psql -U postgres -l`

### Redis Connection Issues

- Ensure Redis is running: `redis-cli ping`
- Check REDIS_HOST and REDIS_PORT in `.env`

### Port Already in Use

- Change PORT in `backend/.env` (default: 3000)
- Change port in `frontend/vite.config.ts` (default: 5173)
