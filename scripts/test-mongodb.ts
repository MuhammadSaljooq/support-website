import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testMongoDB() {
  try {
    console.log("🔍 Testing MongoDB connection...\n");

    // Check DATABASE_URL
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      console.error("❌ DATABASE_URL is not set in your environment variables.");
      console.error("Please set DATABASE_URL in your .env.local file.");
      process.exit(1);
    }

    // Validate connection string format
    if (!databaseUrl.startsWith("mongodb://") && !databaseUrl.startsWith("mongodb+srv://")) {
      console.error("❌ DATABASE_URL must start with 'mongodb://' or 'mongodb+srv://'");
      console.error(`Current format: ${databaseUrl.substring(0, 20)}...`);
      process.exit(1);
    }

    const maskedUrl = databaseUrl.replace(/:[^:@]+@/, ":****@");
    console.log(`📋 Connection string: ${maskedUrl.substring(0, 50)}...\n`);

    // Test 1: Basic connection
    console.log("1. Testing basic connection...");
    await prisma.$connect();
    console.log("✅ Connected to MongoDB successfully!\n");

    // Test 2: Check if we can query the database
    console.log("2. Testing database query...");
    const userCount = await prisma.user.count();
    console.log(`✅ Database query successful! Found ${userCount} users.\n`);

    // Test 3: Test LoginLog model
    console.log("3. Testing LoginLog model...");
    const loginLogCount = await prisma.loginLog.count();
    console.log(`✅ LoginLog model accessible! Found ${loginLogCount} login logs.\n`);

    // Test 4: Create a test login log entry
    console.log("4. Testing login log creation...");
    // Generate a valid MongoDB ObjectId for userId (24 hex characters)
    const { randomBytes } = require("crypto");
    const testUserId = randomBytes(12).toString("hex");
    const testLog = await prisma.loginLog.create({
      data: {
        userId: testUserId,
        username: "test@example.com",
        loginTime: new Date(),
        loginDate: new Date(),
        loginStatus: "SUCCESS",
        ipAddress: "127.0.0.1",
        userAgent: "Test Script",
      },
    });
    console.log(`✅ Login log created successfully! ID: ${testLog.id}\n`);

    // Test 5: Query the test log
    console.log("5. Testing login log retrieval...");
    const retrievedLog = await prisma.loginLog.findUnique({
      where: { id: testLog.id },
    });
    if (retrievedLog) {
      console.log("✅ Login log retrieved successfully!");
      console.log(`   - Username: ${retrievedLog.username}`);
      console.log(`   - Status: ${retrievedLog.loginStatus}`);
      console.log(`   - IP: ${retrievedLog.ipAddress}`);
      console.log(`   - User Agent: ${retrievedLog.userAgent}\n`);
    }

    // Clean up test log
    console.log("6. Cleaning up test data...");
    await prisma.loginLog.delete({
      where: { id: testLog.id },
    });
    console.log("✅ Test data cleaned up!\n");

    console.log("🎉 All MongoDB tests passed! Your database is working correctly.");
  } catch (error) {
    console.error("❌ MongoDB test failed:");
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testMongoDB();

