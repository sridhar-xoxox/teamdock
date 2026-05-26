"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, ArrowRight, ShieldCheck, CheckCircle2, Lock } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { authService } from "@/services/auth.service";

export default function ResetPasswordPage() {
  const router = useRouter();
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }
    
    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    
    setLoading(true);
    try {
      await authService.updatePassword(password);
      setSuccess(true);
      setTimeout(() => {
        router.push("/login");
      }, 3000);
    } catch (err: any) {
      console.error("Reset password error:", err);
      setError(err.message || "Unable to update password. Link may have expired.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f2f2f7] dark:bg-[#1c1c1e] flex items-center justify-center p-4 font-sans text-slate-900 dark:text-slate-100 relative transition-colors duration-500 overflow-hidden">
      
      {/* Dynamic Background Blurs */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-500/10 blur-[150px] dark:bg-indigo-500/5 pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] rounded-full bg-indigo-600/15 blur-[180px] dark:bg-indigo-600/5 pointer-events-none" />

      {/* Main Glass Box */}
      <div className="z-10 max-w-md w-full bg-white/80 dark:bg-[#2c2c2e]/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl p-8 sm:p-12 border border-white/50 dark:border-white/5 transition-all duration-300">
        
        {/* Logo & Brand */}
        <div className="flex items-center gap-3 justify-center mb-8">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <Logo className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
            teamdock
          </span>
        </div>

        {success ? (
          <div className="text-center space-y-4 py-8 animate-in fade-in zoom-in-95 duration-500">
            <div className="mx-auto h-16 w-16 bg-emerald-500/10 dark:bg-emerald-500/25 rounded-full flex items-center justify-center text-emerald-500 shadow-inner">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Password Updated</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto leading-relaxed">
              Your password has been successfully reset. Redirecting you to login...
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
                Reset Password
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                Choose a new, secure password for your workspace account.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="New Password"
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

              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm New Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 text-sm font-semibold transition-all disabled:opacity-50"
                />
              </div>

              {error && <p className="text-xs text-red-500 font-semibold px-1">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#248a54] hover:bg-[#34a86d] text-white font-black py-4 rounded-2xl transition-all duration-300 text-sm shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 group active:scale-[0.98] mt-2 cursor-pointer disabled:opacity-75"
              >
                <span>{loading ? "Updating..." : "Update Password"}</span>
                {!loading && <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />}
              </button>
            </form>
          </div>
        )}

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-white/5 flex items-center gap-2 justify-center text-xs font-bold text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-500" />
          <span>Secured by Supabase Cryptography</span>
        </div>
      </div>
    </div>
  );
}
