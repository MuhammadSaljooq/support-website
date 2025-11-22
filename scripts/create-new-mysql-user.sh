#!/bin/bash

# Create New MySQL User and Database
# This script creates a fresh MySQL user and database for your website

echo "🚀 Creating New MySQL User and Database"
echo "========================================"
echo ""

# Get user input
read -p "Enter new MySQL username [vocco_user]: " MYSQL_USER
MYSQL_USER=${MYSQL_USER:-vocco_user}

read -sp "Enter password for $MYSQL_USER: " MYSQL_PASSWORD
echo ""

read -sp "Confirm password: " MYSQL_PASSWORD_CONFIRM
echo ""

if [ "$MYSQL_PASSWORD" != "$MYSQL_PASSWORD_CONFIRM" ]; then
    echo "❌ Passwords don't match!"
    exit 1
fi

read -p "Database name [vocco_talk_db]: " DB_NAME
DB_NAME=${DB_NAME:-vocco_talk_db}

echo ""
echo "📋 Summary:"
echo "  Username: $MYSQL_USER"
echo "  Database: $DB_NAME"
echo ""
read -p "Continue? (y/n): " confirm

if [ "$confirm" != "y" ]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🔧 Setting up MySQL..."

# Try to connect - we'll need root access or existing access
echo "Attempting to connect to MySQL..."
echo "If prompted, enter your MySQL root password (or current password)"

# Create SQL commands
SQL_COMMANDS=$(cat <<EOF
-- Create database
CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER IF NOT EXISTS '${MYSQL_USER}'@'localhost' IDENTIFIED BY '${MYSQL_PASSWORD}';

-- Grant privileges
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${MYSQL_USER}'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Show success
SELECT 'User and database created successfully!' as status;
SHOW DATABASES LIKE '${DB_NAME}';
SELECT user, host FROM mysql.user WHERE user = '${MYSQL_USER}';
EOF
)

# Try different connection methods
echo ""
echo "Trying to connect to MySQL..."

# Method 1: Try root without password
if mysql -u root <<< "$SQL_COMMANDS" 2>/dev/null; then
    echo "✅ Successfully created user and database!"
    CONNECTION_SUCCESS=true
# Method 2: Try root with password prompt
elif mysql -u root -p <<< "$SQL_COMMANDS" 2>/dev/null; then
    echo "✅ Successfully created user and database!"
    CONNECTION_SUCCESS=true
else
    echo "⚠️  Could not connect automatically"
    echo ""
    echo "Please run these SQL commands manually:"
    echo ""
    echo "1. Connect to MySQL:"
    echo "   mysql -u root -p"
    echo ""
    echo "2. Run these commands:"
    echo "$SQL_COMMANDS"
    CONNECTION_SUCCESS=false
fi

if [ "$CONNECTION_SUCCESS" = true ]; then
    echo ""
    echo "✅ Setup Complete!"
    echo ""
    echo "📝 Update your .env.local file with:"
    echo "DATABASE_URL=\"mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@localhost:3306/${DB_NAME}\""
    echo ""
    
    # Ask if they want to update .env.local automatically
    read -p "Update .env.local automatically? (y/n): " update_env
    
    if [ "$update_env" = "y" ]; then
        # Remove old DATABASE_URL if exists
        if [ -f ".env.local" ]; then
            sed -i.bak '/^DATABASE_URL=/d' .env.local
        else
            touch .env.local
        fi
        
        # Add new DATABASE_URL
        echo "" >> .env.local
        echo "# MySQL Database Connection" >> .env.local
        echo "DATABASE_URL=\"mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@localhost:3306/${DB_NAME}\"" >> .env.local
        
        echo "✅ Updated .env.local!"
    fi
    
    echo ""
    echo "🎉 Next Steps:"
    echo "1. Run: npm run db:generate"
    echo "2. Run: npx prisma db push"
    echo "3. Start your website: npm run dev"
fi


