import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-session";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const status = searchParams.get("status");
    const endpoint = searchParams.get("endpoint");
    const agentId = searchParams.get("agentId"); // Filter by Vapi agent
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {
      userId: user.id,
    };

    // Filter by agent if specified
    if (agentId && agentId !== "all") {
      where.vapiAgentId = agentId;
    }

    if (startDate || endDate) {
      where.timestamp = {};
      if (startDate) {
        where.timestamp.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.timestamp.lte = end;
      }
    }

    // Get total count for pagination
    const total = await db.usage.count({ where });

    // Fetch usage data with agent information
    const usageData = await db.usage.findMany({
      where,
      orderBy: { timestamp: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        timestamp: true,
        apiCalls: true,
        tokensUsed: true,
        cost: true,
        vapiAgentId: true,
        vapiAgent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      data: usageData.map((item) => ({
        id: item.id,
        timestamp: item.timestamp.toISOString(),
        apiCalls: item.apiCalls,
        tokensUsed: item.tokensUsed,
        cost: Number(item.cost),
        agentId: item.vapiAgentId,
        agentName: item.vapiAgent?.name || null,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching detailed usage:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

