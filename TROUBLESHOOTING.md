# Troubleshooting: Database Connection Issues

## Error: "User `user` was denied access on the database `dbname.public`"

This error indicates that the Next.js dev server is using cached environment variables or hasn't picked up the new DATABASE_URL.

### Solution 1: Restart the Dev Server

**IMPORTANT**: You must restart your Next.js dev server after changing environment variables!

1. Stop the current dev server (Ctrl+C or Cmd+C)
2. Start it again:
   ```bash
   npm run dev
   ```

### Solution 2: Verify Environment Variables

Check that both `.env` and `.env.local` have the correct DATABASE_URL:

```bash
# Check .env
cat .env | grep DATABASE_URL

# Check .env.local  
cat .env.local | grep DATABASE_URL
```

Both should show:
```
DATABASE_URL="postgresql://shireenafzal@localhost:5432/support_website?schema=public"
```

### Solution 3: Clear Next.js Cache

If restarting doesn't work, clear the Next.js cache:

```bash
rm -rf .next
npm run dev
```

### Solution 4: Verify Database Connection

Test the database connection directly:

```bash
npm run db:check
npm run db:test
```

Both should show success messages.

### Solution 5: Check PostgreSQL is Running

```bash
brew services list | grep postgresql
```

If it's not running:
```bash
brew services start postgresql@14
```

## Common Issues

### Issue: "Environment variable not found: DATABASE_URL"
- **Cause**: Prisma CLI can't find DATABASE_URL
- **Fix**: Ensure `.env` file exists (Prisma reads from `.env`, not `.env.local`)

### Issue: "Connection refused"
- **Cause**: PostgreSQL is not running
- **Fix**: Start PostgreSQL: `brew services start postgresql@14`

### Issue: "Database does not exist"
- **Cause**: Database hasn't been created
- **Fix**: Create it: `createdb support_website`

### Issue: "Permission denied"
- **Cause**: User doesn't have access to database
- **Fix**: Grant permissions (already done, but you can verify):
  ```bash
  psql support_website -c "GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO shireenafzal;"
  ```

## Quick Verification Checklist

- [ ] PostgreSQL is running (`brew services list | grep postgresql`)
- [ ] Database exists (`psql -lqt | grep support_website`)
- [ ] `.env` file has correct DATABASE_URL
- [ ] `.env.local` file has correct DATABASE_URL
- [ ] Dev server has been restarted after changing env vars
- [ ] `npm run db:check` succeeds
- [ ] `npm run db:test` succeeds

## Still Having Issues?

1. Check the terminal where `npm run dev` is running for error messages
2. Check browser console for client-side errors
3. Check server logs in the terminal
4. Verify the exact error message and search for the Prisma error code

