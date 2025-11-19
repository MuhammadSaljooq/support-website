"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { 
  Activity, 
  DollarSign, 
  TrendingUp, 
  Users, 
  PhoneCall,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DashboardStatsSkeleton } from "@/components/ui/loading-skeletons";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { AdminDashboardButton } from "@/components/dashboard/admin-button";

interface DashboardStats {
  totalApiCalls: number;
  totalTokensUsed: number;
  totalCost: number;
  thisMonthApiCalls: number;
  thisMonthTokensUsed: number;
  thisMonthCost: number;
  currentBalance: number;
  agents: Array<{
    id: string;
    name: string;
    total: {
      apiCalls: number;
      tokensUsed: number;
      cost: number;
    };
    thisMonth: {
      apiCalls: number;
      tokensUsed: number;
      cost: number;
    };
  }>;
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats | null>(null);

  useEffect(() => {
    if (status === "authenticated") {
      fetchStats();
    } else if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/user/stats");
      if (response.ok) {
        const data = await response.json();
        setStats({
          totalApiCalls: data.stats.totalApiCalls || 0,
          totalTokensUsed: data.stats.totalTokensUsed || 0,
          totalCost: data.stats.totalCost || 0,
          thisMonthApiCalls: data.stats.thisMonthApiCalls || 0,
          thisMonthTokensUsed: data.stats.thisMonthTokensUsed || 0,
          thisMonthCost: data.stats.thisMonthCost || 0,
          currentBalance: data.stats.currentBalance || 0,
          agents: data.agents || [],
        });
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="space-y-8">
        <div>
          <div className="h-10 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse mb-3" />
          <div className="h-5 w-96 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
        </div>
        <DashboardStatsSkeleton />
      </div>
    );
  }

  if (!session) {
    router.push("/login");
    return null;
  }

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

  const statCards = [
    {
      title: "Total API Calls",
      value: formatNumber(stats?.totalApiCalls || 0),
      change: stats?.thisMonthApiCalls || 0,
      icon: PhoneCall,
      color: "blue",
      href: "/dashboard/usage",
    },
    {
      title: "Total Cost",
      value: formatCurrency(stats?.totalCost || 0),
      change: stats?.thisMonthCost || 0,
      icon: DollarSign,
      color: "green",
      href: "/dashboard/billing",
    },
    {
      title: "Tokens Used",
      value: formatNumber(stats?.totalTokensUsed || 0),
      change: stats?.thisMonthTokensUsed || 0,
      icon: Zap,
      color: "purple",
      href: "/dashboard/usage",
    },
    {
      title: "Active Agents",
      value: stats?.agents.length || 0,
      change: null,
      icon: Users,
      color: "indigo",
      href: "/dashboard/settings?tab=vapi",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Dashboard Overview
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Welcome back, <span className="font-medium text-slate-900 dark:text-slate-100">{session.user?.name || session.user?.email}</span>. Here's what's happening with your account.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/usage">
              <Activity className="h-4 w-4 mr-2" />
              View Analytics
            </Link>
          </Button>
          <AdminDashboardButton />
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          const isPositive = card.change !== null && card.change >= 0;
          
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
                    {isPositive ? (
                      <ArrowUpRight className="h-3 w-3 text-green-600 dark:text-green-400" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 text-red-600 dark:text-red-400" />
                    )}
                    <span className={isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}>
                      {formatNumber(Math.abs(card.change))} this month
                    </span>
                  </div>
                )}
                {card.change === null && (
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Configured agents
                  </p>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Agents Overview */}
      {stats && stats.agents.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
                Agent Performance
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Overview of your active AI agents
              </p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/dashboard/settings?tab=vapi">
                Manage Agents
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {stats.agents.slice(0, 4).map((agent) => (
              <Card 
                key={agent.id} 
                className="card-hover border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900"
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-semibold text-slate-900 dark:text-slate-100">
                      {agent.name}
                    </CardTitle>
                    <Badge variant="secondary" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border-green-200 dark:border-green-800">
                      Active
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Calls</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {formatNumber(agent.total.apiCalls)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Tokens</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {formatNumber(agent.total.tokensUsed)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 dark:text-slate-500 mb-1">Cost</p>
                      <p className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                        {formatCurrency(agent.total.cost)}
                      </p>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-500">This Month</span>
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {formatNumber(agent.thisMonth.apiCalls)} calls • {formatCurrency(agent.thisMonth.cost)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            Quick Actions
          </CardTitle>
          <CardDescription>
            Common tasks and shortcuts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4 flex-col items-start" asChild>
              <Link href="/dashboard/usage">
                <Activity className="h-5 w-5 mb-2 text-blue-600 dark:text-blue-400" />
                <span className="font-medium">View Usage</span>
                <span className="text-xs text-slate-500 dark:text-slate-500 mt-1">Analytics & Reports</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col items-start" asChild>
              <Link href="/dashboard/api-keys">
                <Zap className="h-5 w-5 mb-2 text-purple-600 dark:text-purple-400" />
                <span className="font-medium">API Keys</span>
                <span className="text-xs text-slate-500 dark:text-slate-500 mt-1">Manage keys</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col items-start" asChild>
              <Link href="/dashboard/billing">
                <DollarSign className="h-5 w-5 mb-2 text-green-600 dark:text-green-400" />
                <span className="font-medium">Billing</span>
                <span className="text-xs text-slate-500 dark:text-slate-500 mt-1">View invoices</span>
              </Link>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col items-start" asChild>
              <Link href="/dashboard/settings">
                <Clock className="h-5 w-5 mb-2 text-indigo-600 dark:text-indigo-400" />
                <span className="font-medium">Settings</span>
                <span className="text-xs text-slate-500 dark:text-slate-500 mt-1">Preferences</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
