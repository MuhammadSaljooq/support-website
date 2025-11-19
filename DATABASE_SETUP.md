# Database Setup Guide

## Issue: Internal Server Error on Signup

The error occurs because the database hasn't been set up yet. Follow these steps:

## Step 1: Set Up PostgreSQL Database

### Option A: Local PostgreSQL

1. Install PostgreSQL if you haven't already:
   - macOS: `brew install postgresql@14`
   - Or download from: https://www.postgresql.org/download/

2. Start PostgreSQL:
   ```bash
   brew services start postgresql@14
   # or
   pg_ctl -D /usr/local/var/postgres start
   ```

3. Create a database:
   ```bash
   createdb support_website
   # or using psql:
   psql postgres
   CREATE DATABASE support_website;
   \q
   ```

### Option B: Use a Cloud Database (Recommended for Development)

- **Supabase** (Free tier): https://supabase.com
- **Neon** (Free tier): https://neon.tech
- **Railway** (Free tier): https://railway.app
- **Vercel Postgres**: https://vercel.com/docs/storage/vercel-postgres

## Step 2: Update .env.local

Update your `.env.local` file with the real database URL:

```bash
# Replace with your actual database URL
DATABASE_URL="postgresql://username:password@localhost:5432/support_website?schema=public"

# For cloud databases, use the connection string they provide
# Example (Supabase):
# DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
```

## Step 3: Run Database Migrations

```bash
# Generate Prisma Client
npx prisma generate

# Create and apply migrations
npx prisma migrate dev --name init

# This will:
# 1. Create the migration files
# 2. Apply them to your database
# 3. Generate the Prisma Client
```

## Step 4: Verify Database Connection

```bash
# Check if Prisma can connect
npx prisma db pull

# Or use the check script
npx tsx scripts/check-db.ts
```

## Step 5: Test the Application

1. Start the dev server:
   ```bash
   npm run dev
   ```

2. Try signing up again at `/signup`

## Troubleshooting

### Error: "Database connection failed"
- Check if PostgreSQL is running
- Verify DATABASE_URL is correct
- Check firewall/network settings

### Error: "Database not set up"
- Run `npx prisma migrate dev`
- Check if migrations were applied: `npx prisma migrate status`

### Error: "Table does not exist"
- Run migrations: `npx prisma migrate dev`
- Or reset database: `npx prisma migrate reset` (⚠️ deletes all data)

### Error: "P1001" (Connection refused)
- Database server is not running
- Wrong host/port in DATABASE_URL
- Database doesn't exist

## Quick Test with SQLite (Alternative)

If you want to test quickly without PostgreSQL, you can temporarily use SQLite:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. Update `.env.local`:
   ```bash
   DATABASE_URL="file:./dev.db"
   ```

3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

**Note**: SQLite is for development only. Use PostgreSQL for production.

