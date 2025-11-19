"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Activity,
  CreditCard,
  Key,
  Settings,
  Home,
} from "lucide-react";
import { AdminDashboardLink } from "@/components/dashboard/admin-link";

const navigation = [
  {
    name: "Overview",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    name: "Usage",
    href: "/dashboard/usage",
    icon: Activity,
  },
  {
    name: "Billing",
    href: "/dashboard/billing",
    icon: CreditCard,
  },
  {
    name: "API Keys",
    href: "/dashboard/api-keys",
    icon: Key,
  },
  {
    name: "Settings",
    href: "/dashboard/settings",
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
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
          <span className="text-white font-bold text-sm">VA</span>
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-base text-slate-900 dark:text-slate-100 leading-tight">
            VoiceAgent
          </span>
          <span className="text-xs text-slate-500 dark:text-slate-400 leading-tight">
            Dashboard
          </span>
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {/* Homepage Link */}
        <Link
          href="/"
          onClick={handleNavigation}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 mb-2"
        >
          <Home className="h-4 w-4" />
          Back to Homepage
        </Link>
        
        {/* Admin Dashboard Link */}
        <AdminDashboardLink />
        
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
                    ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
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
        <div className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50">
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
            Need Help?
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-500">
            Contact support
          </p>
        </div>
      </div>
    </div>
  );
}

