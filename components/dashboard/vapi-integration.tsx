"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Link2, Unlink, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { showToast } from "@/lib/toast";

const vapiKeySchema = z.object({
  apiKey: z.string().min(1, "Vapi API key is required"),
});

type VapiKeyFormData = z.infer<typeof vapiKeySchema>;

interface VapiIntegration {
  id: string;
  isConnected: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export function VapiIntegration() {
  const [integration, setIntegration] = useState<VapiIntegration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<VapiKeyFormData>({
    resolver: zodResolver(vapiKeySchema),
  });

  useEffect(() => {
    fetchIntegration();
  }, []);

  const fetchIntegration = async () => {
    try {
      const response = await fetch("/api/vapi/connect");
      if (response.ok) {
        const data = await response.json();
        setIntegration(data.integration);
      }
    } catch (error) {
      console.error("Error fetching integration:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: VapiKeyFormData) => {
    setIsConnecting(true);
    try {
      const response = await fetch("/api/vapi/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (response.ok) {
        showToast.success("Vapi account connected successfully!");
        reset();
        await fetchIntegration();
      } else {
        showToast.error(result.error || "Failed to connect Vapi account");
      }
    } catch (error) {
      console.error("Error connecting Vapi:", error);
      showToast.error("Failed to connect Vapi account");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      const response = await fetch("/api/vapi/connect", {
        method: "DELETE",
      });

      if (response.ok) {
        showToast.success("Vapi account disconnected successfully");
        await fetchIntegration();
      } else {
        showToast.error("Failed to disconnect Vapi account");
      }
    } catch (error) {
      console.error("Error disconnecting Vapi:", error);
      showToast.error("Failed to disconnect Vapi account");
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const response = await fetch("/api/vapi/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
      
      const result = await response.json();
      
      if (response.ok) {
        showToast.success(result.message || "Metrics synced successfully");
        await fetchIntegration();
      } else {
        showToast.error(result.error || "Failed to sync metrics");
      }
    } catch (error) {
      console.error("Error syncing metrics:", error);
      showToast.error("Failed to sync metrics");
    } finally {
      setIsSyncing(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vapi Integration</CardTitle>
          <CardDescription>Connect your Vapi account to sync usage metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vapi Integration</CardTitle>
        <CardDescription>
          Connect your Vapi account to automatically sync usage metrics and costs
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {integration?.isConnected ? (
          <>
            {/* Connected State */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
              <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  Vapi Account Connected
                </h3>
                <p className="text-sm text-green-700 dark:text-green-300 mb-2">
                  Your Vapi account is connected and metrics are being synced.
                </p>
                {integration.lastSyncedAt && (
                  <p className="text-xs text-green-600 dark:text-green-400">
                    Last synced: {new Date(integration.lastSyncedAt).toLocaleString()}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={handleSync}
                disabled={isSyncing}
                variant="outline"
                className="flex-1"
              >
                {isSyncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Sync Now
                  </>
                )}
              </Button>
              <Button
                onClick={handleDisconnect}
                disabled={isDisconnecting}
                variant="destructive"
                className="flex-1"
              >
                {isDisconnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Disconnecting...
                  </>
                ) : (
                  <>
                    <Unlink className="mr-2 h-4 w-4" />
                    Disconnect
                  </>
                )}
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Not Connected State */}
            <div className="flex items-start gap-4 p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
                  Vapi Account Not Connected
                </h3>
                <p className="text-sm text-amber-700 dark:text-amber-300">
                  Connect your Vapi account to view usage metrics and costs in your dashboard.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Vapi API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Vapi API key"
                  {...register("apiKey")}
                  className={errors.apiKey ? "border-red-500" : ""}
                />
                {errors.apiKey && (
                  <p className="text-sm text-red-500">{errors.apiKey.message}</p>
                )}
                <p className="text-xs text-muted-foreground">
                  You can find your API key in your{" "}
                  <a
                    href="https://dashboard.vapi.ai/settings"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    Vapi dashboard settings
                  </a>
                </p>
              </div>

              <Button type="submit" disabled={isConnecting} className="w-full">
                {isConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    Connect Vapi Account
                  </>
                )}
              </Button>
            </form>
          </>
        )}
      </CardContent>
    </Card>
  );
}

