import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await getAdminUser();

    // Get all table names from Prisma schema
    const tables = [
      { name: "User", rowCount: await db.user.count() },
      { name: "VapiAgent", rowCount: await db.vapiAgent.count() },
      { name: "Usage", rowCount: await db.usage.count() },
      { name: "ApiKey", rowCount: await db.apiKey.count() },
      { name: "Transaction", rowCount: await db.transaction.count() },
      { name: "Subscription", rowCount: await db.subscription.count() },
      { name: "Account", rowCount: await db.account.count() },
      { name: "Session", rowCount: await db.session.count() },
    ];

    return NextResponse.json({
      tables: tables.map((table) => ({
        name: table.name,
        rowCount: table.rowCount,
        columns: getTableColumns(table.name),
      })),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    console.error("Error fetching tables:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

function getTableColumns(tableName: string): string[] {
  const columnMap: Record<string, string[]> = {
    User: ["id", "name", "email", "role", "createdAt", "updatedAt"],
    VapiAgent: ["id", "name", "agentId", "userId", "isActive", "createdAt", "updatedAt", "lastSyncedAt"],
    Usage: ["id", "userId", "vapiAgentId", "apiKeyId", "apiCalls", "tokensUsed", "cost", "timestamp"],
    ApiKey: ["id", "name", "keyPrefix", "userId", "isActive", "lastUsed", "createdAt", "updatedAt"],
    Transaction: ["id", "userId", "amount", "type", "status", "createdAt"],
    Subscription: ["id", "userId", "plan", "credits", "createdAt"],
    Account: ["id", "userId", "type", "provider", "providerAccountId"],
    Session: ["id", "userId", "sessionToken", "expires"],
  };

  return columnMap[tableName] || [];
}

