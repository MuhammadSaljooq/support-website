# Quick MySQL Connection Test

## Method 1: Using MySQL CLI (Fastest)

```bash
# Test basic connection
mysql -u root -p -e "SELECT VERSION();"

# List all databases
mysql -u root -p -e "SHOW DATABASES;"

# Check if vocco_talk_db exists
mysql -u root -p -e "USE vocco_talk_db; SHOW TABLES;"

# View users table
mysql -u root -p -e "USE vocco_talk_db; SELECT * FROM users;"
```

## Method 2: Using Node.js Script

1. **Install dependencies** (if not already installed):
```bash
npm install mysql2 @types/mysql2
```

2. **Add DATABASE_URL to `.env.local`**:
```env
DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/vocco_talk_db"
```

3. **Run the test**:
```bash
npm run test:mysql
```

## Method 3: Create Database First

If the database doesn't exist yet:

```bash
# Create the database
mysql -u root -p < scripts/setup-mysql-db.sql

# Or use the automated script
./scripts/create-mysql-db.sh
```

## Troubleshooting

### MySQL not found
```bash
# Check if MySQL is installed
which mysql
mysql --version

# macOS: Install MySQL
brew install mysql
brew services start mysql

# Ubuntu: Install MySQL
sudo apt-get install mysql-server
sudo systemctl start mysql
```

### Connection refused
```bash
# Check if MySQL is running
# macOS
brew services list | grep mysql

# Ubuntu
sudo systemctl status mysql

# Start MySQL
# macOS
brew services start mysql

# Ubuntu
sudo systemctl start mysql
```

### Access denied
- Check your MySQL root password
- Try: `mysql -u root -p` and enter password when prompted
- Or create a new user:
```sql
CREATE USER 'vocco_user'@'localhost' IDENTIFIED BY 'your_password';
GRANT ALL PRIVILEGES ON vocco_talk_db.* TO 'vocco_user'@'localhost';
FLUSH PRIVILEGES;
```

## Quick Test Commands

```bash
# 1. Test connection
mysql -u root -p -e "SELECT 'Connection successful!' as status;"

# 2. Create database (if needed)
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS vocco_talk_db;"

# 3. Check tables
mysql -u root -p -e "USE vocco_talk_db; SHOW TABLES;"

# 4. Insert test user
mysql -u root -p vocco_talk_db -e "INSERT INTO users (username, email, password, name) VALUES ('testuser', 'test@example.com', 'hashed_password_here', 'Test User');"

# 5. View users
mysql -u root -p -e "USE vocco_talk_db; SELECT id, username, email, role FROM users;"
```


