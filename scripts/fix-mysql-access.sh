#!/bin/bash

# Fix MySQL Access Denied Error
# This script helps you reset MySQL root password or create a new user

echo "🔧 Fixing MySQL Access Denied Error"
echo "===================================="
echo ""

echo "You have two options:"
echo ""
echo "Option 1: Reset MySQL root password (Recommended)"
echo "Option 2: Create a new MySQL user"
echo ""
read -p "Choose option (1 or 2): " option

if [ "$option" = "1" ]; then
    echo ""
    echo "📝 Resetting MySQL Root Password"
    echo ""
    echo "Step 1: Stop MySQL service"
    echo "Press Enter when ready..."
    read
    
    # Stop MySQL
    if command -v brew &> /dev/null; then
        echo "Stopping MySQL via Homebrew..."
        brew services stop mysql
    else
        echo "Please stop MySQL manually, then press Enter..."
        read
    fi
    
    echo ""
    echo "Step 2: Start MySQL in safe mode"
    echo "This allows connection without password..."
    echo ""
    echo "Run this command in a NEW terminal window:"
    echo "  sudo mysqld_safe --skip-grant-tables --skip-networking &"
    echo ""
    echo "Press Enter after you've started MySQL in safe mode..."
    read
    
    echo ""
    echo "Step 3: Connect and reset password"
    echo "Connecting to MySQL..."
    
    mysql -u root << EOF
USE mysql;
ALTER USER 'root'@'localhost' IDENTIFIED BY 'newpassword123';
FLUSH PRIVILEGES;
EXIT;
EOF
    
    if [ $? -eq 0 ]; then
        echo "✅ Password reset successful!"
        echo ""
        echo "Step 4: Restart MySQL normally"
        echo "Kill the safe mode process, then:"
        echo "  brew services start mysql"
        echo ""
        echo "Now you can connect with:"
        echo "  mysql -u root -p"
        echo "  (Password: newpassword123)"
        echo ""
        echo "⚠️  IMPORTANT: Change this password to something secure!"
    else
        echo "❌ Password reset failed. Please try manually."
    fi

elif [ "$option" = "2" ]; then
    echo ""
    echo "📝 Creating New MySQL User"
    echo ""
    echo "We'll create a new user that you can use instead of root."
    echo ""
    echo "First, we need to connect to MySQL somehow."
    echo "Do you have another way to connect? (y/n)"
    read -p "> " has_access
    
    if [ "$has_access" = "y" ]; then
        echo ""
        echo "Please connect to MySQL and run these commands:"
        echo ""
        echo "CREATE USER 'vocco_user'@'localhost' IDENTIFIED BY 'your_secure_password';"
        echo "GRANT ALL PRIVILEGES ON vocco_talk_db.* TO 'vocco_user'@'localhost';"
        echo "FLUSH PRIVILEGES;"
        echo ""
        echo "Then update your .env.local:"
        echo "DATABASE_URL=\"mysql://vocco_user:your_secure_password@localhost:3306/vocco_talk_db\""
    else
        echo ""
        echo "You'll need to reset the root password first (Option 1),"
        echo "or contact your system administrator."
    fi
else
    echo "Invalid option"
fi


