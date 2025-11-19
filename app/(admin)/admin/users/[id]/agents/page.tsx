"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Bot, ArrowLeft, Edit, Trash2, MoreVertical, User, Activity, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { showToast } from "@/lib/toast";
import { format } from "date-fns";
import Link from "next/link";

interface AgentData {
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

interface UserData {
  id: string;
  name: string | null;
  email: string;
}

export default function UserAgentsPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;
  const [user, setUser] = useState<UserData | null>(null);
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchUserAndAgents();
    }
  }, [userId]);

  const fetchUserAndAgents = async () => {
    setLoading(true);
    try {
      // Fetch user info
      const userResponse = await fetch(`/api/admin/users/${userId}`);
      if (userResponse.ok) {
        const userData = await userResponse.json();
        setUser(userData.user);
      }

      // Fetch user's agents
      const agentsResponse = await fetch(`/api/admin/agents?userId=${userId}`);
      if (agentsResponse.ok) {
        const agentsData = await agentsResponse.json();
        setAgents(agentsData.agents);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      showToast.error("Failed to fetch user agents");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (agentId: string) => {
    if (!confirm("Are you sure you want to delete this agent?")) return;

    try {
      const response = await fetch(`/api/admin/agents?id=${agentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast.success("Agent deleted successfully");
        fetchUserAndAgents();
      } else {
        const data = await response.json();
        showToast.error(data.error || "Failed to delete agent");
      }
    } catch (error) {
      showToast.error("Failed to delete agent");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    }).format(value);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/users">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            User Agents
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            {user?.name || user?.email} - All agents
          </p>
        </div>
      </div>

      {/* User Info Card */}
      {user && (
        <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold">
                {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
              </div>
              <div>
                <div className="text-lg font-semibold">{user.name || "No name"}</div>
                <div className="text-sm text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {user.email}
                </div>
              </div>
            </CardTitle>
          </CardHeader>
        </Card>
      )}

      {/* Agents List */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle>Agents ({agents.length})</CardTitle>
          <CardDescription>
            All agents created by this user
          </CardDescription>
        </CardHeader>
        <CardContent>
          {agents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <Bot className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <p>No agents found for this user</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage Stats</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agents.map((agent) => (
                    <TableRow key={agent.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                            <Bot className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {agent.name}
                            </div>
                            {agent.agentId && (
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                ID: {agent.agentId.slice(0, 8)}...
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {agent.isActive ? (
                          <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Inactive</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
                          <div className="flex items-center gap-1">
                            <Activity className="h-3 w-3" />
                            {agent.stats.totalCalls.toLocaleString()} calls
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatCurrency(agent.stats.totalCost)}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-slate-600 dark:text-slate-400">
                          {format(new Date(agent.createdAt), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleDelete(agent.id)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

