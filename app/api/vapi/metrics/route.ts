import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-session";
import { db } from "@/lib/db";
import { fetchVapiMetrics } from "@/lib/vapi";
import { decrypt } from "@/lib/encryption";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get agent ID and date range from query params
    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("agentId");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

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
      startDate || undefined,
      endDate || undefined
    );
    
    // Update last synced timestamp
    await db.vapiAgent.update({
      where: { id: agent.id },
      data: { lastSyncedAt: new Date() },
    });
    
    return NextResponse.json({ 
      metrics,
      agent: {
        id: agent.id,
        name: agent.name,
        agentId: agent.agentId,
      }
    });
  } catch (error) {
    console.error("Error fetching Vapi metrics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

