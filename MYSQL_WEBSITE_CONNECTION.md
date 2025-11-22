# MySQL Website Connection Guide

## ✅ Step 1: Update Prisma Schema

The Prisma schema has been updated to use MySQL. The provider is now set to `mysql`.

## ✅ Step 2: Set Database Connection String

Add or update `DATABASE_URL` in your `.env.local` file:

### Option A: No MySQL Password
```env
DATABASE_URL="mysql://root@localhost:3306/vocco_talk_db"
```

### Option B: With MySQL Password
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/vocco_talk_db"
```

### Option C: Custom User
```env
DATABASE_URL="mysql://username:password@localhost:3306/vocco_talk_db"
```

## ✅ Step 3: Create Database

```bash
# Create database
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS vocco_talk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Or use the setup script
mysql -u root -p < scripts/setup-mysql-db.sql
```

## ✅ Step 4: Run Prisma Migrations

```bash
# Generate Prisma client for MySQL
npm run db:generate

# Create migration
npm run db:migrate

# Or push schema directly (for development)
npx prisma db push
```

## ✅ Step 5: Verify Connection

```bash
# Test database connection
npm run db:check

# Or test with Prisma Studio
npm run db:studio
```

## 🔧 Quick Setup Script

Run the automated setup:

```bash
./scripts/setup-mysql-connection.sh
```

This script will:
1. Prompt for MySQL password
2. Add DATABASE_URL to .env.local
3. Create the database
4. Show next steps

## 📋 What's Been Updated

1. ✅ Prisma schema changed from PostgreSQL to MySQL
2. ✅ Added LoginLog model for tracking login times and dates
3. ✅ Created setup scripts
4. ✅ Database structure ready for users, login logs, and sessions

## 🧪 Test Login/Signup

After setup, test the authentication:

1. **Signup**: Go to `/signup` and create a new account
2. **Login**: Go to `/login` and sign in
3. **Check Database**: 
   ```bash
   mysql -u root -p -e "USE vocco_talk_db; SELECT * FROM users;"
   mysql -u root -p -e "USE vocco_talk_db; SELECT * FROM LoginLog ORDER BY loginTime DESC LIMIT 5;"
   ```

## 🔍 Verify Tables

```bash
mysql -u root -p -e "USE vocco_talk_db; SHOW TABLES;"
```

You should see:
- User
- Account
- Session
- VerificationToken
- Subscription
- Usage
- ApiKey
- Transaction
- VapiAgent
- LoginLog

## 🚨 Troubleshooting

### Error: Unknown database 'vocco_talk_db'
```bash
# Create the database
mysql -u root -p -e "CREATE DATABASE vocco_talk_db;"
```

### Error: Access denied
- Check your MySQL password
- Verify user has privileges: `GRANT ALL ON vocco_talk_db.* TO 'root'@'localhost';`

### Error: P1001 Can't reach database server
- Ensure MySQL is running: `brew services start mysql` (macOS)
- Check connection string format

### Migration Errors
```bash
# Reset migrations (WARNING: Deletes data)
npx prisma migrate reset

# Or push schema directly
npx prisma db push
```

## 📝 Next Steps

1. ✅ Database created
2. ✅ Prisma schema updated
3. ⏭️ Add DATABASE_URL to .env.local
4. ⏭️ Run `npm run db:generate`
5. ⏭️ Run `npm run db:migrate` or `npx prisma db push`
6. ⏭️ Test signup/login functionality


