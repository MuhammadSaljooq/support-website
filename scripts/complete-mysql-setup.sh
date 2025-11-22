#!/bin/bash

# Complete MySQL Setup for Website
# This script completes the MySQL connection setup

echo "🚀 Complete MySQL Setup for Website"
echo "===================================="
echo ""

# Step 1: Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local file..."
    touch .env.local
fi

# Step 2: Get MySQL connection details
echo "Enter MySQL connection details:"
echo ""
read -p "MySQL username [root]: " MYSQL_USER
MYSQL_USER=${MYSQL_USER:-root}

read -sp "MySQL password (press Enter if none): " MYSQL_PASSWORD
echo ""

read -p "MySQL host [localhost]: " MYSQL_HOST
MYSQL_HOST=${MYSQL_HOST:-localhost}

read -p "MySQL port [3306]: " MYSQL_PORT
MYSQL_PORT=${MYSQL_PORT:-3306}

read -p "Database name [vocco_talk_db]: " DB_NAME
DB_NAME=${DB_NAME:-vocco_talk_db}

# Build DATABASE_URL
if [ -z "$MYSQL_PASSWORD" ]; then
    DATABASE_URL="mysql://${MYSQL_USER}@${MYSQL_HOST}:${MYSQL_PORT}/${DB_NAME}"
else
    DATABASE_URL="mysql://${MYSQL_USER}:${MYSQL_PASSWORD}@${MYSQL_HOST}:${MYSQL_PORT}/${DB_NAME}"
fi

# Step 3: Update .env.local
echo ""
echo "📝 Updating .env.local..."

# Remove old DATABASE_URL if exists
if grep -q "^DATABASE_URL=" .env.local; then
    sed -i.bak '/^DATABASE_URL=/d' .env.local
    echo "✅ Removed old DATABASE_URL"
fi

# Add new DATABASE_URL
echo "" >> .env.local
echo "# MySQL Database Connection" >> .env.local
echo "DATABASE_URL=\"$DATABASE_URL\"" >> .env.local
echo "✅ Added DATABASE_URL to .env.local"

# Step 4: Create database
echo ""
echo "📦 Creating database..."
if [ -z "$MYSQL_PASSWORD" ]; then
    mysql -u "$MYSQL_USER" -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
    DB_CREATED=$?
else
    mysql -u "$MYSQL_USER" -p"$MYSQL_PASSWORD" -e "CREATE DATABASE IF NOT EXISTS ${DB_NAME} CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null
    DB_CREATED=$?
fi

if [ $DB_CREATED -eq 0 ]; then
    echo "✅ Database '${DB_NAME}' created or already exists"
else
    echo "⚠️  Could not create database. You may need to create it manually:"
    echo "   mysql -u $MYSQL_USER -p -e \"CREATE DATABASE IF NOT EXISTS ${DB_NAME};\""
fi

# Step 5: Generate Prisma Client
echo ""
echo "🔧 Generating Prisma client..."
npm run db:generate

# Step 6: Push schema to database
echo ""
echo "📤 Pushing Prisma schema to database..."
echo "This will create all tables..."
read -p "Continue? (y/n): " continue_setup

if [[ "$continue_setup" =~ ^[Yy]$ ]]; then
    npx prisma db push --accept-data-loss
    echo ""
    echo "✅ Database schema pushed!"
else
    echo "⏭️  Skipped. Run manually: npx prisma db push"
fi

echo ""
echo "✅ Setup Complete!"
echo ""
echo "📋 Next steps:"
echo "1. Test the connection: npm run db:check"
echo "2. Start your dev server: npm run dev"
echo "3. Test signup/login at http://localhost:3000/signup"
echo ""
echo "🔍 View database:"
echo "   mysql -u $MYSQL_USER -p -e \"USE ${DB_NAME}; SHOW TABLES;\""


