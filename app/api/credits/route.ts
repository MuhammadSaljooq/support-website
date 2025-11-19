import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-session";
import { db } from "@/lib/db";
import { z } from "zod";

const creditOperationSchema = z.object({
  action: z.enum(["add", "subtract", "set"]),
  amount: z.number().positive("Amount must be positive"),
  reason: z.string().optional(),
});

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get user's subscription for credits
    const subscription = await db.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Get credit history from transactions
    const creditTransactions = await db.transaction.findMany({
      where: {
        userId: user.id,
        type: "PURCHASE",
        status: "COMPLETED",
      },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        amount: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      credits: subscription?.credits || 0,
      recentTransactions: creditTransactions.map((t) => ({
        id: t.id,
        amount: Number(t.amount),
        createdAt: t.createdAt.toISOString(),
      })),
    });
  } catch (error) {
    console.error("Error fetching credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

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
    const validatedData = creditOperationSchema.parse(body);

    // Get current subscription
    let subscription = await db.subscription.findFirst({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    // Create subscription if it doesn't exist
    if (!subscription) {
      subscription = await db.subscription.create({
        data: {
          userId: user.id,
          plan: "FREE",
          credits: 0,
        },
      });
    }

    // Calculate new credit balance
    let newCredits = subscription.credits;
    switch (validatedData.action) {
      case "add":
        newCredits += validatedData.amount;
        break;
      case "subtract":
        newCredits = Math.max(0, newCredits - validatedData.amount);
        break;
      case "set":
        newCredits = validatedData.amount;
        break;
    }

    // Update subscription credits
    const updatedSubscription = await db.subscription.update({
      where: { id: subscription.id },
      data: { credits: newCredits },
    });

    // Create transaction record
    const transaction = await db.transaction.create({
      data: {
        userId: user.id,
        amount: validatedData.amount,
        type: validatedData.action === "subtract" ? "USAGE" : "PURCHASE",
        status: "COMPLETED",
      },
    });

    return NextResponse.json(
      {
        success: true,
        credits: updatedSubscription.credits,
        previousCredits: subscription.credits,
        transaction: {
          id: transaction.id,
          amount: Number(transaction.amount),
          type: transaction.type,
          status: transaction.status,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid request data", details: error.errors },
        { status: 400 }
      );
    }

    console.error("Error updating credits:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

