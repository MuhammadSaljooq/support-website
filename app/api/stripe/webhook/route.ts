import { NextRequest, NextResponse } from "next/server";
import { headers } from "next/headers";
import { stripe } from "@/lib/stripe";
import { db } from "@/lib/db";
import Stripe from "stripe";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature header" },
        { status: 400 }
      );
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("STRIPE_WEBHOOK_SECRET is not set");
      return NextResponse.json(
        { error: "Webhook secret not configured" },
        { status: 500 }
      );
    }

    let event: Stripe.Event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret
      );
    } catch (err) {
      const error = err as Error;
      console.error("Webhook signature verification failed:", error.message);
      return NextResponse.json(
        { error: `Webhook Error: ${error.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handleSuccessfulPayment(paymentIntent);
        break;
      }

      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case "charge.succeeded": {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeSucceeded(charge);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  try {
    const userId = paymentIntent.metadata?.userId;

    if (!userId) {
      console.error("No userId in payment intent metadata");
      return;
    }

    const amount = paymentIntent.amount / 100; // Convert from cents to dollars
    const creditsToAdd = Math.floor(amount * 100); // 1 dollar = 100 credits

    // Get or create subscription
    let subscription = await db.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      subscription = await db.subscription.create({
        data: {
          userId,
          plan: "FREE",
          credits: 0,
        },
      });
    }

    // Add credits
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        credits: {
          increment: creditsToAdd,
        },
      },
    });

    // Create transaction record
    await db.transaction.create({
      data: {
        userId,
        amount: amount,
        type: "PURCHASE",
        status: "COMPLETED",
      },
    });

    console.log(`Added ${creditsToAdd} credits to user ${userId}`);
  } catch (error) {
    console.error("Error handling successful payment:", error);
    throw error;
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    const userId = session.metadata?.userId;

    if (!userId) {
      console.error("No userId in checkout session metadata");
      return;
    }

    const amountTotal = (session.amount_total || 0) / 100;
    const creditsToAdd = Math.floor(amountTotal * 100);

    // Get or create subscription
    let subscription = await db.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      subscription = await db.subscription.create({
        data: {
          userId,
          plan: "FREE",
          credits: 0,
        },
      });
    }

    // Add credits
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        credits: {
          increment: creditsToAdd,
        },
      },
    });

    // Create transaction record
    await db.transaction.create({
      data: {
        userId,
        amount: amountTotal,
        type: "PURCHASE",
        status: "COMPLETED",
      },
    });

    console.log(`Added ${creditsToAdd} credits to user ${userId} from checkout`);
  } catch (error) {
    console.error("Error handling checkout completion:", error);
    throw error;
  }
}

async function handleChargeSucceeded(charge: Stripe.Charge) {
  try {
    const userId = charge.metadata?.userId;

    if (!userId) {
      console.error("No userId in charge metadata");
      return;
    }

    const amount = charge.amount / 100;
    const creditsToAdd = Math.floor(amount * 100);

    // Get or create subscription
    let subscription = await db.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      subscription = await db.subscription.create({
        data: {
          userId,
          plan: "FREE",
          credits: 0,
        },
      });
    }

    // Add credits
    await db.subscription.update({
      where: { id: subscription.id },
      data: {
        credits: {
          increment: creditsToAdd,
        },
      },
    });

    // Create transaction record
    await db.transaction.create({
      data: {
        userId,
        amount: amount,
        type: "PURCHASE",
        status: "COMPLETED",
      },
    });

    console.log(`Added ${creditsToAdd} credits to user ${userId} from charge`);
  } catch (error) {
    console.error("Error handling charge success:", error);
    throw error;
  }
}

