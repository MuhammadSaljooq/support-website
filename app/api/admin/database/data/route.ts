import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    await getAdminUser();

    const { searchParams } = new URL(request.url);
    const tableName = searchParams.get("table");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const search = searchParams.get("search") || "";

    if (!tableName) {
      return NextResponse.json({ error: "Table name is required" }, { status: 400 });
    }

    const skip = (page - 1) * limit;

    // Map table names to Prisma models
    let data: any[] = [];
    let total = 0;
    let columns: string[] = [];

    switch (tableName) {
      case "User":
        const userWhere: any = {};
        if (search) {
          userWhere.OR = [
            { email: { contains: search, mode: "insensitive" } },
            { name: { contains: search, mode: "insensitive" } },
          ];
        }
        total = await db.user.count({ where: userWhere });
        data = await db.user.findMany({
          where: userWhere,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        });
        columns = ["id", "name", "email", "role", "createdAt", "updatedAt"];
        break;

      case "VapiAgent":
        const agentWhere: any = {};
        if (search) {
          agentWhere.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { agentId: { contains: search, mode: "insensitive" } },
          ];
        }
        total = await db.vapiAgent.count({ where: agentWhere });
        data = await db.vapiAgent.findMany({
          where: agentWhere,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
          select: {
            id: true,
            name: true,
            agentId: true,
            userId: true,
            isActive: true,
            createdAt: true,
            updatedAt: true,
            lastSyncedAt: true,
          },
        });
        columns = ["id", "name", "agentId", "userId", "isActive", "createdAt", "updatedAt", "lastSyncedAt"];
        break;

      case "Usage":
        const usageWhere: any = {};
        if (search) {
          usageWhere.OR = [
            { userId: { contains: search, mode: "insensitive" } },
            { vapiAgentId: { contains: search, mode: "insensitive" } },
          ];
        }
        total = await db.usage.count({ where: usageWhere });
        data = await db.usage.findMany({
          where: usageWhere,
          skip,
          take: limit,
          orderBy: { timestamp: "desc" },
        });
        columns = ["id", "userId", "vapiAgentId", "apiKeyId", "apiCalls", "tokensUsed", "cost", "timestamp"];
        break;

      case "ApiKey":
        const keyWhere: any = {};
        if (search) {
          keyWhere.OR = [
            { name: { contains: search, mode: "insensitive" } },
            { keyPrefix: { contains: search, mode: "insensitive" } },
          ];
        }
        total = await db.apiKey.count({ where: keyWhere });
        data = await db.apiKey.findMany({
          where: keyWhere,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        });
        columns = ["id", "name", "keyPrefix", "userId", "isActive", "lastUsed", "createdAt", "updatedAt"];
        break;

      case "Transaction":
        const transactionWhere: any = {};
        if (search) {
          transactionWhere.userId = { contains: search, mode: "insensitive" };
        }
        total = await db.transaction.count({ where: transactionWhere });
        data = await db.transaction.findMany({
          where: transactionWhere,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        });
        columns = ["id", "userId", "amount", "type", "status", "createdAt"];
        break;

      case "Subscription":
        const subscriptionWhere: any = {};
        if (search) {
          subscriptionWhere.userId = { contains: search, mode: "insensitive" };
        }
        total = await db.subscription.count({ where: subscriptionWhere });
        data = await db.subscription.findMany({
          where: subscriptionWhere,
          skip,
          take: limit,
          orderBy: { createdAt: "desc" },
        });
        columns = ["id", "userId", "plan", "credits", "createdAt"];
        break;

      case "Account":
        total = await db.account.count();
        data = await db.account.findMany({
          skip,
          take: limit,
          orderBy: { id: "desc" },
          select: {
            id: true,
            userId: true,
            type: true,
            provider: true,
            providerAccountId: true,
          },
        });
        columns = ["id", "userId", "type", "provider", "providerAccountId"];
        break;

      case "Session":
        total = await db.session.count();
        data = await db.session.findMany({
          skip,
          take: limit,
          orderBy: { expires: "desc" },
          select: {
            id: true,
            userId: true,
            sessionToken: true,
            expires: true,
          },
        });
        columns = ["id", "userId", "sessionToken", "expires"];
        break;

      default:
        return NextResponse.json({ error: "Invalid table name" }, { status: 400 });
    }

    // Format data for display
    const rows = data.map((row) => {
      const formattedRow: any = {};
      columns.forEach((col) => {
        const value = (row as any)[col];
        if (value instanceof Date) {
          formattedRow[col] = value.toISOString();
        } else if (typeof value === "bigint") {
          formattedRow[col] = value.toString();
        } else {
          formattedRow[col] = value;
        }
      });
      return formattedRow;
    });

    return NextResponse.json({
      columns,
      rows,
      total,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    console.error("Error fetching table data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

