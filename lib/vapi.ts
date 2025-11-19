// Vapi API integration service
const VAPI_API_URL = "https://api.vapi.ai";

// Get default API key from environment (for testing/development)
export function getDefaultVapiApiKey(): string | null {
  return process.env.VAPI_API_KEY || null;
}

export interface VapiMetrics {
  minutesUsed: number;
  callCount: number;
  costs: number;
  startDate?: string;
  endDate?: string;
}

export interface VapiCall {
  id: string;
  status: string;
  startedAt: string;
  endedAt?: string;
  duration?: number;
  cost?: number;
}

/**
 * Fetch analytics/metrics from Vapi API
 * Tries multiple endpoint formats and falls back to aggregating from /call endpoint
 */
export async function fetchVapiMetrics(
  apiKey: string,
  startDate?: string,
  endDate?: string
): Promise<VapiMetrics> {
  try {
    // Try different endpoint formats
    const endpoints = [
      `${VAPI_API_URL}/analytics`,
      `${VAPI_API_URL}/v1/analytics`,
      `${VAPI_API_URL}/analytics/get`,
      `${VAPI_API_URL}/v1/analytics/get`,
    ];

    let lastError: Error | null = null;

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            columns: ["minutesUsed", "callCount", "costs"],
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
          }),
        });

        if (response.ok) {
          const data = await response.json();
          
          // Handle different response formats
          return {
            minutesUsed: data.minutesUsed || data.minutes_used || data.data?.minutesUsed || 0,
            callCount: data.callCount || data.call_count || data.data?.callCount || 0,
            costs: data.costs || data.cost || data.data?.costs || 0,
            startDate: data.startDate || data.start_date,
            endDate: data.endDate || data.end_date,
          };
        }

        if (response.status !== 404) {
          // If it's not 404, this might be the right endpoint but with wrong format
          const errorText = await response.text();
          lastError = new Error(`HTTP ${response.status}: ${errorText}`);
        }
      } catch (e) {
        lastError = e instanceof Error ? e : new Error(String(e));
        continue;
      }
    }

    // If all endpoints failed, try GET request to /call endpoint and aggregate
    const callsResponse = await fetch(`${VAPI_API_URL}/call`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (callsResponse.ok) {
      const callsData = await callsResponse.json();
      const calls = Array.isArray(callsData) ? callsData : (callsData.calls || []);
      
      // Filter by date range if provided
      let filteredCalls = calls;
      if (startDate || endDate) {
        filteredCalls = calls.filter((call: any) => {
          const callDate = new Date(call.startedAt || call.createdAt || call.timestamp);
          if (startDate && callDate < new Date(startDate)) return false;
          if (endDate && callDate > new Date(endDate)) return false;
          return true;
        });
      }
      
      // Calculate metrics from calls
      const totalMinutes = filteredCalls.reduce((sum: number, call: any) => {
        const duration = call.duration || call.durationSeconds || (call.endedAt && call.startedAt 
          ? (new Date(call.endedAt).getTime() - new Date(call.startedAt).getTime()) / 1000 / 60
          : 0);
        return sum + duration;
      }, 0);

      const totalCost = filteredCalls.reduce((sum: number, call: any) => {
        return sum + (call.cost || call.totalCost || call.amount || 0);
      }, 0);

      return {
        minutesUsed: totalMinutes,
        callCount: filteredCalls.length,
        costs: totalCost,
        startDate,
        endDate,
      };
    }

    throw lastError || new Error("Failed to fetch metrics from all endpoints");
  } catch (error) {
    console.error("Error fetching Vapi metrics:", error);
    throw error;
  }
}

/**
 * Verify Vapi API key by making a test request
 */
export async function verifyVapiApiKey(apiKey: string): Promise<boolean> {
  try {
    // Try multiple endpoints to verify the key
    const endpoints = [
      { url: `${VAPI_API_URL}/call`, method: "GET" },
      { url: `${VAPI_API_URL}/phone-number`, method: "GET" },
      { url: `${VAPI_API_URL}/analytics`, method: "POST", body: { columns: ["callCount"] } },
    ];

    for (const endpoint of endpoints) {
      try {
        const response = await fetch(endpoint.url, {
          method: endpoint.method as "GET" | "POST",
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          ...(endpoint.body && { body: JSON.stringify(endpoint.body) }),
        });

        // If we get a response that's not 401/403, the key is valid
        if (response.status !== 401 && response.status !== 403) {
          return true;
        }
      } catch (e) {
        // Continue to next endpoint
        continue;
      }
    }

    return false;
  } catch (error) {
    console.error("Error verifying Vapi API key:", error);
    return false;
  }
}

/**
 * Fetch recent calls from Vapi
 */
export async function fetchVapiCalls(
  apiKey: string,
  limit: number = 10
): Promise<VapiCall[]> {
  try {
    const response = await fetch(`${VAPI_API_URL}/call`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Vapi API error: ${response.status}`);
    }

    const data = await response.json();
    const calls = Array.isArray(data) ? data : (data.calls || []);
    return calls.slice(0, limit).map((call: any) => ({
      id: call.id || call.callId,
      status: call.status || call.state,
      startedAt: call.startedAt || call.createdAt || call.timestamp,
      endedAt: call.endedAt || call.completedAt,
      duration: call.duration || call.durationSeconds,
      cost: call.cost || call.totalCost || call.amount,
    }));
  } catch (error) {
    console.error("Error fetching Vapi calls:", error);
    return [];
  }
}
