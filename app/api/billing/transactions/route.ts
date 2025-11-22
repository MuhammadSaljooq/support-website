import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-session";
import { db } from "@/lib/db";
import { z } from "zod";

const transactionsQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  type: z.enum(["PURCHASE", "USAGE"]).optional(),
  status: z.enum(["PENDING", "COMPLETED", "FAILED", "REFUNDED"]).optional(),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 20)),
  offset: z.string().optional().transform((val) => (val ? parseInt(val) : 0)),
});

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse and validate query parameters
    const searchParams = request.nextUrl.searchParams;
    const queryParams = {
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      type: searchParams.get("type") || undefined,
      status: searchParams.get("status") || undefined,
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    };

    const validatedParams = transactionsQuerySchema.parse(queryParams);

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (validatedParams.type) {
      where.type = validatedParams.type;
    }

    if (validatedParams.status) {
      where.status = validatedParams.status;
    }

    if (validatedParams.startDate || validatedParams.endDate) {
      where.createdAt = {};
      if (validatedParams.startDate) {
        const startDate = new Date(validatedParams.startDate);
        startDate.setHours(0, 0, 0, 0);
        where.createdAt.gte = startDate;
      }
      if (validatedParams.endDate) {
        const endDate = new Date(validatedParams.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.createdAt.lte = endDate;
      }
    }

    // Validate limit and offset
    const limit = Math.min(Math.max(validatedParams.limit || 20, 1), 100);
    const offset = Math.max(validatedParams.offset || 0, 0);

    // Get total count
    const total = await db.transaction.count({ where });

    // Fetch transactions
    const transactions = await db.transaction.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        createdAt: true,
      },
    });

    // Calculate summary statistics
    const summary = await db.transaction.aggregate({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
      _sum: {
        amount: true,
      },
    });

    const totalSpent = transactions
      .filter((t) => t.status === "COMPLETED" && t.type === "PURCHASE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    const totalUsed = transactions
      .filter((t) => t.status === "COMPLETED" && t.type === "USAGE")
      .reduce((sum, t) => sum + Number(t.amount), 0);

    return NextResponse.json({
      data: transactions.map((transaction) => ({
        id: transaction.id,
        amount: Number(transaction.amount),
        type: transaction.type,
        status: transaction.status,
        createdAt: transaction.createdAt.toISOString(),
      })),
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
      summary: {
        totalSpent,
        totalUsed,
        balance: totalSpent - totalUsed,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error fetching transactions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

