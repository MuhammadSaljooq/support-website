import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-session";
import { db } from "@/lib/db";
import { verifyVapiApiKey } from "@/lib/vapi";
import { encrypt } from "@/lib/encryption";
import { z } from "zod";

// Verify VapiAgent model is available
if (!db.vapiAgent) {
  console.error("ERROR: db.vapiAgent is not available. Run: npx prisma generate");
}

const createAgentSchema = z.object({
  name: z.string().min(1, "Agent name is required").max(100),
  apiKey: z.string().min(1, "API key is required"),
  agentId: z.string().optional(),
});

const updateAgentSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  apiKey: z.string().min(1).optional(),
  agentId: z.string().optional(),
  isActive: z.boolean().optional(),
});

// GET - List all Vapi agents for the user
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agents = await db.vapiAgent.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        agentId: true,
        isActive: true,
        lastSyncedAt: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            usages: true,
          },
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
            totalMinutes: Math.round((usageStats._sum.tokensUsed || 0) / 60), // Convert seconds to minutes
            totalCost: Number(usageStats._sum.cost || 0),
          },
        };
      })
    );

    return NextResponse.json({ agents: agentsWithStats });
  } catch (error) {
    console.error("Error fetching Vapi agents:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new Vapi agent
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check if VapiAgent model is available
    if (!db.vapiAgent) {
      console.error("db.vapiAgent is undefined. Prisma Client needs to be regenerated.");
      return NextResponse.json(
        { 
          error: "Database model not available",
          details: "Please restart your dev server. The Prisma Client needs to be reloaded with the VapiAgent model."
        },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { name, apiKey, agentId } = createAgentSchema.parse(body);

    // Verify the API key with Vapi
    const isValid = await verifyVapiApiKey(apiKey);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Vapi API key. Please check your key and try again." },
        { status: 400 }
      );
    }

    // Encrypt the API key before storing
    let encryptedKey: string;
    try {
      encryptedKey = encrypt(apiKey);
    } catch (encryptError) {
      console.error("Encryption error:", encryptError);
      return NextResponse.json(
        { 
          error: "Failed to encrypt API key",
          details: encryptError instanceof Error ? encryptError.message : "ENCRYPTION_KEY not configured. Please add ENCRYPTION_KEY to your .env.local file (at least 32 characters)."
        },
        { status: 500 }
      );
    }

    // Create the agent
    try {
      const agent = await db.vapiAgent.create({
        data: {
          userId: user.id,
          name,
          apiKey: encryptedKey,
          agentId: agentId || null,
          isActive: true,
        },
        select: {
          id: true,
          name: true,
          agentId: true,
          isActive: true,
          createdAt: true,
        },
      });

      return NextResponse.json({
        success: true,
        agent,
        message: "Vapi agent created successfully",
      });
    } catch (dbError: any) {
      console.error("Database error creating agent:", dbError);
      
      // Check for specific Prisma errors
      if (dbError.code === 'P2002') {
        return NextResponse.json(
          { error: "An agent with this name already exists" },
          { status: 400 }
        );
      }
      
      return NextResponse.json(
        { 
          error: "Failed to create agent",
          details: process.env.NODE_ENV === 'development' ? dbError.message : undefined
        },
        { status: 500 }
      );
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating Vapi agent:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
      },
      { status: 500 }
    );
  }
}

// PATCH - Update a Vapi agent
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("id");

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const validatedData = updateAgentSchema.parse(body);

    // Verify the agent belongs to the user
    const existingAgent = await db.vapiAgent.findFirst({
      where: { id: agentId, userId: user.id },
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    // Prepare update data
    const updateData: any = {};
    if (validatedData.name !== undefined) updateData.name = validatedData.name;
    if (validatedData.agentId !== undefined) updateData.agentId = validatedData.agentId;
    if (validatedData.isActive !== undefined) updateData.isActive = validatedData.isActive;
    
    // If API key is provided, verify and encrypt it
    if (validatedData.apiKey) {
      const isValid = await verifyVapiApiKey(validatedData.apiKey);
      if (!isValid) {
        return NextResponse.json(
          { error: "Invalid Vapi API key. Please check your key and try again." },
          { status: 400 }
        );
      }
      updateData.apiKey = encrypt(validatedData.apiKey);
    }

    // Update the agent
    const updatedAgent = await db.vapiAgent.update({
      where: { id: agentId },
      data: updateData,
      select: {
        id: true,
        name: true,
        agentId: true,
        isActive: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      agent: updatedAgent,
      message: "Agent updated successfully",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating Vapi agent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a Vapi agent
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get("id");

    if (!agentId) {
      return NextResponse.json(
        { error: "Agent ID is required" },
        { status: 400 }
      );
    }

    // Verify the agent belongs to the user
    const existingAgent = await db.vapiAgent.findFirst({
      where: { id: agentId, userId: user.id },
    });

    if (!existingAgent) {
      return NextResponse.json(
        { error: "Agent not found" },
        { status: 404 }
      );
    }

    // Delete the agent (usage records will be preserved with vapiAgentId set to null)
    await db.vapiAgent.delete({
      where: { id: agentId },
    });

    return NextResponse.json({
      success: true,
      message: "Agent deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting Vapi agent:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

