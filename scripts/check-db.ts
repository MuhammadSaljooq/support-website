// Quick database connection check script
import { db } from "../lib/db";

async function checkDatabase() {
  try {
    console.log("Checking database connection...");
    await db.$connect();
    console.log("✅ Database connected successfully!");
    
    // Try a simple query
    const userCount = await db.user.count();
    console.log(`✅ Database is accessible. User count: ${userCount}`);
    
    await db.$disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Database connection failed:");
    console.error(error);
    process.exit(1);
  }
}

checkDatabase();

