# Create New MySQL User and Database

## Quick Setup

### Option 1: Automated Script (Easiest)

```bash
./scripts/create-new-mysql-user.sh
```

The script will:
- Ask for username (default: `vocco_user`)
- Ask for password
- Create the database
- Create the user
- Grant privileges
- Update `.env.local` automatically

### Option 2: Manual SQL Commands

1. **Connect to MySQL** (you'll need root access or existing access):
```bash
mysql -u root -p
# Enter your MySQL root password when prompted
```

2. **Run these SQL commands**:
```sql
-- Create database
CREATE DATABASE IF NOT EXISTS vocco_talk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user (change password!)
CREATE USER 'vocco_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges
GRANT ALL PRIVILEGES ON vocco_talk_db.* TO 'vocco_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify
SHOW DATABASES LIKE 'vocco_talk_db';
SELECT user, host FROM mysql.user WHERE user = 'vocco_user';
```

3. **Exit MySQL**:
```sql
EXIT;
```

### Option 3: Using SQL File

1. Edit `scripts/create-mysql-user-manual.sql` and change the password
2. Run:
```bash
mysql -u root -p < scripts/create-mysql-user-manual.sql
```

## Update Your Website Configuration

After creating the user, update `.env.local`:

```env
DATABASE_URL="mysql://vocco_user:your_secure_password@localhost:3306/vocco_talk_db"
```

## Next Steps

1. **Generate Prisma client**:
```bash
npm run db:generate
```

2. **Push schema to database**:
```bash
npx prisma db push
```

3. **Start your website**:
```bash
npm run dev
```

## Test the Connection

```bash
# Test connection
mysql -u vocco_user -p vocco_talk_db

# Or test from Node.js
npm run test:mysql
```

## Security Notes

- Use a strong password (mix of letters, numbers, symbols)
- The user only has privileges on `vocco_talk_db` (not all databases)
- User can only connect from `localhost` (secure)

## Troubleshooting

### "Access denied" when connecting
- Check the password is correct
- Verify user exists: `SELECT user FROM mysql.user WHERE user = 'vocco_user';`
- Check privileges: `SHOW GRANTS FOR 'vocco_user'@'localhost';`

### "Database doesn't exist"
- Create it: `CREATE DATABASE vocco_talk_db;`
- Grant privileges again: `GRANT ALL ON vocco_talk_db.* TO 'vocco_user'@'localhost';`

### Can't connect as root
- Try: `mysql -u root` (no password)
- Or reset root password (see `QUICK_MYSQL_PASSWORD_RESET.md`)
- Or use an existing MySQL user with CREATE USER privileges


