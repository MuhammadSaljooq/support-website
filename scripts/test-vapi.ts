// Test script to verify Vapi API integration
import { config } from "dotenv";
import { resolve } from "path";
import { fetchVapiMetrics, verifyVapiApiKey, getDefaultVapiApiKey } from "../lib/vapi";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function testVapi() {
  const apiKey = getDefaultVapiApiKey();
  
  if (!apiKey) {
    console.error("❌ VAPI_API_KEY not found in environment variables");
    console.log("Please add VAPI_API_KEY to your .env.local file");
    process.exit(1);
  }

  console.log("Testing Vapi API integration...");
  console.log("API Key:", apiKey.substring(0, 8) + "..." + apiKey.substring(apiKey.length - 4));

  try {
    // Test 1: Verify API key
    console.log("\n1. Verifying API key...");
    const isValid = await verifyVapiApiKey(apiKey);
    if (isValid) {
      console.log("✅ API key is valid!");
    } else {
      console.log("❌ API key is invalid");
      process.exit(1);
    }

    // Test 2: Fetch metrics
    console.log("\n2. Fetching metrics...");
    const metrics = await fetchVapiMetrics(apiKey);
    console.log("✅ Metrics fetched successfully!");
    console.log("\nMetrics:");
    console.log(`  - Minutes Used: ${metrics.minutesUsed}`);
    console.log(`  - Call Count: ${metrics.callCount}`);
    console.log(`  - Costs: $${metrics.costs.toFixed(2)}`);

    console.log("\n✅ All tests passed! Your Vapi integration is working.");
  } catch (error) {
    console.error("\n❌ Error:", error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

testVapi();

