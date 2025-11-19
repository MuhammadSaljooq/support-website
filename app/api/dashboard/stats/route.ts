import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-session";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's subscription for credits
    const subscription = await db.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Get total API calls
    const totalApiCalls = await db.usage.aggregate({
      where: { userId: user.id },
      _sum: { apiCalls: true },
    });

    // Get total tokens used
    const totalTokens = await db.usage.aggregate({
      where: { userId: user.id },
      _sum: { tokensUsed: true },
    });

    // Get current month's usage
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

    // Get current balance from transactions
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

    return NextResponse.json({
      totalApiCalls: totalApiCalls._sum.apiCalls || 0,
      totalTokensUsed: totalTokens._sum.tokensUsed || 0,
      currentBalance: balance,
      thisMonthUsage: {
        apiCalls: thisMonthUsage._sum.apiCalls || 0,
        tokensUsed: thisMonthUsage._sum.tokensUsed || 0,
        cost: Number(thisMonthUsage._sum.cost || 0),
      },
      credits: subscription?.credits || 0,
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

