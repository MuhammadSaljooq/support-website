/**
 * Simple MySQL Connection Test
 * Tests MySQL connection and database status
 */

const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

async function testMySQL() {
  console.log('🔍 Testing MySQL Connection...\n');

  // Test 1: Check if MySQL is installed
  try {
    const { stdout } = await execPromise('mysql --version');
    console.log('✅ MySQL installed:', stdout.trim());
  } catch (error) {
    console.log('❌ MySQL not found. Install with: brew install mysql');
    return;
  }

  // Test 2: Try connection without password
  console.log('\n2️⃣ Testing connection...');
  try {
    await execPromise('mysql -u root -e "SELECT VERSION() as version;"');
    console.log('✅ Connected as root (no password)');
    await runTests('mysql -u root');
  } catch (error) {
    console.log('⚠️  Connection failed. MySQL may require a password.');
    console.log('\n💡 Try manually:');
    console.log('   mysql -u root -p');
    console.log('   Then enter your password when prompted');
    console.log('\nOr run: ./scripts/test-mysql-connection.sh');
  }
}

async function runTests(mysqlCmd) {
  console.log('\n3️⃣ Checking databases...');
  try {
    const { stdout } = await execPromise(`${mysqlCmd} -e "SHOW DATABASES;"`);
    console.log('Available databases:');
    console.log(stdout);
  } catch (error) {
    console.log('Error:', error.message);
  }

  console.log('\n4️⃣ Checking vocco_talk_db...');
  try {
    await execPromise(`${mysqlCmd} -e "USE vocco_talk_db;"`);
    console.log('✅ Database vocco_talk_db exists!');
    
    const { stdout: tables } = await execPromise(`${mysqlCmd} -e "USE vocco_talk_db; SHOW TABLES;"`);
    console.log('\n📋 Tables:');
    console.log(tables);
    
    const { stdout: count } = await execPromise(`${mysqlCmd} -e "USE vocco_talk_db; SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'vocco_talk_db';"`);
    console.log('\n📊 Table count:', count.trim());
    
  } catch (error) {
    console.log('⚠️  Database vocco_talk_db does not exist');
    console.log('\n💡 Create it with:');
    console.log(`   ${mysqlCmd} -e "CREATE DATABASE vocco_talk_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"`);
  }

  console.log('\n✅ Test complete!');
}

testMySQL().catch(console.error);


