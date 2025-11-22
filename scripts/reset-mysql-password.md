# Reset MySQL Root Password

## Quick Fix for "Access denied for user 'root'@'localhost'"

### Method 1: Reset Password via Safe Mode (macOS with Homebrew)

1. **Stop MySQL**:
```bash
brew services stop mysql
```

2. **Start MySQL in safe mode** (in a new terminal):
```bash
sudo mysqld_safe --skip-grant-tables --skip-networking &
```

3. **Connect without password**:
```bash
mysql -u root
```

4. **Reset password**:
```sql
USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
FLUSH PRIVILEGES;
EXIT;
```

5. **Stop safe mode and restart MySQL**:
```bash
sudo killall mysqld
brew services start mysql
```

6. **Test connection**:
```bash
mysql -u root -p
# Enter your new password
```

### Method 2: Create New User (If you can't reset root)

If you can connect somehow, create a new user:

```sql
-- Create new user
CREATE USER 'vocco_user'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant privileges on your database
GRANT ALL PRIVILEGES ON vocco_talk_db.* TO 'vocco_user'@'localhost';
FLUSH PRIVILEGES;
```

Then update `.env.local`:
```env
DATABASE_URL="mysql://vocco_user:your_secure_password@localhost:3306/vocco_talk_db"
```

### Method 3: Use MySQL Workbench or phpMyAdmin

If you have MySQL Workbench or phpMyAdmin installed, you can:
1. Connect through the GUI
2. Reset the root password
3. Or create a new user

### Method 4: Check if MySQL has a different root setup

Sometimes MySQL uses a socket file. Try:

```bash
# Check MySQL socket
ls -la /tmp/mysql.sock

# Connect via socket
mysql -u root --socket=/tmp/mysql.sock
```

### Quick Test After Reset

```bash
# Test connection
mysql -u root -p -e "SELECT 'Connection successful!' as status;"

# Create database if needed
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS vocco_talk_db;"

# Check databases
mysql -u root -p -e "SHOW DATABASES;"
```

## Troubleshooting

### If safe mode doesn't work:
- Check MySQL error logs: `tail -f /usr/local/var/mysql/*.err`
- Try different MySQL paths: `/usr/local/mysql/bin/mysqld_safe`

### If you can't stop MySQL:
```bash
# Find MySQL process
ps aux | grep mysql

# Kill it
sudo killall mysqld
```

### Alternative: Reinstall MySQL (Last Resort)
```bash
brew uninstall mysql
brew install mysql
brew services start mysql
# MySQL will have no root password initially
```


