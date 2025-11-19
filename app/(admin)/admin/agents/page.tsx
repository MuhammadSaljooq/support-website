"use client";

import { useState, useEffect } from "react";
import { Bot, Search, Edit, Trash2, User, Calendar, MoreVertical, Activity, DollarSign } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input as FormInput } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { showToast } from "@/lib/toast";
import { format } from "date-fns";

interface AgentData {
  id: string;
  name: string;
  agentId: string | null;
  isActive: boolean;
  lastSyncedAt: string | null;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string | null;
    email: string;
  };
  usageCount: number;
  stats: {
    totalCalls: number;
    totalMinutes: number;
    totalCost: number;
  };
}

export default function AdminAgentsPage() {
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [userIdFilter, setUserIdFilter] = useState<string>("all");
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);
  const [editForm, setEditForm] = useState({
    name: "",
    isActive: true,
  });

  useEffect(() => {
    fetchAgents();
  }, [page, userIdFilter, activeFilter]);

  const fetchAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "20",
      });
      if (userIdFilter !== "all") params.append("userId", userIdFilter);
      if (activeFilter !== "all") params.append("isActive", activeFilter);

      const response = await fetch(`/api/admin/agents?${params}`);
      if (response.ok) {
        const data = await response.json();
        setAgents(data.agents);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching agents:", error);
      showToast.error("Failed to fetch agents");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (agent: AgentData) => {
    setSelectedAgent(agent);
    setEditForm({
      name: agent.name,
      isActive: agent.isActive,
    });
    setEditDialogOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedAgent) return;

    try {
      const response = await fetch(`/api/admin/agents?id=${selectedAgent.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });

      if (response.ok) {
        showToast.success("Agent updated successfully");
        setEditDialogOpen(false);
        fetchAgents();
      } else {
        const data = await response.json();
        showToast.error(data.error || "Failed to update agent");
      }
    } catch (error) {
      showToast.error("Failed to update agent");
    }
  };

  const handleDelete = async () => {
    if (!selectedAgent) return;

    try {
      const response = await fetch(`/api/admin/agents?id=${selectedAgent.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        showToast.success("Agent deleted successfully");
        setDeleteDialogOpen(false);
        fetchAgents();
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Agent Management
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Manage all agents across all users
        </p>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={activeFilter} onValueChange={(value) => {
              setActiveFilter(value);
              setPage(1);
            }}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="true">Active</SelectItem>
                <SelectItem value="false">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agents Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle>Agents ({pagination.total})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-12 text-slate-500">Loading...</div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12 text-slate-500">No agents found</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent</TableHead>
                    <TableHead>Owner</TableHead>
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
                        <div className="text-sm">
                          <div className="font-medium text-slate-900 dark:text-slate-100">
                            {agent.user.name || "No name"}
                          </div>
                          <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {agent.user.email}
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
                        <div className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
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
                            <DropdownMenuItem onClick={() => handleEdit(agent)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                setSelectedAgent(agent);
                                setDeleteDialogOpen(true);
                              }}
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

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Page {pagination.page} of {pagination.totalPages}
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(page + 1)}
                  disabled={page >= pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Agent</DialogTitle>
            <DialogDescription>
              Update agent information
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Agent Name</Label>
              <FormInput
                id="name"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isActive"
                checked={editForm.isActive}
                onCheckedChange={(checked) =>
                  setEditForm({ ...editForm, isActive: checked as boolean })
                }
              />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Agent</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAgent?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

