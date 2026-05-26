"use client";
import React, { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Zap, Eye, EyeOff, ArrowRight, ShieldCheck, Sparkles, CheckCircle2, Lock, Mail, User, HelpCircle, X } from "lucide-react";
import { useStore } from "@/lib/store";
import { Logo } from "@/components/ui/Logo";
import { authService } from "@/services/auth.service";
import { workspaceService } from "@/services/workspace.service";
import { invitationService } from "@/services/invitation.service";

const COLORS = ["#34a86d", "#10b981", "#db2777", "#7c3aed", "#0d9488", "#2563eb"];

export default function LoginPage() {
  const router = useRouter();
  const pathname = usePathname();
  const { getInviteByEmail, joinWorkspace, currentUser, loading: storeLoading } = useStore();
  
  React.useEffect(() => {
    if (!storeLoading && currentUser && currentUser.workspaceId) {
      router.push("/board");
    }
  }, [currentUser, storeLoading, router]);

  const [isSignUp, setIsSignUp] = useState(pathname === "/signup");
  const [name, setName] = useState("");
  const [showInfo, setShowInfo] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Forgot Password States
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState("");
  
  // Email Confirmation States
  const [showEmailConfirmSent, setShowEmailConfirmSent] = useState(false);

  const [pendingInvite, setPendingInvite] = useState<any>(null);
  const [checkingInvite, setCheckingInvite] = useState(false);

  const hasInvite = !!pendingInvite;

  // Asynchronously check if the email has a pending invite in the database
  React.useEffect(() => {
    const checkInvite = async () => {
      const trimmedEmail = email.trim();
      if (!trimmedEmail || !trimmedEmail.includes("@") || !trimmedEmail.includes(".")) {
        setPendingInvite(null);
        return;
      }
      setCheckingInvite(true);
      try {
        const invite = await invitationService.getPendingInvite(trimmedEmail);
        setPendingInvite(invite);
      } catch (err) {
        console.error("Error checking pending invite:", err);
        setPendingInvite(null);
      } finally {
        setCheckingInvite(false);
      }
    };

    const timer = setTimeout(checkInvite, 300);
    return () => clearTimeout(timer);
  }, [email]);

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError("");
    
    if (!forgotEmail.trim()) {
      setForgotError("Please enter your email address.");
      return;
    }
    
    setForgotLoading(true);
    try {
      await authService.resetPassword(forgotEmail.trim());
      setForgotSuccess(true);
    } catch (err: any) {
      console.error("Forgot password error:", err);
      setForgotError(err.message || "Something went wrong. Please check your credentials.");
    } finally {
      setForgotLoading(false);
    }
  };

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
        if (!name.trim()) {
          setError("Please enter your name.");
          setLoading(false);
          return;
        }
        if (password.length < 8) {
          setError("Password must be at least 8 characters long.");
          setLoading(false);
          return;
        }
        if (!hasInvite && !workspaceName.trim()) {
          setError("Please enter a Workspace Name.");
          setLoading(false);
          return;
        }

        // 1. Sign Up in Supabase
        const authData = await authService.signUp(
          email.trim(), 
          password, 
          name.trim(),
          {
            pendingWorkspaceName: hasInvite ? undefined : workspaceName.trim(),
            pendingInviteId: hasInvite && pendingInvite ? pendingInvite.id : undefined
          }
        );
        
        if (!authData?.user) {
          throw new Error("Unable to create account. Please try again.");
        }

        // Check if session exists (email confirmation is disabled on Supabase)
        if (authData.session) {
          // 2. Create Workspace directly if there is no invite
          if (!hasInvite) {
            await workspaceService.createWorkspace(workspaceName.trim(), authData.user.id);
          } else {
            // If they have an invite, let's join them
            if (pendingInvite) {
              const randomColor = COLORS[Math.floor(Math.random() * COLORS.length)];
              const displayName = name.trim();
              const initials = displayName.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
              
              const newMemberBase = {
                id: authData.user.id,
                name: displayName,
                email: email.trim(),
                role: pendingInvite.role,
                initials,
                color: randomColor
              };

              const mappedInvite = {
                id: pendingInvite.id,
                email: pendingInvite.email,
                role: pendingInvite.role,
                workspaceId: pendingInvite.workspace_id
              };

              await joinWorkspace(mappedInvite, newMemberBase);
            }
          }
          window.location.href = "/board";
        } else {
          // Email confirmation is enabled in Supabase! (Option A)
          setShowEmailConfirmSent(true);
        }
      } else {
        // Sign in using Supabase Auth
        await authService.signIn(email.trim(), password);
        
        // Clean refresh redirect to board
        window.location.href = "/board";
      }
    } catch (err: any) {
      console.error("Auth process error:", err);
      setError(err.message || "An authentication error occurred. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7] dark:bg-[#1c1c1e] flex items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100 relative transition-colors duration-500 overflow-hidden">
      
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-emerald-500/10 blur-[150px] dark:bg-emerald-500/5 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-emerald-600/15 blur-[180px] dark:bg-emerald-600/5 pointer-events-none" />

      {/* Main Glass Box */}
      <div className="z-10 max-w-5xl w-full bg-white/80 dark:bg-[#2c2c2e]/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl flex overflow-hidden min-h-[660px] border border-white/50 dark:border-white/5 transition-all duration-300">
        
        {/* Left Side: Auth Form */}
        <div className="w-full md:w-1/2 p-8 sm:p-14 flex flex-col justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3 text-slate-900 dark:text-white group">
              <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-105 transition-transform duration-300">
                <Logo className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                teamdock
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowInfo(true)}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5 transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="How authentication works"
            >
              <HelpCircle className="h-4.5 w-4.5" />
              <span className="hidden sm:inline">Guide</span>
            </button>
          </div>

          {/* Form Content */}
          <div className="flex-1 max-w-sm w-full mx-auto flex flex-col justify-center">
            {showForgotPassword ? (
              <div>
                <div className="mb-8">
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                    Forgot Password
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                    Enter your email address and we'll send you a secure link to reset your password.
                  </p>
                </div>

                {forgotSuccess ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/10 rounded-2xl p-4 flex items-start gap-3 transition-all animate-in fade-in zoom-in-95">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Reset Email Sent</h4>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal mt-1 font-semibold">
                        Please check your inbox. If the email exists, you'll receive a password reset link shortly.
                      </p>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Mail className="h-4.5 w-4.5" />
                      </div>
                      <input
                        type="email"
                        placeholder="Email Address"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        disabled={forgotLoading}
                        className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold transition-all disabled:opacity-50"
                        required
                      />
                    </div>

                    {forgotError && <p className="text-xs text-red-500 font-semibold px-1">{forgotError}</p>}

                    <button
                      type="submit"
                      disabled={forgotLoading}
                      className="w-full bg-[#248a54] hover:bg-[#34a86d] text-white font-black py-4 rounded-2xl transition-all duration-300 text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group active:scale-[0.98] mt-2 cursor-pointer disabled:opacity-75"
                    >
                      <span>{forgotLoading ? "Sending Link..." : "Send Reset Link"}</span>
                      {!forgotLoading && <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
                    </button>
                  </form>
                )}

                <div className="mt-6 text-center">
                  <button
                    onClick={() => {
                      setShowForgotPassword(false);
                      setForgotSuccess(false);
                      setForgotError("");
                      setForgotEmail("");
                    }}
                    className="text-xs font-bold text-[#248a54] dark:text-[#34a86d] hover:underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              </div>
            ) : showEmailConfirmSent ? (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-500 text-center">
                <div className="mx-auto h-16 w-16 bg-indigo-500/10 dark:bg-indigo-500/25 rounded-full flex items-center justify-center text-indigo-500 shadow-inner">
                  <Mail className="h-10 w-10 animate-bounce" />
                </div>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                    Verify Your Email
                  </h1>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-semibold leading-relaxed">
                    We've sent a verification link to <strong className="text-slate-700 dark:text-slate-200">{email}</strong>.
                  </p>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 dark:border-amber-500/10 rounded-2xl p-4 flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
                  <div className="text-left text-[11px] text-slate-600 dark:text-slate-300 leading-normal font-semibold">
                    Please click the link in your email to confirm your account and automatically initialize your TeamDock workspace.
                  </div>
                </div>

                <button
                  onClick={() => {
                    setShowEmailConfirmSent(false);
                    setIsSignUp(false);
                  }}
                  className="w-full bg-[#248a54] hover:bg-[#34a86d] text-white font-black py-4 rounded-2xl transition-all duration-300 text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
                >
                  Return to Sign In
                </button>
              </div>
            ) : (
              <>
                <div className="mb-8">
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                    {isSignUp ? "Create Workspace" : "Welcome Back"}
                  </h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400">
                    {isSignUp 
                      ? "Build your collaborative playground in seconds." 
                      : "Collaborate instantly on projects and milestones."}
                  </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Mail className="h-4.5 w-4.5" />
                    </div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold transition-all disabled:opacity-50"
                    />
                  </div>

                  {isSignUp && (
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <User className="h-4.5 w-4.5" />
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
                  
                  {isSignUp && !hasInvite && (
                    <div className="relative">
                      <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                        <Sparkles className="h-4.5 w-4.5" />
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

                  {isSignUp && hasInvite && pendingInvite && (
                    <div className="bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/10 rounded-2xl p-4 flex items-start gap-3 transition-all animate-in fade-in slide-in-from-top-2 duration-300">
                      <Sparkles className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="text-left">
                        <h4 className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">Workspace Invitation Detected</h4>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal mt-1">
                          You'll join <strong className="font-bold">{pendingInvite.workspaces?.name}</strong> as <strong className="font-bold">{pendingInvite.role}</strong> upon completing registration.
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <Lock className="h-4.5 w-4.5" />
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
                      {showPassword ? <EyeOff className="h-4.5 w-4.5" /> : <Eye className="h-4.5 w-4.5" />}
                    </button>
                  </div>

                  {!isSignUp && (
                    <div className="text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setShowForgotPassword(true);
                          setError("");
                        }}
                        className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {error && <p className="text-xs text-red-500 font-semibold px-1">{error}</p>}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#248a54] hover:bg-[#34a86d] text-white font-black py-4 rounded-2xl transition-all duration-300 text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group active:scale-[0.98] mt-2 cursor-pointer disabled:opacity-75"
                  >
                    <span>{loading ? "Authenticating..." : isSignUp ? (hasInvite ? "Join Workspace" : "Build Workspace") : "Access Workspace"}</span>
                    {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
                  </button>
                </form>
              </>
            )}
          </div>

          {/* Toggle Footer */}
          {!showForgotPassword && !showEmailConfirmSent && (
            <div className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400">
              {isSignUp ? "Have an account already? " : "New to TeamDock? "}
              <button 
                onClick={() => { 
                  const nextVal = !isSignUp;
                  setIsSignUp(nextVal); 
                  setError(""); 
                  router.push(nextVal ? "/signup" : "/login");
                }}
                disabled={loading}
                className="text-[#248a54] dark:text-[#34a86d] hover:underline font-bold disabled:opacity-50 cursor-pointer"
              >
                {isSignUp ? "Sign In" : "Sign up free"}
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Mockup OS Promotion */}
        <div className="hidden md:flex w-1/2 bg-slate-50/50 dark:bg-[#1c1c1e]/40 border-l border-slate-100 dark:border-white/5 flex-col items-center justify-center p-12 text-center relative overflow-hidden">
          
          {/* Glass floating blobs */}
          <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[80px] dark:bg-emerald-500/5 pointer-events-none" />

          {/* Beautiful interactive glass workspace mockup */}
          <div className="relative w-full max-w-sm p-6 rounded-[2rem] bg-white dark:bg-[#2c2c2e] border border-slate-100 dark:border-white/5 shadow-2xl relative overflow-hidden transition-all duration-500 hover:scale-[1.02]">
            
            {/* Header circles */}
            <div className="flex items-center gap-1.5 mb-6">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
            </div>

            {/* Widget 1: Workforce loading */}
            <div className="space-y-4 text-left">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Workspace Activity</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#248a54] dark:text-[#34a86d] bg-emerald-500/10 px-2 py-0.5 rounded-full">Active</span>
              </div>

              {/* Mock items list */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-[10px] font-black text-white shadow-md shadow-emerald-500/25 apple-bubble">
                    RD
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Re-routing database migrations</p>
                    <p className="text-[9px] text-slate-400">Sprint objective 3</p>
                  </div>
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-[#248a54] dark:text-[#34a86d]" />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-400 to-indigo-600 flex items-center justify-center text-[10px] font-black text-white shadow-md apple-bubble">
                    AP
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">Refining theme configurations</p>
                    <p className="text-[9px] text-slate-400">UX redesign phase 2</p>
                  </div>
                  <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <CheckCircle2 className="h-3 w-3 text-[#248a54] dark:text-[#34a86d]" />
                  </div>
                </div>
              </div>
            </div>

            {/* Shield tag overlay */}
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 justify-center text-xs font-bold text-[#248a54] dark:text-[#34a86d]">
              <ShieldCheck className="h-4 w-4" />
              <span>Secured by Supabase Authentication</span>
            </div>
          </div>

          {/* Quick Start Instructions */}
          <div className="mt-8 text-left max-w-sm w-full">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[#248a54] dark:text-[#34a86d] mb-4">Quick Start Guide</h2>
            <div className="space-y-4">
              <div className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[#248a54] dark:text-[#34a86d] text-[10px] font-black mt-0.5">1</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Create Your Team Workspace</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">Set up a dedicated hub for your projects in seconds, or securely join your team using an email invite.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[#248a54] dark:text-[#34a86d] text-[10px] font-black mt-0.5">2</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Manage Tasks with Ease</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">Organize your team's work using simple drag-and-drop sprint boards. Track progress from start to finish without the clutter.</p>
                </div>
              </div>
              <div className="flex gap-3 items-start">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-[#248a54] dark:text-[#34a86d] text-[10px] font-black mt-0.5">3</span>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">Collaborate & Assign Roles</h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">Invite teammates, assign custom access roles, and monitor everyone's active workloads in real time.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
      
      {/* Footer Text */}
      <div className="absolute bottom-6 w-full text-center text-[10px] font-bold uppercase tracking-widest text-slate-400">
        © 2026 TeamDock Inc. All rights reserved.
      </div>

      {/* Info Guide Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white/95 dark:bg-[#2c2c2e]/95 border border-slate-100 dark:border-white/5 shadow-2xl rounded-3xl max-w-md w-full p-6 relative animate-in zoom-in-95 duration-300">
            <button 
              type="button"
              onClick={() => setShowInfo(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
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
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  <h4 className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Joining a Workspace</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-semibold">
                  If your team administrator recruited you via email, simply type your email address into the signup field. The platform will automatically identify your invitation, hide workspace creation, and link you directly to your team workspace upon registration.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50/50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                <div className="flex items-center gap-2 mb-2">
                  <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
                  <h4 className="text-xs font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400">Creating a New Workspace</h4>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-300 leading-relaxed font-semibold">
                  If you are starting fresh, choose a unique name for your new workspace. Doing so will establish you as the workspace Owner/Admin, unlocking full capabilities to create boards, tasks, and recruit collaborators.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowInfo(false)}
              className="mt-6 w-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 font-bold py-3.5 rounded-2xl text-sm transition-colors cursor-pointer"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
