import { NextRequest, NextResponse } from "next/server";
import { getAdminUser } from "@/lib/admin";
import { db } from "@/lib/db";
import { z } from "zod";

const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

// GET - List all agents across all users
export async function GET(request: NextRequest) {
  try {
    await getAdminUser();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const userId = searchParams.get("userId");
    const isActive = searchParams.get("isActive");

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }
    if (isActive !== null) {
      where.isActive = isActive === "true";
    }

    // Get total count
    const total = await db.vapiAgent.count({ where });

    // Get agents with user info
    const agents = await db.vapiAgent.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        agentId: true,
        isActive: true,
        lastSyncedAt: true,
        createdAt: true,
        updatedAt: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: { usages: true },
        },
      },
    });

    // Get usage stats for each agent
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const usageStats = await db.usage.aggregate({
          where: { vapiAgentId: agent.id },
          _sum: {
            apiCalls: true,
            tokensUsed: true,
            cost: true,
          },
        });

        return {
          ...agent,
          usageCount: agent._count.usages,
          stats: {
            totalCalls: usageStats._sum.apiCalls || 0,
            totalMinutes: Math.round((usageStats._sum.tokensUsed || 0) / 60),
            totalCost: Number(usageStats._sum.cost || 0),
          },
        };
      })
    );

    return NextResponse.json({
      agents: agentsWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    console.error("Error fetching agents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update agent
export async function PATCH(request: NextRequest) {
  try {
    await getAdminUser();

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("id");

    if (!agentId) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const validatedData = updateAgentSchema.parse(body);

    // Check if agent exists
    const existingAgent = await db.vapiAgent.findUnique({
      where: { id: agentId },
    });

    if (!existingAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Update agent
    const updatedAgent = await db.vapiAgent.update({
      where: { id: agentId },
      data: validatedData,
      select: {
        id: true,
        name: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      agent: updatedAgent,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    console.error("Error updating agent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete agent
export async function DELETE(request: NextRequest) {
  try {
    await getAdminUser();

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("id");

    if (!agentId) {
      return NextResponse.json({ error: "Agent ID is required" }, { status: 400 });
    }

    // Check if agent exists
    const existingAgent = await db.vapiAgent.findUnique({
      where: { id: agentId },
    });

    if (!existingAgent) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Delete agent
    await db.vapiAgent.delete({
      where: { id: agentId },
    });

    return NextResponse.json({
      success: true,
      message: "Agent deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Admin access required") {
      return NextResponse.json({ error: "Admin access required" }, { status: 403 });
    }
    console.error("Error deleting agent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

