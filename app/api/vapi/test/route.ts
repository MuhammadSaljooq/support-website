import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/get-session";
import { fetchVapiMetrics, verifyVapiApiKey, getDefaultVapiApiKey } from "@/lib/vapi";

/**
 * Test endpoint to verify Vapi API key and fetch test metrics
 * Uses the default VAPI_API_KEY from environment if no key provided
 */
export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const apiKey = searchParams.get("apiKey") || getDefaultVapiApiKey();

    if (!apiKey) {
      return NextResponse.json(
        { error: "No API key provided. Set VAPI_API_KEY in .env.local or pass as query param." },
        { status: 400 }
      );
    }

    // Verify the API key
    const isValid = await verifyVapiApiKey(apiKey);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid Vapi API key" },
        { status: 400 }
      );
    }

    // Fetch metrics
    const metrics = await fetchVapiMetrics(apiKey);

    return NextResponse.json({
      success: true,
      message: "Vapi API key is valid and working!",
      metrics,
    });
  } catch (error) {
    console.error("Error testing Vapi API:", error);
    return NextResponse.json(
      { 
        error: error instanceof Error ? error.message : "Internal server error",
        details: "Check your API key and Vapi API connectivity"
      },
      { status: 500 }
    );
  }
}

