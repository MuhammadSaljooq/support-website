// Test database connection with actual Prisma client
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["query", "error", "warn"],
});

async function testConnection() {
  try {
    console.log("Testing Prisma connection...");
    console.log("DATABASE_URL:", process.env.DATABASE_URL ? "Set" : "NOT SET");
    
    if (process.env.DATABASE_URL) {
      console.log("DATABASE_URL value:", process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@"));
    }
    
    await prisma.$connect();
    console.log("✅ Connected to database");
    
    // Try to query User table
    const userCount = await prisma.user.count();
    console.log(`✅ User table accessible. Count: ${userCount}`);
    
    // Try to find a user (should work even if empty)
    const users = await prisma.user.findMany({ take: 1 });
    console.log("✅ User query successful");
    
    await prisma.$disconnect();
    console.log("\n✅ All tests passed!");
    process.exit(0);
  } catch (error: any) {
    console.error("\n❌ Error:", error.message);
    if (error.code) {
      console.error("Error code:", error.code);
    }
    if (error.meta) {
      console.error("Error meta:", JSON.stringify(error.meta, null, 2));
    }
    
    await prisma.$disconnect();
    process.exit(1);
  }
}

testConnection();

