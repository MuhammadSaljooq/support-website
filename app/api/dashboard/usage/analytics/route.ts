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
    const agentId = searchParams.get("agentId"); // Filter by Vapi agent

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

    // Get usage data grouped by date
    const usageData = await db.usage.findMany({
      where,
      orderBy: { timestamp: "asc" },
      include: {
        vapiAgent: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    // Group by date
    const dailyData: Record<
      string,
      { date: string; apiCalls: number; tokensUsed: number; cost: number }
    > = {};

    usageData.forEach((usage) => {
      const date = new Date(usage.timestamp).toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, apiCalls: 0, tokensUsed: 0, cost: 0 };
      }
      dailyData[date].apiCalls += usage.apiCalls;
      dailyData[date].tokensUsed += usage.tokensUsed;
      dailyData[date].cost += Number(usage.cost);
    });

    // Convert to array and sort
    const result = Object.values(dailyData).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate totals
    const totals = result.reduce(
      (acc, day) => ({
        apiCalls: acc.apiCalls + day.apiCalls,
        tokensUsed: acc.tokensUsed + day.tokensUsed,
        cost: acc.cost + day.cost,
      }),
      { apiCalls: 0, tokensUsed: 0, cost: 0 }
    );

    return NextResponse.json({
      dailyData: result,
      totals,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

