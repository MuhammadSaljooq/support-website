"use client";

import { useState, useEffect } from "react";
import { Database, Table, Search, RefreshCw, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table as DataTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { showToast } from "@/lib/toast";
import { format } from "date-fns";

interface TableInfo {
  name: string;
  rowCount: number;
  columns: string[];
}

interface TableData {
  columns: string[];
  rows: any[];
  total: number;
}

export default function AdminDatabasePage() {
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [tableData, setTableData] = useState<TableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(50);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (selectedTable) {
      fetchTableData();
    }
  }, [selectedTable, page, limit, search]);

  const fetchTables = async () => {
    try {
      const response = await fetch("/api/admin/database/tables");
      if (response.ok) {
        const data = await response.json();
        setTables(data.tables);
        if (data.tables.length > 0 && !selectedTable) {
          setSelectedTable(data.tables[0].name);
        }
      }
    } catch (error) {
      console.error("Error fetching tables:", error);
      showToast.error("Failed to fetch database tables");
    }
  };

  const fetchTableData = async () => {
    if (!selectedTable) return;

    setLoading(true);
    try {
      const params = new URLSearchParams({
        table: selectedTable,
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("search", search);

      const response = await fetch(`/api/admin/database/data?${params}`);
      if (response.ok) {
        const data = await response.json();
        setTableData(data);
      } else {
        showToast.error("Failed to fetch table data");
      }
    } catch (error) {
      console.error("Error fetching table data:", error);
      showToast.error("Failed to fetch table data");
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    if (!tableData) return;

    const headers = tableData.columns.join(",");
    const rows = tableData.rows.map((row) =>
      tableData.columns.map((col) => {
        const value = row[col];
        if (value === null || value === undefined) return "";
        if (typeof value === "object") return JSON.stringify(value);
        return String(value);
      }).join(",")
    );

    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${selectedTable}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    link.click();
    URL.revokeObjectURL(url);
    showToast.success("Data exported successfully");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Database Explorer
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Browse and manage database tables and records
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tables List */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Table className="h-5 w-5" />
              Tables
            </CardTitle>
            <CardDescription>Select a table to view</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-[600px] overflow-y-auto">
              {tables.map((table) => (
                <button
                  key={table.name}
                  onClick={() => {
                    setSelectedTable(table.name);
                    setPage(1);
                    setSearch("");
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                    selectedTable === table.name
                      ? "bg-gradient-to-r from-red-600 to-orange-600 text-white"
                      : "hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{table.name}</span>
                    <Badge
                      variant={selectedTable === table.name ? "secondary" : "outline"}
                      className={
                        selectedTable === table.name
                          ? "bg-white/20 text-white border-white/30"
                          : ""
                      }
                    >
                      {table.rowCount.toLocaleString()}
                    </Badge>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Table Data Viewer */}
        <div className="lg:col-span-3 space-y-6">
          {selectedTable ? (
            <>
              {/* Controls */}
              <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg">{selectedTable}</CardTitle>
                      <CardDescription>
                        {tableData?.total.toLocaleString() || 0} total records
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={fetchTableData}
                        disabled={loading}
                      >
                        <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                        Refresh
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExport}
                        disabled={!tableData}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Export
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Search records..."
                        value={search}
                        onChange={(e) => {
                          setSearch(e.target.value);
                          setPage(1);
                        }}
                        className="pl-10"
                      />
                    </div>
                    <Select
                      value={limit.toString()}
                      onValueChange={(value) => {
                        setLimit(parseInt(value));
                        setPage(1);
                      }}
                    >
                      <SelectTrigger className="w-full md:w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="25">25 rows</SelectItem>
                        <SelectItem value="50">50 rows</SelectItem>
                        <SelectItem value="100">100 rows</SelectItem>
                        <SelectItem value="200">200 rows</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Data Table */}
              <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900">
                <CardContent className="p-0">
                  {loading ? (
                    <div className="text-center py-12 text-slate-500">Loading...</div>
                  ) : tableData && tableData.rows.length > 0 ? (
                    <div className="overflow-x-auto">
                      <DataTable>
                        <TableHeader>
                          <TableRow>
                            {tableData.columns.map((col) => (
                              <TableHead key={col} className="font-semibold">
                                {col}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {tableData.rows.map((row, idx) => (
                            <TableRow key={idx}>
                              {tableData.columns.map((col) => (
                                <TableCell key={col} className="max-w-xs truncate">
                                  {row[col] === null || row[col] === undefined ? (
                                    <span className="text-slate-400 italic">null</span>
                                  ) : typeof row[col] === "object" ? (
                                    <code className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                                      {JSON.stringify(row[col]).slice(0, 50)}...
                                    </code>
                                  ) : (
                                    String(row[col])
                                  )}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </DataTable>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">No data found</div>
                  )}

                  {/* Pagination */}
                  {tableData && tableData.total > limit && (
                    <div className="flex items-center justify-between p-4 border-t border-slate-200 dark:border-slate-800">
                      <div className="text-sm text-slate-600 dark:text-slate-400">
                        Showing {(page - 1) * limit + 1} - {Math.min(page * limit, tableData.total)} of{" "}
                        {tableData.total}
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
                          disabled={page * limit >= tableData.total}
                        >
                          Next
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900">
              <CardContent className="py-12 text-center">
                <Database className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 dark:text-slate-400">
                  Select a table from the list to view its data
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

