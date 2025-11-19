import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-session";
import { db } from "@/lib/db";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get last 10 API calls
    const recentActivity = await db.usage.findMany({
      where: { userId: user.id },
      orderBy: { timestamp: "desc" },
      take: 10,
      select: {
        id: true,
        timestamp: true,
        apiCalls: true,
        tokensUsed: true,
        cost: true,
      },
    });

    return NextResponse.json(
      recentActivity.map((activity) => ({
        id: activity.id,
        timestamp: activity.timestamp.toISOString(),
        apiCalls: activity.apiCalls,
        tokensUsed: activity.tokensUsed,
        cost: Number(activity.cost),
      }))
    );
  } catch (error) {
    console.error("Error fetching activity:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

