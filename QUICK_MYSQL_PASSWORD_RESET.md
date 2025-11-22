# Quick MySQL Password Reset Guide

## Your command got suspended - here's the fix:

### Step 1: Stop the suspended process

In your terminal, run:
```bash
# Bring to foreground and stop
fg
# Then press Ctrl+C

# Or kill it directly
sudo killall mysqld_safe
sudo killall mysqld
```

### Step 2: Start MySQL safe mode properly

**Option A: Use the script (Easiest)**
```bash
./scripts/start-mysql-safe-mode.sh
```

**Option B: Manual command (redirect output)**
```bash
sudo mysqld_safe --skip-grant-tables --skip-networking > /dev/null 2>&1 &
sleep 5
```

### Step 3: Connect without password

```bash
mysql -u root
```

### Step 4: Reset password

In MySQL, run:
```sql
USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';
FLUSH PRIVILEGES;
EXIT;
```

### Step 5: Stop safe mode and restart MySQL normally

```bash
sudo killall mysqld_safe
sudo killall mysqld
brew services start mysql
```

### Step 6: Test with new password

```bash
mysql -u root -p
# Enter: your_new_password
```

## Complete Command Sequence

```bash
# 1. Stop any running MySQL
brew services stop mysql
sudo killall mysqld_safe 2>/dev/null
sudo killall mysqld 2>/dev/null

# 2. Start safe mode (background, no output)
sudo mysqld_safe --skip-grant-tables --skip-networking > /dev/null 2>&1 &

# 3. Wait for it to start
sleep 5

# 4. Connect
mysql -u root

# 5. In MySQL, reset password:
# USE mysql;
# ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword123';
# FLUSH PRIVILEGES;
# EXIT;

# 6. Stop safe mode
sudo killall mysqld_safe
sudo killall mysqld

# 7. Start MySQL normally
brew services start mysql

# 8. Test
mysql -u root -p
```

## Troubleshooting

### If safe mode won't start:
```bash
# Check MySQL error logs
tail -f /usr/local/var/mysql/*.err

# Check if port 3306 is in use
lsof -i :3306

# Try different MySQL path
/usr/local/mysql/bin/mysqld_safe --skip-grant-tables --skip-networking &
```

### If you can't connect:
- Wait a bit longer (MySQL takes time to start)
- Check: `ps aux | grep mysqld` (should see mysqld_safe running)
- Try: `mysql -u root --socket=/tmp/mysql.sock`


