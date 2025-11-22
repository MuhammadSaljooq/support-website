#!/bin/bash

# Start MySQL in Safe Mode (for password reset)
# This script properly starts MySQL in safe mode

echo "🔧 Starting MySQL in Safe Mode..."
echo ""

# Check if MySQL is already running
if pgrep -x mysqld > /dev/null; then
    echo "⚠️  MySQL is already running. Stopping it first..."
    brew services stop mysql 2>/dev/null || sudo killall mysqld 2>/dev/null
    sleep 2
fi

echo "Starting MySQL in safe mode (no password required)..."
echo "This will run in the background..."
echo ""

# Start MySQL in safe mode with output redirected
sudo mysqld_safe --skip-grant-tables --skip-networking > /dev/null 2>&1 &

# Wait for MySQL to start
echo "Waiting for MySQL to start..."
sleep 5

# Check if it's running
if pgrep -x mysqld > /dev/null; then
    echo "✅ MySQL safe mode started!"
    echo ""
    echo "Now you can connect without password:"
    echo "  mysql -u root"
    echo ""
    echo "Then run these commands to reset password:"
    echo "  USE mysql;"
    echo "  ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_new_password';"
    echo "  FLUSH PRIVILEGES;"
    echo "  EXIT;"
    echo ""
    echo "After resetting, stop safe mode:"
    echo "  sudo killall mysqld_safe"
    echo "  sudo killall mysqld"
    echo "  brew services start mysql"
else
    echo "❌ Failed to start MySQL in safe mode"
    echo "Check MySQL error logs for details"
fi


