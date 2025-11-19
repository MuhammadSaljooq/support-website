"use client";

import { useState, useEffect } from "react";
import { 
  Users, 
  Bot, 
  Activity, 
  DollarSign,
  TrendingUp,
  UserPlus,
  ArrowUpRight,
  CreditCard,
  Shield,
  Settings,
  Database,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface AdminStats {
  users: {
    total: number;
    admins: number;
    regular: number;
    recent: number;
  };
  agents: {
    total: number;
    active: number;
    inactive: number;
  };
  usage: {
    total: {
      apiCalls: number;
      tokensUsed: number;
      cost: number;
      records: number;
    };
    thisMonth: {
      apiCalls: number;
      tokensUsed: number;
      cost: number;
    };
  };
  subscriptions: Record<string, number>;
}

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
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

  const formatNumber = (value: number) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toLocaleString();
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-3" />
          <div className="h-5 w-96 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-slate-200 dark:border-slate-800">
              <CardHeader>
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-32 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats?.users.total || 0,
      change: stats?.users.recent || 0,
      icon: Users,
      color: "blue",
      href: "/admin/users",
    },
    {
      title: "Total Agents",
      value: stats?.agents.total || 0,
      change: stats?.agents.active || 0,
      icon: Bot,
      color: "purple",
      href: "/admin/agents",
      changeLabel: "Active",
    },
    {
      title: "Total Cost",
      value: formatCurrency(stats?.usage.total.cost || 0),
      change: stats?.usage.thisMonth.cost || 0,
      icon: DollarSign,
      color: "green",
      href: "/admin/analytics",
      changeLabel: "This Month",
    },
    {
      title: "API Calls",
      value: formatNumber(stats?.usage.total.apiCalls || 0),
      change: stats?.usage.thisMonth.apiCalls || 0,
      icon: Activity,
      color: "indigo",
      href: "/admin/analytics",
      changeLabel: "This Month",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Manage users, agents, and monitor system-wide analytics
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/users">
              <Users className="h-4 w-4 mr-2" />
              Manage Users
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/admin/database">
              <Database className="h-4 w-4 mr-2" />
              Database
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const isPositive = card.change >= 0;
          
          return (
            <Card 
              key={card.title} 
              className="card-hover border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  {card.title}
                </CardTitle>
                <div className={cn(
                  "p-2 rounded-lg",
                  card.color === "blue" && "bg-blue-50 dark:bg-blue-900/20",
                  card.color === "green" && "bg-green-50 dark:bg-green-900/20",
                  card.color === "purple" && "bg-purple-50 dark:bg-purple-900/20",
                  card.color === "indigo" && "bg-indigo-50 dark:bg-indigo-900/20"
                )}>
                  <Icon className={cn(
                    "h-4 w-4",
                    card.color === "blue" && "text-blue-600 dark:text-blue-400",
                    card.color === "green" && "text-green-600 dark:text-green-400",
                    card.color === "purple" && "text-purple-600 dark:text-purple-400",
                    card.color === "indigo" && "text-indigo-600 dark:text-indigo-400"
                  )} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                  {card.value}
                </div>
                {card.change !== null && (
                  <div className="flex items-center gap-1 text-xs">
                    <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                    <span className="text-slate-500 dark:text-slate-500">
                      {card.changeLabel || "This Month"}: {typeof card.change === "number" && card.change < 1000 ? card.change.toLocaleString() : formatNumber(Math.abs(card.change))}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Breakdown */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              User Breakdown
            </CardTitle>
            <CardDescription>User roles and distribution</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-slate-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Regular Users</span>
              </div>
              <Badge variant="secondary">{stats?.users.regular || 0}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-red-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Admins</span>
              </div>
              <Badge variant="destructive">{stats?.users.admins || 0}</Badge>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <UserPlus className="h-4 w-4 text-blue-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">New Users (7d)</span>
              </div>
              <Badge variant="outline">{stats?.users.recent || 0}</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Agent Status */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
              Agent Status
            </CardTitle>
            <CardDescription>Agent activity overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-green-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Active Agents</span>
              </div>
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                {stats?.agents.active || 0}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-slate-400" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Inactive Agents</span>
              </div>
              <Badge variant="secondary">{stats?.agents.inactive || 0}</Badge>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm text-slate-600 dark:text-slate-400">Total Agents</span>
              </div>
              <Badge variant="outline">{stats?.agents.total || 0}</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Quick Actions
          </CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col items-start" asChild>
              <Link href="/admin/users">
                <Users className="h-5 w-5 mb-2 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">Manage Users</span>
                <span className="text-xs text-slate-500 dark:text-slate-500 mt-1">View & edit users</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col items-start" asChild>
              <Link href="/admin/agents">
                <Bot className="h-5 w-5 mb-2 text-purple-600 dark:text-purple-400" />
                <span className="font-medium">Manage Agents</span>
                <span className="text-xs text-slate-500 dark:text-slate-500 mt-1">All user agents</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col items-start" asChild>
              <Link href="/admin/analytics">
                <Activity className="h-5 w-5 mb-2 text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium">Analytics</span>
                <span className="text-xs text-slate-500 dark:text-slate-500 mt-1">System metrics</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col items-start" asChild>
              <Link href="/admin/settings">
                <Settings className="h-5 w-5 mb-2 text-slate-600 dark:text-slate-400" />
                <span className="font-medium">Settings</span>
                <span className="text-xs text-slate-500 dark:text-slate-500 mt-1">Admin config</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

