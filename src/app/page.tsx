"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Zap, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, 
  FolderKanban, Users, ClipboardList, CheckSquare, 
  Laptop, Calendar, Keyboard
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function LandingPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-[#f2f2f7] dark:bg-[#1c1c1e] text-slate-900 dark:text-slate-100 font-sans relative transition-colors duration-500 overflow-x-hidden">
      {/* Background Gradient Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[50%] rounded-full bg-emerald-500/10 blur-[150px] dark:bg-emerald-500/5 pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[50%] rounded-full bg-indigo-500/10 blur-[150px] dark:bg-indigo-500/5 pointer-events-none" />

      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-[#f2f2f7]/80 dark:bg-[#1c1c1e]/80 border-b border-slate-200/50 dark:border-white/5 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
              <Logo className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              teamdock
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="px-5 py-2.5 rounded-2xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="px-5 py-2.5 rounded-2xl text-sm font-black bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:shadow-indigo-500/30 hover:scale-102 active:scale-98 transition-all"
            >
              Get Started Free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-24 px-6 max-w-7xl mx-auto text-center">
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Next-Gen Collaborative Task Management
          </div>
          
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.1] md:leading-[1.05]">
            Where team projects <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-500 to-indigo-500 bg-clip-text text-transparent">dock & collaborate.</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
            Plan sprints, track task assignees, manage user roles, and take interactive notes. Keep your team synchronized in one gorgeous, unified dashboard.
          </p>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-black bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/20 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group text-base"
            >
              <span>Build Your Workspace</span>
              <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold bg-white dark:bg-[#2c2c2e]/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5 shadow-sm hover:bg-slate-50 dark:hover:bg-[#2c2c2e]/80 transition-all text-base"
            >
              Access Existing Team
            </Link>
          </div>
        </div>

        {/* Dashboard Mockup Showcase */}
        <div className="mt-20 max-w-5xl mx-auto rounded-[2.5rem] bg-white/70 dark:bg-[#2c2c2e]/40 backdrop-blur-xl border border-white/50 dark:border-white/5 p-4 sm:p-6 shadow-2xl relative overflow-hidden group">
          <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
          
          <div className="rounded-2xl overflow-hidden border border-slate-100 dark:border-white/5 shadow-lg bg-slate-900 relative aspect-[1.6]">
            {/* Header Toolbar */}
            <div className="h-10 bg-slate-950 flex items-center px-4 justify-between border-b border-slate-800">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
              </div>
              <div className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                TeamDock Workspace Preview
              </div>
              <div className="w-14"></div>
            </div>

            {/* Content Mockup Graphic */}
            <div className="p-6 h-full bg-[#0f121d] text-left flex flex-col justify-between select-none">
              <div className="grid grid-cols-12 gap-5">
                {/* Mock Sidebar */}
                <div className="col-span-3 space-y-4">
                  <div className="h-10 bg-white/5 rounded-xl flex items-center px-3 gap-2">
                    <div className="w-5 h-5 rounded bg-emerald-500"></div>
                    <div className="h-3 w-20 bg-white/10 rounded"></div>
                  </div>
                  <div className="space-y-2.5 pt-2">
                    <div className="h-3 w-16 bg-white/10 rounded ml-2"></div>
                    <div className="h-8 bg-white/5 rounded-xl ml-2"></div>
                    <div className="h-8 bg-white/5 rounded-xl ml-2"></div>
                    <div className="h-8 bg-white/5 rounded-xl ml-2"></div>
                  </div>
                </div>

                {/* Mock Main Board */}
                <div className="col-span-9 space-y-5">
                  <div className="flex justify-between items-center">
                    <div className="h-6 w-32 bg-white/20 rounded"></div>
                    <div className="h-8 w-8 rounded-full bg-indigo-500/20"></div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    {/* Mock Stats */}
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                      <div className="h-2 w-12 bg-white/10 rounded"></div>
                      <div className="h-5 w-8 bg-white/20 rounded"></div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                      <div className="h-2 w-12 bg-white/10 rounded"></div>
                      <div className="h-5 w-8 bg-white/20 rounded"></div>
                    </div>
                    <div className="bg-white/5 p-4 rounded-2xl border border-white/5 space-y-2">
                      <div className="h-2 w-12 bg-white/10 rounded"></div>
                      <div className="h-5 w-8 bg-white/20 rounded"></div>
                    </div>
                  </div>

                  {/* Tasks List Mock */}
                  <div className="bg-white/5 p-5 rounded-[24px] border border-white/5 space-y-3">
                    <div className="h-3.5 w-24 bg-white/15 rounded"></div>
                    <div className="space-y-2">
                      <div className="h-10 bg-[#161a29] rounded-xl flex items-center justify-between px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-white/20"></div>
                          <div className="h-3 w-40 bg-white/10 rounded"></div>
                        </div>
                        <div className="h-5 w-12 bg-rose-500/20 rounded-full"></div>
                      </div>
                      <div className="h-10 bg-[#161a29] rounded-xl flex items-center justify-between px-3">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 rounded-full border border-white/20"></div>
                          <div className="h-3 w-32 bg-white/10 rounded"></div>
                        </div>
                        <div className="h-5 w-12 bg-indigo-500/20 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bottom bar */}
              <div className="flex items-center gap-2 text-slate-500 text-xs font-semibold py-2">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                <span>Runs securely on Supabase row-level security</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-[#1a1f2e]/25">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Everything your sprint needs.
            </h2>
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              A comprehensive toolkit for developers, designers, and managers to streamline sprint tasks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-8 rounded-[2rem] bg-white dark:bg-[#2c2c2e] border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-6">
                <FolderKanban className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black tracking-tight mb-2">Workspace & Projects</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Create dedicated workspaces and group tasks under specific projects. Keep work structured and focused.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-8 rounded-[2rem] bg-white dark:bg-[#2c2c2e] border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-6">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black tracking-tight mb-2">Access Roles</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Manage roles (Admin, Manager, Member) to control task assignment, project updates, and team deletions securely.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-8 rounded-[2rem] bg-white dark:bg-[#2c2c2e] border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-2xl bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-6">
                <ClipboardList className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black tracking-tight mb-2">Interactive Notepad</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                Draft quick ideas and meeting logs on the fly using built-in rich formatting. Auto-saved instantly to your browser storage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200/50 dark:border-white/5 py-12 text-center text-slate-400 text-sm font-semibold">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-6 w-6 rounded bg-emerald-500 flex items-center justify-center text-white">
              <Logo className="h-4 w-4" />
            </div>
            <span className="font-black text-slate-900 dark:text-white">teamdock</span>
          </div>
          <div>
            © 2026 TeamDock Inc. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
