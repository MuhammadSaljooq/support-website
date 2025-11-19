"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
          Admin Settings
        </h1>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
          Configure admin panel settings
        </p>
      </div>

      <Card className="border-slate-200 dark:border-slate-800 shadow-elevation-2 bg-white dark:bg-slate-900">
        <CardHeader>
          <CardTitle>Coming Soon</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 dark:text-slate-400">
            Admin settings configuration coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

