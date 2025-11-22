-- Manual SQL Script to Create New MySQL User and Database
-- Run this with: mysql -u root -p < scripts/create-mysql-user-manual.sql
-- Or copy and paste into MySQL: mysql -u root -p

-- Configuration (change these)
SET @db_name = 'vocco_talk_db';
SET @db_user = 'vocco_user';
SET @db_password = 'your_secure_password_here';

-- Create database
CREATE DATABASE IF NOT EXISTS `vocco_talk_db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Create user
CREATE USER IF NOT EXISTS 'vocco_user'@'localhost' IDENTIFIED BY 'your_secure_password_here';

-- Grant privileges
GRANT ALL PRIVILEGES ON `vocco_talk_db`.* TO 'vocco_user'@'localhost';

-- Apply changes
FLUSH PRIVILEGES;

-- Verify
SELECT 'User and database created successfully!' as status;
SHOW DATABASES LIKE 'vocco_talk_db';
SELECT user, host FROM mysql.user WHERE user = 'vocco_user';


