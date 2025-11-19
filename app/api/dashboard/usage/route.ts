import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-session";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get last 30 days of usage data
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

    const usageData = await db.usage.findMany({
      where: {
        userId: user.id,
        timestamp: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    // Group by date
    const dailyData: Record<string, { date: string; apiCalls: number }> = {};

    usageData.forEach((usage) => {
      const date = new Date(usage.timestamp).toISOString().split("T")[0];
      if (!dailyData[date]) {
        dailyData[date] = { date, apiCalls: 0 };
      }
      dailyData[date].apiCalls += usage.apiCalls;
    });

    // Fill in missing days with 0
    const result = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split("T")[0];
      result.push({
        date: dateStr,
        apiCalls: dailyData[dateStr]?.apiCalls || 0,
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching usage data:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

