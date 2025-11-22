#!/bin/bash

# Diagnose MySQL Permission Issues
# Checks various permission-related problems

echo "🔍 Diagnosing MySQL Permission Issues..."
echo "========================================"
echo ""

# Test 1: Check if we can connect with password
echo "1️⃣ Testing connection with password..."
read -sp "Enter MySQL root password: " MYSQL_PASSWORD
echo ""

if mysql -u root -p"${MYSQL_PASSWORD}" -e "SELECT 'Connection test' as status;" 2>/dev/null; then
    echo "✅ Password is correct! Connection works."
    MYSQL_CMD="mysql -u root -p${MYSQL_PASSWORD}"
    CAN_CONNECT=true
else
    ERROR_OUTPUT=$(mysql -u root -p"${MYSQL_PASSWORD}" -e "SELECT 1;" 2>&1)
    echo "❌ Connection failed"
    echo "Error: $ERROR_OUTPUT"
    echo ""
    
    # Check specific error types
    if echo "$ERROR_OUTPUT" | grep -q "Access denied"; then
        echo "🔍 This is an access denied error. Possible causes:"
        echo "   - Password is incorrect"
        echo "   - User account is locked"
        echo "   - Host restrictions"
        echo "   - User doesn't exist"
    fi
    
    CAN_CONNECT=false
    MYSQL_CMD="mysql -u root -p${MYSQL_PASSWORD}"
fi

if [ "$CAN_CONNECT" = true ]; then
    echo ""
    echo "2️⃣ Checking user permissions..."
    $MYSQL_CMD -e "SELECT user, host, account_locked, password_expired FROM mysql.user WHERE user='root';" 2>/dev/null
    
    echo ""
    echo "3️⃣ Checking socket file permissions..."
    if [ -S /tmp/mysql.sock ]; then
        ls -la /tmp/mysql.sock
        echo "✅ Socket file exists"
    else
        echo "⚠️  Socket file not found at /tmp/mysql.sock"
        echo "Checking alternative locations..."
        find /tmp -name "mysql.sock" 2>/dev/null
        find /var/run -name "mysql.sock" 2>/dev/null
    fi
    
    echo ""
    echo "4️⃣ Checking MySQL data directory permissions..."
    $MYSQL_CMD -e "SHOW VARIABLES LIKE 'datadir';" 2>/dev/null | tail -1 | awk '{print $2}' | xargs ls -ld 2>/dev/null || echo "Cannot check data directory"
    
    echo ""
    echo "5️⃣ Checking user privileges..."
    $MYSQL_CMD -e "SHOW GRANTS FOR 'root'@'localhost';" 2>/dev/null
    
    echo ""
    echo "6️⃣ Testing if we can create database..."
    if $MYSQL_CMD -e "CREATE DATABASE IF NOT EXISTS test_permissions_check;" 2>/dev/null; then
        echo "✅ Can create databases"
        $MYSQL_CMD -e "DROP DATABASE test_permissions_check;" 2>/dev/null
    else
        echo "❌ Cannot create databases - permission issue!"
        ERROR=$($MYSQL_CMD -e "CREATE DATABASE test_permissions_check;" 2>&1)
        echo "Error: $ERROR"
    fi
    
    echo ""
    echo "7️⃣ Checking if we can create users..."
    if $MYSQL_CMD -e "CREATE USER IF NOT EXISTS 'test_user_check'@'localhost';" 2>/dev/null; then
        echo "✅ Can create users"
        $MYSQL_CMD -e "DROP USER 'test_user_check'@'localhost';" 2>/dev/null
    else
        echo "❌ Cannot create users - permission issue!"
        ERROR=$($MYSQL_CMD -e "CREATE USER 'test_user_check'@'localhost';" 2>&1)
        echo "Error: $ERROR"
    fi
    
    echo ""
    echo "8️⃣ Checking MySQL version and status..."
    $MYSQL_CMD -e "SELECT VERSION() as version, @@hostname as hostname;" 2>/dev/null
    
    echo ""
    echo "================================"
    echo "✅ Diagnosis Complete!"
    echo ""
    echo "If you can connect but can't create users/databases,"
    echo "the root user might need GRANT privileges."
    echo ""
    echo "Try:"
    echo "  $MYSQL_CMD"
    echo "  GRANT ALL PRIVILEGES ON *.* TO 'root'@'localhost' WITH GRANT OPTION;"
    echo "  FLUSH PRIVILEGES;"
else
    echo ""
    echo "⚠️  Cannot proceed with diagnosis - connection failed"
    echo ""
    echo "Possible solutions:"
    echo "1. Reset MySQL root password (see reset-mysql-password-complete.sh)"
    echo "2. Check if MySQL is running: brew services list | grep mysql"
    echo "3. Check socket file: ls -la /tmp/mysql.sock"
    echo "4. Try connecting via TCP: mysql -u root -p -h 127.0.0.1"
fi


