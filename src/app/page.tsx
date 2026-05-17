import Link from "next/link";
import { Shield, Zap, Layout, ArrowRight } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-indigo-500/30 font-sans">
      {/* Navbar */}
      <nav className="border-b border-white/5 bg-black/20 backdrop-blur-md fixed top-0 w-full z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Logo className="h-8 w-8 text-white drop-shadow-md" />
            <span className="text-xl font-black tracking-tighter text-white">TeamDock</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Log in
            </Link>
            <Link href="/signup" className="text-sm font-bold bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-500 transition-all shadow-[0_0_15px_rgba(79,70,229,0.4)]">
              Get started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 pt-40 pb-24 text-center flex flex-col items-center relative overflow-hidden">
        
        {/* Dynamic Background */}
        <div className="absolute inset-0 z-0 pointer-events-none flex items-center justify-center">
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at center, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
          <div className="w-[800px] h-[800px] bg-indigo-500/15 blur-[120px] rounded-full animate-pulse" style={{ animationDuration: '4s' }} />
          <div className="absolute w-[600px] h-[600px] bg-cyan-500/10 blur-[100px] rounded-full animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
        </div>

        {/* CSS for custom fade up animation */}
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
          .animate-fade-up {
            opacity: 0;
            animation: fadeUp 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
          .delay-200 { animation-delay: 200ms; }
          .delay-400 { animation-delay: 400ms; }
          .delay-600 { animation-delay: 600ms; }
        `}} />

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-8 backdrop-blur-sm relative z-10 animate-fade-up">
          <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Enterprise-Grade</span>
          <span className="text-white/20">·</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">PWA-Ready</span>
        </div>
        
        <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-6 leading-[1.1] max-w-5xl relative z-10">
          <div className="animate-fade-up delay-200">Collaboration</div>
          <div className="animate-fade-up delay-400">you <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">control.</span></div>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mb-12 font-medium leading-relaxed relative z-10 animate-fade-up delay-600">
          A fast and simple way to manage your team's projects. Organize tasks beautifully and keep everyone on the same page.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 relative z-10 animate-fade-up delay-600">
          <Link href="/signup" className="flex items-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-[0_0_30px_rgba(79,70,229,0.3)]">
            Start for free <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/board" className="flex items-center gap-2 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full font-bold text-sm hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
            View dashboard
          </Link>
        </div>
        {/* App UI Mockup Frame */}
        <div className="w-full max-w-6xl mt-24 relative z-10 animate-fade-up delay-600 hidden md:block">
          {/* Top gradient fade so it blends perfectly into the black background */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent z-20 pointer-events-none" />
          
          {/* Dashboard Container */}
          <div className="rounded-xl border border-white/10 bg-[#090C15] overflow-hidden shadow-[0_0_80px_rgba(79,70,229,0.2)] flex flex-col h-[500px]">
            {/* macOS Browser Header */}
            <div className="h-12 w-full bg-[#13161C] border-b border-white/5 flex items-center px-4 shrink-0">
              <div className="flex gap-2">
                <div className="h-3 w-3 rounded-full bg-[#FF5F56] border border-black/20" />
                <div className="h-3 w-3 rounded-full bg-[#FFBD2E] border border-black/20" />
                <div className="h-3 w-3 rounded-full bg-[#27C93F] border border-black/20" />
              </div>
              <div className="mx-auto flex-1 flex justify-center">
                <div className="h-7 w-72 bg-[#090C15] rounded-md flex items-center justify-center px-3 border border-white/5 shadow-inner">
                  <div className="text-[10px] text-white/30 font-medium tracking-wide">teamdock.app/board</div>
                </div>
              </div>
              <div className="w-14" /> {/* Spacer to center the URL bar */}
            </div>

            {/* Application Wrapper */}
            <div className="flex flex-1 overflow-hidden">
            {/* Sidebar Mockup */}
            <div className="w-[240px] border-r border-white/5 bg-[#0E121B] flex flex-col pt-6 pb-4">
              {/* Logo */}
              <div className="px-5 mb-8 flex items-center gap-2">
                <div className="h-6 w-6 rounded bg-indigo-500 flex items-center justify-center">
                   <div className="h-3 w-3 bg-white rounded-sm" />
                </div>
                <div className="h-4 w-24 bg-white/90 rounded" />
              </div>
              
              {/* Workspace Badge */}
              <div className="px-4 mb-6">
                <div className="rounded-xl border border-white/5 bg-white/5 p-3">
                   <div className="h-2 w-16 bg-white/30 rounded mb-2" />
                   <div className="h-3 w-20 bg-white/90 rounded mb-2" />
                   <div className="h-2 w-24 bg-white/30 rounded" />
                </div>
              </div>
              
              {/* Compose Button */}
              <div className="px-4 mb-6">
                <div className="w-full rounded-xl bg-emerald-500 text-white font-bold text-xs py-3 flex items-center justify-center">
                   + Compose Task
                </div>
              </div>
              
              {/* Nav Links */}
              <div className="space-y-1 px-3">
                <div className="h-10 w-full bg-white/5 rounded-xl flex items-center px-3">
                   <div className="h-4 w-4 bg-indigo-400 rounded-md mr-3" />
                   <div className="h-3 w-16 bg-white/90 rounded" />
                </div>
                <div className="h-10 w-full rounded-xl flex items-center px-3">
                   <div className="h-4 w-4 bg-white/20 rounded-md mr-3" />
                   <div className="h-3 w-20 bg-white/40 rounded" />
                </div>
                <div className="h-10 w-full rounded-xl flex items-center px-3">
                   <div className="h-4 w-4 bg-white/20 rounded-md mr-3" />
                   <div className="h-3 w-12 bg-white/40 rounded" />
                </div>
              </div>
              
              {/* Projects Header */}
              <div className="mt-8 px-6">
                <div className="h-2 w-16 bg-white/30 rounded" />
              </div>
            </div>

            {/* Main Content Mockup */}
            <div className="flex-1 p-8 overflow-hidden bg-[#090C15]">
              
              {/* Header */}
              <div className="flex justify-between items-center mb-8">
                <div className="h-8 w-24 bg-white/90 rounded" />
                <div className="flex gap-4 items-center">
                  <div className="h-10 w-64 bg-[#111623] rounded-xl border border-white/5" />
                  <div className="h-8 w-8 bg-white/10 rounded-full" />
                </div>
              </div>

              {/* Stats Cards Row */}
              <div className="flex gap-4 mb-8">
                {[
                  { label: "TOTAL PROJECTS", val: "0" },
                  { label: "TOTAL TASKS", val: "1" },
                  { label: "ACTIVE MEMBERS", val: "2" },
                  { label: "COMPLETED", val: "0" },
                  { label: "OVERDUE", val: "0" },
                ].map((stat, i) => (
                  <div key={i} className="flex-1 bg-[#131823] border border-white/5 rounded-2xl p-4">
                    <div className="flex justify-between items-center mb-4">
                      <div className="h-2 w-16 bg-white/40 rounded" />
                      <div className="h-4 w-6 bg-emerald-500/20 rounded flex items-center justify-center">
                        <div className="h-1.5 w-3 bg-emerald-400 rounded-sm" />
                      </div>
                    </div>
                    <div className="h-7 w-6 bg-white/90 rounded" />
                  </div>
                ))}
              </div>

              {/* Grid Layout */}
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Assigned Tasks */}
                  <div className="bg-[#131823] border border-white/5 rounded-3xl p-6 h-[200px]">
                    <div className="flex justify-between items-center mb-6">
                      <div className="h-5 w-32 bg-white/90 rounded" />
                      <div className="h-1 w-4 bg-white/20 rounded" />
                    </div>
                    <div className="border border-white/5 rounded-xl bg-[#090C15] p-5 mb-4">
                      <div className="h-4 w-24 bg-white/80 rounded mb-4" />
                      <div className="flex gap-4">
                        <div className="h-2 w-16 bg-white/40 rounded" />
                        <div className="h-2 w-24 bg-orange-400/80 rounded" />
                      </div>
                    </div>
                  </div>
                  {/* People */}
                  <div className="bg-[#131823] border border-white/5 rounded-3xl p-6 h-[140px]">
                    <div className="flex justify-between items-center mb-6">
                      <div className="h-5 w-20 bg-white/90 rounded" />
                      <div className="h-8 w-8 bg-emerald-500 rounded-xl" />
                    </div>
                    <div className="flex gap-4">
                      <div className="h-14 w-14 rounded-full bg-indigo-500 flex items-center justify-center border-[3px] border-[#131823]">
                        <div className="h-4 w-4 bg-white/80 rounded-sm" />
                      </div>
                      <div className="h-14 w-14 rounded-full bg-indigo-500 flex items-center justify-center border-[3px] border-[#131823]">
                        <div className="h-4 w-4 bg-white/80 rounded-sm" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Projects */}
                  <div className="bg-[#131823] border border-white/5 rounded-3xl p-6 h-[180px]">
                    <div className="flex justify-between items-center mb-8">
                      <div className="h-5 w-24 bg-white/90 rounded" />
                      <div className="h-8 w-8 bg-emerald-500 rounded-xl" />
                    </div>
                    <div className="border border-white/5 border-dashed rounded-2xl h-[70px] bg-white/[0.01] flex items-center justify-center">
                       <div className="h-3 w-48 bg-white/20 rounded" />
                    </div>
                  </div>
                  {/* Private Notepad */}
                  <div className="bg-[#131823] border border-white/5 rounded-3xl p-6 h-[160px]">
                    <div className="h-5 w-32 bg-white/90 rounded mb-6" />
                    <div className="h-3 w-full bg-white/20 rounded mb-3" />
                    <div className="h-3 w-2/3 bg-white/20 rounded" />
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        </div>
      </main>

      {/* Feature Cards */}
      <div className="max-w-5xl mx-auto px-6 pb-32 relative z-10">
        <div className="grid md:grid-cols-3 gap-6">
          
          <div className="bg-[#111111] border border-white/5 p-8 rounded-[2rem] hover:border-indigo-500/30 transition-all duration-500 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-indigo-500/10">
            <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <Shield className="h-7 w-7 text-indigo-400" />
            </div>
            <h3 className="text-lg font-black text-white mb-3 tracking-tight">Total Privacy & Security</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-semibold">
              Keep your team's work completely private. You have full control over who can see, edit, or manage your projects.
            </p>
          </div>

          <div className="bg-[#111111] border border-white/5 p-8 rounded-[2rem] hover:border-cyan-500/30 transition-all duration-500 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-cyan-500/10">
            <div className="h-14 w-14 rounded-2xl bg-cyan-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <Zap className="h-7 w-7 text-cyan-400" />
            </div>
            <h3 className="text-lg font-black text-white mb-3 tracking-tight">Works Anywhere, Offline</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-semibold">
              Install the app directly to your phone or computer. It works lightning fast, even when you lose your internet connection.
            </p>
          </div>

          <div className="bg-[#111111] border border-white/5 p-8 rounded-[2rem] hover:border-emerald-500/30 transition-all duration-500 group hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-500/10">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
              <Layout className="h-7 w-7 text-emerald-400" />
            </div>
            <h3 className="text-lg font-black text-white mb-3 tracking-tight">Simple Task Boards</h3>
            <p className="text-sm text-slate-400 leading-relaxed font-semibold">
              Easily drag and drop tasks to organize your day. See exactly what your team is working on at a single glance.
            </p>
          </div>

        </div>
      </div>
      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center relative z-10">
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
          © 2026 TeamDock Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
