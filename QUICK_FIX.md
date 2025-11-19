# Quick Fix for Signup Error

## The Problem
You're getting an "Internal server error" because the database isn't set up yet. The `DATABASE_URL` in `.env.local` is just a placeholder.

## Quick Solution (Choose One)

### Option 1: Use Supabase (Easiest - Free)

1. Go to https://supabase.com and sign up (free)
2. Create a new project
3. Go to Project Settings → Database
4. Copy the "Connection string" (URI format)
5. Update `.env.local`:
   ```bash
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"
   ```
6. Run migrations:
   ```bash
   npm run db:migrate
   ```
7. Try signing up again!

### Option 2: Use Local PostgreSQL

1. Install PostgreSQL:
   ```bash
   brew install postgresql@14
   brew services start postgresql@14
   ```

2. Create database:
   ```bash
   createdb support_website
   ```

3. Update `.env.local`:
   ```bash
   DATABASE_URL="postgresql://$(whoami)@localhost:5432/support_website?schema=public"
   ```

4. Run migrations:
   ```bash
   npm run db:migrate
   ```

### Option 3: Use SQLite (Quick Test)

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
   npm run db:migrate
   ```

## Verify Setup

After setting up, test the database:
```bash
npm run db:check
```

Or test registration:
```bash
npm run db:test
```

## Still Having Issues?

Check the terminal/console for the specific error code:
- **P1001**: Database connection failed - check DATABASE_URL
- **P2021/P2003**: Tables don't exist - run `npm run db:migrate`
- **P2002**: Email already exists (not an error, just duplicate)

The improved error messages will now show you exactly what's wrong!

