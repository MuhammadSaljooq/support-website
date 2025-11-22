import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-session";
import { db } from "@/lib/db";
import { z } from "zod";

const usageQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  limit: z.string().optional().transform((val) => (val ? parseInt(val) : 50)),
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
      limit: searchParams.get("limit") || undefined,
      offset: searchParams.get("offset") || undefined,
    };

    const validatedParams = usageQuerySchema.parse(queryParams);

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    if (validatedParams.startDate || validatedParams.endDate) {
      where.timestamp = {};
      if (validatedParams.startDate) {
        const startDate = new Date(validatedParams.startDate);
        startDate.setHours(0, 0, 0, 0);
        where.timestamp.gte = startDate;
      }
      if (validatedParams.endDate) {
        const endDate = new Date(validatedParams.endDate);
        endDate.setHours(23, 59, 59, 999);
        where.timestamp.lte = endDate;
      }
    }

    // Validate limit and offset
    const limit = Math.min(Math.max(validatedParams.limit || 50, 1), 100);
    const offset = Math.max(validatedParams.offset || 0, 0);

    // Get total count
    const total = await db.usage.count({ where });

    // Fetch usage data
    const usageData = await db.usage.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
      skip: offset,
      select: {
        id: true,
        timestamp: true,
        apiCalls: true,
        tokensUsed: true,
        cost: true,
      },
    });

    return NextResponse.json({
      data: usageData.map((item) => ({
        id: item.id,
        timestamp: item.timestamp.toISOString(),
        apiCalls: item.apiCalls,
        tokensUsed: item.tokensUsed,
        cost: Number(item.cost),
      })),
      pagination: {
        limit,
        offset,
        total,
        hasMore: offset + limit < total,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid query parameters", details: error.issues },
        { status: 400 }
      );
    }

    console.error("Error fetching usage data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

