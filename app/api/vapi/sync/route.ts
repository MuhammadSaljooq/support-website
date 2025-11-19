import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-session";
import { db } from "@/lib/db";
import { fetchVapiMetrics } from "@/lib/vapi";
import { decrypt } from "@/lib/encryption";

/**
 * Sync Vapi metrics for a specific agent and store them in the Usage table
 */
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get agent ID and date range from body
    const body = await request.json().catch(() => ({}));
    const agentId = body.agentId;
    const startDate = body.startDate;
    const endDate = body.endDate;

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }

    // Get the agent
    const agent = await db.vapiAgent.findFirst({
      where: { id: agentId, userId: user.id, isActive: true },
    });

    if (!agent) {
      return NextResponse.json(
        { error: "Agent not found or inactive" },
        { status: 404 }
      );
    }

    // Decrypt the API key
    const decryptedKey = decrypt(agent.apiKey);
    
    // Fetch metrics from Vapi
    const metrics = await fetchVapiMetrics(
      decryptedKey,
      startDate,
      endDate
    );
    
    // Store metrics in Usage table, associated with this agent
    await db.usage.create({
      data: {
        userId: user.id,
        vapiAgentId: agent.id,
        apiCalls: metrics.callCount,
        tokensUsed: Math.round(metrics.minutesUsed * 60), // Convert minutes to seconds (approximate)
        cost: metrics.costs,
        timestamp: new Date(),
      },
    });
    
    // Update last synced timestamp for the agent
    await db.vapiAgent.update({
      where: { id: agent.id },
      data: { lastSyncedAt: new Date() },
    });
    
    return NextResponse.json({ 
      success: true,
      metrics,
      agentId: agent.id,
      agentName: agent.name,
      message: `Metrics synced successfully for ${agent.name}` 
    });
  } catch (error) {
    console.error("Error syncing Vapi metrics:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

