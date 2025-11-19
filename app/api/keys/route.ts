import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-session";
import { db } from "@/lib/db";
import { v4 as uuidv4 } from "uuid";
import bcrypt from "bcryptjs";
import { z } from "zod";

const createKeySchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name too long"),
});

const updateKeySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  isActive: z.boolean().optional(),
});

// GET - List all API keys for the user
export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const apiKeys = await db.apiKey.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        lastUsed: true,
        isActive: true,
        createdAt: true,
      },
    });

    // Get usage stats for each key
    const keysWithStats = await Promise.all(
      apiKeys.map(async (key) => {
        const usageStats = await db.usage.aggregate({
          where: { apiKeyId: key.id },
          _sum: {
            apiCalls: true,
            tokensUsed: true,
            cost: true,
          },
          _count: {
            id: true,
          },
        });

        return {
          ...key,
          stats: {
            totalApiCalls: usageStats._sum.apiCalls || 0,
            totalTokensUsed: usageStats._sum.tokensUsed || 0,
            totalCost: Number(usageStats._sum.cost || 0),
            usageCount: usageStats._count.id || 0,
          },
        };
      })
    );

    return NextResponse.json({ keys: keysWithStats });
  } catch (error) {
    console.error("Error fetching API keys:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST - Create a new API key
export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createKeySchema.parse(body);

    // Generate API key
    const rawKey = `sk_live_${uuidv4().replace(/-/g, "")}`;
    const keyPrefix = rawKey.substring(0, 12); // "sk_live_xxx"
    
    // Hash the key before storing
    const hashedKey = await bcrypt.hash(rawKey, 12);

    // Create API key in database
    const apiKey = await db.apiKey.create({
      data: {
        userId: user.id,
        name: validatedData.name,
        key: hashedKey,
        keyPrefix: keyPrefix,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        createdAt: true,
      },
    });

    // Return the raw key only once (for display to user)
    return NextResponse.json(
      {
        success: true,
        apiKey: {
          id: apiKey.id,
          name: apiKey.name,
          key: rawKey, // Return full key only on creation
          keyPrefix: apiKey.keyPrefix,
          createdAt: apiKey.createdAt,
        },
        message: "API key created successfully. Save this key securely - it won't be shown again.",
      },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error creating API key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PATCH - Update API key (name or active status)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json(
        { error: "API key ID is required" },
        { status: 400 }
      );
    }

    const validatedData = updateKeySchema.parse(updateData);

    // Verify the API key belongs to the user
    const existingKey = await db.apiKey.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    // Update the API key
    const updatedKey = await db.apiKey.update({
      where: { id: id },
      data: validatedData,
      select: {
        id: true,
        name: true,
        keyPrefix: true,
        isActive: true,
        lastUsed: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      success: true,
      apiKey: updatedKey,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating API key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// DELETE - Revoke API key
export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "API key ID is required" },
        { status: 400 }
      );
    }

    // Verify the API key belongs to the user
    const existingKey = await db.apiKey.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingKey) {
      return NextResponse.json(
        { error: "API key not found" },
        { status: 404 }
      );
    }

    // Delete the API key
    await db.apiKey.delete({
      where: { id: id },
    });

    return NextResponse.json({
      success: true,
      message: "API key revoked successfully",
    });
  } catch (error) {
    console.error("Error deleting API key:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

