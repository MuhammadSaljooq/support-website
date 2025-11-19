"use client";

import { useState, useEffect } from "react";
import { DateRange } from "react-day-picker";
import { DateRangePicker } from "@/components/dashboard/date-range-picker";
import { UsageCharts } from "@/components/dashboard/usage-charts";
import { UsageTable } from "@/components/dashboard/usage-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { subDays, format } from "date-fns";
import { ChartSkeleton, UsageTableSkeleton } from "@/components/ui/loading-skeletons";
import { showToast } from "@/lib/toast";

interface UsageItem {
  id: string;
  timestamp: string;
  apiCalls: number;
  tokensUsed: number;
  cost: number;
  agentId?: string | null;
  agentName?: string | null;
}

interface AnalyticsData {
  dailyData: {
    date: string;
    apiCalls: number;
    tokensUsed: number;
    cost: number;
  }[];
  totals: {
    apiCalls: number;
    tokensUsed: number;
    cost: number;
  };
}

interface VapiAgent {
  id: string;
  name: string;
}

export default function UsagePage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [endpointFilter, setEndpointFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");
  const [agents, setAgents] = useState<VapiAgent[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [usageData, setUsageData] = useState<UsageItem[]>([]);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [loadingAnalytics, setLoadingAnalytics] = useState(true);

  // Fetch available agents
  useEffect(() => {
    const fetchAgents = async () => {
      try {
        const response = await fetch("/api/vapi/agents");
        if (response.ok) {
          const data = await response.json();
          setAgents(data.agents || []);
        }
      } catch (error) {
        console.error("Error fetching agents:", error);
      }
    };
    fetchAgents();
  }, []);

  const fetchUsageData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (dateRange?.from) {
        params.append("startDate", format(dateRange.from, "yyyy-MM-dd"));
      }
      if (dateRange?.to) {
        params.append("endDate", format(dateRange.to, "yyyy-MM-dd"));
      }
      if (statusFilter !== "all") {
        params.append("status", statusFilter);
      }
      if (endpointFilter !== "all") {
        params.append("endpoint", endpointFilter);
      }
      if (agentFilter !== "all") {
        params.append("agentId", agentFilter);
      }

      const response = await fetch(`/api/dashboard/usage/detailed?${params}`);
      if (response.ok) {
        const data = await response.json();
        setUsageData(data.data);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching usage data:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const params = new URLSearchParams();
      if (dateRange?.from) {
        params.append("startDate", format(dateRange.from, "yyyy-MM-dd"));
      }
      if (dateRange?.to) {
        params.append("endDate", format(dateRange.to, "yyyy-MM-dd"));
      }
      if (agentFilter !== "all") {
        params.append("agentId", agentFilter);
      }

      const response = await fetch(
        `/api/dashboard/usage/analytics?${params}`
      );
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      }
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  useEffect(() => {
    fetchUsageData();
  }, [page, limit, dateRange, statusFilter, endpointFilter, agentFilter]);

  useEffect(() => {
    fetchAnalytics();
  }, [dateRange, agentFilter]);

  const handleExportCSV = () => {
    if (usageData.length === 0) return;

    const headers = ["Timestamp", "Agent", "API Calls", "Tokens Used", "Cost"];
    const rows = usageData.map((item) => [
      new Date(item.timestamp).toISOString(),
      item.agentName || "N/A",
      item.apiCalls.toString(),
      item.tokensUsed.toString(),
      item.cost.toFixed(4),
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map((row) => row.join(",")),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `usage-export-${format(new Date(), "yyyy-MM-dd")}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast.success("Usage data exported to CSV");
  };

  const handleResetFilters = () => {
    setDateRange({
      from: subDays(new Date(), 30),
      to: new Date(),
    });
    setStatusFilter("all");
    setEndpointFilter("all");
    setAgentFilter("all");
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Usage Analytics</h1>
        <p className="text-muted-foreground">
          Monitor your API usage, token consumption, and costs
        </p>
      </div>

      {/* Filters */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <DateRangePicker
              date={dateRange}
              onDateChange={setDateRange}
              className="w-full md:w-auto"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={endpointFilter} onValueChange={setEndpointFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Endpoint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Endpoints</SelectItem>
                <SelectItem value="chat">Chat</SelectItem>
                <SelectItem value="completion">Completion</SelectItem>
                <SelectItem value="embedding">Embedding</SelectItem>
              </SelectContent>
            </Select>
            <Select value={agentFilter} onValueChange={setAgentFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Agent" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Agents</SelectItem>
                {agents.map((agent) => (
                  <SelectItem key={agent.id} value={agent.id}>
                    {agent.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleResetFilters} variant="outline">
              Reset Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {analyticsData && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">
              {agentFilter !== "all" 
                ? `Metrics for ${agents.find(a => a.id === agentFilter)?.name || "Selected Agent"}`
                : "Total Metrics (All Agents)"}
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900 card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total API Calls
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {analyticsData.totals.apiCalls.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900 card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Tokens Used
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  {analyticsData.totals.tokensUsed.toLocaleString()}
                </div>
              </CardContent>
            </Card>
            <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900 card-hover">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Total Cost
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                  ${analyticsData.totals.cost.toFixed(4)}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Charts */}
      {loadingAnalytics ? (
        <ChartSkeleton />
      ) : analyticsData ? (
        <UsageCharts data={analyticsData.dailyData} />
      ) : (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No analytics data available
          </CardContent>
        </Card>
      )}

      {/* Usage Table */}
      {loading ? (
        <UsageTableSkeleton />
      ) : (
        <UsageTable
          data={usageData}
          pagination={pagination}
          onPageChange={setPage}
          onLimitChange={(newLimit) => {
            setLimit(newLimit);
            setPage(1);
          }}
          onExport={handleExportCSV}
        />
      )}
    </div>
  );
}
