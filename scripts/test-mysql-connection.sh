#!/bin/bash

echo "🔍 Testing MySQL Connection..."
echo "================================"
echo ""

# Test 1: Check if MySQL is installed
echo "1️⃣ Checking MySQL installation..."
if command -v mysql &> /dev/null; then
    MYSQL_VERSION=$(mysql --version 2>&1)
    echo "✅ MySQL found: $MYSQL_VERSION"
else
    echo "❌ MySQL not found in PATH"
    echo "   Install MySQL: brew install mysql (macOS)"
    exit 1
fi
echo ""

# Test 2: Try connecting without password
echo "2️⃣ Testing connection as 'root' (no password)..."
if mysql -u root -e "SELECT 'Connection successful!' as status;" 2>/dev/null; then
    echo "✅ Connected successfully as 'root' (no password required)"
    MYSQL_CMD="mysql -u root"
    NO_PASSWORD=true
else
    echo "⚠️  Connection failed (password may be required)"
    NO_PASSWORD=false
fi
echo ""

# Test 3: Try with password prompt
if [ "$NO_PASSWORD" = false ]; then
    echo "3️⃣ Testing with password..."
    echo "Please enter MySQL root password (or press Enter to skip):"
    read -s MYSQL_PASSWORD
    
    if [ -z "$MYSQL_PASSWORD" ]; then
        echo "⚠️  No password provided. Trying alternative methods..."
        MYSQL_CMD="mysql -u root"
    else
        MYSQL_CMD="mysql -u root -p$MYSQL_PASSWORD"
    fi
    
    if $MYSQL_CMD -e "SELECT 'Connected!' as status;" 2>/dev/null; then
        echo "✅ Connected successfully with password"
    else
        echo "❌ Connection failed. Please check your password."
        echo ""
        echo "💡 Try manually: mysql -u root -p"
        exit 1
    fi
fi
echo ""

# Test 4: Check MySQL server status
echo "4️⃣ Checking MySQL server status..."
if $MYSQL_CMD -e "SELECT VERSION() as 'MySQL Version', NOW() as 'Server Time';" 2>/dev/null; then
    echo "✅ MySQL server is running"
else
    echo "❌ Cannot connect to MySQL server"
    echo "   Start MySQL: brew services start mysql (macOS)"
    exit 1
fi
echo ""

# Test 5: List databases
echo "5️⃣ Available databases:"
$MYSQL_CMD -e "SHOW DATABASES;" 2>/dev/null
echo ""

# Test 6: Check if vocco_talk_db exists
echo "6️⃣ Checking for 'vocco_talk_db' database..."
if $MYSQL_CMD -e "USE vocco_talk_db;" 2>/dev/null; then
    echo "✅ Database 'vocco_talk_db' exists!"
    
    # Count tables
    TABLE_COUNT=$($MYSQL_CMD -e "USE vocco_talk_db; SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'vocco_talk_db';" 2>/dev/null | tail -1)
    echo "   Tables found: $TABLE_COUNT"
    echo ""
    
    # List tables
    echo "📋 Tables in vocco_talk_db:"
    $MYSQL_CMD -e "USE vocco_talk_db; SHOW TABLES;" 2>/dev/null
    
    # Check for User table
    if $MYSQL_CMD -e "USE vocco_talk_db; SHOW TABLES LIKE 'User';" 2>/dev/null | grep -q "User"; then
        echo ""
        echo "✅ User table exists"
        USER_COUNT=$($MYSQL_CMD -e "USE vocco_talk_db; SELECT COUNT(*) FROM \`User\`;" 2>/dev/null | tail -1)
        echo "   Total users: $USER_COUNT"
    fi
    
    # Check for LoginLog table
    if $MYSQL_CMD -e "USE vocco_talk_db; SHOW TABLES LIKE 'LoginLog';" 2>/dev/null | grep -q "LoginLog"; then
        echo "✅ LoginLog table exists"
        LOG_COUNT=$($MYSQL_CMD -e "USE vocco_talk_db; SELECT COUNT(*) FROM LoginLog;" 2>/dev/null | tail -1)
        echo "   Total login logs: $LOG_COUNT"
    fi
    
else
    echo "⚠️  Database 'vocco_talk_db' does not exist"
    echo ""
    echo "💡 Create it with:"
    echo "   $MYSQL_CMD -e \"CREATE DATABASE vocco_talk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;\""
    echo ""
    echo "   Or run: mysql -u root -p < scripts/setup-mysql-db.sql"
fi
echo ""

# Test 7: Test Prisma connection
echo "7️⃣ Testing Prisma connection..."
cd "$(dirname "$0")/.."
if [ -f ".env.local" ] && grep -q "DATABASE_URL" .env.local; then
    echo "✅ DATABASE_URL found in .env.local"
    DATABASE_URL=$(grep "DATABASE_URL" .env.local | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    echo "   Connection string configured"
else
    echo "⚠️  DATABASE_URL not found in .env.local"
    echo "   Add: DATABASE_URL=\"mysql://root:password@localhost:3306/vocco_talk_db\""
fi
echo ""

echo "================================"
echo "✅ MySQL Connection Test Complete!"
echo ""
echo "📋 Summary:"
echo "  - MySQL: ✅ Installed"
echo "  - Connection: ✅ Working"
if [ "$NO_PASSWORD" = true ]; then
    echo "  - Authentication: ✅ No password required"
else
    echo "  - Authentication: ✅ Password configured"
fi
echo "  - Database: $(if $MYSQL_CMD -e "USE vocco_talk_db;" 2>/dev/null; then echo "✅ Exists"; else echo "⚠️  Not created"; fi)"
echo ""
