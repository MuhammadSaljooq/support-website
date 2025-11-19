"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, usePathname } from "next/navigation";
import { Sidebar } from "@/components/admin/sidebar";
import { Navbar } from "@/components/admin/navbar";
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  // Don't apply admin layout to login page - render it directly
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  useEffect(() => {
    const checkAdmin = async () => {
      // If session is still loading, wait
      if (status === "loading") {
        setCheckingAdmin(true);
        return;
      }

      setCheckingAdmin(true);

      if (status === "unauthenticated") {
        router.push("/admin/login");
        setCheckingAdmin(false);
        return;
      }

      if (status === "authenticated" && session?.user?.id) {
        try {
          const response = await fetch("/api/admin/check", {
            cache: "no-store",
          });
          
          if (response.ok) {
            const data = await response.json();
            setIsAdmin(data.isAdmin);
            
            if (!data.isAdmin) {
              router.push("/admin/login");
              setCheckingAdmin(false);
              return;
            }
            // Admin check passed
            setCheckingAdmin(false);
          } else {
            console.error("Admin check failed:", response.status);
            router.push("/admin/login");
            setCheckingAdmin(false);
            return;
          }
        } catch (error) {
          console.error("Admin check error:", error);
          router.push("/admin/login");
          setCheckingAdmin(false);
          return;
        }
      } else {
        // Not authenticated but not loading either
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, [session, status, router]);

  // Show loading while checking session or admin status
  if (status === "loading" || checkingAdmin || !isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:border-r lg:border-slate-200 dark:lg:border-slate-800 bg-white dark:bg-slate-900 shadow-elevation-1">
        <Sidebar onNavigate={() => {}} />
      </aside>

      {/* Mobile Sidebar Sheet */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <Sidebar onNavigate={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar onMenuClick={() => setMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
          <div className="container mx-auto px-4 py-8 lg:px-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

