"use client";
import React, { useState, useCallback } from "react";
import { Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Lock, Mail, User, HelpCircle, X, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { authService } from "@/services/auth.service";
import { workspaceService } from "@/services/workspace.service";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [pendingInvite, setPendingInvite] = useState<any>(null);
  const [checkingInvite, setCheckingInvite] = useState(false);

  const hasInvite = !!pendingInvite;

  // Check for a pending invite via server-side API (bypasses RLS for unauthenticated users)
  const checkInvite = useCallback(async (emailValue: string) => {
    const trimmed = emailValue.trim();
    if (!trimmed || !trimmed.includes("@") || !trimmed.includes(".")) {
      setPendingInvite(null);
      return;
    }
    setCheckingInvite(true);
    try {
      const res = await fetch(`/api/check-invite?email=${encodeURIComponent(trimmed)}`);
      const data = await res.json();
      setPendingInvite(data.invite || null);
    } catch {
      setPendingInvite(null);
    } finally {
      setCheckingInvite(false);
    }
  }, []);

  React.useEffect(() => {
    if (!isSignUp) { setPendingInvite(null); return; }
    const timer = setTimeout(() => checkInvite(email), 400);
    return () => clearTimeout(timer);
  }, [email, isSignUp, checkInvite]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        // --- SIGN UP ---
        if (!name.trim()) { setError("Please enter your full name."); setLoading(false); return; }
        if (password.length < 8) { setError("Password must be at least 8 characters."); setLoading(false); return; }
        if (!hasInvite && !workspaceName.trim()) { setError("Please enter a Workspace Name."); setLoading(false); return; }

        // 1. Create Supabase auth account
        const authData = await authService.signUp(email.trim(), password, name.trim());
        if (!authData?.user) throw new Error("Unable to create account. Please try again.");

        if (hasInvite && pendingInvite) {
          // 2a. INVITED: Accept invite via server-side API (service role, bypasses RLS).
          // We pass userId + userEmail directly because the server-side session cookie
          // is NOT yet available immediately after a client-side signUp().
          const res = await fetch('/api/accept-invite', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              inviteId: pendingInvite.id,
              workspaceId: pendingInvite.workspace_id,
              role: pendingInvite.role,
              userId: authData.user.id,
              userEmail: email.trim(),
            }),
          });
          const result = await res.json();
          if (!res.ok) throw new Error(result.error || 'Failed to join workspace. Please contact your admin.');

          // 3a. Redirect to the workspace they just joined
          window.location.href = "/board";
        } else {
          // 2b. NEW WORKSPACE: Create workspace for this user
          await workspaceService.createWorkspace(workspaceName.trim(), authData.user.id);

          // 3b. Hard redirect — forces full store re-init with the new session
          window.location.href = "/board";
        }
      } else {
        // --- SIGN IN ---
        await authService.signIn(email.trim(), password);
        window.location.href = "/board";
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      setError(err.message || "An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7] dark:bg-[#1c1c1e] flex items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100 relative transition-colors duration-500 overflow-hidden">
      
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-emerald-500/10 blur-[150px] dark:bg-emerald-500/5 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-emerald-600/15 blur-[180px] dark:bg-emerald-600/5 pointer-events-none" />

      {/* Main Glass Card */}
      <div className="z-10 max-w-5xl w-full bg-white/80 dark:bg-[#2c2c2e]/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl flex overflow-hidden min-h-[640px] border border-white/50 dark:border-white/5 transition-all duration-300">
        
        {/* Left: Auth Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-14 flex flex-col justify-between">
          
          {/* Logo */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white group">
              <Logo className="h-10 w-10 text-emerald-600 dark:text-white group-hover:scale-105 transition-transform duration-300" />
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                teamdock
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Guide</span>
            </button>
          </div>

          {/* Form */}
          <div className="flex-1 max-w-sm w-full mx-auto flex flex-col justify-center">
            <div className="mb-8">
              <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                {isSignUp ? (hasInvite ? "Join Your Team" : "Create Workspace") : "Welcome Back"}
              </h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                {isSignUp
                  ? hasInvite ? "Complete your registration to join the workspace." : "Build your collaborative playground in seconds."
                  : "Collaborate instantly on projects and milestones."}
              </p>
            </div>

            <form onSubmit={handleAuth} className="space-y-4">
              {/* Email */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="email"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold transition-all disabled:opacity-50"
                />
                {isSignUp && checkingInvite && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    <Loader2 className="h-4 w-4 text-slate-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Invite detected banner */}
              {isSignUp && hasInvite && pendingInvite && (
                <div className="bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/10 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Sparkles className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Workspace Invitation Detected
                    </h4>
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal mt-1">
                      You'll join <strong>{pendingInvite.workspaces?.name || "your team's workspace"}</strong> as{" "}
                      <strong className="capitalize">{pendingInvite.role}</strong> upon completing registration.
                    </p>
                  </div>
                </div>
              )}

              {/* Full Name — only on signup */}
              {isSignUp && (
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold transition-all disabled:opacity-50"
                  />
                </div>
              )}

              {/* Workspace Name — only on signup when NO invite */}
              {isSignUp && !hasInvite && (
                <div className="relative">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Workspace Name"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold transition-all disabled:opacity-50"
                  />
                </div>
              )}

              {/* Password */}
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold transition-all disabled:opacity-50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={loading}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {error && <p className="text-xs text-red-500 font-semibold px-1">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#248a54] hover:bg-[#34a86d] text-white font-black py-4 rounded-2xl transition-all duration-300 text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group active:scale-[0.98] mt-2 cursor-pointer disabled:opacity-75"
              >
                {loading ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Processing...</>
                ) : (
                  <>
                    <span>
                      {isSignUp
                        ? hasInvite ? "Join Workspace" : "Build Workspace"
                        : "Access Workspace"}
                    </span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Toggle Sign In / Sign Up */}
          <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
            {isSignUp ? "Have an account already? " : "New to TeamDock? "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); setPendingInvite(null); }}
              disabled={loading}
              className="text-[#248a54] dark:text-[#34a86d] hover:underline font-bold disabled:opacity-50"
            >
              {isSignUp ? "Sign In" : "Sign up free"}
            </button>
          </div>
        </div>

        {/* Right: Visual Panel */}
        <div className="hidden md:flex w-1/2 bg-slate-50/50 dark:bg-[#1c1c1e]/40 border-l border-slate-100 dark:border-white/5 flex-col items-center justify-center p-12 text-center relative overflow-hidden">
          <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[80px] dark:bg-emerald-500/5 pointer-events-none" />

          <div className="relative w-full max-w-sm p-6 rounded-[2rem] bg-white dark:bg-[#2c2c2e] border border-slate-100 dark:border-white/5 shadow-2xl overflow-hidden transition-all duration-500 hover:scale-[1.02]">
            <div className="flex items-center gap-1.5 mb-6">
              <div className="w-3 h-3 rounded-full bg-rose-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-emerald-400" />
            </div>

            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Workspace Activity</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#248a54] dark:text-[#34a86d] bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <div className="space-y-3">
                {[
                  { initials: "RD", color: "from-emerald-400 to-emerald-600", task: "Re-routing database migrations", sub: "Sprint objective 3" },
                  { initials: "AP", color: "from-indigo-400 to-indigo-600", task: "Refining theme configurations", sub: "UX redesign phase 2" },
                ].map((item) => (
                  <div key={item.initials} className="flex items-center gap-3">
                    <div className={`h-8 w-8 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center text-[10px] font-black text-white shadow-md apple-bubble`}>
                      {item.initials}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{item.task}</p>
                      <p className="text-[9px] text-slate-400">{item.sub}</p>
                    </div>
                    <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                      <CheckCircle2 className="h-3 w-3 text-[#248a54] dark:text-[#34a86d]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 justify-center text-xs font-bold text-[#248a54] dark:text-[#34a86d]">
              <ShieldCheck className="h-4 w-4" />
              <span>Secured by Supabase Authentication</span>
            </div>
          </div>

          <div className="mt-8 text-left max-w-sm w-full space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[#248a54] dark:text-[#34a86d]">How It Works</h2>
            {[
              { n: 1, title: "Joining via Invite", body: "Enter the email your admin recruited. The system auto-detects your invite and links you to their workspace automatically." },
              { n: 2, title: "Creating a New Workspace", body: "No invite? Enter a workspace name to become the Admin and start recruiting your own team." },
              { n: 3, title: "Signing In", body: "Already have an account? Use the Sign In tab to access your workspace." },
            ].map(({ n, title, body }) => (
              <div key={n} className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[#248a54] dark:text-[#34a86d] text-[10px] font-black mt-0.5">{n}</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">{title}</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 w-full text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
        © 2026 TeamDock Inc. All rights reserved.
      </div>

      {/* Info Guide Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white/95 dark:bg-[#2c2c2e]/95 border border-slate-100 dark:border-white/5 shadow-2xl rounded-3xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-300">
            <button type="button" onClick={() => setShowInfo(false)} className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
              <X className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/25 flex items-center justify-center text-emerald-500">
                <HelpCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white tracking-tight">How Authentication Works</h3>
            </div>
            <div className="space-y-4 text-left">
              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Joining a Workspace</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-semibold">
                  If your team administrator recruited you via email, simply type your email address into the signup field. The platform will automatically identify your invitation, hide workspace creation, and link you directly to your team workspace upon registration.
                </p>
              </div>
              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Creating a New Workspace</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-semibold">
                  If you are starting fresh, choose a unique name for your new workspace. Doing so will establish you as the workspace Owner/Admin, unlocking full capabilities to create boards, tasks, and recruit collaborators.
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setShowInfo(false)} className="mt-6 w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-3.5 rounded-2xl text-sm transition-colors cursor-pointer">
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
