# Recover MySQL Root Access

## Method 1: Check Default Root User

MySQL root user is typically just `root`. Try these:

```bash
# Try connecting as root (no password)
mysql -u root

# Try with common passwords (if you set one)
mysql -u root -p
# Then try: (empty), root, password, admin, or your usual passwords
```

## Method 2: Check All MySQL Users

```bash
# If you can connect with any user
mysql -u root -p -e "SELECT user, host FROM mysql.user;"
```

Common root users:
- `root@localhost`
- `root@127.0.0.1`
- `root@%`

## Method 3: Reset Root Password (macOS)

### Option A: Using MySQL Safe Mode

1. **Stop MySQL**:
```bash
brew services stop mysql
# or
sudo /usr/local/mysql/support-files/mysql.server stop
```

2. **Start MySQL in safe mode**:
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
UPDATE user SET authentication_string=PASSWORD('newpassword') WHERE User='root';
FLUSH PRIVILEGES;
EXIT;
```

5. **Restart MySQL normally**:
```bash
brew services start mysql
# or
sudo /usr/local/mysql/support-files/mysql.server start
```

### Option B: Using MySQL Configuration

1. **Stop MySQL**:
```bash
brew services stop mysql
```

2. **Create reset file**:
```bash
echo "ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';" > /tmp/mysql-reset.sql
```

3. **Start MySQL with init file**:
```bash
mysqld_safe --init-file=/tmp/mysql-reset.sql &
```

4. **Wait a few seconds, then restart normally**:
```bash
brew services start mysql
```

## Method 4: Create New Admin User

If you can't recover root, create a new admin user:

```bash
# Connect if possible (try different methods)
mysql -u root
# or
mysql -u root -p
```

Then create new user:

```sql
-- Create new admin user
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'your_secure_password';

-- Grant all privileges
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost' WITH GRANT OPTION;

-- For remote access (optional)
CREATE USER 'admin'@'%' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'%' WITH GRANT OPTION;

-- Apply changes
FLUSH PRIVILEGES;
```

Then use this user in your DATABASE_URL:
```env
DATABASE_URL="mysql://admin:your_secure_password@localhost:3306/vocco_talk_db"
```

## Method 5: Check MySQL Installation Type

### If installed via Homebrew (macOS):
```bash
# Check MySQL version and location
brew list mysql
mysql --version

# Check if running
brew services list | grep mysql

# Restart MySQL
brew services restart mysql
```

### If installed via installer:
- Check `/usr/local/mysql/` or `/Applications/MySQL/`
- May have a MySQL preference pane in System Preferences

## Method 6: Check for MySQL Configuration Files

MySQL config files may have user info:

```bash
# Check for my.cnf or my.ini
cat ~/.my.cnf
cat /etc/my.cnf
cat /usr/local/etc/my.cnf

# Look for [client] section with user/password
```

## Quick Recovery Steps

1. **Try default root (no password)**:
   ```bash
   mysql -u root
   ```

2. **If that works, set a password**:
   ```sql
   ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
   FLUSH PRIVILEGES;
   ```

3. **If that doesn't work, try reset**:
   - Stop MySQL
   - Start in safe mode
   - Reset password
   - Restart MySQL

4. **If all else fails, create new user**:
   - Connect with any method that works
   - Create new admin user
   - Use that for your website

## For Your Website

Once you have access, update `.env.local`:

```env
# If root works
DATABASE_URL="mysql://root:your_password@localhost:3306/vocco_talk_db"

# Or use new admin user
DATABASE_URL="mysql://admin:your_password@localhost:3306/vocco_talk_db"
```


