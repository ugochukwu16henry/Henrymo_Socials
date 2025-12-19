# Alternative Migration Approach

If you're experiencing connection issues from Windows to the Docker PostgreSQL container, here are alternative ways to run migrations:

## Option 1: Run Prisma from Inside Docker Container

1. Copy Prisma schema to container:
```bash
docker cp backend/prisma henrymo_postgres:/tmp/prisma
docker cp backend/.env henrymo_postgres:/tmp/.env
```

2. Run Prisma commands inside container:
```bash
docker exec -it henrymo_postgres sh
cd /tmp
npm install prisma @prisma/client
npx prisma generate
npx prisma migrate dev --name init
```

## Option 2: Use Docker Network

Update your `DATABASE_URL` to use the Docker network:
```
DATABASE_URL="postgresql://postgres:postgres@host.docker.internal:5432/henrymo_socials?schema=public"
```

Or if running from Windows, try:
```
DATABASE_URL="postgresql://postgres:postgres@127.0.0.1:5432/henrymo_socials?schema=public"
```

## Option 3: Manual SQL Execution

You can manually create the tables by running the SQL from Prisma schema. First, generate the SQL:

```bash
cd backend
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql
```

Then execute it in the database:
```bash
docker exec -i henrymo_postgres psql -U postgres -d henrymo_socials < migration.sql
```

## Option 4: Use Prisma Studio

Once tables are created, you can use Prisma Studio to manage data:
```bash
cd backend
npx prisma studio
```

This will open a web interface at http://localhost:5555

