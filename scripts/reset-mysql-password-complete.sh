#!/bin/bash

# Complete MySQL Password Reset Guide
# This script helps reset MySQL root password step by step

echo "🔧 MySQL Password Reset - Step by Step"
echo "======================================"
echo ""

echo "MySQL is running but requires a password."
echo "We'll reset it using safe mode."
echo ""

read -p "Press Enter to continue..." 

# Step 1: Stop MySQL
echo ""
echo "Step 1: Stopping MySQL..."
if command -v brew &> /dev/null; then
    brew services stop mysql
    sleep 2
    echo "✅ MySQL stopped"
else
    echo "Please stop MySQL manually, then press Enter..."
    read
fi

# Step 2: Start in safe mode
echo ""
echo "Step 2: Starting MySQL in safe mode..."
echo "This allows connection without password."
echo ""

# Kill any existing MySQL processes
sudo killall mysqld_safe 2>/dev/null
sudo killall mysqld 2>/dev/null
sleep 1

# Start in safe mode (background, no output)
echo "Starting safe mode (this may take a few seconds)..."
sudo mysqld_safe --skip-grant-tables --skip-networking > /dev/null 2>&1 &

# Wait for MySQL to start
echo "Waiting for MySQL to start..."
sleep 5

# Check if it's running
if pgrep -x mysqld > /dev/null; then
    echo "✅ MySQL safe mode started!"
    echo ""
    
    # Step 3: Reset password
    echo "Step 3: Resetting root password..."
    echo ""
    read -sp "Enter new password for root: " NEW_PASSWORD
    echo ""
    read -sp "Confirm password: " CONFIRM_PASSWORD
    echo ""
    
    if [ "$NEW_PASSWORD" != "$CONFIRM_PASSWORD" ]; then
        echo "❌ Passwords don't match!"
        sudo killall mysqld_safe mysqld 2>/dev/null
        exit 1
    fi
    
    # Reset password
    mysql -u root <<EOF
USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY '${NEW_PASSWORD}';
FLUSH PRIVILEGES;
EXIT;
EOF
    
    if [ $? -eq 0 ]; then
        echo "✅ Password reset successful!"
        
        # Step 4: Stop safe mode
        echo ""
        echo "Step 4: Stopping safe mode..."
        sudo killall mysqld_safe mysqld 2>/dev/null
        sleep 2
        
        # Step 5: Start MySQL normally
        echo "Step 5: Starting MySQL normally..."
        if command -v brew &> /dev/null; then
            brew services start mysql
            sleep 3
        else
            mysqld_safe > /dev/null 2>&1 &
            sleep 3
        fi
        
        echo "✅ MySQL restarted!"
        echo ""
        echo "Step 6: Testing connection..."
        if mysql -u root -p"${NEW_PASSWORD}" -e "SELECT 'Connection successful!' as status;" 2>/dev/null; then
            echo "✅ Connection test successful!"
            echo ""
            echo "🎉 Password reset complete!"
            echo ""
            echo "You can now connect with:"
            echo "  mysql -u root -p"
            echo "  (Password: ${NEW_PASSWORD})"
            echo ""
            echo "Now you can create a new user:"
            echo "  ./scripts/create-new-mysql-user.sh"
        else
            echo "⚠️  Connection test failed. Try manually:"
            echo "  mysql -u root -p"
        fi
    else
        echo "❌ Password reset failed"
        echo "MySQL safe mode is still running. Stop it with:"
        echo "  sudo killall mysqld_safe mysqld"
    fi
else
    echo "❌ Failed to start MySQL in safe mode"
    echo ""
    echo "Try manually:"
    echo "  1. sudo mysqld_safe --skip-grant-tables --skip-networking &"
    echo "  2. sleep 5"
    echo "  3. mysql -u root"
    echo "  4. Then run: ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword';"
fi


