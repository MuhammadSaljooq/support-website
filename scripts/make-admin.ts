// Script to make a user an admin
// Usage: npm run make-admin <email>

import { config } from "dotenv";
import { resolve } from "path";
import { db } from "../lib/db";

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") });
config({ path: resolve(process.cwd(), ".env") });

async function makeAdmin(email: string) {
  try {
    const user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      console.error(`❌ User with email ${email} not found`);
      process.exit(1);
    }

    if (user.role === "ADMIN") {
      console.log(`✅ User ${email} is already an admin`);
      await db.$disconnect();
      return;
    }

    await db.user.update({
      where: { email },
      data: { role: "ADMIN" },
    });

    console.log(`✅ Successfully made ${email} an admin`);
    await db.$disconnect();
  } catch (error) {
    console.error("❌ Error:", error instanceof Error ? error.message : error);
    await db.$disconnect();
    process.exit(1);
  }
}

const email = process.argv[2];

if (!email) {
  console.error("Usage: npm run make-admin <email>");
  process.exit(1);
}

makeAdmin(email);

