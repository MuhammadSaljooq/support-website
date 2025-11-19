// Verify environment variables are loaded correctly
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local first (Next.js priority)
config({ path: resolve(process.cwd(), ".env.local") });
// Then load .env (fallback)
config({ path: resolve(process.cwd(), ".env") });

console.log("Environment Variables Check:");
console.log("============================");
console.log("DATABASE_URL:", process.env.DATABASE_URL ? "✅ Set" : "❌ NOT SET");
if (process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL;
  // Mask password if present
  const masked = url.replace(/:([^:@]+)@/, ":****@");
  console.log("  Value:", masked);
  
  // Check if it's the placeholder
  if (url.includes("dbname") || url.includes("user:password")) {
    console.log("  ⚠️  WARNING: This looks like a placeholder value!");
  } else {
    console.log("  ✅ Looks like a real connection string");
  }
} else {
  console.log("\n❌ DATABASE_URL is not set!");
  console.log("Please check your .env.local file.");
  process.exit(1);
}

console.log("\nNEXTAUTH_SECRET:", process.env.NEXTAUTH_SECRET ? "✅ Set" : "⚠️  Not set (optional for testing)");
console.log("\n✅ Environment check complete!");

