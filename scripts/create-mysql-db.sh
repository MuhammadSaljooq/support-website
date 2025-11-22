#!/bin/bash

# MySQL Database Setup Script
# This script creates the database and tables for user authentication and login tracking

echo "🚀 Setting up MySQL database for vocco talk..."
echo ""

# Check if MySQL is installed
if ! command -v mysql &> /dev/null; then
    echo "❌ MySQL is not installed or not in PATH"
    echo "Please install MySQL first:"
    echo "  macOS: brew install mysql"
    echo "  Ubuntu: sudo apt-get install mysql-server"
    exit 1
fi

# Prompt for MySQL root password
read -sp "Enter MySQL root password: " MYSQL_PASSWORD
echo ""

# Database name
DB_NAME="vocco_talk_db"

# Create database and tables
echo "📦 Creating database and tables..."
mysql -u root -p"$MYSQL_PASSWORD" < "$(dirname "$0")/setup-mysql-db.sql"

if [ $? -eq 0 ]; then
    echo "✅ Database created successfully!"
    echo ""
    echo "Database: $DB_NAME"
    echo "Tables created:"
    echo "  - users (username, email, password, role, etc.)"
    echo "  - login_logs (login time, date, IP, status)"
    echo "  - user_sessions (active session tracking)"
    echo ""
    echo "📝 Next steps:"
    echo "1. Update your .env.local with MySQL connection string:"
    echo "   DATABASE_URL=\"mysql://root:YOUR_PASSWORD@localhost:3306/vocco_talk_db\""
    echo ""
    echo "2. Test connection:"
    echo "   mysql -u root -p -e 'USE vocco_talk_db; SHOW TABLES;'"
else
    echo "❌ Failed to create database. Please check your MySQL credentials."
    exit 1
fi


