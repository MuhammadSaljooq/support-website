import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Get DATABASE_URL - Next.js automatically loads .env.local
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  const errorMsg = `DATABASE_URL is not set. Please ensure:
1. .env.local file exists with DATABASE_URL="postgresql://shireenafzal@localhost:5432/support_website?schema=public"
2. Restart your dev server after changing environment variables
3. Check that the file is in the project root directory`;
  
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// Validate it's not the placeholder
if (databaseUrl.includes("dbname") || databaseUrl.includes("user:password@localhost:5432/dbname")) {
  const errorMsg = `DATABASE_URL appears to be a placeholder. Please update .env.local with your actual database URL:
DATABASE_URL="postgresql://shireenafzal@localhost:5432/support_website?schema=public"
Then restart your dev server.`;
  
  console.error(errorMsg);
  throw new Error(errorMsg);
}

// Log in development to help debug (masked)
if (process.env.NODE_ENV === "development") {
  const masked = databaseUrl.replace(/:[^:@]+@/, ":****@");
  console.log("✅ Database URL configured:", masked);
}

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

// Verify VapiAgent is available (for debugging)
if (process.env.NODE_ENV === "development" && !db.vapiAgent) {
  console.warn("⚠️  VapiAgent model not found in Prisma Client. Run: npx prisma generate");
}

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

