# 🔄 CRITICAL: Restart Instructions

## The Problem
You're seeing the error: `User 'user' was denied access on the database 'dbname.public'`

This means your Next.js dev server is using **cached environment variables** from when it first started.

## ✅ THE FIX (Do This Now)

### Step 1: Stop the Dev Server
1. Go to the terminal where `npm run dev` is running
2. Press `Ctrl+C` (Windows/Linux) or `Cmd+C` (Mac) to stop it
3. **Wait for it to fully stop** - you should see the prompt return

### Step 2: Clear All Caches
Run these commands:

```bash
# Clear Next.js cache
rm -rf .next

# Clear node modules cache (optional but recommended)
rm -rf node_modules/.cache

# Regenerate Prisma client
npx prisma generate
```

### Step 3: Verify Environment Variables
```bash
npm run verify:env
```

You should see:
```
DATABASE_URL: ✅ Set
  Value: postgresql:****@localhost:5432/support_website?schema=public
  ✅ Looks like a real connection string
```

### Step 4: Start Fresh
```bash
npm run dev
```

**IMPORTANT**: Watch the terminal output when it starts. You should see:
```
✅ Database URL configured: postgresql:****@localhost:5432/support_website?schema=public
```

If you see an error about DATABASE_URL, the environment variable isn't being loaded.

### Step 5: Test Signup
1. Go to http://localhost:3000/signup
2. Try creating an account
3. It should work now!

## 🔍 If It Still Doesn't Work

### Check 1: Verify .env.local exists and is correct
```bash
cat .env.local | grep DATABASE_URL
```

Should show:
```
DATABASE_URL="postgresql://shireenafzal@localhost:5432/support_website?schema=public"
```

### Check 2: Make sure .env file also exists
```bash
cat .env | grep DATABASE_URL
```

Should show the same value.

### Check 3: Check for typos
Make sure there are no extra spaces or quotes:
```bash
# Correct:
DATABASE_URL="postgresql://shireenafzal@localhost:5432/support_website?schema=public"

# Wrong (extra spaces):
DATABASE_URL = "postgresql://..."
```

### Check 4: Verify database is running
```bash
brew services list | grep postgresql
```

Should show `postgresql@14 started`

### Check 5: Test database connection
```bash
npm run db:check
```

Should show: `✅ Database connected successfully!`

## 🚨 Common Mistakes

1. **Not fully stopping the dev server** - Make sure it's completely stopped before restarting
2. **Editing .env.local while server is running** - Always restart after changes
3. **Having wrong DATABASE_URL** - Make sure it's not the placeholder `dbname`
4. **Not clearing .next cache** - This is crucial!

## Still Having Issues?

Run this diagnostic:
```bash
npm run verify:env && npm run db:check && echo "✅ All checks passed!"
```

If all checks pass but signup still fails, check the terminal where `npm run dev` is running for the exact error message.

