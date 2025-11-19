"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Loader2, 
  Plus, 
  Trash2, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle,
  Phone,
  Edit2,
  X,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { showToast } from "@/lib/toast";
import { Badge } from "@/components/ui/badge";

const agentSchema = z.object({
  name: z.string().min(1, "Agent name is required").max(100),
  apiKey: z.string().min(1, "Vapi API key is required"),
  agentId: z.string().optional(),
});

type AgentFormData = z.infer<typeof agentSchema>;

interface VapiAgent {
  id: string;
  name: string;
  agentId: string | null;
  isActive: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
  usageCount: number;
  stats: {
    totalCalls: number;
    totalMinutes: number;
    totalCost: number;
  };
}

export function VapiAgents() {
  const [agents, setAgents] = useState<VapiAgent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingAgent, setEditingAgent] = useState<VapiAgent | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletingAgent, setDeletingAgent] = useState<VapiAgent | null>(null);
  const [syncingAgentId, setSyncingAgentId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AgentFormData>({
    resolver: zodResolver(agentSchema),
  });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const response = await fetch("/api/vapi/agents");
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents || []);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = async (data: AgentFormData) => {
    try {
      const url = isEditing && editingAgent
        ? `/api/vapi/agents?id=${editingAgent.id}`
        : "/api/vapi/agents";
      
      const method = isEditing ? "PATCH" : "POST";
      
      // For PATCH, only send fields that are provided (API key is optional)
      const body = isEditing && !data.apiKey
        ? { name: data.name, agentId: data.agentId }
        : data;
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const result = await response.json();

      if (response.ok) {
        showToast.success(
          isEditing 
            ? "Agent updated successfully!" 
            : "Agent created successfully!"
        );
        reset();
        setIsDialogOpen(false);
        setIsEditing(false);
        setEditingAgent(null);
        await fetchAgents();
      } else {
        const errorMsg = result.details 
          ? `${result.error}: ${result.details}` 
          : result.error || "Failed to save agent";
        showToast.error(errorMsg);
        console.error("Agent save error:", result);
      }
    } catch (error) {
      console.error("Error saving agent:", error);
      showToast.error("Failed to save agent");
    }
  };

  const handleEdit = (agent: VapiAgent) => {
    setEditingAgent(agent);
    setIsEditing(true);
    setIsDialogOpen(true);
    // Note: We don't populate the API key for security reasons
    reset({
      name: agent.name,
      agentId: agent.agentId || undefined,
      apiKey: "", // User needs to re-enter if changing
    });
  };

  const handleDelete = async () => {
    if (!deletingAgent) return;

    try {
      const response = await fetch(`/api/vapi/agents?id=${deletingAgent.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast.success("Agent deleted successfully");
        await fetchAgents();
      } else {
        const error = await response.json();
        showToast.error(error.error || "Failed to delete agent");
      }
    } catch (error) {
      console.error("Error deleting agent:", error);
      showToast.error("Failed to delete agent");
    } finally {
      setIsDeleting(false);
      setDeletingAgent(null);
    }
  };

  const handleSync = async (agentId: string) => {
    setSyncingAgentId(agentId);
    try {
      const response = await fetch("/api/vapi/sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentId }),
      });

      const result = await response.json();

      if (response.ok) {
        showToast.success(result.message || "Metrics synced successfully");
        await fetchAgents();
      } else {
        showToast.error(result.error || "Failed to sync metrics");
      }
    } catch (error) {
      console.error("Error syncing metrics:", error);
      showToast.error("Failed to sync metrics");
    } finally {
      setSyncingAgentId(null);
    }
  };

  const handleToggleActive = async (agent: VapiAgent) => {
    try {
      const response = await fetch(`/api/vapi/agents?id=${agent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !agent.isActive }),
      });

      if (response.ok) {
        showToast.success(
          agent.isActive ? "Agent deactivated" : "Agent activated"
        );
        await fetchAgents();
      } else {
        showToast.error("Failed to update agent");
      }
    } catch (error) {
      console.error("Error updating agent:", error);
      showToast.error("Failed to update agent");
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Vapi Agents</CardTitle>
          <CardDescription>Manage your Vapi voice agents</CardDescription>
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
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Vapi Agents</CardTitle>
              <CardDescription>
                Manage multiple Vapi agents, each with its own API key and metrics
              </CardDescription>
            </div>
            <Button onClick={() => {
              setIsEditing(false);
              setEditingAgent(null);
              reset();
              setIsDialogOpen(true);
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Add Agent
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-12">
              <Phone className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Agents Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first Vapi agent to start tracking usage metrics
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Your First Agent
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {agents.map((agent) => (
                <Card key={agent.id} className="relative">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold">{agent.name}</h3>
                          {agent.isActive ? (
                            <Badge variant="default" className="bg-green-500">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary">Inactive</Badge>
                          )}
                        </div>
                        {agent.agentId && (
                          <p className="text-sm text-muted-foreground mb-3">
                            Agent ID: {agent.agentId}
                          </p>
                        )}
                        <div className="grid grid-cols-3 gap-4 mt-4">
                          <div>
                            <p className="text-xs text-muted-foreground">Total Calls</p>
                            <p className="text-lg font-semibold">{agent.stats.totalCalls.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total Minutes</p>
                            <p className="text-lg font-semibold">{agent.stats.totalMinutes.toLocaleString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Total Cost</p>
                            <p className="text-lg font-semibold">${agent.stats.totalCost.toFixed(2)}</p>
                          </div>
                        </div>
                        {agent.lastSyncedAt && (
                          <p className="text-xs text-muted-foreground mt-3">
                            Last synced: {new Date(agent.lastSyncedAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                      <div className="flex flex-col gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSync(agent.id)}
                          disabled={syncingAgentId === agent.id || !agent.isActive}
                        >
                          {syncingAgentId === agent.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEdit(agent)}
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleActive(agent)}
                        >
                          {agent.isActive ? (
                            <X className="h-4 w-4" />
                          ) : (
                            <Check className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setDeletingAgent(agent);
                            setIsDeleting(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? "Edit Agent" : "Add New Vapi Agent"}
            </DialogTitle>
            <DialogDescription>
              {isEditing 
                ? "Update your agent details. Re-enter the API key if you want to change it."
                : "Add a new Vapi agent with its API key to track usage metrics separately."
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <Input
                id="name"
                placeholder="e.g., Medical Support Agent"
                {...register("name")}
                className={errors.name ? "border-red-500" : ""}
              />
              {errors.name && (
                <p className="text-sm text-red-500">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="apiKey">
                Vapi API Key {isEditing && <span className="text-muted-foreground font-normal">(optional)</span>}
              </Label>
              <Input
                id="apiKey"
                type="password"
                placeholder={isEditing ? "Leave blank to keep current key" : "Enter your Vapi API key"}
                {...register("apiKey", { 
                  required: !isEditing ? "API key is required" : false 
                })}
                className={errors.apiKey ? "border-red-500" : ""}
              />
              {errors.apiKey && (
                <p className="text-sm text-red-500">{errors.apiKey.message}</p>
              )}
              <p className="text-xs text-muted-foreground">
                {isEditing 
                  ? "Leave blank to keep current key, or enter new key to update"
                  : "Get your API key from your Vapi dashboard settings. Your default key is configured in .env.local"
                }
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="agentId">Agent ID (Optional)</Label>
              <Input
                id="agentId"
                placeholder="Vapi agent ID for reference"
                {...register("agentId")}
              />
              <p className="text-xs text-muted-foreground">
                Optional: Your Vapi agent ID for reference
              </p>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setIsEditing(false);
                  setEditingAgent(null);
                  reset();
                }}
              >
                Cancel
              </Button>
              <Button type="submit">
                {isEditing ? "Update Agent" : "Create Agent"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={isDeleting} onOpenChange={setIsDeleting}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Agent?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletingAgent?.name}"? 
              This will remove the agent but keep all historical usage data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingAgent(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

