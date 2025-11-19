// Test script to verify VapiAgent model is available
import { config } from "dotenv";
import { resolve } from "path";
import { db } from "../lib/db";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function testVapiAgent() {
  try {
    console.log("Testing VapiAgent model availability...");
    
    // Check if vapiAgent exists
    if (!db.vapiAgent) {
      console.error("❌ db.vapiAgent is undefined!");
      console.log("Available models:", Object.keys(db).filter(key => !key.startsWith('$')));
      process.exit(1);
    }
    
    console.log("✅ db.vapiAgent is available");
    console.log("Available methods:", Object.keys(db.vapiAgent).filter(key => !key.startsWith('$')));
    
    // Try to count agents
    const count = await db.vapiAgent.count();
    console.log(`✅ Can query VapiAgent table. Current count: ${count}`);
    
    console.log("\n✅ All tests passed! VapiAgent model is working correctly.");
    await db.$disconnect();
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    await db.$disconnect();
    process.exit(1);
  }
}

testVapiAgent();

