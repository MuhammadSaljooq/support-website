import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-session";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's subscription
    const subscription = await db.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Get total usage statistics
    const totalUsage = await db.usage.aggregate({
      where: { userId: user.id },
      _sum: {
        apiCalls: true,
        tokensUsed: true,
        cost: true,
      },
      _count: {
        id: true,
      },
    });

    // Get this month's usage
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthUsage = await db.usage.aggregate({
      where: {
        userId: user.id,
        timestamp: {
          gte: startOfMonth,
        },
      },
      _sum: {
        apiCalls: true,
        tokensUsed: true,
        cost: true,
      },
    });

    // Get usage stats per agent
    const agents = await db.vapiAgent.findMany({
      where: { userId: user.id, isActive: true },
      select: {
        id: true,
        name: true,
      },
    });

    const agentStats = await Promise.all(
      agents.map(async (agent) => {
        const agentUsage = await db.usage.aggregate({
          where: {
            userId: user.id,
            vapiAgentId: agent.id,
          },
          _sum: {
            apiCalls: true,
            tokensUsed: true,
            cost: true,
          },
        });

        const thisMonthAgentUsage = await db.usage.aggregate({
          where: {
            userId: user.id,
            vapiAgentId: agent.id,
            timestamp: {
              gte: startOfMonth,
            },
          },
          _sum: {
            apiCalls: true,
            tokensUsed: true,
            cost: true,
          },
        });

        return {
          id: agent.id,
          name: agent.name,
          total: {
            apiCalls: agentUsage._sum.apiCalls || 0,
            tokensUsed: agentUsage._sum.tokensUsed || 0,
            cost: Number(agentUsage._sum.cost || 0),
          },
          thisMonth: {
            apiCalls: thisMonthAgentUsage._sum.apiCalls || 0,
            tokensUsed: thisMonthAgentUsage._sum.tokensUsed || 0,
            cost: Number(thisMonthAgentUsage._sum.cost || 0),
          },
        };
      })
    );

    // Get transaction balance
    const transactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        status: "COMPLETED",
      },
    });

    const balance = transactions.reduce((acc, t) => {
      if (t.type === "PURCHASE") {
        return acc + Number(t.amount);
      } else {
        return acc - Number(t.amount);
      }
    }, 0);

    // Get account creation date
    const userRecord = await db.user.findUnique({
      where: { id: user.id },
      select: { createdAt: true },
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: userRecord?.createdAt,
      },
      subscription: {
        plan: subscription?.plan || "FREE",
        credits: subscription?.credits || 0,
      },
      stats: {
        totalApiCalls: totalUsage._sum.apiCalls || 0,
        totalTokensUsed: totalUsage._sum.tokensUsed || 0,
        totalCost: Number(totalUsage._sum.cost || 0),
        totalUsageRecords: totalUsage._count.id || 0,
        thisMonthApiCalls: thisMonthUsage._sum.apiCalls || 0,
        thisMonthTokensUsed: thisMonthUsage._sum.tokensUsed || 0,
        thisMonthCost: Number(thisMonthUsage._sum.cost || 0),
        currentBalance: balance,
      },
      agents: agentStats,
    });
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

