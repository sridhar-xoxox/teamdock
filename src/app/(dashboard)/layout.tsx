"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { useStore } from "@/lib/store";
import { Menu } from "lucide-react";
import { Logo } from "@/components/Logo";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { currentUser } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!currentUser) {
      router.push("/login");
    }
  }, [currentUser, router]);

  if (!currentUser) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0a0f1e] text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* ── Gradient background ───────────────────────────────── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-indigo-600/20 blur-[120px]" />
        <div className="absolute -bottom-40 -right-40 h-[600px] w-[600px] rounded-full bg-cyan-500/15 blur-[120px]" />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <div className={`fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="h-full w-60">
          <Sidebar />
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden relative z-10 w-full">
        {/* Mobile Header */}
        <header className="flex h-16 items-center justify-between border-b border-white/10 bg-[#0d1117]/80 px-4 backdrop-blur-xl lg:hidden shrink-0">
          <div className="flex items-center gap-2.5 text-white">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-bold tracking-tight">
              teamdock
            </span>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <Menu className="h-6 w-6" />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
