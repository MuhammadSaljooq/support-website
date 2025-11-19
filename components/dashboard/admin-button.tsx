"use client";

import { useState, useEffect } from "react";
import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function AdminDashboardButton() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const response = await fetch("/api/admin/check", {
        cache: "no-store",
      });
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.isAdmin);
      }
    } catch (error) {
      console.error("Error checking admin status:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading || !isAdmin) {
    return null;
  }

  return (
    <Button variant="outline" size="sm" asChild className="bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 border-red-200 dark:border-red-800">
      <Link href="/admin">
        <Shield className="h-4 w-4 mr-2 text-red-600 dark:text-red-400" />
        Admin Dashboard
      </Link>
    </Button>
  );
}

