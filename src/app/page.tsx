"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Zap, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, 
  FolderKanban, Users, ClipboardList, Flame, Star, Kanban
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
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
              <Logo className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              teamdock
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="px-4 py-2 rounded-xl text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 rounded-xl text-sm font-black bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-500 hover:shadow-indigo-500/30 hover:scale-102 active:scale-98 transition-all"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-6 max-w-7xl mx-auto text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/5 border border-emerald-500/20 dark:border-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" />
            Sprint Planning & Team Sync
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-slate-950 dark:text-white leading-[1.1]">
            Get your projects <br />
            <span className="bg-gradient-to-r from-emerald-500 to-indigo-500 bg-clip-text text-transparent">done, together.</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed font-semibold">
            Create custom team workspaces, manage project roles, prioritize sprint tasks, and keep meeting notes updated in real-time.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-black bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-xl shadow-emerald-500/20 hover:opacity-95 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group text-sm"
            >
              <span>Build Workspace</span>
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold bg-white dark:bg-[#2c2c2e]/60 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/5 shadow-sm hover:bg-slate-50 dark:hover:bg-[#2c2c2e]/80 transition-all text-sm"
            >
              Join Existing Team
            </Link>
          </div>
        </div>

        {/* 3D Perspective Dashboard Graphic Mockup */}
        <div className="mt-16 max-w-5xl mx-auto px-4 [perspective:1200px]">
          <div className="relative w-full rounded-[2rem] border border-slate-200/50 dark:border-white/5 bg-white/40 dark:bg-[#1e2330]/40 backdrop-blur-xl p-3 sm:p-5 shadow-2xl transition-all duration-700 ease-out md:[transform:rotateX(10deg)_rotateY(-6deg)_rotateZ(1deg)] md:hover:[transform:none] group">
            {/* Glossy overlay effect */}
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-transparent to-indigo-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none rounded-[2rem]" />
            
            <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-white/5 shadow-lg bg-[#0f121d] relative h-64 sm:h-auto sm:aspect-[1.7]">
              {/* Fake Window header bar */}
              <div className="h-8 bg-slate-950 flex items-center px-4 justify-between border-b border-slate-800">
                <div className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-amber-500"></div>
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
                </div>
                <div className="text-[9px] font-mono text-slate-500 uppercase tracking-widest font-bold">
                  teamdock-app-preview
                </div>
                <div className="w-10"></div>
              </div>

              {/* Simulated UI Content */}
              <div className="p-4 h-[calc(100%-2rem)] bg-[#0f121d] text-left flex flex-col justify-between select-none">
                <div className="grid grid-cols-12 gap-4 h-[85%]">
                  {/* Sidebar UI Mock */}
                  <div className="hidden md:block col-span-3 border-r border-white/5 pr-3 space-y-4">
                    <div className="h-8 bg-white/5 rounded-lg flex items-center px-2.5 gap-2">
                      <div className="w-4 h-4 rounded bg-emerald-500 apple-bubble"></div>
                      <div className="h-2 w-14 bg-white/20 rounded"></div>
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="h-6 bg-white/10 rounded-lg"></div>
                      <div className="h-6 bg-white/5 rounded-lg"></div>
                      <div className="h-6 bg-white/5 rounded-lg"></div>
                    </div>
                  </div>

                  {/* Main Sprint Board UI Mock */}
                  <div className="col-span-12 md:col-span-9 space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-white/5">
                      <div className="h-4 w-28 bg-white/20 rounded"></div>
                      <div className="flex gap-1">
                        <div className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] flex items-center justify-center font-bold">T</div>
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] flex items-center justify-center font-bold">K</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {/* Column 1 */}
                      <div className="bg-white/5 p-3 rounded-xl border border-white/5 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">To Do</span>
                          <span className="text-[9px] font-bold text-slate-500 bg-white/10 px-1.5 py-0.5 rounded-full">3</span>
                        </div>
                        <div className="bg-[#161a29] p-2 rounded-lg border border-white/5 space-y-2 hover:border-emerald-500/30 transition-all">
                          <div className="h-2 w-full bg-white/20 rounded"></div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-[8px] px-1 bg-emerald-500/20 text-emerald-400 rounded">Normal</span>
                            <div className="w-4 h-4 rounded-full bg-indigo-500 text-white text-[8px] flex items-center justify-center font-bold">U</div>
                          </div>
                        </div>
                      </div>

                      {/* Column 2 */}
                      <div className="hidden sm:block bg-white/5 p-3 rounded-xl border border-white/5 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-amber-400 uppercase tracking-wider">In Progress</span>
                          <span className="text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-full">1</span>
                        </div>
                        <div className="bg-[#161a29] p-2 rounded-lg border border-white/5 space-y-2 border-l-2 border-l-amber-500">
                          <div className="h-2 w-full bg-white/20 rounded"></div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-[8px] px-1 bg-amber-500/20 text-amber-400 rounded">High</span>
                            <div className="w-4 h-4 rounded-full bg-emerald-500 text-white text-[8px] flex items-center justify-center font-bold">M</div>
                          </div>
                        </div>
                      </div>

                      {/* Column 3 */}
                      <div className="hidden sm:block bg-white/5 p-3 rounded-xl border border-white/5 space-y-2.5">
                        <div className="flex justify-between items-center">
                          <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-wider">Done</span>
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full">8</span>
                        </div>
                        <div className="bg-[#161a29]/65 p-2 rounded-lg border border-white/5 space-y-2 opacity-60">
                          <div className="h-2 w-full bg-white/20 rounded line-through"></div>
                          <div className="flex justify-between items-center pt-1">
                            <span className="text-[8px] px-1 bg-slate-500/20 text-slate-400 rounded">Done</span>
                            <div className="w-4 h-4 rounded-full bg-slate-600 text-white text-[8px] flex items-center justify-center font-bold">✓</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Status Ribbon */}
                <div className="flex items-center gap-1.5 text-slate-500 text-[10px] font-semibold">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Secured with role-based policies</span>
                </div>
              </div>
            </div>

            {/* Hover Floating Mini Cards (Layered 3D details) */}
            <div className="absolute top-12 -right-8 bg-[#1f2433]/90 backdrop-blur border border-white/10 p-3 rounded-2xl shadow-2xl flex items-center gap-3 transition-transform duration-500 group-hover:translate-x-2 group-hover:-translate-y-2 hidden md:flex">
              <div className="h-7 w-7 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center"><Flame className="h-4 w-4" /></div>
              <div>
                <p className="text-[10px] font-bold text-white leading-none">High Priority Tasks</p>
                <span className="text-[9px] text-slate-400">Sprint Ending Soon</span>
              </div>
            </div>

            <div className="absolute bottom-8 -left-6 bg-[#1f2433]/90 backdrop-blur border border-white/10 p-3 rounded-2xl shadow-2xl flex items-center gap-3 transition-transform duration-500 group-hover:-translate-x-2 group-hover:translate-y-2 hidden md:flex">
              <div className="h-7 w-7 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center"><Star className="h-4 w-4" /></div>
              <div>
                <p className="text-[10px] font-bold text-white leading-none">Workspace Joined</p>
                <span className="text-[9px] text-slate-400">Active Sync Online</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Simplified Features Section */}
      <section className="py-16 border-t border-slate-200/50 dark:border-white/5 bg-slate-50/50 dark:bg-[#1a1f2e]/25">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-md mx-auto mb-12 space-y-2">
            <h2 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              Everything your sprint needs.
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold">
              No bloated tools. Just pure collaborative task management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#2c2c2e] border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-4">
                <FolderKanban className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-base font-black tracking-tight mb-1.5">Workspaces</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Create custom hubs for each project team. Keep tasks organized and focused.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#2c2c2e] border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-xl bg-indigo-500/15 flex items-center justify-center text-indigo-600 dark:text-indigo-400 mb-4">
                <Users className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-base font-black tracking-tight mb-1.5">Access Roles</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Set Owner, Manager, or Member access controls to manage tasks and permissions securely.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white dark:bg-[#2c2c2e] border border-slate-200/50 dark:border-white/5 shadow-sm hover:shadow-md transition-all">
              <div className="h-10 w-10 rounded-xl bg-purple-500/15 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-4">
                <ClipboardList className="h-5.5 w-5.5" />
              </div>
              <h3 className="text-base font-black tracking-tight mb-1.5">Notepad</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-semibold">
                Write quick details and meeting items with markdown helpers. Saves instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Minimal Footer */}
      <footer className="border-t border-slate-200/50 dark:border-white/5 py-3.5 bg-slate-50 dark:bg-[#1a1f2e]/45">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center text-[11px] font-bold text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <Logo className="h-5 w-5 text-slate-400" />
            <span className="font-black text-slate-500 dark:text-slate-400 uppercase tracking-tight">teamdock</span>
          </div>
          <div>
            © 2026 TEAMDOCK.
          </div>
        </div>
      </footer>
    </div>
  );
}
