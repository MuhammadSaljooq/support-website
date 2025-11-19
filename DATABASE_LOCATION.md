# Database Location & Information

## 📍 Database Location

Your PostgreSQL database files are stored at:
```
/opt/homebrew/var/postgresql@14
```

This is the PostgreSQL data directory where all databases, tables, and data are stored.

## 🗄️ Database Details

- **Database Name**: `support_website`
- **Owner**: `shireenafzal`
- **Size**: ~9.2 MB
- **Location**: `/opt/homebrew/var/postgresql@14/base/[database_oid]/`
- **Connection**: `localhost:5432`

## 🔌 Connection Information

**Connection String** (from `.env.local`):
```
postgresql://shireenafzal@localhost:5432/support_website?schema=public
```

**Breakdown**:
- **User**: `shireenafzal`
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `support_website`
- **Schema**: `public`

## 📊 Database Tables

Your database contains these tables:
- `User` - User accounts
- `Account` - OAuth accounts
- `Session` - User sessions
- `Subscription` - User subscriptions
- `Usage` - API usage tracking
- `Transaction` - Billing transactions
- `ApiKey` - API keys
- `VerificationToken` - Email verification tokens

## 🛠️ How to Access the Database

### Option 1: Using psql (Command Line)
```bash
psql support_website
```

### Option 2: Using Prisma Studio (Visual Interface)
```bash
npm run db:studio
```
This will open a web interface at http://localhost:5555

### Option 3: Using a Database GUI Tool
Connect with:
- **Host**: `localhost`
- **Port**: `5432`
- **Database**: `support_website`
- **User**: `shireenafzal`
- **Password**: (none required for local)

Popular tools:
- **pgAdmin** - https://www.pgadmin.org/
- **TablePlus** - https://tableplus.com/
- **DBeaver** - https://dbeaver.io/
- **Postico** (Mac) - https://eggerapps.at/postico/

## 📁 Database File Structure

```
/opt/homebrew/var/postgresql@14/
├── base/              # Database files (one folder per database)
│   └── [oid]/         # Your support_website database files
├── global/            # Cluster-wide tables
├── pg_logical/        # Logical replication data
├── pg_multixact/      # Multi-transaction status
└── pg_hba.conf        # Client authentication config
```

## 🔍 Useful Commands

### Check database size
```bash
psql support_website -c "SELECT pg_size_pretty(pg_database_size('support_website'));"
```

### List all tables
```bash
psql support_website -c "\dt"
```

### Count records in User table
```bash
psql support_website -c "SELECT COUNT(*) FROM \"User\";"
```

### View table structure
```bash
psql support_website -c "\d \"User\""
```

### Backup database
```bash
pg_dump support_website > backup.sql
```

### Restore database
```bash
psql support_website < backup.sql
```

## 🚨 Important Notes

1. **Don't manually edit files** in `/opt/homebrew/var/postgresql@14/` - always use SQL commands or Prisma
2. **Backup before major changes** - Use `pg_dump` to create backups
3. **Database is local** - Only accessible from your machine
4. **No password required** - Local PostgreSQL uses peer authentication

## 🔄 Database Management

### Start PostgreSQL
```bash
brew services start postgresql@14
```

### Stop PostgreSQL
```bash
brew services stop postgresql@14
```

### Check status
```bash
brew services list | grep postgresql
```

### View logs
```bash
tail -f /opt/homebrew/var/log/postgresql@14.log
```

## 📝 Quick Reference

**Current Database**: `support_website`  
**Data Directory**: `/opt/homebrew/var/postgresql@14`  
**Connection**: `postgresql://shireenafzal@localhost:5432/support_website`  
**Size**: ~9.2 MB  
**Tables**: 8 tables  
**Status**: ✅ Running and accessible

