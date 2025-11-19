// Test script to check registration endpoint
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function testDatabase() {
  try {
    console.log("Testing database connection...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "NOT SET");
    
    await prisma.$connect();
    console.log("✅ Connected to database");
    
    // Try to query User table
    const userCount = await prisma.user.count();
    console.log(`✅ User table exists. Count: ${userCount}`);
    
    // Try to create a test user (will fail if table doesn't exist)
    console.log("\nTesting user creation...");
    const testUser = await prisma.user.create({
      data: {
        name: "Test User",
        email: `test-${Date.now()}@example.com`,
        password: "hashed_password_here",
      },
    });
    console.log("✅ User creation works!");
    
    // Clean up
    await prisma.user.delete({
      where: { id: testUser.id },
    });
    console.log("✅ Test user deleted");
    
    await prisma.$disconnect();
    console.log("\n✅ All tests passed!");
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    
    if (error.code === "P1001") {
      console.error("\n💡 Solution: Check your DATABASE_URL and ensure PostgreSQL is running");
    } else if (error.code === "P2021" || error.code === "P2003") {
      console.error("\n💡 Solution: Run 'npx prisma migrate dev' to create the database tables");
    }
    
    await prisma.$disconnect();
    process.exit(1);
  }
}

testDatabase();

