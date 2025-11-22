/**
 * MySQL Connection Test Script
 * Tests connection to MySQL database and displays status
 */

import mysql from 'mysql2/promise';
import * as dotenv from 'dotenv';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env.local') });

const DATABASE_URL = process.env.DATABASE_URL || process.env.DATABASE_URL_MYSQL;

async function testConnection() {
  console.log('🔍 Testing MySQL Connection...\n');

  if (!DATABASE_URL) {
    console.log('❌ DATABASE_URL not found in environment variables');
    console.log('\nPlease add to .env.local:');
    console.log('DATABASE_URL="mysql://root:YOUR_PASSWORD@localhost:3306/vocco_talk_db"');
    process.exit(1);
  }

  // Parse MySQL connection string
  // Format: mysql://user:password@host:port/database
  const url = new URL(DATABASE_URL.replace('mysql://', 'http://'));
  const config = {
    host: url.hostname,
    port: parseInt(url.port) || 3306,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1), // Remove leading '/'
  };

  console.log('📋 Connection Details:');
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   User: ${config.user}`);
  console.log(`   Database: ${config.database || '(not specified)'}`);
  console.log('');

  let connection: mysql.Connection | null = null;

  try {
    // Test connection
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.user,
      password: config.password,
    });

    console.log('✅ Successfully connected to MySQL server!\n');

    // Get MySQL version
    const [versionRows] = await connection.execute('SELECT VERSION() as version');
    const version = (versionRows as any[])[0].version;
    console.log(`📊 MySQL Version: ${version}\n`);

    // List databases
    const [databases] = await connection.execute('SHOW DATABASES');
    console.log('📦 Available Databases:');
    (databases as any[]).forEach((db: any) => {
      const dbName = Object.values(db)[0];
      console.log(`   - ${dbName}`);
    });
    console.log('');

    // Check if vocco_talk_db exists
    const dbExists = (databases as any[]).some(
      (db: any) => Object.values(db)[0] === 'vocco_talk_db'
    );

    if (dbExists) {
      console.log('✅ Database "vocco_talk_db" exists!\n');

      // Connect to the database
      await connection.changeUser({ database: 'vocco_talk_db' });

      // Show tables
      const [tables] = await connection.execute('SHOW TABLES');
      console.log('📋 Tables in vocco_talk_db:');
      (tables as any[]).forEach((table: any) => {
        const tableName = Object.values(table)[0];
        console.log(`   - ${tableName}`);
      });
      console.log('');

      // Check users table
      const [usersCount] = await connection.execute('SELECT COUNT(*) as count FROM users');
      const userCount = (usersCount as any[])[0].count;
      console.log(`👥 Total Users: ${userCount}`);

      // Check login_logs table
      const [logsCount] = await connection.execute('SELECT COUNT(*) as count FROM login_logs');
      const logCount = (logsCount as any[])[0].count;
      console.log(`📝 Total Login Logs: ${logCount}`);

      // Show recent login logs
      if (logCount > 0) {
        console.log('\n📊 Recent Login Logs:');
        const [logs] = await connection.execute(
          'SELECT id, username, login_time, login_date, login_status FROM login_logs ORDER BY login_time DESC LIMIT 5'
        );
        console.table(logs);
      }

      // Show table structures
      console.log('\n📋 Users Table Structure:');
      const [usersStructure] = await connection.execute('DESCRIBE users');
      console.table(usersStructure);

    } else {
      console.log('⚠️  Database "vocco_talk_db" does not exist yet\n');
      console.log('To create it, run:');
      console.log('  mysql -u root -p < scripts/setup-mysql-db.sql');
      console.log('  or');
      console.log('  ./scripts/create-mysql-db.sh');
    }

    await connection.end();
    console.log('\n✅ Connection test completed successfully!');

  } catch (error: any) {
    console.error('\n❌ Connection failed!');
    console.error(`Error: ${error.message}\n`);

    if (error.code === 'ECONNREFUSED') {
      console.log('💡 MySQL server is not running. Start it with:');
      console.log('   macOS: brew services start mysql');
      console.log('   Ubuntu: sudo systemctl start mysql');
    } else if (error.code === 'ER_ACCESS_DENIED_ERROR') {
      console.log('💡 Access denied. Check your username and password.');
    } else if (error.code === 'ER_BAD_DB_ERROR') {
      console.log('💡 Database does not exist. Create it first.');
    }

    process.exit(1);
  }
}

testConnection();

