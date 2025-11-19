import { NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";

export async function GET() {
  try {
    await getAdminUser();

    // Get total users
    const totalUsers = await db.user.count();
    const totalAdmins = await db.user.count({ where: { role: "ADMIN" } });
    const totalRegularUsers = await db.user.count({ where: { role: "USER" } });

    // Get total agents
    const totalAgents = await db.vapiAgent.count();
    const activeAgents = await db.vapiAgent.count({ where: { isActive: true } });

    // Get total usage stats
    const totalUsage = await db.usage.aggregate({
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

    // Get subscription stats
    const subscriptionStats = await db.subscription.groupBy({
      by: ["plan"],
      _count: {
        plan: true,
      },
    });

    // Get recent users (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentUsers = await db.user.count({
      where: {
        createdAt: {
          gte: sevenDaysAgo,
        },
      },
    });

    return NextResponse.json({
      users: {
        total: totalUsers,
        admins: totalAdmins,
        regular: totalRegularUsers,
        recent: recentUsers,
      },
      agents: {
        total: totalAgents,
        active: activeAgents,
        inactive: totalAgents - activeAgents,
      },
      usage: {
        total: {
          apiCalls: totalUsage._sum.apiCalls || 0,
          tokensUsed: totalUsage._sum.tokensUsed || 0,
          cost: Number(totalUsage._sum.cost || 0),
          records: totalUsage._count.id || 0,
        },
        thisMonth: {
          apiCalls: thisMonthUsage._sum.apiCalls || 0,
          tokensUsed: thisMonthUsage._sum.tokensUsed || 0,
          cost: Number(thisMonthUsage._sum.cost || 0),
        },
      },
      subscriptions: subscriptionStats.reduce(
        (acc, stat) => {
          acc[stat.plan] = stat._count.plan;
          return acc;
        },
        {} as Record<string, number>
      ),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

