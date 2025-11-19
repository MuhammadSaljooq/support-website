# ⚠️ RESTART REQUIRED

## The Issue
You're seeing: `Cannot read properties of undefined (reading 'create')`

This happens because the Next.js dev server is using a **cached version** of Prisma Client that doesn't include the new `VapiAgent` model.

## ✅ THE FIX

### Step 1: Stop Your Dev Server
Press `Ctrl+C` (or `Cmd+C`) in the terminal where `npm run dev` is running.

### Step 2: Clear Caches
```bash
rm -rf .next
rm -rf node_modules/.cache
```

### Step 3: Regenerate Prisma Client
```bash
npx prisma generate
```

### Step 4: Restart Dev Server
```bash
npm run dev
```

## Verification

After restarting, you should see in the terminal:
```
✅ Database URL configured: postgresql:****@localhost:5432/support_website?schema=public
```

If you see a warning about VapiAgent, the Prisma Client wasn't regenerated properly.

## Quick Test

Test that VapiAgent is available:
```bash
npm run test:vapi-agent
```

Should show:
```
✅ db.vapiAgent is available
✅ Can query VapiAgent table. Current count: 0
```

## Why This Happens

- Prisma Client is generated at build time
- Next.js caches the Prisma Client instance
- When you add new models, you need to:
  1. Regenerate Prisma Client (`npx prisma generate`)
  2. Clear Next.js cache (`rm -rf .next`)
  3. Restart the dev server

## Still Having Issues?

1. Check that the VapiAgent table exists:
   ```bash
   psql support_website -c "\d \"VapiAgent\""
   ```

2. Verify Prisma schema has VapiAgent:
   ```bash
   grep -A 10 "model VapiAgent" prisma/schema.prisma
   ```

3. Force regenerate:
   ```bash
   rm -rf node_modules/.prisma
   npx prisma generate
   ```

