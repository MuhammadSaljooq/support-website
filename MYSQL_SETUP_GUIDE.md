# MySQL Database Setup Guide

This guide will help you set up a MySQL database for user authentication and login tracking.

## Prerequisites

1. MySQL installed on your system
   - macOS: `brew install mysql`
   - Ubuntu: `sudo apt-get install mysql-server`
   - Windows: Download from [MySQL Downloads](https://dev.mysql.com/downloads/mysql/)

2. MySQL service running
   - macOS: `brew services start mysql`
   - Ubuntu: `sudo systemctl start mysql`
   - Windows: MySQL service should start automatically

## Quick Setup

### Option 1: Using the Setup Script (Recommended)

```bash
# Make script executable
chmod +x scripts/create-mysql-db.sh

# Run the setup script
./scripts/create-mysql-db.sh
```

The script will:
- Check if MySQL is installed
- Prompt for MySQL root password
- Create the database `vocco_talk_db`
- Create all necessary tables

### Option 2: Manual Setup

```bash
# Connect to MySQL
mysql -u root -p

# Run the SQL script
source scripts/setup-mysql-db.sql

# Or directly
mysql -u root -p < scripts/setup-mysql-db.sql
```

## Database Structure

### Tables Created

1. **users**
   - `id` - Primary key
   - `username` - Unique username
   - `email` - Unique email
   - `password` - Hashed password (bcrypt)
   - `name` - Full name
   - `role` - USER or ADMIN
   - `is_active` - Account status
   - `created_at` - Account creation time
   - `updated_at` - Last update time

2. **login_logs**
   - `id` - Primary key
   - `user_id` - Foreign key to users
   - `username` - Username at login time
   - `login_time` - Exact login timestamp
   - `login_date` - Login date
   - `ip_address` - IP address of login
   - `user_agent` - Browser/client info
   - `login_status` - SUCCESS or FAILED
   - `failure_reason` - Reason for failed login

3. **user_sessions**
   - `id` - Primary key
   - `user_id` - Foreign key to users
   - `session_token` - Unique session token
   - `ip_address` - IP address
   - `user_agent` - Browser/client info
   - `login_time` - Session start time
   - `last_activity` - Last activity timestamp
   - `expires_at` - Session expiration
   - `is_active` - Session status

## Connection String

Update your `.env.local` file:

```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/vocco_talk_db"
```

Or with a specific user:

```env
DATABASE_URL="mysql://username:password@localhost:3306/vocco_talk_db"
```

## Testing Connection

### Test 1: Check Tables

```bash
mysql -u root -p -e "USE vocco_talk_db; SHOW TABLES;"
```

### Test 2: View Data

```bash
mysql -u root -p < scripts/mysql-connection-test.sql
```

### Test 3: Insert Test User

```sql
USE vocco_talk_db;

-- Insert a test user (password: test123)
-- Note: This is a sample hash, generate your own with bcrypt
INSERT INTO users (username, email, password, name) 
VALUES ('testuser', 'test@example.com', '$2a$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'Test User');
```

### Test 4: Log a Login

```sql
USE vocco_talk_db;

-- Log a successful login
INSERT INTO login_logs (user_id, username, login_time, login_date, ip_address, login_status)
VALUES (1, 'testuser', NOW(), CURDATE(), '127.0.0.1', 'SUCCESS');

-- View login logs
SELECT * FROM login_logs ORDER BY login_time DESC;
```

## Common Commands

### View All Users
```sql
SELECT id, username, email, role, created_at FROM users;
```

### View Login Logs
```sql
SELECT 
    ll.login_time,
    ll.login_date,
    u.username,
    ll.ip_address,
    ll.login_status
FROM login_logs ll
JOIN users u ON ll.user_id = u.id
ORDER BY ll.login_time DESC;
```

### Count Logins by Date
```sql
SELECT 
    login_date,
    COUNT(*) as login_count,
    SUM(CASE WHEN login_status = 'SUCCESS' THEN 1 ELSE 0 END) as successful_logins
FROM login_logs
GROUP BY login_date
ORDER BY login_date DESC;
```

### Find Active Sessions
```sql
SELECT 
    u.username,
    us.login_time,
    us.last_activity,
    us.expires_at
FROM user_sessions us
JOIN users u ON us.user_id = u.id
WHERE us.is_active = TRUE AND us.expires_at > NOW();
```

## Security Notes

1. **Change Default Passwords**: The sample admin user has a placeholder password. Change it immediately.

2. **Create Application User**: Don't use root for your application. Create a dedicated user:

```sql
-- Create application user
CREATE USER 'vocco_app'@'localhost' IDENTIFIED BY 'strong_password_here';

-- Grant privileges
GRANT SELECT, INSERT, UPDATE, DELETE ON vocco_talk_db.* TO 'vocco_app'@'localhost';
FLUSH PRIVILEGES;
```

3. **Password Hashing**: Always hash passwords using bcrypt before storing. Never store plain text passwords.

4. **Connection Security**: Use SSL for production connections.

## Troubleshooting

### MySQL Not Found
```bash
# Check if MySQL is installed
which mysql

# Check MySQL version
mysql --version
```

### Connection Refused
```bash
# Check if MySQL is running
# macOS
brew services list | grep mysql

# Ubuntu
sudo systemctl status mysql
```

### Permission Denied
- Make sure you're using the correct username and password
- Check if the user has privileges on the database

### Database Already Exists
```sql
-- Drop and recreate (WARNING: This deletes all data!)
DROP DATABASE IF EXISTS vocco_talk_db;
-- Then run setup-mysql-db.sql again
```

## Next Steps

1. ✅ Database created
2. ✅ Tables created
3. ⏭️ Update `.env.local` with MySQL connection string
4. ⏭️ Update Prisma schema to use MySQL (if needed)
5. ⏭️ Test database connection from your application


