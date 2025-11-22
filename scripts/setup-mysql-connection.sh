#!/bin/bash

# Setup MySQL Connection for Website
# This script helps configure MySQL for login/signup

echo "🔧 Setting up MySQL connection for website..."
echo ""

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local not found. Creating it..."
    touch .env.local
fi

# Prompt for MySQL password
echo "Enter MySQL root password (press Enter if no password):"
read -s MYSQL_PASSWORD

if [ -z "$MYSQL_PASSWORD" ]; then
    DATABASE_URL='mysql://root@localhost:3306/vocco_talk_db'
else
    DATABASE_URL="mysql://root:${MYSQL_PASSWORD}@localhost:3306/vocco_talk_db"
fi

# Check if DATABASE_URL already exists in .env.local
if grep -q "DATABASE_URL" .env.local; then
    echo "⚠️  DATABASE_URL already exists in .env.local"
    echo "Current value:"
    grep "DATABASE_URL" .env.local
    echo ""
    read -p "Do you want to update it? (y/n): " update
    if [[ "$update" =~ ^[Yy]$ ]]; then
        # Remove old DATABASE_URL
        sed -i.bak '/^DATABASE_URL=/d' .env.local
        # Add new one
        echo "DATABASE_URL=\"$DATABASE_URL\"" >> .env.local
        echo "✅ Updated DATABASE_URL in .env.local"
    fi
else
    # Add DATABASE_URL to .env.local
    echo "" >> .env.local
    echo "# MySQL Database Connection" >> .env.local
    echo "DATABASE_URL=\"$DATABASE_URL\"" >> .env.local
    echo "✅ Added DATABASE_URL to .env.local"
fi

echo ""
echo "📦 Creating database if it doesn't exist..."
if [ -z "$MYSQL_PASSWORD" ]; then
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS vocco_talk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
else
    mysql -u root -p"$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS vocco_talk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Run Prisma migrations:"
echo "   npm run db:migrate"
echo ""
echo "2. Generate Prisma client:"
echo "   npm run db:generate"
echo ""
echo "3. Test the connection:"
echo "   npm run db:check"


