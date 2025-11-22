#!/bin/bash

# Start MySQL Server
# Fixes: ERROR 2002 (HY000): Can't connect to local MySQL server

echo "🚀 Starting MySQL Server..."
echo ""

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL not found. Install with: brew install mysql"
    exit 1
fi

# Method 1: Try Homebrew services (macOS)
if command -v brew &> /dev/null; then
    echo "Starting MySQL via Homebrew..."
    brew services start mysql
    
    # Wait a bit
    sleep 3
    
    # Check if it's running
    if brew services list | grep mysql | grep -q "started"; then
        echo "✅ MySQL started via Homebrew!"
        echo ""
        echo "Test connection:"
        echo "  mysql -u root"
        exit 0
    fi
fi

# Method 2: Try mysqld_safe
echo "Trying mysqld_safe..."
if command -v mysqld_safe &> /dev/null; then
    mysqld_safe --user=mysql > /dev/null 2>&1 &
    sleep 3
    if ps aux | grep mysqld | grep -v grep > /dev/null; then
        echo "✅ MySQL started via mysqld_safe!"
        exit 0
    fi
fi

# Method 3: Try systemctl (Linux)
if command -v systemctl &> /dev/null; then
    echo "Trying systemctl..."
    sudo systemctl start mysql
    sleep 2
    if sudo systemctl is-active --quiet mysql; then
        echo "✅ MySQL started via systemctl!"
        exit 0
    fi
fi

echo "⚠️  Could not start MySQL automatically"
echo ""
echo "Try manually:"
echo "  macOS: brew services start mysql"
echo "  Linux: sudo systemctl start mysql"
echo "  Or: sudo /usr/local/mysql/support-files/mysql.server start"


