"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Bot,
  BarChart3,
  Settings,
  Home,
  Shield,
  Database,
} from "lucide-react";

const navigation = [
  {
    name: "Overview",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    name: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    name: "Users with Agents",
    href: "/admin/users-with-agents",
    icon: Bot,
  },
  {
    name: "All Agents",
    href: "/admin/agents",
    icon: Bot,
  },
  {
    name: "Database",
    href: "/admin/database",
    icon: Database,
  },
  {
    name: "Analytics",
    href: "/admin/analytics",
    icon: BarChart3,
  },
  {
    name: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

interface SidebarProps {
  className?: string;
  onNavigate?: () => void;
}

export function Sidebar({ className, onNavigate }: SidebarProps) {
  const pathname = usePathname();

  const handleNavigation = () => {
    if (onNavigate) {
      onNavigate();
    }
  };

  return (
    <div className={cn("flex flex-col h-full bg-white dark:bg-slate-900", className)}>
      {/* Logo/Brand Section */}
      <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-200 dark:border-slate-800">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 via-red-500 to-orange-600 flex items-center justify-center shadow-lg shadow-red-500/20">
          <Shield className="h-5 w-5 text-white" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base text-slate-900 dark:text-slate-100 leading-tight">
            Admin Panel
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
            VoiceAgent
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Dashboard Link */}
        <Link
          href="/dashboard"
          onClick={handleNavigation}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 mb-2"
        >
          <Home className="h-4 w-4" />
          Back to Dashboard
        </Link>
        
        {/* Divider */}
        <div className="h-px bg-slate-200 dark:bg-slate-800 my-3" />
        
        {/* Navigation Items */}
        <div className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={handleNavigation}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative group",
                  isActive
                    ? "bg-gradient-to-r from-red-600 to-orange-600 text-white shadow-lg shadow-red-500/25"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
                )}
              >
                <Icon className={cn(
                  "h-4 w-4 transition-transform",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )} />
                <span>{item.name}</span>
                {isActive && (
                  <div className="absolute right-2 w-1.5 h-1.5 rounded-full bg-white/80" />
                )}
              </Link>
            );
          })}
        </div>
      </nav>
      
      {/* Footer Section */}
      <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800">
        <div className="px-3 py-2 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-xs font-medium text-red-700 dark:text-red-400 mb-1">
            Admin Access
          </p>
          <p className="text-xs text-red-600 dark:text-red-500">
            Full system control
          </p>
        </div>
      </div>
    </div>
  );
}

