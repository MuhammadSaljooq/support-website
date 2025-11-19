"use client";

import { useState, useEffect } from "react";
import { Users, Bot, Search, Mail, Calendar, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

interface UserWithAgents {
  id: string;
  name: string | null;
  email: string;
  role: "USER" | "ADMIN";
  createdAt: string;
  stats: {
    agents: number;
    apiKeys: number;
    usageRecords: number;
    transactions: number;
  };
}

export default function UsersWithAgentsPage() {
  const [users, setUsers] = useState<UserWithAgents[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchUsersWithAgents();
  }, [search]);

  const fetchUsersWithAgents = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/users?${params}&limit=100`);
      if (response.ok) {
        const data = await response.json();
        // Filter to only show users with agents
        const usersWithAgents = data.users.filter(
          (user: UserWithAgents) => user.stats.agents > 0
        );
        setUsers(usersWithAgents);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Users with Agents
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          View all users who have created agents
        </p>
      </div>

      {/* Search */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="h-6 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : users.length === 0 ? (
        <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900">
          <CardContent className="py-12 text-center">
            <Bot className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <p className="text-slate-600 dark:text-slate-400">
              {search ? "No users found matching your search" : "No users with agents found"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {users.map((user) => (
            <Card
              key={user.id}
              className="card-hover border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900"
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold text-lg">
                      {user.name?.[0]?.toUpperCase() || user.email[0].toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {user.name || "No name"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-1 mt-1">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </CardDescription>
                    </div>
                  </div>
                  {user.role === "ADMIN" && (
                    <Badge className="bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400">
                      Admin
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <div className="flex items-center gap-2">
                    <Bot className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                      Agents
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-lg font-semibold">
                    {user.stats.agents}
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-slate-500 dark:text-slate-500 text-xs">Usage Records</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {user.stats.usageRecords.toLocaleString()}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-500 dark:text-slate-500 text-xs">API Keys</div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {user.stats.apiKeys}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className="text-xs text-slate-500 dark:text-slate-500 flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    Joined {format(new Date(user.createdAt), "MMM yyyy")}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    asChild
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                  >
                    <Link href={`/admin/users/${user.id}/agents`}>
                      View Agents
                      <ArrowRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

