#!/bin/bash

# Check MySQL Users Script
# Helps identify available MySQL users

echo "🔍 Checking MySQL Users..."
echo ""

# Try to connect as root without password
echo "Attempting to connect as 'root' without password..."
if mysql -u root -e "SELECT 'Connected as root!' as status;" 2>/dev/null; then
    echo "✅ Successfully connected as 'root' (no password required)"
    echo ""
    echo "📋 All MySQL Users:"
    mysql -u root -e "SELECT user, host FROM mysql.user ORDER BY user, host;" 2>/dev/null
    echo ""
    echo "💡 You can set a password with:"
    echo "   mysql -u root -e \"ALTER USER 'root'@'localhost' IDENTIFIED BY 'your_password';\""
    exit 0
fi

# Try with password prompt
echo "⚠️  Root without password didn't work"
echo ""
echo "Please try these options:"
echo ""
echo "1. Try connecting manually:"
echo "   mysql -u root -p"
echo "   (Then enter your password when prompted)"
echo ""
echo "2. Check if MySQL is running:"
echo "   brew services list | grep mysql"
echo "   or"
echo "   sudo systemctl status mysql"
echo ""
echo "3. Try common usernames:"
echo "   mysql -u root"
echo "   mysql -u admin"
echo "   mysql -u mysql"
echo ""
echo "4. If you can't remember, you may need to reset the password."
echo "   See: scripts/recover-mysql-root.md"


