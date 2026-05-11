"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, ShieldCheck, Eye, EyeOff, Chrome, Apple, Facebook, Linkedin, UserPlus } from "lucide-react";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/Logo";

const COLORS = ["#6366f1", "#22d3ee", "#a855f7", "#f59e0b", "#ec4899", "#10b981"];

export default function SignUpPage() {
  const router = useRouter();
  const { createWorkspace, setCurrentUser } = useStore();
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !password || !workspaceName.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
    const displayName = name.trim();
    const initials = displayName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
    
    const newMemberBase = {
      id: `u_${Date.now()}`,
      name: displayName,
      email: email.trim(),
      role: "Workspace Admin",
      initials,
      color: randomColor
    };

    createWorkspace(workspaceName.trim(), newMemberBase);
    router.push("/board");
  };

  const handleSocialAuth = (provider: string) => {
    const mockEmail = `demo@${provider.toLowerCase()}.com`;
    const newMemberBase = {
      id: `u_${Date.now()}`,
      name: `${provider} User`,
      email: mockEmail,
      role: "Workspace Admin",
      initials: provider[0].toUpperCase(),
      color: COLORS[Math.floor(Math.random() * COLORS.length)]
    };
    
    createWorkspace(`${provider} Workspace`, newMemberBase);
    router.push("/board");
  };

  return (
    <div className="min-h-screen bg-[#f4f5f8] dark:bg-[#0a0f1e] flex items-center justify-center p-4 font-sans text-gray-900 dark:text-slate-100 relative transition-colors duration-300">
      <div className="z-10 max-w-5xl w-full bg-white dark:bg-[#111827] rounded-xl shadow-2xl flex overflow-hidden min-h-[600px] border border-gray-100 dark:border-white/10 transition-colors duration-300">
        
        {/* Left Side: Signup Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col">
          <div className="flex items-center gap-2 mb-10 text-slate-900 dark:text-white">
            <Logo className="h-10 w-10" />
            <span className="text-3xl font-bold tracking-tight">teamdock</span>
          </div>

          <div className="flex-1 max-w-sm w-full mx-auto">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">Create Account</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-8">Start collaborating with your team today.</p>

            <form onSubmit={handleAuth} className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                />
              </div>
              
              <div>
                <input
                  type="text"
                  placeholder="Workspace Name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                />
              </div>
              
              <div>
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                />
              </div>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 rounded-md border border-gray-300 dark:border-white/10 bg-white dark:bg-white/5 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-400 dark:placeholder-gray-500 text-sm pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && <p className="text-xs text-red-500 font-medium">{error}</p>}

              <button
                type="submit"
                className="w-full bg-[#007aff] hover:bg-blue-600 text-white font-bold py-3 rounded-md transition-colors text-sm shadow-sm mt-2"
              >
                Sign Up
              </button>
            </form>

            <div className="mt-8">
              <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold mb-3">Sign up with</p>
              <div className="flex gap-2">
                <button onClick={() => handleSocialAuth('Google')} className="h-10 w-10 flex items-center justify-center rounded bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 hover:bg-gray-100 dark:hover:bg-white/10 transition-colors">
                  <Chrome className="h-4 w-4 text-red-500" />
                </button>
                <button onClick={() => handleSocialAuth('Apple')} className="h-10 w-10 flex items-center justify-center rounded bg-black hover:bg-gray-800 transition-colors">
                  <Apple className="h-4 w-4 text-white" />
                </button>
              </div>
            </div>

            <div className="mt-8 text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <button onClick={() => router.push("/login")} className="text-[#007aff] hover:underline font-medium">
                Sign in
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Visual */}
        <div className="hidden md:flex w-1/2 bg-[#fafbfc] dark:bg-[#0d1117] border-l border-gray-100 dark:border-white/10 flex-col items-center justify-center p-12 text-center relative">
          <div className="relative w-64 h-64 mb-8">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-40 bg-white border-2 border-gray-800 rounded-xl shadow-xl flex flex-col items-center justify-center gap-3">
                <UserPlus className="h-12 w-12 text-[#007aff]" />
                <div className="text-xs font-bold text-gray-400">JOIN THE TEAM</div>
              </div>
            </div>
            <div className="absolute top-4 left-4 bg-white p-2 rounded-full shadow-lg border border-gray-100 animate-bounce">
              <Zap className="h-5 w-5 text-amber-500" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Scale with TeamDock</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs leading-relaxed">
            The most intuitive way to manage your team's tasks and visibility.
          </p>
        </div>

      </div>
    </div>
  );
}
